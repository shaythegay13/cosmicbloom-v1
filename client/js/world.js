// Seeded world generation + tile rendering for a region.
// The same (biome, seed) pair always produces the same map, so obstacle
// positions are stable across sessions and never collide with saved plots.
import { TILE_PX, WORLD_WIDTH, WORLD_HEIGHT } from './config.js';
import { mulberry32, tileHash } from './engine/rand.js';
import { tierForScore } from './data/biomes.mjs';

export class World {
    constructor(biome, seed) {
        this.biome = biome;
        this.seed = seed;
        this.width = WORLD_WIDTH;
        this.height = WORLD_HEIGHT;
        this.tiles = [];
        this._generate();
    }

    _generate() {
        const rng = mulberry32(this.seed);
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = this._genTile(x, y, rng);
            }
        }
        // small pond for water-themed biomes
        if (['terraces', 'rainforest', 'tundra'].includes(this.biome.id)) {
            const cx = 6 + Math.floor(rng() * 4), cy = 20 + Math.floor(rng() * 4);
            for (let y = -1; y <= 1; y++) {
                for (let x = -2; x <= 2; x++) {
                    if (Math.abs(x) === 2 && y !== 0) continue;
                    const t = this.tileAt(cx + x, cy + y);
                    if (t && t.type === 'grass') {
                        this.tiles[cy + y][cx + x] = { type: 'water', walkable: false };
                    }
                }
            }
        }
    }

    _genTile(x, y, rng) {
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
            return { type: 'fence', walkable: false };
        }
        // keep the center clear as the guaranteed starting farm patch
        const nearCenter = x >= 11 && x <= 19 && y >= 11 && y <= 19;
        if (!nearCenter) {
            const r = rng();
            if (r < 0.055) return { type: 'tree', walkable: false };
            if (r < 0.075) return { type: 'rock', walkable: false };
            if (r < 0.09) return { type: 'prop', walkable: false };
        } else {
            rng(); // keep the stream aligned regardless of branch
        }
        return { type: 'grass', walkable: true, plot: null };
    }

    tileAt(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
        return this.tiles[Math.floor(y)][Math.floor(x)];
    }

    isWalkable(x, y) {
        const t = this.tileAt(Math.round(x), Math.round(y));
        return !!t && t.walkable;
    }

    randomWalkable(rng) {
        for (let tries = 0; tries < 40; tries++) {
            const x = 1 + Math.floor(rng() * (this.width - 2));
            const y = 1 + Math.floor(rng() * (this.height - 2));
            const t = this.tileAt(x, y);
            if (t && t.walkable && !t.plot) return { x, y };
        }
        return null;
    }

    // ---- rendering --------------------------------------------------------

    // Ground pass (cached per restoration tier on an offscreen canvas:
    // redrawing 900 tiles every frame is the single biggest perf cost).
    _groundCache(atlas, tier) {
        if (this._cache && this._cacheTier === tier && this._cacheAtlas === atlas) {
            return this._cache;
        }
        const cv = document.createElement('canvas');
        cv.width = this.width * TILE_PX;
        cv.height = this.height * TILE_PX;
        const ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const t = this.tiles[y][x];
                if (t.type === 'water') {
                    atlas.draw(ctx, 'water/0', x * TILE_PX, y * TILE_PX);
                } else {
                    const v = tileHash(x, y, this.seed) % 3;
                    atlas.draw(ctx, `ground/${tier}/${v}`, x * TILE_PX, y * TILE_PX);
                }
            }
        }
        this._cache = cv;
        this._cacheTier = tier;
        this._cacheAtlas = atlas;
        return cv;
    }

    invalidateGround() { this._cache = null; }

    drawGround(ctx, atlas, camera, score) {
        const tier = tierForScore(score);
        const cache = this._groundCache(atlas, tier);
        ctx.drawImage(cache,
            camera.x * TILE_PX, camera.y * TILE_PX, camera.wPx, camera.hPx,
            0, 0, camera.wPx, camera.hPx);
    }

    // Obstacles are drawn in the y-sorted entity pass (trees overlap tiles above)
    obstacles(camera) {
        const out = [];
        const x0 = Math.max(0, Math.floor(camera.x) - 1);
        const y0 = Math.max(0, Math.floor(camera.y) - 1);
        const x1 = Math.min(this.width, Math.ceil(camera.x + camera.wPx / TILE_PX) + 1);
        const y1 = Math.min(this.height, Math.ceil(camera.y + camera.hPx / TILE_PX) + 2);
        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                const t = this.tiles[y][x];
                if (t.type !== 'grass' && t.type !== 'water') {
                    out.push({ x, y, type: t.type });
                }
            }
        }
        return out;
    }

    static obstacleFrame(type, score) {
        if (type === 'tree') return `tree/${tierForScore(score)}`;
        if (type === 'rock') return 'rock';
        if (type === 'prop') return 'prop';
        if (type === 'fence') return 'fence';
        return null;
    }
}

export class Camera {
    constructor() {
        this.x = 0; this.y = 0;     // top-left, in tiles (fractional)
        this.wPx = 0; this.hPx = 0; // viewport CSS px
    }

    resize(wPx, hPx) {
        this.wPx = wPx;
        this.hPx = hPx;
    }

    follow(target, world, dt) {
        const wTiles = this.wPx / TILE_PX, hTiles = this.hPx / TILE_PX;
        const tx = target.x + 0.5 - wTiles / 2;
        const ty = target.y + 0.5 - hTiles / 2;
        // critically-damped-ish smoothing
        const k = Math.min(1, dt * 6);
        this.x += (tx - this.x) * k;
        this.y += (ty - this.y) * k;
        this.clamp(world);
    }

    clamp(world) {
        const wTiles = this.wPx / TILE_PX, hTiles = this.hPx / TILE_PX;
        this.x = Math.max(0, Math.min(this.x, world.width - wTiles));
        this.y = Math.max(0, Math.min(this.y, world.height - hTiles));
        if (world.width < wTiles) this.x = (world.width - wTiles) / 2;
        if (world.height < hTiles) this.y = (world.height - hTiles) / 2;
    }

    toScreen(tx, ty) {
        return { x: (tx - this.x) * TILE_PX, y: (ty - this.y) * TILE_PX };
    }

    toTile(sx, sy) {
        return { x: Math.floor(this.x + sx / TILE_PX), y: Math.floor(this.y + sy / TILE_PX) };
    }
}
