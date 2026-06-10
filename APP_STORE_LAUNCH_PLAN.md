# Farm & Give — App Store & Play Store Launch Plan
## "Rewind the Planet" edition

## Context

Farm & Give is currently a **web-only** game: Node/Express + MongoDB backend (JWT auth, Stripe payments with 10%-to-charity allocation, real ACGA community-garden data), and a vanilla JS + HTML5 Canvas frontend (~2,500 lines, one 30x30 farm map, 4 crops, 5 emoji-rendered characters). To publish on the Apple App Store and Google Play Store at "finished quality" with Cosmic Coop-comparable visuals and new world-travel + planet-restoration gameplay, the project needs: a native packaging layer, a complete art overhaul, a new biome/restoration game layer, store-compliant monetization (Stripe is **prohibited** for digital goods on both stores), and compliance/QA work.

**User decisions (fixed):**
- Packaging: **Capacitor** wrapper around the upgraded canvas game
- Art: **AI/programmatically generated final art** (Claude-drawn, cozy pixel-art style; no future asset swap)
- Scope: **7 biomes** at launch (prairie/N.America, rainforest/S.America, savanna/Africa, rice terraces/Asia, countryside/Europe, outback/Australia, tundra/Arctic)
- IAP: **RevenueCat** native billing, keeping the 10%-to-charity accounting server-side

**Confirmed engine debt to fix:** tile size 32 hardcoded across 4 files; frame-rate-dependent movement (no deltaTime); touch events just alias clicks (no tap-to-move); world obstacles regenerated randomly each load (saved plots can collide); crop growth math conflicts with the watering gate; canvas not devicePixelRatio-aware; `api.js:4` uses `window.location.origin` (breaks under `capacitor://localhost`).

---

## Phase 0 — Foundation: Vite + ES modules (~2-3 days)

Capacitor needs a built `webDir` and live-reload needs a dev server, so adopt Vite and convert the 7 global-scope client scripts to ES modules.

1. `npm i -D vite concurrently`; new `client/vite.config.js` (root `client`, `build.outDir: '../www'`, dev proxy `/api → localhost:5000`).
2. Convert `client/js/*.js` to `export class`/`import`; `index.html` loads one `<script type="module" src="js/main.js">`.
3. `api.js`: `baseURL = import.meta.env.VITE_API_URL || window.location.origin + '/api'`.
4. New `client/js/config.js` — TILE_SIZE, API URL, save intervals; replace all hardcoded `32`s.
5. DPR-aware canvas in `Game.setupCanvas` (`canvas.width = cssWidth * dpr; ctx.scale(dpr, dpr)`).
6. npm scripts: `client:dev`, `client:build`, combined `dev`; `server/index.js` serves `www/` (fallback `client/` in dev).

**Verify:** full auth → character → farm loop in browser at `localhost:5173`; built `www/` served by `npm start`.

## Phase 1 — Engine upgrades (~3-4 weeks; project core)

All testable in browser; keep emoji rendering as fallback so the game never stops being playable.

- **1a. Sprites:** `client/js/engine/assets.js` (PNG atlas + JSON frames/animations loader, `imageSmoothingEnabled = false`); `engine/renderer.js` (layered draw: ground → detail → objects/crops → creatures → player → overlay, one `worldToScreen()`). Rewrite `World.drawTile`, `FarmingSystem.draw`, `Player.draw` onto it.
- **1b. Fixed timestep:** accumulate deltaTime, 60Hz updates; movement in tiles/sec with smooth sub-tile position + 4-direction walk animation. Fix crop growth to per-stage timers (`stageStartedAt` reset on watering) with **offline fast-forward** from timestamps on load.
- **1c. Scenes + travel:** `engine/scenes.js` — `FarmScene` (refactored current game) + `WorldMapScene` (stylized planet map, 7 region nodes, lock states, per-region rewind-meter ring). `client/js/regions.js` — data-driven region defs (biome palette, crops, obstacles, creatures, unlock cost, milestones) + **seeded world gen** (mulberry32 PRNG, seed persisted per farm — fixes obstacle-respawn bug).
- **1d. Restoration system:** `client/js/restoration.js` — per-region score 0-100 from harvests/native plantings/milestones; drives tile tier art (degraded/recovering/lush at 0-33/34-66/67-100), ambient palette tint, creature spawn counts, dead→living tree transforms, milestone rewards. `engine/creatures.js` — simple wander-AI ambient creatures.
- **1e. Touch controls (high risk — iterate early on real devices):** `engine/input.js` — **tap-to-move with A\* pathfinding** (`engine/pathfinding.js`) + one **contextual action button** (shows Till/Plant/Water/Harvest by tile state); long-press = action radial; drag pans camera; `touch-action: none`; keyboard/mouse kept for dev.
- **1f. Responsive UI:** `env(safe-area-inset-*)`, 44px+ touch targets, portrait-primary, `viewport-fit=cover`.
- **1g. Audio:** `engine/audio.js` — WebAudio; **SFX synthesized at runtime** (oscillator/noise recipes); 3-4 generated music loop WAVs from the Phase 2 pipeline; init on first user gesture (iOS); persisted mute toggles.
- **1h. Local-first save + sync:** `client/js/storage.js` — debounced local saves (localStorage / `@capacitor/preferences` behind one interface), server snapshot sync with `saveVersion` last-write-wins every 60s + on background; full offline boot with cached auth.

