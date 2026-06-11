// Ground tiles, obstacles and props — drawn per biome from its palette.
import { Px, TILE, shade, mulberry32, hashStr, tuft, flowerStamp } from '../style.mjs';

// Ground tile: tier 0 = cracked/dry, 1 = patchy recovery, 2 = lush
export function groundTile(biome, tier, variant) {
    const g = biome.ground[tier];
    const rng = mulberry32(hashStr(`${biome.id}-g${tier}-${variant}`));
    const px = new Px(TILE, TILE);
    px.rect(0, 0, TILE, TILE, g.base);

    // soft texture speckles
    px.speckle(0, 0, TILE, TILE, g.light, 0.06, rng);
    px.speckle(0, 0, TILE, TILE, g.dark, 0.06, rng);

    if (tier === 0) {
        // cracks: meandering dark lines
        for (let n = 0; n < 2 + variant; n++) {
            let x = Math.floor(rng() * TILE);
            let y = Math.floor(rng() * (TILE / 2));
            const len = 8 + Math.floor(rng() * 10);
            for (let i = 0; i < len; i++) {
                px.set(x, y, g.detail);
                x += rng() < 0.5 ? 1 : (rng() < 0.5 ? -1 : 0);
                y += 1;
            }
        }
        // tiny pebbles
        for (let n = 0; n < 3; n++) {
            const x = Math.floor(rng() * (TILE - 2)), y = Math.floor(rng() * (TILE - 2));
            px.set(x, y, g.dark); px.set(x + 1, y, g.light);
        }
    } else if (tier === 1) {
        // sparse tufts of returning grass
        for (let n = 0; n < 4 + variant * 2; n++) {
            tuft(px, 2 + Math.floor(rng() * (TILE - 4)), 2 + Math.floor(rng() * (TILE - 5)), g.detail);
        }
        px.speckle(0, 0, TILE, TILE, shade(g.base, 0.12), 0.05, rng);
    } else {
        // lush: dense tufts + occasional tiny flowers
        for (let n = 0; n < 7 + variant * 2; n++) {
            tuft(px, 2 + Math.floor(rng() * (TILE - 4)), 2 + Math.floor(rng() * (TILE - 5)), g.detail);
        }
        for (let n = 0; n < 1 + (variant % 2); n++) {
            const fc = ['#f5f2ec', '#f2c94c', '#e8a0b8'][Math.floor(rng() * 3)];
            flowerStamp(px, 3 + Math.floor(rng() * (TILE - 6)), 3 + Math.floor(rng() * (TILE - 6)), fc, '#f2c94c');
        }
    }
    return px;
}

// Tilled soil (dry or watered)
export function soilTile(biome, wet) {
    const s = biome.soil;
    const base = wet ? s.wet : s.base;
    const rng = mulberry32(hashStr(`${biome.id}-soil-${wet}`));
    const px = new Px(TILE, TILE);
    px.rect(0, 0, TILE, TILE, base);
    // furrow rows
    for (let y = 3; y < TILE; y += 6) {
        px.hline(1, y, TILE - 2, shade(base, -0.25));
        px.hline(1, y + 1, TILE - 2, shade(base, 0.12));
    }
    px.speckle(0, 0, TILE, TILE, shade(base, 0.1), 0.05, rng);
    // border lip so plots read as raised beds
    px.hline(0, 0, TILE, shade(base, 0.18));
    px.vline(0, 0, TILE, shade(base, 0.18));
    px.hline(0, TILE - 1, TILE, shade(base, -0.3));
    px.vline(TILE - 1, 0, TILE, shade(base, -0.3));
    if (wet) {
        // glisten
        px.speckle(0, 0, TILE, TILE, shade(base, 0.35), 0.03, rng);
    }
    return px;
}

export function waterTile(biome, variant) {
    const w = biome.water;
    const rng = mulberry32(hashStr(`${biome.id}-water-${variant}`));
    const px = new Px(TILE, TILE);
    px.rect(0, 0, TILE, TILE, w.base);
    // wave glints
    for (let n = 0; n < 5; n++) {
        const x = Math.floor(rng() * (TILE - 6)), y = 2 + Math.floor(rng() * (TILE - 4));
        px.hline(x, y, 3 + Math.floor(rng() * 3), w.light);
    }
    px.speckle(0, 0, TILE, TILE, w.dark, 0.05, rng);
    return px;
}

export function pathTile(biome) {
    const g = biome.ground[1];
    const rng = mulberry32(hashStr(`${biome.id}-path`));
    const px = new Px(TILE, TILE);
    const base = shade(g.base, -0.08);
    px.rect(0, 0, TILE, TILE, base);
    for (let n = 0; n < 8; n++) {
        const x = 1 + Math.floor(rng() * (TILE - 5)), y = 1 + Math.floor(rng() * (TILE - 4));
        px.rect(x, y, 2 + Math.floor(rng() * 2), 2, shade(base, 0.15));
    }
    px.speckle(0, 0, TILE, TILE, shade(base, -0.18), 0.05, rng);
    return px;
}

