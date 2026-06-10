// Ambient creature sprites — two body plans (quadruped, bird) parameterized
// by size and palette. 2-frame idle/walk animation each, facing left;
// the engine flips horizontally as needed. Big eyes, chunky silhouettes.
import { Px, TILE, shade } from '../style.mjs';

function quad(creature, frame) {
    const px = new Px(TILE, TILE);
    const c = creature.color;
    const a = creature.accent;
    const big = creature.size === 'big';
    const bodyW = big ? 11 : 8;
    const bodyH = big ? 7 : 5;
    const cy = big ? 18 : 21;
    const bob = frame === 1 ? 1 : 0;

    // body
    px.blob(17, cy + bob, bodyW, bodyH, c);
    // haunch shading
    px.blob(21, cy + 1 + bob, bodyW * 0.45, bodyH * 0.6, shade(c, -0.08));
    // head (facing left)
    const hx = 17 - bodyW + 1, hy = cy - bodyH + (big ? 0 : 1) + bob;
    px.blob(hx, hy, big ? 5 : 4, big ? 5 : 4, c);
    // ears
    px.set(hx - 2, hy - (big ? 5 : 4), a);
    px.set(hx + 2, hy - (big ? 5 : 4), a);
    px.set(hx - 2, hy - (big ? 4 : 3), c);
    px.set(hx + 2, hy - (big ? 4 : 3), c);
    // big friendly eye + cheek
    px.set(hx - 1, hy - 1, '#2d2438');
    px.set(hx - 1, hy - 2, '#ffffff');
    px.set(hx - 3, hy + 1, shade('#e0527a', 0.3));
    // snout
    px.set(hx - (big ? 5 : 4), hy + 1, shade(c, -0.2));
    // legs (alternate per frame)
    const legY = cy + bodyH - 1 + bob;
    const legLen = big ? 5 : 4;
    const off = frame === 1 ? 1 : 0;
    px.rect(11 - off, legY, 2, legLen - bob, shade(c, -0.15));
    px.rect(15 + off, legY, 2, legLen - bob, shade(c, -0.22));
    px.rect(19 - off, legY, 2, legLen - bob, shade(c, -0.15));
    px.rect(23 + off, legY, 2, legLen - bob, shade(c, -0.22));
    // tail
    px.blob(17 + bodyW - 1, cy - 2 + bob, 2, 2, a);
    px.outline();
    return px;
}

function bird(creature, frame) {
    const px = new Px(TILE, TILE);
    const c = creature.color;
    const a = creature.accent;
    const hop = frame === 1 ? -1 : 0;
    const cy = 21 + hop;

    // body
    px.blob(17, cy, 6, 5, c);
    // wing
    px.blob(19, cy + (frame === 1 ? -1 : 1), 4, 2.5, shade(c, -0.12));
    // head
    px.blob(12, cy - 5, 4, 4, c);
    // eye
    px.set(11, cy - 6, '#2d2438');
    px.set(11, cy - 7, '#ffffff');
    // beak
    px.set(8, cy - 5, a);
    px.set(7, cy - 5, shade(a, -0.15));
    // tail feathers
    px.hline(22, cy - 2, 4, a);
    px.hline(22, cy - 1, 3, shade(a, -0.15));
    // legs
    if (frame === 0) {
        px.vline(15, cy + 5, 3, '#b08a4a');
        px.vline(19, cy + 5, 3, '#b08a4a');
    } else {
        px.vline(17, cy + 5, 3, '#b08a4a');
    }
    px.outline();
    return px;
}

export function creatureSprite(creature, frame) {
    return creature.body === 'bird' ? bird(creature, frame) : quad(creature, frame);
}
