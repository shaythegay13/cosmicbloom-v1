import { describe, it, expect } from 'vitest';
import { BIOMES, BIOME_ORDER, getBiome, getCrop, tierForScore } from '../../client/js/data/biomes.mjs';

describe('biome data integrity', () => {
    it('has 7 biomes in unlock order', () => {
        expect(BIOMES.length).toBe(7);
        expect(BIOME_ORDER[0]).toBe('prairie');
    });

    it('every biome has 4 crops, one native, 3 ground tiers, 2 creatures', () => {
        for (const b of BIOMES) {
            expect(b.crops.length, b.id).toBe(4);
            expect(b.crops.filter(c => c.native).length, b.id).toBe(1);
            expect(b.ground.length, b.id).toBe(3);
            expect(b.creatures.length, b.id).toBe(2);
        }
    });

    it('crop ids are unique within a biome and economically sane', () => {
        for (const b of BIOMES) {
            const ids = b.crops.map(c => c.id);
            expect(new Set(ids).size).toBe(ids.length);
            for (const c of b.crops) {
                expect(c.sellPrice, `${b.id}/${c.id}`).toBeGreaterThan(c.seedPrice);
                expect(c.growMs).toBeGreaterThanOrEqual(15000);
                expect(c.restore).toBeGreaterThan(0);
            }
        }
    });

    it('unlock costs and levels ascend along the journey', () => {
        for (let i = 1; i < BIOMES.length; i++) {
            expect(BIOMES[i].unlock.coins).toBeGreaterThan(BIOMES[i - 1].unlock.coins);
            expect(BIOMES[i].unlock.level).toBeGreaterThan(BIOMES[i - 1].unlock.level);
        }
    });

    it('tier thresholds map correctly', () => {
        expect(tierForScore(0)).toBe(0);
        expect(tierForScore(33)).toBe(0);
        expect(tierForScore(34)).toBe(1);
        expect(tierForScore(66)).toBe(1);
        expect(tierForScore(67)).toBe(2);
        expect(tierForScore(100)).toBe(2);
    });

    it('lookup helpers work', () => {
        expect(getBiome('savanna').place).toBe('Africa');
        expect(getCrop('terraces', 'rice').native).toBe(true);
        expect(getCrop('terraces', 'nope')).toBeUndefined();
    });
});