export function fenceTile(biome) {
    const wood = shade(biome.tree.trunk, 0.08);
    const px = new Px(TILE, TILE);
    // two posts + two rails
    px.rect(4, 8, 4, 20, wood);
    px.rect(24, 8, 4, 20, wood);
    px.rect(0, 12, TILE, 3, shade(wood, 0.15));
    px.rect(0, 20, TILE, 3, shade(wood, 0.15));
    px.rect(4, 8, 4, 2, shade(wood, 0.25));
    px.rect(24, 8, 4, 2, shade(wood, 0.25));
    px.outline();
    return px;
}

// Tree: 32x64 tall sprite. state 0 = dead, 1 = recovering, 2 = lush
export function treeSprite(biome, state) {
    const t = biome.tree;
    const px = new Px(TILE, TILE * 2);
    const trunk = t.trunk;
    // trunk
    px.rect(14, 36, 5, 24, trunk);
    px.rect(13, 52, 7, 8, trunk);
    px.vline(14, 36, 24, shade(trunk, 0.18));
    px.vline(18, 36, 24, shade(trunk, -0.2));

    if (state === 0) {
        // dead: bare crooked branches, desaturated
        const dead = t.dead;
        px.rect(14, 36, 5, 24, dead);
        px.vline(14, 36, 24, shade(dead, 0.15));
        px.vline(18, 36, 24, shade(dead, -0.2));
        // branches
        px.hline(8, 30, 8, dead); px.vline(8, 24, 7, dead);
        px.hline(17, 26, 9, dead); px.vline(25, 20, 7, dead);
        px.vline(16, 18, 10, dead); px.set(15, 18, dead); px.set(17, 17, dead);
    } else {
        const leaf = state === 1 ? t.leafMid : t.leafLush;
        if (state === 1) {
            // recovering: smaller, sparser canopy
            px.blob(16, 26, 10, 9, leaf);
            px.blob(10, 32, 6, 5, leaf);
            px.blob(23, 31, 6, 5, leaf);
        } else {
            // lush: big layered canopy
            px.blob(16, 22, 13, 11, leaf);
            px.blob(8, 31, 8, 7, leaf);
            px.blob(24, 31, 8, 7, leaf);
            px.blob(16, 14, 8, 6, shade(leaf, 0.12));
            // fruit / blossom dots
            const rng = mulberry32(hashStr(`${biome.id}-treedots`));
            for (let n = 0; n < 5; n++) {
                px.set(6 + Math.floor(rng() * 20), 14 + Math.floor(rng() * 18), shade(leaf, 0.4));
            }
        }
    }
    px.outline();
    return px;
}

export function rockSprite(biome) {
    const g = biome.ground[0];
    const base = shade(g.dark, 0.25);
    const px = new Px(TILE, TILE);
    px.blob(16, 20, 11, 8, base);
    px.blob(11, 16, 5, 4, shade(base, 0.12));
    px.set(20, 17, shade(base, 0.3));
    px.set(21, 18, shade(base, 0.3));
    px.outline();
    return px;
}

// Biome-specific decorative prop
export function propSprite(biome) {
    const px = new Px(TILE, TILE);
    const kind = biome.prop;
    if (kind === 'boulder') {
        px.blob(16, 19, 12, 9, '#8c8478');
        px.blob(22, 14, 5, 4, '#9c948a');
    } else if (kind === 'haybale') {
        px.blob(16, 20, 11, 8, '#d8b35c');
        px.hline(5, 20, 22, '#b08f3e');
        px.vline(16, 12, 16, '#b08f3e');
    } else if (kind === 'lantern') {
        px.rect(14, 8, 5, 3, '#8a3030');
        px.rect(13, 11, 7, 9, '#d8a23a');
        px.rect(15, 13, 3, 5, '#f5e3a0');
        px.rect(14, 20, 5, 2, '#8a3030');
        px.vline(16, 22, 8, '#5d4426');
    } else if (kind === 'termite') {
        px.blob(16, 22, 8, 7, '#a06a3c');
        px.blob(16, 14, 5, 6, '#a06a3c');
        px.blob(16, 8, 3, 4, '#8f5a32');
    } else if (kind === 'fern') {
        const leaf = biome.tree.leafLush;
        for (const [dx, dy] of [[-6, -2], [6, -2], [-4, -6], [4, -6], [0, -8]]) {
            px.blob(16 + dx, 20 + dy, 4, 2, leaf);
        }
        px.vline(16, 14, 12, shade(leaf, -0.25));
    } else if (kind === 'spinifex') {
        const c = '#b3a05a';
        for (let a = -3; a <= 3; a++) {
            px.vline(16 + a * 3, 18 - Math.abs(a), 10 + Math.abs(a), a % 2 ? c : shade(c, 0.15));
        }
    } else if (kind === 'icerock') {
        px.blob(16, 20, 11, 8, '#b8cad8');
        px.blob(12, 15, 5, 4, '#d5e3ee');
        px.set(20, 17, '#eef5fa');
    } else {
        px.blob(16, 20, 10, 8, '#8c8478');
    }
    px.outline();
    return px;
}
