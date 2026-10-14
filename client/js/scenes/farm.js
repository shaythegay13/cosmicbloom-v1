// FarmScene: one region's playable farm — world, crops, creatures, avatar.
import { TILE_PX } from '../config.js';
import { World, Camera } from '../world.js';
import { FarmingSystem } from '../farming.js';
import { Avatar } from '../player.js';
import { CreatureManager } from '../engine/creatures.js';
import { Particles } from '../engine/particles.js';
import { findPath, adjacentTarget } from '../engine/pathfinding.js';
import { tierForScore } from '../data/biomes.mjs';

export class FarmScene {
    constructor(game, biome) {
        this.game = game;
        this.biome = biome;
        this.farm = game.state.farm(biome.id);
        this.world = new World(biome, this.farm.seed);
        this.farming = new FarmingSystem(game, biome, this.farm, this.world);
        this.avatar = new Avatar(game.state.character);
        this.creatures = new CreatureManager(biome, this.world, this.farm.seed);
        this.creatures.sync(this.farm.restoration);
        this.particles = new Particles();
        this.camera = new Camera();
        this.cursor = null; // hovered/last-tapped tile
        this._lastTier = tierForScore(this.farm.restoration);
    }

    get atlas() {
        return this.game.assets.biome(this.biome.id);
    }

    enter() {
        this.camera.resize(this.game.viewWidth, this.game.viewHeight);
        this.camera.x = this.avatar.x - this.camera.wPx / TILE_PX / 2;
        this.camera.y = this.avatar.y - this.camera.hPx / TILE_PX / 2;
        this.camera.clamp(this.world);
        this.game.audio.setBiome(this.biome.id);
        this.game.ui.showFarmHud(this.biome, this.farm);
    }

    resize() {
        const firstLayout = this.camera.wPx === 0 || this.camera.hPx === 0;
        this.camera.resize(this.game.viewWidth, this.game.viewHeight);
        if (firstLayout && this.camera.wPx > 0 && this.camera.hPx > 0) {
            this.camera.x = this.avatar.x - this.camera.wPx / TILE_PX / 2;
            this.camera.y = this.avatar.y - this.camera.hPx / TILE_PX / 2;
        }
        this.camera.clamp(this.world);
    }

    onTap(sx, sy) {
        const t = this.camera.toTile(sx, sy);
        this.cursor = t;

        // creatures first — petting them is a tiny joy
        const wx = this.camera.x + sx / TILE_PX, wy = this.camera.y + sy / TILE_PX;
        const creature = this.creatures.hitTest(wx, wy);
        if (creature) {
            this.particles.burst('fx/heart', creature.x + 0.5, creature.y, 3, { g: -10, vy: -20, life: 1 });
            this.game.audio.sfx('creature');
            return;
        }

        const action = this.farming.actionFor(t.x, t.y);
        const ax = Math.round(this.avatar.x), ay = Math.round(this.avatar.y);
        if (action) {
            if (this.avatar.isAdjacentTo(t.x, t.y)) {
                this.farming.perform(action, t.x, t.y);
                this.avatar.stop();
            } else {
                const adj = adjacentTarget(this.world, ax, ay, t.x, t.y);
                if (adj) this.avatar.setPath(adj.path, { x: t.x, y: t.y });
            }
            return;
        }
        // plain walk
        if (this.world.isWalkable(t.x, t.y)) {
            const path = findPath(this.world, ax, ay, t.x, t.y);
            if (path) this.avatar.setPath(path);
        }
    }

    onDrag(dx, dy) {
        this.camera.x -= dx / TILE_PX;
        this.camera.y -= dy / TILE_PX;
        this.camera.clamp(this.world);
        this._dragHold = 1.2; // seconds before camera re-follows the avatar
    }

