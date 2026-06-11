// Farm & Give art style library — the single source of truth for how every
// sprite is drawn. All sprites are built from these primitives so the whole
// game shares one cozy, chunky pixel-art look:
//   - 32px logical grid, rendered at 2x into atlases
//   - automatic 1px dark outline around every silhouette
//   - 2-tone shading, light from the top-left
//   - warm saturated palette defined in client/js/data/biomes.mjs + here

export const SCALE = 2;          // logical px -> atlas px
export const TILE = 32;          // logical tile size

export const OUTLINE = '#2d2438'; // universal soft-dark outline (warm purple-black)

// Shared accent palette (non-biome colors)
export const PAL = {
    skin: ['#f2c9a0', '#d8a276', '#a06a3c'],
    white: '#f5f2ec',
    cream: '#ece2cc',
    coin: '#f2c94c',
    coinDark: '#c99e2e',
    heart: '#e0527a',
    waterDrop: '#6ab8e8',
    sparkle: '#fff3b0',
    bubble: '#fdfaf2',
    bubbleEdge: '#c9bda4'
};

// Deterministic PRNG so `npm run art` output is reproducible
export function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]) {
    return '#' + [r, g, b].map(v => Math.round(clamp01(v / 255) * 255).toString(16).padStart(2, '0')).join('');
}

// Lighten (amt > 0) or darken (amt < 0) a hex color
export function shade(hex, amt) {
    const rgb = hexToRgb(hex);
    if (amt >= 0) {
        return rgbToHex(rgb.map(v => v + (255 - v) * amt));
    }
    return rgbToHex(rgb.map(v => v * (1 + amt)));
}

// A logical-pixel buffer. Coordinates are logical pixels; null = transparent.
export class Px {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.data = new Array(w * h).fill(null);
    }

    set(x, y, c) {
        x = Math.round(x); y = Math.round(y);
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
        this.data[y * this.w + x] = c;
    }

    get(x, y) {
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
        return this.data[y * this.w + x];
    }

    rect(x, y, w, h, c) {
        for (let j = 0; j < h; j++) {
            for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
        }
    }

    hline(x, y, w, c) { this.rect(x, y, w, 1, c); }
    vline(x, y, h, c) { this.rect(x, y, 1, h, c); }

    ellipse(cx, cy, rx, ry, c) {
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
            for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
                const dx = (x - cx) / rx, dy = (y - cy) / ry;
                if (dx * dx + dy * dy <= 1.0) this.set(x, y, c);
            }
        }
    }

    // Cozy shaded blob: base fill, light on the upper-left, shadow lower-right
    blob(cx, cy, rx, ry, base) {
        const light = shade(base, 0.22);
        const dark = shade(base, -0.18);
        this.ellipse(cx, cy, rx, ry, base);
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
            for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
                const dx = (x - cx) / rx, dy = (y - cy) / ry;
                const d = dx * dx + dy * dy;
                if (d > 1.0) continue;
                const lightness = -(dx + dy) / 2;
                if (d > 0.45 && lightness > 0.25) this.set(x, y, light);
                else if (d > 0.5 && lightness < -0.25) this.set(x, y, dark);
            }
        }
    }

    // Scatter single pixels (deterministic given rng)
    speckle(x, y, w, h, c, density, rng) {
        for (let j = 0; j < h; j++) {
            for (let i = 0; i < w; i++) {
                if (rng() < density) this.set(x + i, y + j, c);
            }
        }
    }

    // 1px outline at transparent pixels that touch opaque ones
    outline(color = OUTLINE) {
        const add = [];
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                if (this.get(x, y) !== null) continue;
                if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) {
                    add.push([x, y]);
                }
            }
        }
        add.forEach(([x, y]) => this.set(x, y, color));
    }

    mirrorX() {
        const out = new Px(this.w, this.h);
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                out.set(this.w - 1 - x, y, this.get(x, y));
            }
        }
        return out;
    }

    // Stamp another Px buffer onto this one
    paste(px, ox, oy) {
        for (let y = 0; y < px.h; y++) {
            for (let x = 0; x < px.w; x++) {
                const c = px.get(x, y);
                if (c !== null) this.set(ox + x, oy + y, c);
            }
        }
    }

    // Render to a node-canvas 2d context at SCALE, at atlas position (ax, ay)
    render(ctx, ax, ay) {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                const c = this.get(x, y);
                if (c === null) continue;
                ctx.fillStyle = c;
                ctx.fillRect(ax + x * SCALE, ay + y * SCALE, SCALE, SCALE);
            }
        }
    }
}

// ---- shared shape stamps ----------------------------------------------

// Small grass tuft
export function tuft(px, x, y, c) {
    px.set(x, y, c);
    px.set(x - 1, y + 1, c);
    px.set(x + 1, y + 1, c);
    px.set(x, y + 1, c);
}

// 4-petal flower (3x3)
export function flowerStamp(px, x, y, petal, center) {
    px.set(x, y - 1, petal);
    px.set(x, y + 1, petal);
    px.set(x - 1, y, petal);
    px.set(x + 1, y, petal);
    px.set(x, y, center);
}

// Simple leaf pair on a stem pixel
export function leafPair(px, x, y, c) {
    px.set(x - 1, y, c);
    px.set(x - 2, y, c);
    px.set(x + 1, y, c);
    px.set(x + 2, y, c);
}
