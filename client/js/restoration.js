// The "rewind the planet" mechanic: every region tracks a 0-100 restoration
// score. Farming native life earns points; the score drives ground tiles,
// tree health, ambient tint, wildlife population and milestone rewards.
import { MILESTONES, tierForScore, UNLOCK_RESTORATION, BIOME_ORDER, getBiome } from './data/biomes.mjs';

export { tierForScore, MILESTONES, UNLOCK_RESTORATION };

// Add points; returns { tierChanged, milestones: [newly crossed milestone objs] }
export function addRestoration(farm, points) {
    const before = farm.restoration || 0;
    const after = Math.max(0, Math.min(100, before + points));
    farm.restoration = after;
    const crossed = MILESTONES.filter(m =>
        after >= m.score && !(farm.milestonesClaimed || []).includes(m.score));
    crossed.forEach(m => {
        farm.milestonesClaimed = farm.milestonesClaimed || [];
        farm.milestonesClaimed.push(m.score);
    });
    return {
        tierChanged: tierForScore(before) !== tierForScore(after),
        milestones: crossed
    };
}

// Status of a region for the world map: 'open' | 'unlockable' | 'locked'
export function regionStatus(state, regionId) {
    if (state.unlockedRegions.includes(regionId)) return 'open';
    const idx = BIOME_ORDER.indexOf(regionId);
    if (idx <= 0) return 'unlockable';
    const prevId = BIOME_ORDER[idx - 1];
    const prevFarm = state.farms[prevId];
    const prevDone = prevFarm && prevFarm.restoration >= UNLOCK_RESTORATION;
    return prevDone ? 'unlockable' : 'locked';
}

export function canAfford(state, regionId) {
    const biome = getBiome(regionId);
    return state.coins >= biome.unlock.coins && state.level >= biome.unlock.level;
}

// Overall planet progress (0-100) across all regions
export function planetProgress(state) {
    const total = BIOME_ORDER.reduce((sum, id) =>
        sum + ((state.farms[id] && state.farms[id].restoration) || 0), 0);
    return Math.round(total / BIOME_ORDER.length);
}
