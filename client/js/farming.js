// Farming for one region: plots, growth, and the one-tap contextual action.
// Plot shape (stored in state.farms[region].plots["x,y"]):
//   { tilled: true, crop: { id, stage, stageStart, needsWater } | null }
// Growth: watering starts a stage timer; when it elapses the crop advances
// one stage and (if not final) thirsts again. On load, elapsed offline time
// is applied the same way, so crops keep growing while the app is closed.
import { getCrop, tierForScore } from './data/biomes.mjs';
import { TILE_PX } from './config.js';
import { addRestoration } from './restoration.js';

export const FINAL_STAGE = 4;

export class FarmingSystem {
    constructor(game, biome, farm, world) {
        this.game = game; // for state, audio, particles, events
        this.biome = biome;
        this.farm = farm;
        this.world = world;
        farm.plots = farm.plots || {};
        this._attachPlotsToTiles();
        this.fastForward();
    }

    _attachPlotsToTiles() {
        for (const key of Object.keys(this.farm.plots)) {
            const [x, y] = key.split(',').map(Number);
            const tile = this.world.tileAt(x, y);
            if (tile && tile.type === 'grass') {
                tile.plot = this.farm.plots[key];
            } else {
                delete this.farm.plots[key]; // plot no longer matches the map
            }
        }
    }

    plotAt(x, y) {
        return this.farm.plots[`${x},${y}`] || null;
    }

    // Apply elapsed real time to all crops (called on load/resume)
    fastForward(now = Date.now()) {
        for (const plot of Object.values(this.farm.plots)) {
            const crop = plot.crop;
            if (!crop || crop.needsWater || crop.stage >= FINAL_STAGE) continue;
            const def = getCrop(this.biome.id, crop.id);
            if (!def) { plot.crop = null; continue; }
            if (now - crop.stageStart >= this._growMs(def)) {
                crop.stage++;
                crop.stageStart = now;
                if (crop.stage < FINAL_STAGE) crop.needsWater = true;
            }
        }
    }

    _growMs(def) {
        // Sunny's ability: everything grows 10% faster
        const mult = this.game.state.character === 'sunny' ? 0.9 : 1;
        return def.growMs * mult;
    }

    update() {
        this.fastForward();
    }

    // What would a tap on this tile do right now?
    actionFor(x, y) {
        const tile = this.world.tileAt(x, y);
        if (!tile || tile.type !== 'grass') return null;
        const plot = tile.plot;
        if (!plot || !plot.tilled) return 'till';
        if (!plot.crop) return 'plant';
        if (plot.crop.stage >= FINAL_STAGE) return 'harvest';
        if (plot.crop.needsWater) return 'water';
        return null; // growing — nothing to do
    }

    perform(action, x, y) {
        switch (action) {
            case 'till': return this._till(x, y);
            case 'plant': return this._plant(x, y);
            case 'water': return this._water(x, y);
            case 'harvest': return this._harvest(x, y);
        }
        return false;
    }

    _till(x, y) {
        const tile = this.world.tileAt(x, y);
        if (!tile || tile.type !== 'grass' || (tile.plot && tile.plot.tilled)) return false;
        const plot = { tilled: true, crop: null };
        tile.plot = plot;
        this.farm.plots[`${x},${y}`] = plot;
        this.game.state.addXp(1);
        this.game.fx('till', x, y);
        this.game.emit('tilled', { x, y });
        return true;
    }

    _plant(x, y) {
        const plot = this.plotAt(x, y);
        if (!plot || !plot.tilled || plot.crop) return false;
        const seedId = this.game.state.selectedSeed;
        const def = getCrop(this.biome.id, seedId);
        if (!def) return false;
        if (!this.game.state.takeSeed(seedId)) {
            this.game.emit('noSeeds', { seedId });
            return false;
        }
        plot.crop = { id: seedId, stage: 0, stageStart: Date.now(), needsWater: true };
        this.game.state.addXp(2);
        this.game.fx('plant', x, y);
        this.game.emit('planted', { x, y, crop: seedId });
        return true;
    }

    _water(x, y) {
        const plot = this.plotAt(x, y);
        if (!plot || !plot.crop || !plot.crop.needsWater) return false;
        this._waterPlot(plot);
        // River's ability: 20% chance to also water adjacent thirsty crops
        if (this.game.state.character === 'river' && Math.random() < 0.2) {
            for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const adj = this.plotAt(x + dx, y + dy);
                if (adj && adj.crop && adj.crop.needsWater) {
                    this._waterPlot(adj);
                    this.game.fx('water', x + dx, y + dy);
                }
            }
        }
        this.game.state.addXp(1);
        this.game.fx('water', x, y);
        this.game.emit('watered', { x, y });
        return true;
    }

    _waterPlot(plot) {
        plot.crop.needsWater = false;
        plot.crop.stageStart = Date.now();
    }

    _harvest(x, y) {
        const plot = this.plotAt(x, y);
        if (!plot || !plot.crop || plot.crop.stage < FINAL_STAGE) return false;
        const def = getCrop(this.biome.id, plot.crop.id);
        let coins = def.sellPrice;
        let xp = def.xp;
        const state = this.game.state;

        // Character abilities
        const hour = new Date().getHours();
        if (state.character === 'luna' && (hour >= 18 || hour < 6)) coins *= 2;
        if (state.character === 'terra') coins = Math.floor(coins * 1.15);
        if (state.character === 'sage') xp = Math.floor(xp * 1.25);

        plot.crop = null;
        state.addCoins(coins);
        state.addXp(xp);

        // Restoration: native crops heal the land fastest
        const pts = def.restore * (def.native ? 1.5 : 1);
        const result = addRestoration(this.farm, pts);
        this.game.fx('harvest', x, y);
        this.game.emit('harvested', { x, y, crop: def.id, coins, restoration: result });
        return true;
    }

    draw(ctx, atlas, coreAtlas, camera, nowMs) {
        const bob = Math.sin(nowMs / 280) * 3;
        for (const key of Object.keys(this.farm.plots)) {
            const [x, y] = key.split(',').map(Number);
            const plot = this.farm.plots[key];
            const s = camera.toScreen(x, y);
            if (s.x < -TILE_PX || s.y < -TILE_PX || s.x > camera.wPx || s.y > camera.hPx) continue;
            if (plot.tilled) {
                const wet = plot.crop && !plot.crop.needsWater && plot.crop.stage < FINAL_STAGE;
                atlas.draw(ctx, wet ? 'soil/wet' : 'soil/dry', s.x, s.y);
            }
            if (plot.crop) {
                atlas.draw(ctx, `crop/${plot.crop.id}/${plot.crop.stage}`, s.x, s.y);
                if (plot.crop.needsWater) {
                    coreAtlas.draw(ctx, 'ind/water', s.x, s.y - TILE_PX * 0.7 + bob);
                } else if (plot.crop.stage >= FINAL_STAGE) {
                    coreAtlas.draw(ctx, 'ind/ready', s.x, s.y - TILE_PX * 0.7 + bob);
                }
            }
        }
    }
}
