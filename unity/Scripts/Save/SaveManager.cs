// Cosmic Bloom — local-first saves + server snapshot sync.
// Mirrors client/js/storage.js from the web game: debounced local writes,
// periodic server sync with saveVersion last-write-wins, save on pause,
// offline fast-forward on resume.
using System.IO;
using CosmicBloom.Core;
using CosmicBloom.Farming;
using CosmicBloom.Net;
using UnityEngine;

namespace CosmicBloom.Save
{
    public class SaveManager : MonoBehaviour
    {
        public static SaveManager Instance { get; private set; }

        [Tooltip("Seconds between debounced local writes after a change")]
        public float localDebounce = 1.5f;
        [Tooltip("Seconds between server sync attempts (0 = disabled)")]
        public float serverSyncInterval = 60f;

        public GameState State { get; private set; }
        public FarmingSystem Farming { get; private set; }

        static string SavePath => Path.Combine(Application.persistentDataPath, "cosmicbloom_save.json");

        float _dirtyTimer = -1f;
        float _syncTimer;

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            State = new GameState(LoadLocal());
            Farming = new FarmingSystem(State);
            State.OnDirty += () => _dirtyTimer = localDebounce;

            Farming.FastForward();   // apply time that passed while the app was closed
        }

        void Update()
        {
            if (_dirtyTimer > 0f && (_dirtyTimer -= Time.deltaTime) <= 0f)
                WriteLocal();

            if (serverSyncInterval > 0f && ApiClient.IsAuthenticated)
            {
                _syncTimer += Time.deltaTime;
                if (_syncTimer >= serverSyncInterval)
                {
                    _syncTimer = 0f;
                    StartCoroutine(ApiClient.SaveToServer(State.Save, null));
                }
            }
        }

        void OnApplicationPause(bool paused)
        {
            if (paused)
            {
                WriteLocal();
                if (ApiClient.IsAuthenticated)
                    StartCoroutine(ApiClient.SaveToServer(State.Save, null));
            }
            else
            {
                Farming.FastForward();   // crops grew while backgrounded
            }
        }

        void OnApplicationQuit() => WriteLocal();

        public void WriteLocal()
        {
            _dirtyTimer = -1f;
            File.WriteAllText(SavePath, State.Save.ToJson());
        }

        static SaveSnapshot LoadLocal()
        {
            if (!File.Exists(SavePath)) return new SaveSnapshot();
            try { return SaveSnapshot.FromJson(File.ReadAllText(SavePath)); }
            catch { return new SaveSnapshot(); }
        }

        /// <summary>After login: pick the newer of local vs server save (by saveVersion).</summary>
        public void ResolveWithServer(SaveSnapshot server)
        {
            if (server != null && server.schema == 2 && server.saveVersion > State.Save.saveVersion)
            {
                State = new GameState(server);
                Farming = new FarmingSystem(State);
                State.OnDirty += () => _dirtyTimer = localDebounce;
                Farming.FastForward();
                WriteLocal();
            }
        }
    }
}
