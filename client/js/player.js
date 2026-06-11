// PlayerState: progression data + economy. Avatar: the on-screen farmer.
import { PLAYER_SPEED, TILE_PX } from './config.js';
import { BIOME_ORDER, getBiome } from './data/biomes.mjs';

export function defaultState(character = null, username = '') {
    return {
        schema: 2,
        saveVersion: 1,
        savedAt: Date.now(),
        username,
        character,
        level: 1,
        xp: 0,
        coins: 100,
        currentRegion: 'prairie',
        unlockedRegions: ['prairie'],
        selectedSeed: 'sunflower',
        seeds: { sunflower: 5, corn: 3 }, // starter pack
        farms: {},
        settings: { music: true, sfx: true },
        tutorialStep: 0
    };
}

export class PlayerState {
    constructor(data, listeners = {}) {
        Object.assign(this, defaultState(), data);
        this.listeners = listeners; // { onChange, onLevelUp }
    }

    _changed() {
        if (this.listeners.onChange) this.listeners.onChange(this);
    }

    addCoins(amount) {
        this.coins += amount;
        this._changed();
    }

    spendCoins(amount) {
        if (this.coins < amount) return false;
        this.coins -= amount;
        this._changed();
        return true;
    }

    xpNeeded() { return this.level * 100; }

    addXp(amount) {
        this.xp += amount;
        while (this.xp >= this.xpNeeded()) {
            this.xp -= this.xpNeeded();
            this.level++;
            if (this.listeners.onLevelUp) this.listeners.onLevelUp(this.level);
        }
        this._changed();
    }

    addSeeds(id, qty = 1) {
        this.seeds[id] = (this.seeds[id] || 0) + qty;
        this._changed();
    }

    takeSeed(id) {
        if (!this.seeds[id]) return false;
        this.seeds[id]--;
        if (this.seeds[id] <= 0) delete this.seeds[id];
        this._changed();
        return true;
    }

    farm(regionId) {
        if (!this.farms[regionId]) {
            this.farms[regionId] = {
                seed: Math.floor(Math.random() * 0x7fffffff),
                restoration: 0,
                milestonesClaimed: [],
                plots: {}
            };
        }
        return this.farms[regionId];
    }

    unlockRegion(regionId) {
        const biome = getBiome(regionId);
        if (!biome || this.unlockedRegions.includes(regionId)) return false;
        if (!this.spendCoins(biome.unlock.coins)) return false;
        this.unlockedRegions.push(regionId);
        this._changed();
        return true;
    }

    // Snapshot sent to the server / stored locally
    serialize() {
        return {
            schema: this.schema,
            saveVersion: this.saveVersion,
            savedAt: this.savedAt,
            character: this.character,
            level: this.level,
            xp: this.xp,
            coins: this.coins,
            currentRegion: this.currentRegion,
            unlockedRegions: this.unlockedRegions,
            selectedSeed: this.selectedSeed,
            seeds: this.seeds,
            farms: this.farms,
            settings: this.settings,
            tutorialStep: this.tutorialStep
        };
    }
}

// Migrate a legacy (schema 1) server save into the new shape
export function migrateLegacy(gameProgress, character) {
    const state = defaultState(character);
    state.level = gameProgress.level || 1;
    state.xp = gameProgress.experience || 0;
    state.coins = gameProgress.coins ?? 100;
    if (gameProgress.farm && Array.isArray(gameProgress.farm.plots)) {
        const farm = {
            seed: 12345, restoration: 0, milestonesClaimed: [], plots: {}
        };
        for (const p of gameProgress.farm.plots) {
            // legacy crops map onto prairie's crops where possible
            const id = ['corn', 'wheat'].includes(p.crop) ? p.crop : (p.crop ? 'corn' : null);
            farm.plots[`${p.x},${p.y}`] = {
                tilled: true,
                crop: id ? { id, stage: Math.min(4, p.stage || 0), stageStart: Date.now(), needsWater: true } : null
            };
        }
        state.farms.prairie = farm;
    }
    return state;
}

const DIRS = { down: 'down', up: 'up', left: 'left', right: 'right' };

export class Avatar {
    constructor(characterId) {
        this.characterId = characterId;
        this.x = 15; this.y = 15;
        this.dir = DIRS.down;
        this.path = [];
        this.queuedAction = null; // { x, y } farm tile to act on when adjacent
        this.moving = false;
        this.animT = 0;
    }

    setPath(path, queuedAction = null) {
        this.path = path || [];
        this.queuedAction = queuedAction;
    }

    stop() {
        this.path = [];
        this.queuedAction = null;
    }

    update(dt, world, keyboardVec) {
        let vx = 0, vy = 0;
        if (keyboardVec.x || keyboardVec.y) {
            // direct control overrides pathing
            this.path = [];
            const len = Math.hypot(keyboardVec.x, keyboardVec.y) || 1;
            vx = (keyboardVec.x / len) * PLAYER_SPEED;
            vy = (keyboardVec.y / len) * PLAYER_SPEED;
            const nx = this.x + vx * dt, ny = this.y + vy * dt;
            if (world.isWalkable(nx, this.y)) this.x = nx;
            if (world.isWalkable(this.x, ny)) this.y = ny;
        } else if (this.path.length) {
            const next = this.path[0];
            const dx = next.x - this.x, dy = next.y - this.y;
            const dist = Math.hypot(dx, dy);
            const step = PLAYER_SPEED * dt;
            if (dist <= step) {
                this.x = next.x; this.y = next.y;
                this.path.shift();
            } else {
                vx = (dx / dist) * PLAYER_SPEED;
                vy = (dy / dist) * PLAYER_SPEED;
                this.x += vx * dt;
                this.y += vy * dt;
            }
        }

        this.moving = !!(vx || vy || this.path.length);
        if (vx || vy) {
            if (Math.abs(vx) > Math.abs(vy)) this.dir = vx > 0 ? 'right' : 'left';
            else if (vy !== 0) this.dir = vy > 0 ? 'down' : 'up';
        }
        this.animT += dt * (this.moving ? 7 : 2.5);
    }

    arrived() {
        return this.path.length === 0;
    }

    isAdjacentTo(x, y) {
        return Math.abs(Math.round(this.x) - x) + Math.abs(Math.round(this.y) - y) <= 1;
    }

    frameName() {
        const f = this.moving ? (1 + (Math.floor(this.animT) % 2)) : 0;
        return `char/${this.characterId}/${this.dir}/${f}`;
    }

    draw(ctx, coreAtlas, camera) {
        const s = camera.toScreen(this.x, this.y);
        coreAtlas.draw(ctx, 'ind/shadow', s.x, s.y + 4);
        const bob = this.moving ? 0 : Math.sin(this.animT) * 1.5;
        coreAtlas.draw(ctx, this.frameName(), s.x, s.y - TILE_PX * 0.15 + bob);
    }
}
