// Cosmic Bloom — data definitions matching unity/GameData/*.json.
// Deserialized with Newtonsoft Json.NET (Unity package: com.unity.nuget.newtonsoft-json).
using System;
using System.Collections.Generic;

namespace CosmicBloom.Data
{
    [Serializable]
    public class RegionDef
    {
        public string id;
        public string name;
        public int act;
        public int unlockCoins;
        public int unlockLevel;
        public string description;
        public string skyColor;
        public List<string> groundTiers;
        public List<string> ambientTints;
        public List<LandmarkDef> landmarks;
        public List<int> milestones;
    }

    [Serializable]
    public class LandmarkDef
    {
        public string id;
        public string name;
        public int restoreCost;
        public string unlocks;
    }

    [Serializable]
    public class CropDef
    {
        public string id;
        public string name;
        public string region;
        public string archetype;   // stalk | bush | vine | root | flower
        public string color;
        public string leafColor;
        public int seedPrice;
        public int sellPrice;
        public float growMinutes;  // real-time minutes per growth stage
        public int stages;
        public float restore;      // region restoration points on harvest
        public int xp;
        public int soilDrain;      // negative = cover crop (restores soil)
        public string growsAt;     // day | night | any
        public bool native;
        public string notes;

        public long GrowMsPerStage => (long)(growMinutes * 60_000f / Math.Max(1, stages - 1));
    }

    [Serializable]
    public class NpcDef
    {
        public string id;
        public string name;
        public string region;      // region id the NPC lives in
        public string role;
        public string personality;
        public string activeAt;    // day | night | any
        public string home;
        public Dictionary<string, string> palette;
        public List<string> questIds;
        public Dictionary<string, string> dialogue;
    }

    [Serializable]
    public class QuestStep
    {
        public string type;        // clear_plots | plant_crop | harvest_crop | restore_landmark | ...
        public string crop;
        public string landmark;
        public string region;
        public string item;
        public string animal;
        public string target;
        public string @event;
        public List<string> npcs;
        public int count;
        public int threshold;
        public int kinds;
        public string id;
    }

    [Serializable]
    public class QuestRewards
    {
        public int coins;
        public int xp;
        public List<string> items;
    }

    [Serializable]
    public class QuestDef
    {
        public string id;
        public int act;
        public string title;
        public string giver;       // npc id or null
        public string summary;
        public List<QuestStep> steps;
        public QuestRewards rewards;
        public string unlocks;     // next quest id or null
    }

    [Serializable]
    public class AnimalDef
    {
        public string id;
        public string name;
        public string kind;        // livestock | pet | helper
        public string produce;
        public float produceMinutes;
        public int cost;
        public int unlockLevel;
        public Dictionary<string, string> palette;
        public string notes;
    }

    [Serializable]
    public class ToolDef
    {
        public string id;
        public string name;
        public string action;      // till | water | clear | harvest | fish
        public int tier;
        public int cost;
        public int unlockLevel;
        public string notes;
    }
}
