// Crop sprites — every crop is a parameterized variation of a few archetypes
// (stalk, bush, root, vine, flower) so all 28 crops share one visual language.
// 5 stages: 0 sprout, 1 small, 2 mid, 3 mature, 4 ready-to-harvest.
import { Px, TILE, shade, leafPair, flowerStamp } from '../style.mjs';

function sprout(px, leaf) {
    px.vline(16, 24, 4, shade(leaf, -0.15));
    px.set(15, 23, leaf);
    px.set(17, 23, leaf);
    px.set(15, 22, shade(leaf, 0.2));
    px.set(17, 22, shade(leaf, 0.2));
}

function stalkCrop(px, stage, color, leaf) {
    const heights = [0, 8, 14, 19, 22];
    const h = heights[stage];
    const baseY = 28;
    px.vline(16, baseY - h, h, shade(leaf, -0.2));
    // leaves along the stalk
    for (let y = baseY - 3; y > baseY - h + 3; y -= 4) {
        leafPair(px, 16, y, leaf);
        px.set(14, y - 1, shade(leaf, 0.18));
    }
    if (stage >= 3) {
        // grain head / fruit cluster at top
        const top = baseY - h;
        px.blob(16, top - 1, 3, 4, stage === 4 ? color : shade(color, -0.25));
        if (stage === 4) {
            px.set(14, top - 3, shade(color, 0.3));
            px.set(17, top, shade(color, 0.3));
        }
    }
}

function bushCrop(px, stage, color, leaf) {
    const sizes = [0, 4, 6, 8, 9];
    const r = sizes[stage];
    px.blob(16, 28 - r + 1, r + 1, r * 0.8 + 1, leaf);
    if (stage >= 2) px.blob(11, 26, 3, 2, shade(leaf, 0.15));
    if (stage === 4) {
        // ripe berries/fruit
        for (const [dx, dy] of [[-4, -2], [3, -4], [0, 1], [5, 0], [-2, -6]]) {
            px.set(16 + dx, 24 + dy, color);
            px.set(16 + dx + 1, 24 + dy, shade(color, 0.25));
        }
    } else if (stage === 3) {
        for (const [dx, dy] of [[-3, -2], [3, -3]]) {
            px.set(16 + dx, 24 + dy, shade(color, -0.3));
        }
    }
}

function rootCrop(px, stage, color, leaf) {
    // leafy top grows; the root/produce shows at the soil line when ready
    const tops = [0, 3, 5, 7, 8];
    const r = tops[stage];
    for (let i = -r; i <= r; i += 2) {
        px.vline(16 + i, 26 - r + Math.abs(i / 2), r - Math.abs(i / 2) + 2, i % 4 === 0 ? leaf : shade(leaf, 0.15));
    }
    if (stage === 4) {
        // shoulders of the root pushing out of the soil
        px.blob(16, 28, 4, 2.5, color);
        px.hline(14, 27, 5, shade(color, 0.2));
    }
}

function vineCrop(px, stage, color, leaf) {
    // low sprawling vine with a big fruit
    const spread = [0, 4, 7, 10, 12];
    const s = spread[stage];
    for (let i = -s; i <= s; i += 3) {
        px.blob(16 + i, 27, 2.5, 1.8, i % 2 === 0 ? leaf : shade(leaf, -0.12));
    }
    px.hline(16 - s, 28, s * 2, shade(leaf, -0.25));
    if (stage >= 3) {
        const big = stage === 4;
        const r = big ? 5 : 3;
        px.blob(19, 26 - r / 2, r, r * 0.85, big ? color : shade(color, -0.3));
        if (big) {
            px.set(19, 21, shade(leaf, -0.3)); // stem nub
            px.set(17, 24, shade(color, 0.3));
        }
    }
}

function flowerCrop(px, stage, color, leaf) {
    const heights = [0, 6, 11, 15, 17];
    const h = heights[stage];
    const baseY = 28;
    px.vline(16, baseY - h, h, shade(leaf, -0.18));
    if (stage >= 1) leafPair(px, 16, baseY - 2, leaf);
    if (stage >= 2) leafPair(px, 16, baseY - 6, leaf);
    if (stage === 3) {
        // bud
        px.blob(16, baseY - h - 1, 2, 3, shade(color, -0.25));
    } else if (stage === 4) {
        // full bloom
        px.blob(16, baseY - h - 2, 4, 4, color);
        flowerStamp(px, 16, baseY - h - 2, shade(color, 0.3), '#f2c94c');
        px.set(13, baseY - h - 4, shade(color, 0.2));
        px.set(19, baseY - h, shade(color, 0.2));
    }
}

const ARCHETYPES = { stalk: stalkCrop, bush: bushCrop, root: rootCrop, vine: vineCrop, flower: flowerCrop };

export function cropSprite(crop, stage) {
    const px = new Px(TILE, TILE);
    if (stage === 0) {
        sprout(px, crop.leaf);
    } else {
        ARCHETYPES[crop.archetype](px, stage, crop.color, crop.leaf);
    }
    px.outline();
    return px;
}

// Seed packet icon for shop/HUD (16x16 look inside a 32 cell)
export function seedPacketSprite(crop) {
    const px = new Px(TILE, TILE);
    px.rect(8, 6, 16, 20, '#ece2cc');
    px.rect(8, 6, 16, 4, shade(crop.color, -0.05));
    px.rect(9, 7, 14, 1, shade(crop.color, 0.25));
    // crop glyph on the packet
    px.blob(16, 17, 4, 4, crop.color);
    px.set(16, 12, crop.leaf);
    px.set(15, 13, crop.leaf);
    px.hline(10, 24, 12, shade('#ece2cc', -0.18));
    px.outline();
    return px;
}
