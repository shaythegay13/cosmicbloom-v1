# 🌍 Farm & Give — Rewind the Planet

A cozy farming game for iOS, Android and the web. Travel to seven regions
around the world, start farms in each, and **rewind** worn-down landscapes
back to life — barren dirt turns to lush meadow, dead trees bloom, and
wildlife returns as you farm. **We donate 10% of our proceeds to real
community gardens** that players pick in-game.

## The game

- 🗺️ **7 biomes**: Prairie Heartland → Old World Countryside → Misty Rice
  Terraces → Golden Savanna → Emerald Rainforest → Red Earth Outback →
  Aurora Tundra, each with native crops, ambient creatures and its own music
- 🌿 **Restoration**: every harvest heals the region (native crops 1.5x);
  the ground, trees, ambient light and wildlife visibly recover through
  three tiers, with milestone rewards at 25/50/75/100%
- 👩‍🌾 **5 farmers** with distinct abilities (faster growth, night yields,
  richer soil, splash watering, bonus XP)
- 📱 **Mobile-first**: tap-to-move with pathfinding, one-tap contextual farm
  actions, haptics, portrait UI with safe-area support
- 🔌 **Offline-first**: fully playable without a connection; saves sync
  (last-write-wins) when you're back online; crops grow while you're away
- 🪙 **Fair monetization**: optional consumable coin packs via native IAP
  (RevenueCat). No ads, no tracking, no pay-to-win

## Tech

| Layer | Stack |
|---|---|
| Game client | Vanilla JS ES modules + HTML5 Canvas, Vite |
| Art | 100% generated pixel art — `npm run art` draws 434 sprites into atlases (see `ART_STYLE_GUIDE.md`) |
| Audio | WebAudio: synthesized SFX + procedural per-biome music |
| Mobile | Capacitor 8 (`ios/`, `android/`), RevenueCat IAP |
| Backend | Node/Express + MongoDB (JWT auth, save sync, charity ledger, RevenueCat webhook) |
| Tests/CI | Vitest (unit + supertest API tests), GitHub Actions with art-determinism gate |

## Develop

```bash
npm install
cp .env.example .env       # set MONGODB_URI etc.
npm run seed               # seed community gardens (needs MongoDB)
npm run dev                # API on :5000 + Vite client on :5173
```

Other scripts: `npm run art` (regenerate atlases + icon/splash masters),
`npm test`, `npm run client:build`, `npx cap run ios|android -l --external`
(native live-reload).

Debug atlas viewer: http://localhost:5173/debug/atlas-viewer.html

## Ship it

- `STORE_SUBMISSION_CHECKLIST.md` — every step to the App Store & Play Store
- `QA_CHECKLIST.md` — device test pass before each submission
- `APP_STORE_LAUNCH_PLAN.md` — the full phased roadmap this repo followed
- `render.yaml` — one-click backend deploy (Render + MongoDB Atlas)

## License

MIT
