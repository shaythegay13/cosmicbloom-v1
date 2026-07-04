# Cosmic Bloom — Unity starter kit

This folder is the bridge between this repo and your local **CosmicBloom**
Unity 6 project (`C:\Projects\CosmicBloom`). It contains everything
engine-ready that survived the pivot from the web game: the content database,
a C# systems kit wired to the existing backend, and the design doc
(`../COSMIC_BLOOM_GDD.md`).

## What's here

```
unity/
├── GameData/        # content database (JSON) — regions, crops, npcs, quests, animals, tools
└── Scripts/
    ├── Config/GameConfig.cs      # API URL, monetization ids, charity kill-switch
    ├── Core/GameState.cs         # player state + schema-2 save snapshot (server-compatible)
    ├── Core/TimeManager.cs       # day/night cycle, grow windows, ambient light curve
    ├── Data/Definitions.cs       # C# models for the JSON content
    ├── Data/GameDatabase.cs      # Resources loader + lookups
    ├── Farming/FarmingSystem.cs  # till/plant/water/harvest, soil health, offline fast-forward
    ├── Net/ApiClient.cs          # auth + save/load against server/ (JWT, sliding renewal)
    └── Save/SaveManager.cs       # local-first saves, debounce, server sync (last-write-wins)
```

## Import into the Unity project

1. **Install Newtonsoft JSON** (needed for dictionary serialization):
   Package Manager → **+ → Add package by name** → `com.unity.nuget.newtonsoft-json`
2. Copy `Scripts/` → `Assets/Scripts/` in the Unity project
3. Copy `GameData/` → `Assets/Resources/GameData/` (the `Resources` folder name
   is load-bearing — `GameDatabase` loads from there)
4. Create an empty GameObject in your boot scene with **TimeManager** and
   **SaveManager** components
5. Call `GameDatabase.LoadAll()` once at startup (e.g. from SaveManager.Awake
   or a Bootstrap script)

## Backend

The Node/Express server in `../server/` is used as-is — same JWT auth, same
schema-2 save contract, same RevenueCat webhook. Run it locally with
`npm run dev` (from the repo root) and the Editor build talks to
`http://localhost:5000` automatically (see `GameConfig.ApiBaseUrl`).

## Working with Unity MCP (Antigravity / Claude Code)

The official Unity MCP (`com.unity.ai.assistant` package) runs inside the
Unity Editor and is driven by a **local** agent (Google Antigravity or the
Claude Code CLI on the same machine). Typical loop:

1. Open the CosmicBloom project in Unity 6
2. Connect your agent to the Unity MCP server (approve the connection in the
   Editor when prompted)
3. Ask the agent to build scenes/prefabs/tilemaps against these scripts —
   e.g. *"Create a FarmPlot prefab and a 20x20 tilemap for starlight_vale
   using the ground tier colors in regions.json"*

Keep this folder as the source of truth for **content data** (edit the JSON
here, re-copy to `Assets/Resources/GameData/`) so game design stays
reviewable in git alongside the backend it must stay compatible with.

## Design guardrails (carried over)

- **Save schema:** must pass `server/routes/game.js#validateSnapshot` —
  schema 2, coins ≤ 1e8, restoration 0–100, ≤ 1000 plots per farm
- **Monetization:** free Act 1 + `cb_full_unlock` non-consumable + cosmetics.
  No ads, no energy timers, no pay-to-win
- **Charity:** `GameConfig.CharityEnabled = false` until store-policy review;
  never phrase a purchase as a donation
