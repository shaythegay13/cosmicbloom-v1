// Effect, indicator and UI sprites shared across all biomes.
import { Px, TILE, shade, PAL, flowerStamp } from '../style.mjs';

export function sparkle(frame) {
    const px = new Px(16, 16);
    const c = PAL.sparkle;
    if (frame === 0) {
        px.set(8, 6, c); px.set(8, 10, c); px.set(6, 8, c); px.set(10, 8, c); px.set(8, 8, '#ffffff');
    } else {
        px.vline(8, 4, 9, c); px.hline(4, 8, 9, c);
        px.set(8, 8, '#ffffff');
        px.set(6, 6, c); px.set(10, 10, c); px.set(10, 6, c); px.set(6, 10, c);
    }
    return px;
}

export function droplet(frame) {
    const px = new Px(16, 16);
    const c = PAL.waterDrop;
    const y = frame === 0 ? 5 : 9;
    px.set(8, y - 2, c);
    px.blob(8, y, 2, 2.5, c);
    px.set(7, y - 1, shade(c, 0.35));
    px.outline();
    return px;
}

export function heart() {
    const px = new Px(16, 16);
    const c = PAL.heart;
    px.blob(6, 6, 3, 3, c);
    px.blob(10, 6, 3, 3, c);
    px.rect(4, 7, 9, 3, c);
    for (let i = 0; i < 4; i++) px.hline(5 + i, 10 + i, 7 - i * 2, i ? shade(c, -0.1) : c);
    px.set(5, 5, shade(c, 0.3));
    px.outline();
    return px;
}

export function coin(frame) {
    const px = new Px(16, 16);
    const c = PAL.coin;
    if (frame === 0) {
        px.blob(8, 8, 5, 5, c);
        px.ellipse(8, 8, 3, 3, shade(c, -0.12));
        px.set(8, 7, shade(c, 0.35));
        px.set(7, 8, shade(c, 0.35));
    } else {
        // edge-on spin
        px.rect(7, 3, 3, 11, c);
        px.vline(7, 3, 11, shade(c, 0.3));
        px.vline(9, 3, 11, PAL.coinDark);
    }
    px.outline();
    return px;
}

export function popPuff(frame) {
    const px = new Px(16, 16);
    const c = '#fdfaf2';
    const r = frame === 0 ? 3 : 5;
    for (const [dx, dy] of [[-r, 0], [r, 0], [0, -r], [0, r], [-r + 1, -r + 1], [r - 1, r - 1], [r - 1, -r + 1], [-r + 1, r - 1]]) {
        px.set(8 + dx, 8 + dy, c);
        if (frame === 0) px.set(8 + dx, 8 + dy, shade(c, -0.1));
    }
    return px;
}

// Floating "needs water" bubble shown above a thirsty crop
export function waterBubble() {
    const px = new Px(TILE, TILE);
    px.blob(16, 12, 9, 7, PAL.bubble);
    // tail
    px.set(13, 20, PAL.bubble); px.set(12, 21, PAL.bubble);
    // droplet glyph inside
    const c = PAL.waterDrop;
    px.set(16, 8, c);
    px.blob(16, 11, 3, 3.5, c);
    px.set(15, 10, shade(c, 0.35));
    px.outline(PAL.bubbleEdge);
    return px;
}

// Floating "ready to harvest" bubble
export function readyBubble() {
    const px = new Px(TILE, TILE);
    px.blob(16, 12, 9, 7, PAL.bubble);
    px.set(13, 20, PAL.bubble); px.set(12, 21, PAL.bubble);
    // sparkle-star glyph
    const c = '#f2a73b';
    px.vline(16, 8, 7, c);
    px.hline(13, 11, 7, c);
    px.set(14, 9, c); px.set(18, 13, c); px.set(18, 9, c); px.set(14, 13, c);
    px.set(16, 11, '#ffe9b0');
    px.outline(PAL.bubbleEdge);
    return px;
}

// Tile selection cursor (rounded corners highlight)
export function cursorTile() {
    const px = new Px(TILE, TILE);
    const c = '#ffffff';
    const L = 9;
    for (const [ox, oy, dx, dy] of [[1, 1, 1, 0], [1, 1, 0, 1], [30, 1, -1, 0], [30, 1, 0, 1], [1, 30, 1, 0], [1, 30, 0, -1], [30, 30, -1, 0], [30, 30, 0, -1]]) {
        for (let i = 0; i < L; i++) px.set(ox + dx * i, oy + dy * i, c);
    }
    return px;
}

// Soft round shadow blob drawn under characters/creatures
export function shadowBlob() {
    const px = new Px(TILE, TILE);
    px.ellipse(16, 28, 8, 3, 'rgba(45,36,56,0.30)');
    return px;
}

// Little flower used in lush celebrations
export function confettiFlower(i) {
    const px = new Px(16, 16);
    const colors = ['#f2c94c', '#e0527a', '#6ab8e8', '#8a5fc9'];
    flowerStamp(px, 8, 8, colors[i % colors.length], '#fff3b0');
    return px;
}
