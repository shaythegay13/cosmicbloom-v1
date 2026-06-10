// Farm & Give asset build — renders every sprite from the parameterized
// style library into per-biome PNG atlases + JSON metadata, plus the app
// icon and splash masters. Deterministic: same input -> same bytes.
//
// Usage: npm run art   (writes to client/public/atlases and tools/art/out)
import { createCanvas } from '@napi-rs/canvas';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { SCALE, Px } from './style.mjs';
import { BIOMES } from '../../client/js/data/biomes.mjs';
import { groundTile, soilTile, waterTile, pathTile, fenceTile, treeSprite, rockSprite, propSprite } from './sprites/tiles.mjs';
import { cropSprite, seedPacketSprite } from './sprites/crops.mjs';
import { creatureSprite } from './sprites/creatures.mjs';
import { characterSprite, CHARACTERS } from './sprites/characters.mjs';
import * as fx from './sprites/effects.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const ATLAS_DIR = join(ROOT, 'client/public/atlases');
const ICON_DIR = join(ROOT, 'tools/art/out');

// ---- shelf packer ------------------------------------------------------
function packAtlas(name, items, maxW = 1024) {
    items.sort((a, b) => (b.px.h - a.px.h) || a.name.localeCompare(b.name));
    const frames = {};
    let x = 0, y = 0, rowH = 0, atlasW = 0;
    for (const item of items) {
        const w = item.px.w * SCALE, h = item.px.h * SCALE;
        if (x + w > maxW) { x = 0; y += rowH; rowH = 0; }
        frames[item.name] = { x, y, w, h };
        item._pos = { x, y };
        x += w;
        rowH = Math.max(rowH, h);
        atlasW = Math.max(atlasW, x);
    }
    const atlasH = y + rowH;
    const canvas = createCanvas(atlasW, atlasH);
    const ctx = canvas.getContext('2d');
    for (const item of items) {
        item.px.render(ctx, item._pos.x, item._pos.y);
    }
    writeFileSync(join(ATLAS_DIR, `${name}.png`), canvas.toBuffer('image/png'));
    writeFileSync(join(ATLAS_DIR, `${name}.json`), JSON.stringify({
        meta: { scale: SCALE, w: atlasW, h: atlasH },
        frames
    }));
    return { count: items.length, w: atlasW, h: atlasH };
}

// ---- core atlas (characters + effects + indicators) ---------------------
function buildCore() {
    const items = [];
    for (const ch of CHARACTERS) {
        for (const dir of ['down', 'up', 'right']) {
            for (let f = 0; f < 3; f++) {
                const px = characterSprite(ch, dir, f);
                items.push({ name: `char/${ch.id}/${dir}/${f}`, px });
                if (dir === 'right') {
                    items.push({ name: `char/${ch.id}/left/${f}`, px: px.mirrorX() });
                }
            }
        }
    }
    items.push({ name: 'fx/sparkle/0', px: fx.sparkle(0) });
    items.push({ name: 'fx/sparkle/1', px: fx.sparkle(1) });
    items.push({ name: 'fx/droplet/0', px: fx.droplet(0) });
    items.push({ name: 'fx/droplet/1', px: fx.droplet(1) });
    items.push({ name: 'fx/heart', px: fx.heart() });
    items.push({ name: 'fx/coin/0', px: fx.coin(0) });
    items.push({ name: 'fx/coin/1', px: fx.coin(1) });
    items.push({ name: 'fx/pop/0', px: fx.popPuff(0) });
    items.push({ name: 'fx/pop/1', px: fx.popPuff(1) });
    for (let i = 0; i < 4; i++) items.push({ name: `fx/flower/${i}`, px: fx.confettiFlower(i) });
    items.push({ name: 'ind/water', px: fx.waterBubble() });
    items.push({ name: 'ind/ready', px: fx.readyBubble() });
    items.push({ name: 'ind/cursor', px: fx.cursorTile() });
    items.push({ name: 'ind/shadow', px: fx.shadowBlob() });
    return packAtlas('core', items);
}