    update(dt) {
        this.avatar.update(dt, this.world, this.game.input.moveVector());

        // arrive -> perform queued farm action
        if (this.avatar.queuedAction && this.avatar.arrived()) {
            const q = this.avatar.queuedAction;
            this.avatar.queuedAction = null;
            const action = this.farming.actionFor(q.x, q.y);
            if (action && this.avatar.isAdjacentTo(q.x, q.y)) {
                this.farming.perform(action, q.x, q.y);
            }
        }

        // keyboard action key acts on the faced tile
        if (this.game.input.actionPressed() && !this._actionHeld) {
            this._actionHeld = true;
            const fx = Math.round(this.avatar.x + (this.avatar.dir === 'left' ? -1 : this.avatar.dir === 'right' ? 1 : 0));
            const fy = Math.round(this.avatar.y + (this.avatar.dir === 'up' ? -1 : this.avatar.dir === 'down' ? 1 : 0));
            const action = this.farming.actionFor(fx, fy) || this.farming.actionFor(Math.round(this.avatar.x), Math.round(this.avatar.y));
            if (action) {
                const tx = this.farming.actionFor(fx, fy) ? fx : Math.round(this.avatar.x);
                const ty = this.farming.actionFor(fx, fy) ? fy : Math.round(this.avatar.y);
                this.farming.perform(action, tx, ty);
            }
        } else if (!this.game.input.actionPressed()) {
            this._actionHeld = false;
        }

        this.farming.update();

        if (this._dragHold > 0) this._dragHold -= dt;
        else this.camera.follow(this.avatar, this.world, dt);

        const tier = tierForScore(this.farm.restoration);
        if (tier !== this._lastTier) {
            this._lastTier = tier;
            this.world.invalidateGround();
        }
        this.creatures.sync(this.farm.restoration);
        this.creatures.update(dt);
        this.particles.update(dt);
    }

    render(ctx, nowMs) {
        const atlas = this.atlas;
        const core = this.game.assets.core;
        const cam = this.camera;

        this.world.drawGround(ctx, atlas, cam, this.farm.restoration);
        this.farming.draw(ctx, atlas, core, cam, nowMs);

        // cursor highlight
        if (this.cursor) {
            const s = cam.toScreen(this.cursor.x, this.cursor.y);
            core.draw(ctx, 'ind/cursor', s.x, s.y);
        }

        // y-sorted entities: obstacles, creatures, avatar
        const drawables = [];
        for (const ob of this.world.obstacles(cam)) {
            drawables.push({
                y: ob.y,
                draw: () => {
                    const frame = World.obstacleFrame(ob.type, this.farm.restoration);
                    const s = cam.toScreen(ob.x, ob.y);
                    atlas.drawAnchored(ctx, frame, s.x, s.y, TILE_PX);
                }
            });
        }
        for (const c of this.creatures.creatures) {
            drawables.push({
                y: c.y,
                draw: () => {
                    const s = cam.toScreen(c.x, c.y);
                    core.draw(ctx, 'ind/shadow', s.x, s.y + 2);
                    atlas.draw(ctx, c.frameName(), s.x, s.y - TILE_PX * 0.1);
                }
            });
        }
        drawables.push({ y: this.avatar.y, draw: () => this.avatar.draw(ctx, core, cam) });
        drawables.sort((a, b) => a.y - b.y);
        drawables.forEach(d => d.draw());

        this.particles.draw(ctx, core, (x, y) => cam.toScreen(x, y));

        // restoration ambient tint: the world literally brightens as it heals
        const tint = this.biome.tint[tierForScore(this.farm.restoration)];
        if (tint && tint !== 'rgba(0,0,0,0)') {
            ctx.fillStyle = tint;
            ctx.fillRect(0, 0, cam.wPx, cam.hPx);
        }
    }

    // particle hooks called by FarmingSystem via game.fx()
    spawnFx(kind, x, y) {
        const cx = x + 0.5, cy = y + 0.3;
        switch (kind) {
            case 'till':
                this.particles.burst(['fx/pop/0', 'fx/pop/1'], cx, cy, 4, { life: 0.5 });
                break;
            case 'plant':
                this.particles.burst(['fx/sparkle/0', 'fx/sparkle/1'], cx, cy, 3, { life: 0.6 });
                break;
            case 'water':
                this.particles.burst(['fx/droplet/0', 'fx/droplet/1'], cx, cy, 5, { life: 0.6, g: 80 });
                break;
            case 'harvest':
                this.particles.burst(['fx/sparkle/0', 'fx/sparkle/1'], cx, cy, 5, { life: 0.7 });
                this.particles.spawn('fx/coin/0', cx, cy, { vy: -60, g: 0, life: 0.7, frames: ['fx/coin/0', 'fx/coin/1'], fps: 6 });
                break;
            case 'milestone':
                this.particles.burst(['fx/flower/0', 'fx/flower/1', 'fx/flower/2', 'fx/flower/3'],
                    this.avatar.x + 0.5, this.avatar.y, 14, { life: 1.4, vy: -70, g: 60 });
                break;
        }
    }
}
