import { describe, it, expect } from 'vitest';
import { addRestoration, regionStatus, planetProgress } from '../../client/js/restoration.js';
import { defaultState } from '../../client/js/player.js';

describe('restoration scoring', () => {
    it('accumulates, clamps and reports milestones once', () => {
        const farm = { restoration: 0, milestonesClaimed: [] };
        let r = addRestoration(farm, 30);
        expect(farm.restoration).toBe(30);
        expect(r.milestones.map(m => m.score)).toEqual([25]);

        r = addRestoration(farm, 30);
        expect(r.milestones.map(m => m.score)).toEqual([50]);

        r = addRestoration(farm, 500);
        expect(farm.restoration).toBe(100);
        expect(r.milestones.map(m => m.score)).toEqual([75, 100]);
        expect(r.tierChanged).toBe(true);

        r = addRestoration(farm, 10);
        expect(r.milestones).toEqual([]); // never re-granted
    });

    it('reports tier changes at boundaries', () => {
        const farm = { restoration: 30, milestonesClaimed: [25] };
        expect(addRestoration(farm, 3).tierChanged).toBe(false); // 33 still tier 0
        expect(addRestoration(farm, 1).tierChanged).toBe(true);  // 34 -> tier 1
    });
});

describe('region progression', () => {
    it('locks regions until the previous one is 50% restored', () => {
        const state = defaultState('sunny');
        state.farms.prairie = { restoration: 49, milestonesClaimed: [], plots: {} };
        expect(regionStatus(state, 'prairie')).toBe('open');
        expect(regionStatus(state, 'countryside')).toBe('locked');

        state.farms.prairie.restoration = 50;
        expect(regionStatus(state, 'countryside')).toBe('unlockable');
        expect(regionStatus(state, 'terraces')).toBe('locked');
    });

    it('planet progress averages all regions', () => {
        const state = defaultState('sunny');
        state.farms.prairie = { restoration: 70 };
        state.farms.savanna = { restoration: 30 };
        expect(planetProgress(state)).toBe(Math.round(100 / 7));
    });
});
