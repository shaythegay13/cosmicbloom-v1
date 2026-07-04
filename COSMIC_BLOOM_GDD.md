# Cosmic Bloom: Starlight Rewilding — Game Design Document

**Genre:** Cozy Mobile Farming Sim / Rewilding Adventure
**Platform:** Mobile (iOS / Android), built in **Unity 6 (2D URP)**
**Art style:** Pixel-art hybrid of *Stardew Valley* and *Cosmic Coop* — bright,
vibrant, whimsical with a cosmic twist
**Core theme:** Rewilding a dying galaxy by restoring land, ecosystems and
forgotten cosmic lore.

> This document is the single source of truth for the Unity build. The
> machine-readable version of its content data (regions, crops, NPCs, quests,
> animals, tools) lives in `unity/GameData/*.json` and is loaded by the C#
> starter kit in `unity/Scripts/`.

---

## 1. Art style & visual direction

**Inspirations:** Stardew Valley (warm handcrafted pixel art), Cosmic Coop
(bright, cartoonish space-farming), Celeste/Fez (soft lighting, wonder).

### Palette
- **Cosmic:** deep purples, electric blues, neon pinks, golden yellows
- **Natural:** warm greens, earthy browns, soft whites

### Lighting
- Soft glow on cosmic elements (bioluminescent plants, floating orbs) via
  URP 2D lights
- Dynamic day/night cycle with twinkling stars and auroras
- Aurora burst effects on major restoration milestones

### Characters
- **Protagonist:** customizable pixel-art avatar (human, alien or magical
  creature)
- **NPCs:** expressive, cute, unique silhouettes (farmer with a space helmet,
  botanist with glowing vines)
- **Animals:** cosmic twists on farm classics (star-wool sheep, chickens that
  lay glowing eggs)

### Environments
- **Surface farm (Starlight Vale):** overgrown plots, vines, mushrooms,
  glowing flora; cozy pixel buildings (broken greenhouse, toolshed, barn)
- **Cosmic zones:** crystal caves, floating islands with zero-gravity plots,
  alien biomes (desert cacti that bloom into stars)
- **Sky:** constellations that visibly re-light as regions are restored

### UI/UX
- Minimalist HUD, large touch targets (44px+), readable text
- Tool icons glow faintly when active; progress bars shimmer like stardust;
  menus on holographic/starfield backgrounds

---

## 2. Story & narrative

### Premise
You inherit a neglected cosmic farm in the **Starlight Vale**, where the
**Great Cosmic Tree** once kept the stars alive. The land is barren, crops are
withered, the ecosystem is fading. Rewild the land, restore its magic, revive
the galaxy.

### Act 1 — The Arrival (early game)
- Opening: a mysterious guide greets you — *"The stars are fading, and the
  Vale is dying. But hope isn't lost — if you listen to the land, it will tell
  you its secrets."*
- Clear a small plot, plant your first **Starlight Berry**, unlock basic tools
  (cosmic hoe, watering can, axe)
- Meet **Zyx**, a curious alien farmer — first friend and tutorial guide
- Introduces: day/night cycle, soil health, first animal companion

### Act 2 — The Unraveling (mid game)
- **Old journals** scattered across the map reveal the Starlight Clan's
  downfall
- **Ruined landmarks** (Celestial Arboretum, Moonlit Pond) restore into
  functional areas and unlock lore + abilities
- NPC arcs: **Lumina** (revive the Great Cosmic Tree), **Orbit** (space-rock
  stories), **Elder Nova** (clan history)
- Side quests: *The Lost Seed*, *The Meteor Mystery*, *Festival Preparation*
- Cosmic events: meteor showers (rare seeds), comet visits (temp boosts),
  alien festivals (seasonal gatherings)

### Act 3 — The Restoration (late game)
The **Four Sacred Gardens**, each a themed region:
1. **Sun Garden** — heat-resistant crops, solar-powered tools
2. **Moon Garden** — glow-in-the-dark plants, nocturnal farming
3. **Star Garden** — constellation crops, stargazing events
4. **Nebula Garden** — bioluminescent plants, floating islands

Collect a rare seed from each garden, host the **Cosmic Festival**, plant the
**Heartseed** at the Great Cosmic Tree's roots to restore the galaxy.

### Act 4 — Infinite Bloom (endless)
- New planets with unique challenges; seed import/export with alien traders
- Deep farm customization and decoration
- **Legacy mode:** pass the farm to a new gardener; challenge runs

---

## 3. Core gameplay mechanics

### Rewilding system
- **Soil health (0–100 per plot):** planting drains it; fallow plots
  regenerate over time; cover crops restore it faster
- **Ecosystem balance:** friendly predators control pests; pollinators (bees,
  butterflies) boost yields and spread wildflowers
- **Dynamic wildlife:** animals and plants return to restored areas
  (per-region restoration score 0–100 drives visuals + spawns, carried over
  from the proven web-game system)

### Farming & progression
- Traditional crops (wheat, carrots) + cosmic variants (Starberries, Moon
  Melons, Nebula Peppers)
- **Constellation crops** form star patterns when fully grown
- Day/night-gated crops; watering gates each growth stage; offline
  fast-forward on return
- Tool upgrades: Cosmic Hoe, Solar Watering Can (auto-waters in daylight),
  Alien Harvester (bulk collect)
