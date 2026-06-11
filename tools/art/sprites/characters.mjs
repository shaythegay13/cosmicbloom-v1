// Player character sprites — one chibi farmer template, parameterized per
// character (skin, hair, outfit, headwear). 4 directions x 3 frames
// (idle, walk-a, walk-b). Left frames are mirrored from right.
import { Px, TILE, shade, PAL } from '../style.mjs';

export const CHARACTERS = [
    { id: 'sunny', skin: PAL.skin[0], hair: '#f2b13b', outfit: '#e8893a', hat: 'straw' },
    { id: 'luna', skin: PAL.skin[1], hair: '#8a5fc9', outfit: '#5d4a9a', hat: 'moonpin' },
    { id: 'terra', skin: PAL.skin[2], hair: '#5d4226', outfit: '#4f8a3c', hat: 'bandana' },
    { id: 'river', skin: PAL.skin[0], hair: '#4f86c9', outfit: '#3a6ea8', hat: 'none' },
    { id: 'sage', skin: PAL.skin[1], hair: '#b8b4ac', outfit: '#3f7a55', hat: 'wizard' }
];

const HEAD_Y = 12, HEAD_R = 6;

function drawLegs(px, frame, outfit) {
    const dark = shade(outfit, -0.3);
    const y = 26;
    const offA = frame === 1 ? 1 : 0;
    const offB = frame === 2 ? 1 : 0;
    px.rect(13, y, 3, 4 - offA, dark);
    px.rect(17, y, 3, 4 - offB, dark);
    px.rect(13, y + 3 - offA, 3, 1, '#5d4226'); // boots
    px.rect(17, y + 3 - offB, 3, 1, '#5d4226');
}

function drawBody(px, outfit, frame) {
    const bob = frame === 0 ? 0 : 0;
    px.rect(12, 19 + bob, 9, 7, outfit);
    px.rect(12, 19 + bob, 9, 2, shade(outfit, 0.18));
    px.vline(20, 19 + bob, 7, shade(outfit, -0.18));
    // arms
    const armSwing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    px.rect(10, 20 + armSwing, 2, 5, shade(outfit, -0.08));
    px.rect(21, 20 - armSwing, 2, 5, shade(outfit, -0.08));
}

function drawHat(px, ch, dir) {
    if (ch.hat === 'straw') {
        px.rect(8, HEAD_Y - HEAD_R + 1, 17, 2, '#e0c060');
        px.rect(11, HEAD_Y - HEAD_R - 2, 11, 3, '#e8cc74');
        px.hline(11, HEAD_Y - HEAD_R + 1, 11, '#b08f3e');
    } else if (ch.hat === 'wizard') {
        px.rect(9, HEAD_Y - HEAD_R + 1, 15, 2, shade(ch.outfit, -0.1));
        px.rect(13, HEAD_Y - HEAD_R - 3, 7, 4, shade(ch.outfit, -0.1));
        px.rect(15, HEAD_Y - HEAD_R - 6, 3, 3, shade(ch.outfit, -0.1));
        px.set(16, HEAD_Y - HEAD_R - 7, '#f2c94c');
    } else if (ch.hat === 'bandana' && dir !== 'up') {
        px.rect(10, HEAD_Y - HEAD_R, 13, 3, shade(ch.outfit, 0.1));
        px.set(22, HEAD_Y - HEAD_R + 3, shade(ch.outfit, 0.1));
    } else if (ch.hat === 'moonpin' && dir !== 'up') {
        px.set(21, HEAD_Y - HEAD_R + 2, '#f2e9a0');
        px.set(22, HEAD_Y - HEAD_R + 3, '#f2e9a0');
    }
}

function head(px, ch, dir) {
    // hair behind / head / face by direction
    px.blob(16, HEAD_Y, HEAD_R + 1, HEAD_R, ch.skin);
    if (dir === 'up') {
        // back of head: all hair
        px.blob(16, HEAD_Y, HEAD_R + 1, HEAD_R, ch.hair);
    } else {
        // fringe
        px.rect(10, HEAD_Y - HEAD_R + 1, 13, 3, ch.hair);
        px.set(10, HEAD_Y - 2, ch.hair);
        px.set(22, HEAD_Y - 2, ch.hair);
        if (dir === 'down') {
            // two big friendly eyes
            px.set(13, HEAD_Y, '#2d2438'); px.set(13, HEAD_Y - 1, '#ffffff');
            px.set(19, HEAD_Y, '#2d2438'); px.set(19, HEAD_Y - 1, '#ffffff');
            // blush
            px.set(11, HEAD_Y + 2, '#f0a0a8');
            px.set(21, HEAD_Y + 2, '#f0a0a8');
            // smile
            px.set(16, HEAD_Y + 3, shade(ch.skin, -0.35));
        } else {
            // profile (right): one eye
            px.set(12, HEAD_Y, '#2d2438'); px.set(12, HEAD_Y - 1, '#ffffff');
            px.set(10, HEAD_Y + 2, '#f0a0a8');
            // hair sweeps back
            px.rect(19, HEAD_Y - HEAD_R + 1, 4, 6, ch.hair);
        }
    }
    drawHat(px, ch, dir);
}

export function characterSprite(ch, dir, frame) {
    // dir: 'down' | 'up' | 'right' (left is mirrored by the build script)
    const px = new Px(TILE, TILE);
    drawLegs(px, frame, ch.outfit);
    drawBody(px, ch.outfit, frame);
    head(px, ch, dir);
    px.outline();
    return px;
}
