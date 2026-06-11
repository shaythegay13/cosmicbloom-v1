// Ambient wildlife. Creatures return as a region's restoration score rises —
// the most visible payoff of "rewinding" a region back to health.
import { TILE_PX } from '../config.js';
import { mulberry32 } from './rand.js';

const STATES = { IDLE: 0, WALK: 1 };

class Creature {
    constructor(def, x, y, rng) {
        this.def = def;
        this.x = x; this.y = y;
        this.rng = rng;
        this.state = STATES.IDLE;
        this.timer = 1 + rng() * 2;
        this.dir = rng() < 0.5 ? -1 : 1; // -1 left (authored), 1 right (mirrored)
        this.tx = x; this.ty = y;
        this.animT = rng();
        this.speed = def.body === 'bird' ? 1.6 : 0.9;
    }

    update(dt, world) {
        this.animT += dt;
        this.timer -= dt;
        if (this.state === STATES.IDLE) {
            if (this.timer <= 0) {
                // pick a nearby walkable tile to amble to
                for (let tries = 0; tries < 6; tries++) {
                    const nx = Math.round(this.x + (this.rng() * 6 - 3));
                    const ny = Math.round(this.y + (this.rng() * 6 - 3));
                    if (world.isWalkable(nx, ny) && !world.tileAt(nx, ny).plot) {
                        this.tx = nx; this.ty = ny;
                        this.state = STATES.WALK;
                        this.dir = nx > this.x ? 1 : -1;
                        break;
                    }
                }
                this.timer = 2 + this.rng() * 3;
            }
        } else {
            const dx = this.tx - this.x, dy = this.ty - this.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 0.05 || this.timer <= 0) {
                this.state = STATES.IDLE;
                this.timer = 1.5 + this.rng() * 3;
            } else {
                this.x += (dx / dist) * this.speed * dt;
                this.y += (dy / dist) * this.speed * dt;
            }
        }
    }

    frameName() {
        const f = (this.state === STATES.WALK ? Math.floor(this.animT * 5) : Math.floor(this.animT * 2)) % 2;
        return `creature/${this.def.id}/${this.dir === 1 ? 'r' : ''}${f}`;
    }
}

export class CreatureManager {
    constructor(biome, world, seed) {
        this.biome = biome;
        this.world = world;
        this.rng = mulberry32(seed ^ 0xC0FFEE);
        this.creatures = [];
    }

    // Population scales with restoration: 0 below 40, then grows to 4
    targetCount(score) {
        if (score < 40) return 0;
        return Math.min(4, 1 + Math.floor((score - 40) / 20));
    }

    sync(score) {
        const target = this.targetCount(score);
        while (this.creatures.length < target) {
            const def = this.biome.creatures[this.creatures.length % this.biome.creatures.length];
            const spot = this.world.randomWalkable(this.rng);
            if (!spot) break;
            this.creatures.push(new Creature(def, spot.x, spot.y, this.rng));
        }
        while (this.creatures.length > target) this.creatures.pop();
    }

    update(dt) {
        for (const c of this.creatures) c.update(dt, this.world);
    }

    // Returns the creature at a tap position (screen-space check), if any
    hitTest(wx, wy) {
        for (const c of this.creatures) {
            if (Math.abs(c.x - wx) < 0.6 && Math.abs(c.y - wy) < 0.7) return c;
        }
        return null;
    }

    draw(ctx, atlas, coreAtlas, camToScreen) {
        for (const c of this.creatures) {
            const s = camToScreen(c.x, c.y);
            coreAtlas.draw(ctx, 'ind/shadow', s.x, s.y + 2);
            atlas.draw(ctx, c.frameName(), s.x, s.y - TILE_PX * 0.1);
        }
    }
}