**Verify:** browser playtests, DevTools touch emulation, 6x CPU throttle, airplane-mode session.

## Phase 2 — Generated-art pipeline (~2 weeks; highest consistency risk)

**Prove one biome (prairie) end-to-end before mass-producing the other 6.**

- `tools/art/` Node workspace using `@napi-rs/canvas`. **Programmatic pixel art rendered to committed PNG atlases**, `npm run art` regenerates deterministically (CI asserts clean git diff).
  - `tools/art/style.js` — single source of truth: master palette ramps + per-biome degraded/recovering/lush ground ramps, shared primitives (`outline`, `dither`, `shade`, stamps), 1px-outline + 2-tone shading rules. Consistency at scale comes from every sprite using only these primitives.
  - `tools/art/sprites/*.js` — parameterized families (e.g. `drawCrop({base, fruitColor, stage})` so ~30 crops are variations of 4-5 archetypes); `tools/art/build.js` shelf-packs atlases → `client/assets/atlas-{core,biome-*,ui}.png/.json` + 1024² icon master + 2732² splash master; `tools/art/audio.js` writes per-biome music WAVs.
- **Resolution:** 32px logical pixel-art grid rendered at 2x (64px) into atlases — chunky, cozy Cosmic-Coop-style (rounded silhouettes, big-eyed creatures, warm saturated palette).
- **Asset manifest (~650 sprites):** core — 5 characters × 4 directions × 6 frames (shared body template + palette params), effects, UI atlas (9-slice panels, icons, rewind-ring, map nodes), logo. Per biome ×7 — ~15 ground tiles (3 restoration tiers × variants, tilled, watered), ~10 obstacles (incl. dead/recovering/lush trees), 20-25 crop growth sprites, 2-3 ambient creatures × 4 frames (bison, macaw, meerkat, crane, hedgehog, kangaroo, arctic fox), map-node illustration ×3 states.
- `ART_STYLE_GUIDE.md` + hidden `client/debug/atlas-viewer.html` for visual QA.

## Phase 3 — Gameplay content (~1.5-2 weeks)

1. Per-biome crop data in `regions.js` (+ server-side validation list): native-crop bonuses (e.g. rice +25% sell, 2x restoration), tuned so each biome restores in ~2-4 play hours.
2. **Progression:** start in degraded prairie; milestones at 25/50/75/100% grant rewards; 50% unlocks travel to next region (costs coins + level — economy sink); world map planet visibly "rewinds" per restored region; 100% everywhere = Planet Restored celebration.
3. **Charity tie-in:** each virtual region restored highlights the player's real selected community garden; keep `routes/charity.js` as-is. Copy must say "**We donate** 10% of proceeds" (see Phase 6 compliance).
4. **FTUE:** `client/js/tutorial.js` — ~10-step contextual overlay.
5. **Make shop/inventory real:** seeds purchased with coins and consumed (currently `plantSeed` hardcodes free carrots; shop purchase is an `alert` stub); per-biome seed catalogs.

## Phase 4 — Backend (~1 week, parallel with 1-3)

