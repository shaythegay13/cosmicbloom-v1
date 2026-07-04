// Cosmic Bloom — loads the JSON content database from Resources/GameData.
// Copy unity/GameData/*.json into Assets/Resources/GameData/ (see unity/README.md).
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using UnityEngine;

namespace CosmicBloom.Data
{
    public static class GameDatabase
    {
        public static IReadOnlyList<RegionDef> Regions { get; private set; }
        public static IReadOnlyList<CropDef> Crops { get; private set; }
        public static IReadOnlyList<NpcDef> Npcs { get; private set; }
        public static IReadOnlyList<QuestDef> Quests { get; private set; }
        public static IReadOnlyList<AnimalDef> Animals { get; private set; }
        public static IReadOnlyList<ToolDef> Tools { get; private set; }

        static Dictionary<string, RegionDef> _regionById;
        static Dictionary<string, CropDef> _cropById;
        static Dictionary<string, NpcDef> _npcById;
        static Dictionary<string, QuestDef> _questById;

        public static bool Loaded { get; private set; }

        public static void LoadAll()
        {
            if (Loaded) return;

            Regions = LoadList<RegionDef>("GameData/regions", "regions");
            Crops   = LoadList<CropDef>("GameData/crops", "crops");
            Npcs    = LoadList<NpcDef>("GameData/npcs", "npcs");
            Quests  = LoadList<QuestDef>("GameData/quests", "quests");
            Animals = LoadList<AnimalDef>("GameData/animals", "animals");
            Tools   = LoadList<ToolDef>("GameData/tools", "tools");

            _regionById = Regions.ToDictionary(r => r.id);
            _cropById   = Crops.ToDictionary(c => c.id);
            _npcById    = Npcs.ToDictionary(n => n.id);
            _questById  = Quests.ToDictionary(q => q.id);

            Loaded = true;
            Debug.Log($"[GameDatabase] {Regions.Count} regions, {Crops.Count} crops, " +
                      $"{Npcs.Count} NPCs, {Quests.Count} quests, {Animals.Count} animals, {Tools.Count} tools");
        }

        static List<T> LoadList<T>(string resourcePath, string rootKey)
        {
            var asset = Resources.Load<TextAsset>(resourcePath);
            if (asset == null)
            {
                Debug.LogError($"[GameDatabase] Missing Resources/{resourcePath}.json");
                return new List<T>();
            }
            var root = JsonConvert.DeserializeObject<Dictionary<string, List<T>>>(asset.text);
            return root != null && root.TryGetValue(rootKey, out var list) ? list : new List<T>();
        }

        public static RegionDef Region(string id) => _regionById.GetValueOrDefault(id);
        public static CropDef Crop(string id) => _cropById.GetValueOrDefault(id);
        public static NpcDef Npc(string id) => _npcById.GetValueOrDefault(id);
        public static QuestDef Quest(string id) => _questById.GetValueOrDefault(id);
        public static IEnumerable<CropDef> CropsFor(string regionId) => Crops.Where(c => c.region == regionId);
    }
}
