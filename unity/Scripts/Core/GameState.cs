// Cosmic Bloom — runtime player state + the schema-2 save snapshot.
// The snapshot shape MUST stay compatible with the existing backend contract
// (server/routes/game.js#validateSnapshot): schema=2, coins/level caps,
// farms keyed by region id with restoration 0-100.
using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace CosmicBloom.Core
{
    [Serializable]
    public class CropState
    {
        public string id;              // crop def id
        public int stage;              // 0..def.stages-1
        public long stageStart;        // unix ms when current stage began
        public bool needsWater;        // watering gates each stage
    }

    [Serializable]
    public class PlotState
    {
        public bool tilled;
        public float soilHealth = 100f;   // 0-100; planting drains, fallow regenerates
        public CropState crop;            // null when empty
    }

    [Serializable]
    public class FarmState
    {
        public int seed;                              // world-gen seed (deterministic layout)
        public float restoration;                     // 0-100 region rewilding score
        public List<int> milestonesClaimed = new();
        public List<string> landmarksRestored = new();
        public Dictionary<string, PlotState> plots = new();  // "x,y" -> plot
    }

    /// <summary>Schema-2 save snapshot — serialized locally and synced to the server verbatim.</summary>
    [Serializable]
    public class SaveSnapshot
    {
        public int schema = 2;
        public long saveVersion;          // monotonic; server keeps the highest (last-write-wins)
        public long savedAt;              // unix ms
        public int coins;
        public int level = 1;
        public int xp;
        public string currentRegion = "starlight_vale";
        public List<string> unlockedRegions = new() { "starlight_vale" };
        public Dictionary<string, int> seeds = new();       // crop id -> seed count
        public List<string> tools = new() { "cosmic_hoe", "watering_can" };
        public List<string> animals = new();
        public List<string> questsCompleted = new();
        public string activeQuest = "q_arrival";
        public bool fullGameUnlocked;                       // cb_full_unlock entitlement
        public List<string> cosmeticsOwned = new();
        public Dictionary<string, FarmState> farms = new();

        public string ToJson() => JsonConvert.SerializeObject(this);
        public static SaveSnapshot FromJson(string json) =>
            JsonConvert.DeserializeObject<SaveSnapshot>(json) ?? new SaveSnapshot();
    }

    /// <summary>Live player state wrapping the snapshot with events + progression rules.</summary>
    public class GameState
    {
        public SaveSnapshot Save { get; private set; }
        public event Action<int> OnCoinsChanged;
        public event Action<int> OnLevelUp;
        public event Action OnDirty;   // anything changed -> SaveManager debounces a write

        public GameState(SaveSnapshot save) => Save = save ?? new SaveSnapshot();

        public FarmState CurrentFarm
        {
            get
            {
                if (!Save.farms.TryGetValue(Save.currentRegion, out var farm))
                {
                    farm = new FarmState { seed = UnityEngine.Random.Range(1, int.MaxValue) };
                    Save.farms[Save.currentRegion] = farm;
                }
                return farm;
            }
        }

        public static int XpForLevel(int level) => 100 * level;

        public void AddCoins(int amount)
        {
            Save.coins = Math.Max(0, Save.coins + amount);
            OnCoinsChanged?.Invoke(Save.coins);
            MarkDirty();
        }

        public bool SpendCoins(int amount)
        {
            if (Save.coins < amount) return false;
            AddCoins(-amount);
            return true;
        }

        public void AddXp(int amount)
        {
            Save.xp += amount;
            while (Save.xp >= XpForLevel(Save.level))
            {
                Save.xp -= XpForLevel(Save.level);
                Save.level++;
                OnLevelUp?.Invoke(Save.level);
            }
            MarkDirty();
        }

        public void MarkDirty()
        {
            Save.saveVersion++;
            Save.savedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            OnDirty?.Invoke();
        }
    }
}