// ---- per-biome atlas -----------------------------------------------------
function buildBiome(biome) {
    const items = [];
    for (let tier = 0; tier < 3; tier++) {
        for (let v = 0; v < 3; v++) {
            items.push({ name: `ground/${tier}/${v}`, px: groundTile(biome, tier, v) });
        }
    }
    items.push({ name: 'soil/dry', px: soilTile(biome, false) });
    items.push({ name: 'soil/wet', px: soilTile(biome, true) });
    items.push({ name: 'water/0', px: waterTile(biome, 0) });
    items.push({ name: 'path', px: pathTile(biome) });
    items.push({ name: 'fence', px: fenceTile(biome) });
    for (let s = 0; s < 3; s++) items.push({ name: `tree/${s}`, px: treeSprite(biome, s) });
    items.push({ name: 'rock', px: rockSprite(biome) });
    items.push({ name: 'prop', px: propSprite(biome) });
    for (const crop of biome.crops) {
        for (let st = 0; st < 5; st++) {
            items.push({ name: `crop/${crop.id}/${st}`, px: cropSprite(crop, st) });
        }
        items.push({ name: `seed/${crop.id}`, px: seedPacketSprite(crop) });
    }
    for (const cr of biome.creatures) {
        for (let f = 0; f < 2; f++) {
            const px = creatureSprite(cr, f);
            items.push({ name: `creature/${cr.id}/${f}`, px });
            items.push({ name: `creature/${cr.id}/r${f}`, px: px.mirrorX() });
        }
    }
    return packAtlas(`biome-${biome.id}`, items);
}

// ---- app icon + splash masters ------------------------------------------
// A chunky pixel planet being "rewound" to green, with a sprout on top.
function planetArt() {
    const px = new Px(32, 32);
    // planet sphere
    px.blob(16, 18, 11, 11, '#5fa8d8');
    // green continents sweeping in
    px.blob(12, 15, 5, 4, '#5cb56b');
    px.blob(20, 21, 5, 3.5, '#5cb56b');
    px.blob(18, 13, 3, 2.5, '#7cc97a');
    // a remaining brown patch (the part still to restore)
    px.blob(10, 23, 3.5, 2.5, '#a8854f');
    // sprout growing from the top
    px.vline(16, 3, 5, '#3f8a3c');
    px.set(14, 3, '#5cb56b'); px.set(13, 4, '#5cb56b');
    px.set(18, 3, '#5cb56b'); px.set(19, 4, '#5cb56b');
    px.set(14, 2, '#7cc97a'); px.set(18, 2, '#7cc97a');
    // sparkle
    px.set(24, 10, '#fff3b0'); px.set(25, 9, '#ffffff');
    px.outline();
    return px;
}

function buildIconAndSplash() {
    mkdirSync(ICON_DIR, { recursive: true });
    const art = planetArt();

    // icon: 1024x1024, warm radial sky behind the pixel planet
    const icon = createCanvas(1024, 1024);
    const ic = icon.getContext('2d');
    const grad = ic.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0, '#ffe9b8');
    grad.addColorStop(1, '#aee3f5');
    ic.fillStyle = grad;
    ic.fillRect(0, 0, 1024, 1024);
    const s = 28; // 32px art * 28 = 896, centered
    ic.imageSmoothingEnabled = false;
    const tmp = createCanvas(32 * 2, 32 * 2);
    art.render(tmp.getContext('2d'), 0, 0);
    ic.drawImage(tmp, (1024 - 32 * s) / 2, (1024 - 32 * s) / 2 + 16, 32 * s, 32 * s);
    writeFileSync(join(ICON_DIR, 'icon.png'), icon.toBuffer('image/png'));

    // splash: 2732x2732 centered art on soft gradient
    const splash = createCanvas(2732, 2732);
    const sc = splash.getContext('2d');
    const sg = sc.createLinearGradient(0, 0, 0, 2732);
    sg.addColorStop(0, '#fdf6e3');
    sg.addColorStop(1, '#cdeBF5'.toLowerCase());
    sc.fillStyle = sg;
    sc.fillRect(0, 0, 2732, 2732);
    sc.imageSmoothingEnabled = false;
    const ss = 24;
    sc.drawImage(tmp, (2732 - 32 * ss) / 2, (2732 - 32 * ss) / 2, 32 * ss, 32 * ss);
    writeFileSync(join(ICON_DIR, 'splash.png'), splash.toBuffer('image/png'));
}

// ---- run -----------------------------------------------------------------
mkdirSync(ATLAS_DIR, { recursive: true });
const t0 = Date.now();
const core = buildCore();
console.log(`core: ${core.count} frames, ${core.w}x${core.h}`);
for (const biome of BIOMES) {
    const r = buildBiome(biome);
    console.log(`biome-${biome.id}: ${r.count} frames, ${r.w}x${r.h}`);
}
buildIconAndSplash();
console.log(`icon + splash masters written to tools/art/out`);
console.log(`done in ${Date.now() - t0}ms`);
