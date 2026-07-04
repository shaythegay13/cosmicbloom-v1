// Cosmic Bloom — core farm loop: till → plant → water → (stage timer) → harvest,
// plus soil health and offline fast-forward. Ported from the proven web-game
// logic (client/js/farming.js): watering gates every stage; elapsed real time
// is applied on load/resume so crops grow while the app is closed.
using System;
using CosmicBloom.Core;
using CosmicBloom.Data;

namespace CosmicBloom.Farming
{
    public class FarmingSystem
    {
        readonly GameState _state;
        public event Action<string, int, int> OnAction;   // action, x, y (for FX/SFX/quests)

        public const float SoilRegenPerMinuteFallow = 1.5f;   // fallow plots heal over time
        public const float SoilFloorToPlant = 15f;            // too depleted to plant below this

        public FarmingSystem(GameState state) => _state = state;

        static string Key(int x, int y) => $"{x},{y}";
        static long NowMs() => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        public PlotState PlotAt(int x, int y) =>
            _state.CurrentFarm.plots.GetValueOrDefault(Key(x, y));

        /// <summary>What the contextual action button should show for this tile, or null.</summary>
        public string ActionFor(int x, int y)
        {
            var plot = PlotAt(x, y);
            if (plot == null || !plot.tilled) return "till";
            if (plot.crop == null) return plot.soilHealth >= SoilFloorToPlant ? "plant" : null;
            var def = GameDatabase.Crop(plot.crop.id);
            if (plot.crop.stage >= def.stages - 1) return "harvest";
            if (plot.crop.needsWater) return "water";
            return null; // growing
        }

        public bool Till(int x, int y)
        {
            var key = Key(x, y);
            var farm = _state.CurrentFarm;
            if (farm.plots.TryGetValue(key, out var existing) && existing.tilled) return false;
            farm.plots[key] = new PlotState { tilled = true, soilHealth = existing?.soilHealth ?? 100f };
            Fire("till", x, y);
            return true;
        }

        public bool Plant(int x, int y, string cropId)
        {
            var plot = PlotAt(x, y);
            var def = GameDatabase.Crop(cropId);
            if (plot == null || !plot.tilled || plot.crop != null || def == null) return false;
            if (plot.soilHealth < SoilFloorToPlant) return false;
            if (!_state.Save.seeds.TryGetValue(cropId, out var count) || count <= 0) return false;

            _state.Save.seeds[cropId] = count - 1;
            if (_state.Save.seeds[cropId] == 0) _state.Save.seeds.Remove(cropId);

            plot.crop = new CropState { id = cropId, stage = 0, stageStart = NowMs(), needsWater = true };
            Fire("plant", x, y);
            return true;
        }

        public bool Water(int x, int y)
        {
            var plot = PlotAt(x, y);
            if (plot?.crop == null || !plot.crop.needsWater) return false;
            plot.crop.needsWater = false;
            plot.crop.stageStart = NowMs();   // stage timer starts when watered
            Fire("water", x, y);
            return true;
        }

        public bool Harvest(int x, int y)
        {
            var plot = PlotAt(x, y);
            if (plot?.crop == null) return false;
            var def = GameDatabase.Crop(plot.crop.id);
            if (plot.crop.stage < def.stages - 1) return false;

            _state.AddCoins(def.sellPrice);
            _state.AddXp(def.xp);

            var farm = _state.CurrentFarm;
            float restore = def.restore * (def.native ? 1.5f : 1f);   // native-crop rewilding bonus
            farm.restoration = Math.Clamp(farm.restoration + restore, 0f, 100f);

            // Soil: harvesting a normal crop drains; cover crops (negative drain) restore
            plot.soilHealth = Math.Clamp(plot.soilHealth - def.soilDrain, 0f, 100f);
            plot.crop = null;
            Fire("harvest", x, y);
            return true;
        }

        long _lastTick = NowMs();

        /// <summary>
        /// Advance all crops and soil by real elapsed time. Call every few seconds
        /// while playing AND once on app resume/load (offline growth). A crop
        /// advances at most one stage per watering — matching the web game.
        /// </summary>
        public void FastForward()
        {
            long now = NowMs();
            float elapsedMinutes = (now - _lastTick) / 60_000f;
            _lastTick = now;

            foreach (var plot in _state.CurrentFarm.plots.Values)
            {
                if (plot.crop == null)
                {
                    // fallow regeneration: empty tilled plots heal with real elapsed time
                    if (plot.tilled && plot.soilHealth < 100f)
                        plot.soilHealth = Math.Clamp(
                            plot.soilHealth + SoilRegenPerMinuteFallow * elapsedMinutes, 0f, 100f);
                    continue;
                }

                var def = GameDatabase.Crop(plot.crop.id);
                if (def == null || plot.crop.needsWater) continue;
                if (plot.crop.stage >= def.stages - 1) continue;

                // day/night gate: crop's window must be open to advance in real time.
                // (Offline elapsed time ignores the gate for fairness on long absences.)
                bool offlineCatchup = now - plot.crop.stageStart > def.GrowMsPerStage * 2;
                if (!offlineCatchup && !(TimeManager.Instance?.GrowWindowOpen(def.growsAt) ?? true)) continue;

                if (now - plot.crop.stageStart >= def.GrowMsPerStage)
                {
                    plot.crop.stage++;
                    plot.crop.stageStart = now;
                    if (plot.crop.stage < def.stages - 1)
                        plot.crop.needsWater = true;   // each stage needs a fresh watering
                }
            }
        }

        void Fire(string action, int x, int y)
        {
            _state.MarkDirty();
            OnAction?.Invoke(action, x, y);
        }
    }
}