- Animals: chickens, sheep + cosmic pets (bioluminescent fox, glowing
  axolotl, star slime)

### Exploration & events
- Hidden biomes unlocked by restoring landmarks
- Procedural events: meteor showers, comet visits, alien festivals

*(Multiplayer/co-op: intentionally out of scope — cut from an earlier draft.)*

---

## 4. Mobile design

- **Sessions:** short-term goals (10–15 min loops) + long-term goal (revive
  the Great Cosmic Tree); daily/weekly events
- **No timers/energy walls.** Offline crop growth; the galaxy keeps evolving
- **Controls:** tap-to-move with pathfinding, contextual action button,
  optional auto-tools
- **Accessibility:** visual task cues, progressive optional challenges

---

## 5. Cast & content scale

**50 NPCs — 10 per region** (full roster with dialogue in
`unity/GameData/npcs.json`). The core story cast:

| Name | Role | Personality | Story role |
|---|---|---|---|
| **Zyx** | Alien farmer | Curious, playful | First guide; teaches farming basics |
| **Lumina** | Botanist | Shy, dreamy | Wants to revive the Great Cosmic Tree; Starlight Clan lore |
| **Orbit** | Space-rock collector | Mischievous, energetic | Clan stories; unlocks cosmic events |
| **Elder Nova** | Wise elder | Calm, mysterious | Clan history; guides restoration |
| **Captain Pebble** | Space pirate | Gruff but kind | Trading and exploration side quests |

Each region adds its own supporting cast (forge keepers, moth shepherds,
talking courier hounds, sky chefs…) — flavor NPCs today, side-quest givers
as content grows.

**Content database totals** (`unity/GameData/`):

| Content | Count |
|---|---|
| Quests | 60 — 15 per act |
| NPCs | 50 — 10 per region |
| Crops | 25 farmable + the Heartseed (quest-only finale crop) |
| Animals | 15 (6 livestock, 6 pets, 3 helpers) |
| Tools | 10 (3 till / 3 water / 2 harvest / clear / fish) |
| Regions | 5 (Starlight Vale + Four Sacred Gardens) |

---

## 6. Early-game farm layout (Starlight Vale)

1. **Starting plot** — small overgrown area with a broken greenhouse
2. **Toolshed** — basic tools (hoe, watering can, axe)
3. **Moonlit Pond** — dried up; restore to unlock fishing
4. **Alien Market** — seeds, tools, decorations
5. **NPC homes** — Zyx's house (early quests), Lumina's greenhouse (later)

---

## 7. Monetization (decided)

**Free download + one-time full-game unlock + cosmetic IAP. No ads, no
energy timers, no pay-to-win. Ever.**

- **Act 1 free** (~30–45 min of play), then a single **$4.99 Full Game
  unlock** (non-consumable `cb_full_unlock`) opens Acts 2–4
- **Cosmetic shop:** outfits, tool skins, farm decorations ($0.99–$4.99,
  non-consumables)
- Billing via **RevenueCat** (server webhook + entitlement sync already built
  in `server/routes/payments.js`)

### Charity (dormant scaffold)
The 10%-of-proceeds community-garden donation system from Farm & Give stays
**implemented server-side but disabled in the client** (store donation-policy
compliance needs more legwork). Keep the `Transaction.charityAmount`
accounting and `server/routes/charity.js` intact; ship with
`charityEnabled = false` in the client config. No user-facing donation copy at
launch.

---

## 8. Tech architecture

| Layer | Choice |
|---|---|
| Engine | Unity 6 (6000.x), 2D URP, portrait |
| Language | C# (starter kit in `unity/Scripts/`) |
| Content data | JSON in `unity/GameData/` → `Assets/Resources/GameData/` |
| Backend | Existing Node/Express + MongoDB (`server/`) — unchanged; JWT auth, schema-2 save sync (last-write-wins), RevenueCat webhook |
| Saves | Local-first (persistentDataPath) + server snapshot sync, offline fast-forward |
| IAP | RevenueCat Unity SDK |
| AI tooling | Unity MCP (`com.unity.ai.assistant`) driven from a local agent (Claude Code CLI / Antigravity) |

### Save compatibility
The Unity client reuses the server's **schema-2 snapshot** contract
(`server/routes/game.js#validateSnapshot`): `{ schema: 2, saveVersion, coins,
level, xp, currentRegion, unlockedRegions, farms: { <regionId>: { seed,
restoration: 0–100, milestonesClaimed, plots } } }`. Region ids are the five
Cosmic Bloom regions (`starlight_vale`, `sun_garden`, `moon_garden`,
`star_garden`, `nebula_garden`).

---

## 9. Development phases

1. **Vertical slice (Starlight Vale):** tilemap farm, tap-to-move, till →
   plant → water → harvest with soil health, day/night cycle, Zyx + first 3
   quests, local saves
2. **Systems:** restoration visuals, animals/pets, events, remaining Act 1–2
   quests, server sync + auth
3. **Content:** the Four Sacred Gardens, Acts 2–3, festivals, fishing
4. **Monetization + polish:** RevenueCat, cosmetics shop, audio, FX
5. **Store prep:** the compliance work in `STORE_SUBMISSION_CHECKLIST.md`
   still applies (account deletion, privacy labels, IARC, TestFlight/Play
   closed testing)
