import { describe, it, expect, beforeEach } from 'vitest';
import { FarmingSystem, FINAL_STAGE } from '../../client/js/farming.js';
import { PlayerState, defaultState, migrateLegacy } from '../../client/js/player.js';
import { getBiome, getCrop } from '../../client/js/data/biomes.mjs';
import { findPath, adjacentTarget } from '../../client/js/engine/pathfinding.js';
import { mulberry32, tileHash } from '../../client/js/engine/rand.js';

function makeStubWorld() {
    const tiles = {};
    return {
        tileAt(x, y) {
            const k = `${x},${y}`;
            if (!tiles[k]) tiles[k] = { type: 'grass', walkable: true, plot: null };
            return tiles[k];
        }
    };
}

function makeFarming(character = 'terra') {
    const state = new PlayerState(defaultState(character, 't'));
    const events = [];
    const game = { state, fx: () => {}, emit: n => events.push(n) };
    const farm = { seed: 1, restoration: 0, milestonesClaimed: [], plots: {} };
    const fs = new FarmingSystem(game, getBiome('prairie'), farm, makeStubWorld());
    return { fs, state, farm, events };
}

describe('farming cycle', () => {
    let ctx;
    beforeEach(() => { ctx = makeFarming(); });

    it('walks the till -> plant -> water -> harvest action chain', () => {
        const { fs, state } = ctx;
        expect(fs.actionFor(2, 2)).toBe('till');
        expect(fs.perform('till', 2, 2)).toBe(true);
        expect(fs.actionFor(2, 2)).toBe('plant');

        state.selectedSeed = 'sunflower';
        expect(fs.perform('plant', 2, 2)).toBe(true);
        expect(fs.actionFor(2, 2)).toBe('water');
        expect(fs.perform('water', 2, 2)).toBe(true);
        expect(fs.actionFor(2, 2)).toBe(null); // growing
    });

    it('planting consumes seeds and fails without them', () => {
        const { fs, state } = ctx;
        fs.perform('till', 1, 1);
        state.selectedSeed = 'pumpkin';
        state.seeds = {};
        expect(fs.perform('plant', 1, 1)).toBe(false);
        state.addSeeds('pumpkin', 1);
        expect(fs.perform('plant', 1, 1)).toBe(true);
        expect(state.seeds.pumpkin).toBeUndefined(); // last one consumed
    });

    it('grows one stage per watering and harvests with restoration', () => {
        const { fs, state, farm } = ctx;
        const def = getCrop('prairie', 'sunflower');
        fs.perform('till', 2, 2);
        state.selectedSeed = 'sunflower';
        fs.perform('plant', 2, 2);
        const plot = fs.plotAt(2, 2);

        for (let s = 0; s < FINAL_STAGE; s++) {
            plot.crop.needsWater = false;
            plot.crop.stageStart = Date.now() - def.growMs - 1;
            fs.fastForward();
        }
        expect(plot.crop.stage).toBe(FINAL_STAGE);
        expect(fs.actionFor(2, 2)).toBe('harvest');

        const coinsBefore = state.coins;
        fs.perform('harvest', 2, 2);
        // terra: +15% coins
        expect(state.coins).toBe(coinsBefore + Math.floor(def.sellPrice * 1.15));
        expect(farm.restoration).toBe(def.restore * 1.5); // native bonus
        expect(plot.crop).toBe(null);
    });

    it('offline fast-forward advances one stage then waits for water', () => {
        const { fs, state } = ctx;
        fs.perform('till', 3, 3);
        state.selectedSeed = 'corn';
        fs.perform('plant', 3, 3);
        fs.perform('water', 3, 3);
        const plot = fs.plotAt(3, 3);
        plot.crop.stageStart = Date.now() - 999999999;
        fs.fastForward();
        expect(plot.crop.stage).toBe(1);
        expect(plot.crop.needsWater).toBe(true);
    });
});

describe('player progression', () => {
    it('levels with xp carry-over', () => {
        const ps = new PlayerState(defaultState('sage', 'x'));
        let ups = 0;
        ps.listeners.onLevelUp = () => ups++;
        ps.addXp(250); // L1 needs 100 -> L2 with 150 spare (L2 needs 200)
        expect(ps.level).toBe(2);
        expect(ps.xp).toBe(150);
        expect(ups).toBe(1);
    });

    it('guards the wallet', () => {
        const ps = new PlayerState(defaultState('luna', 'x'));
        expect(ps.spendCoins(100)).toBe(true);
        expect(ps.spendCoins(1)).toBe(false);
    });

    it('migrates legacy schema-1 saves', () => {
        const legacy = migrateLegacy({
            level: 4, coins: 321, experience: 12,
            farm: { plots: [{ x: 5, y: 6, crop: 'wheat', stage: 2 }] }
        }, 'river');
        expect(legacy.schema).toBe(2);
        expect(legacy.level).toBe(4);
        expect(legacy.farms.prairie.plots['5,6'].crop.id).toBe('wheat');
    });
});

describe('pathfinding', () => {
    const grid = {
        width: 10, height: 10,
        isWalkable(x, y) {
            if (x < 0 || y < 0 || x >= 10 || y >= 10) return false;
            return !(x === 5 && y !== 9);
        }
    };

    it('routes around walls', () => {
        const path = findPath(grid, 1, 1, 8, 1);
        expect(path.length).toBeGreaterThan(10);
        expect(path.at(-1)).toEqual({ x: 8, y: 1 });
    });

    it('returns null for unreachable tiles', () => {
        const sealed = { width: 3, height: 3, isWalkable: (x, y) => x === 0 && y === 0 };
        expect(findPath(sealed, 0, 0, 2, 2)).toBe(null);
    });

    it('finds the nearest adjacent tile for farm actions', () => {
        const adj = adjacentTarget(grid, 1, 1, 3, 3);
        expect(Math.abs(adj.x - 3) + Math.abs(adj.y - 3)).toBe(1);
    });
});

describe('determinism', () => {
    it('mulberry32 streams are reproducible', () => {
        const a = mulberry32(7), b = mulberry32(7);
        expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    });

    it('tileHash is stable', () => {
        expect(tileHash(3, 4, 9)).toBe(tileHash(3, 4, 9));
        expect(tileHash(3, 4, 9)).not.toBe(tileHash(4, 3, 9));
    });
});