1. **Data model** (`server/models/User.js`): `gameProgress.farms: [{regionId, seed, restorationScore, plots, milestonesClaimed}]` + `currentRegion`, `saveVersion`, `savedAt`; one-time migration of legacy `farm.plots` on load; loose server-side sanity caps.
2. **Stripe → RevenueCat:** remove Stripe from client + `package.json`; rewrite `server/routes/payments.js`: `POST /api/payments/revenuecat/webhook` (auth-header verified) handles purchase events for consumable coin packs — creates `Transaction` (`providerTransactionId`, `provider`), computes 10% charity amount, increments `user.charityContribution` + `Charity.totalReceived`, **credits coins server-side** (webhook = source of truth, `appUserID = user._id`), reverses on `REFUND`; add `POST /api/payments/sync`.
3. **Account deletion (Apple 5.1.1(v) hard blocker):** `DELETE /api/auth/me` — password-verified, deletes user, anonymizes transactions.
4. **Hardening:** `express-rate-limit` (tight on auth), JWT 30d sliding renewal (mobile users can't be logged out weekly), prod logging/CSP cleanup.
5. **Hosting:** Render (or Railway) via `render.yaml` + MongoDB Atlas M0; env vars in `.env.example`; server keeps serving `www/` for web + legal pages.

**Verify:** RevenueCat dashboard test events via ngrok; curl tests for deletion + multi-farm save/load.

## Phase 5 — Capacitor (~1 week)

1. `npx cap init "Farm & Give" com.farmandgive.app --web-dir=www`; add iOS + Android; plugins: `@capacitor/{preferences,haptics,status-bar,splash-screen,app,network}`, `@revenuecat/purchases-capacitor`; `capacitor.config.ts` with `server.androidScheme: 'https'`.
2. `client/js/native.js` — platform detect, Preferences storage adapter, haptics, pause/resume hooks (save on background, fast-forward crops on resume), Android back button, network listener.
3. CORS: allow `capacitor://localhost` + `https://localhost`; `VITE_API_URL` baked in `.env.production`.
4. `client/js/iap.js` — RevenueCat Offerings → native-priced coin-pack shop tab; purchase → instant grant + `/payments/sync`. Products configured in App Store Connect, Play Console, RevenueCat.
5. `npx capacitor-assets generate` from Phase 2 icon/splash masters.
6. iOS: signing, portrait-only, `ITSAppUsesNonExemptEncryption=false`, no tracking SDKs. Android: minSdk 23+, signed AAB, Play App Signing.
7. Dev loop: `npx cap run ios|android -l --external` with Vite.

**Verify:** full loop on iOS Simulator + real iPhone + mid-range Android; sandbox IAP; airplane-mode then sync.

## Phase 6 — Store compliance & submission (~1 week work + 1-2 weeks review)

1. **Start day 1 (lead times):** Apple Developer $99/yr, Play Console $25, RevenueCat account, paid-apps/tax/banking agreements on both stores.
2. **Legal:** privacy policy + ToS at `/privacy`, `/terms` (static `client/legal/*.html`), linked in-app.
3. Apple privacy nutrition label + Google Data Safety form (email, user ID, purchases; nothing "used to track"; deletion available).
4. **Charity-copy audit (Apple 3.2.2 / Play donation policy):** model is "company donates its own proceeds" — allowed; never phrase purchases as donations.
5. Age rating: IARC + Apple questionnaires (expect 4+/Everyone); not enrolling in Kids Category; declare 13+ target on Play.
6. **Store assets:** screenshots (iPhone 6.9" + 6.5"; Play phone/tablet + 1024×500 feature graphic); iPhone-only at launch to cut QA scope.
7. **Review readiness:** pre-leveled demo reviewer account in notes; consumable-IAP explanation; offline-tolerance already built.
8. TestFlight internal → external beta; Play internal → closed track. **Note:** new personal Play accounts require 12 testers/14 days closed testing before production — bake into timeline.
9. `STORE_SUBMISSION_CHECKLIST.md` tracking all of the above.

## Phase 7 — Quality (~1 week, continuous)

1. **Tests:** `vitest` + `supertest` + `mongodb-memory-server` — crop growth/fast-forward math, restoration scoring, save round-trip, unlock rules, auth/save/webhook API tests. `.github/workflows/ci.yml`: install → `npm run art` (clean-diff determinism check) → test → build.
2. **Performance budget (Moto G-class):** pre-render static ground layer to offscreen canvas per restoration tier (biggest win vs. current full repaint); one atlas per biome; dpr capped at 2; pooled particles; <150 dynamic sprites/frame, app <40MB.
3. `QA_CHECKLIST.md`: device matrix (iPhone SE/Pro notch/mid Android/tablet), interruption tests (call mid-purchase, background mid-save), offline transitions, IAP happy/cancel/refund, account deletion, fresh FTUE, 30-min thermal soak.

---

## Dependencies & effort

| # | Phase | Effort | Depends on |
|---|-------|--------|-----------|
| 0 | Vite + modules | S (2-3d) | — |
| 1 | Engine upgrades | XL (3-4w) | 0 |
| 2 | Art pipeline (prairie first) | L (2w) | 0; interleaves with 1a |
| 3 | Gameplay content | L (1.5-2w) | 1, 2 |
| 4 | Backend | M (1w) | parallel |
| 5 | Capacitor + IAP | M (1w) | 0, 4 |
| 6 | Compliance/submission | M (1w + review) | accounts day 1; needs 3-5 |
| 7 | Quality | M (1w) | continuous |

**Total: ~9-12 weeks.** Critical path: engine → content → review.

**Top risks:** (1) generated-art quality at finished level — prove prairie fully before scaling to 7 biomes; (2) touch-control feel — prototype on real devices in Phase 1e, not after; (3) IAP/charity-messaging review compliance — copy audit + consumable-only catalog + server-side webhook truth; (4) Phase 1 schedule — keep emoji fallback renderer so the game is always playable.

## Key files

Most-modified existing: `client/js/game.js`, `world.js`, `farming.js`, `player.js`, `ui.js`, `api.js`, `server/models/User.js`, `server/routes/payments.js`, `server/index.js`, `package.json`.
Major new: `client/js/engine/{assets,renderer,scenes,input,pathfinding,audio,creatures}.js`, `client/js/{config,regions,restoration,storage,tutorial,native,iap}.js`, `tools/art/*`, `capacitor.config.ts`, `ios/`, `android/`, `client/legal/*`, `tests/`, `.github/workflows/ci.yml`.

## Verification

- Every phase ends with a browser-playable build (`npm run dev`); Capacitor live-reload (`npx cap run ios -l`) once Phase 5 lands.
- `npm run art` determinism enforced in CI; atlas-viewer page for visual art QA.
- `npm test` (vitest) for game math + API; `QA_CHECKLIST.md` on real devices; sandbox IAP on TestFlight/Play internal before submission.
