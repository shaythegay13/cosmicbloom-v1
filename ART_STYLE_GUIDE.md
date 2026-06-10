# Farm & Give — Art Style Guide

All art in Farm & Give is **generated programmatically** by `tools/art` (`npm run art`).
This document explains the rules the generator enforces so new sprites stay consistent.

## Core rules

| Rule | Value |
|------|-------|
| Logical grid | 32 px tiles (tall sprites: 32x64) |
| Render scale | 2x into atlases (64 px cells) — nearest-neighbor only |
| Outline | Automatic 1 px outline, `#2d2438` (warm purple-black) on every silhouette |
| Shading | 2-tone: light from **top-left** (+22% lightness), shadow lower-right (−18%) |
| Silhouettes | Chunky, rounded — built from `blob()` ellipses, no thin spindly shapes |
| Faces | Big 1px-highlight eyes, pink blush pixels — every living thing is friendly |

## Palette

Biome palettes live in `client/js/data/biomes.mjs` (single source of truth shared
with the game). Each biome defines:

- **3 ground tiers** (degraded → recovering → lush): `base/dark/light/detail`
- **soil** ramp (dry + wet), **water** ramp, **tree** colors (trunk, lush leaf, mid leaf, dead)
- **sky** color and per-tier ambient **tint** overlays

Shared accents (`tools/art/style.mjs` → `PAL`): coin gold `#f2c94c`, heart pink
`#e0527a`, water-drop blue `#6ab8e8`, bubble cream `#fdfaf2`.

## Parameterized families (how 430+ sprites stay consistent)

- **Crops** (28): five archetypes — `stalk`, `bush`, `root`, `vine`, `flower` —
  each crop is only `{archetype, color, leaf}`. 5 growth stages, stage 0 is a shared sprout.
- **Creatures** (14): two body plans — `quad` (size big/small) and `bird` —
  each creature is only `{body, size, color, accent}`. 2 animation frames, mirrored variants generated.
- **Characters** (5): one chibi farmer template; per character `{skin, hair, outfit, hat}`.
  4 directions x 3 frames; left is mirrored from right.
- **Tiles**: ground texture density/decoration increases with restoration tier
  (cracks → sparse tufts → dense tufts + tiny flowers). Trees have 3 states that
  follow the region's restoration tier (dead → recovering → lush).

## Do / Don't

- **Do** add new sprites as parameter variations of existing families.
- **Do** run `npm run art` and inspect `/debug/atlas-viewer.html` after changes.
- **Don't** hand-edit the PNG atlases — they are build outputs (regenerated deterministically).
- **Don't** introduce new saturated hues outside the biome palettes; reuse `PAL` accents.

## QA

`client/public/debug/atlas-viewer.html` renders every atlas with frame names —
load it via the Vite dev server at `/debug/atlas-viewer.html` and compare biomes
side by side for palette cohesion.
