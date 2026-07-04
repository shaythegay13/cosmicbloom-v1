// Cosmic Bloom — day/night cycle. Crops with growsAt "day"/"night" only
// advance during their window; some NPCs appear only at night.
using System;
using UnityEngine;

namespace CosmicBloom.Core
{
    public class TimeManager : MonoBehaviour
    {
        public static TimeManager Instance { get; private set; }

        [Tooltip("Real-time minutes for one full in-game day")]
        public float dayLengthMinutes = 24f;

        [Tooltip("0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset")]
        [Range(0f, 1f)] public float timeOfDay = 0.3f;

        [Tooltip("Night spans [nightStart, 1] and [0, dayStart]")]
        public float dayStart = 0.25f;
        public float nightStart = 0.78f;

        public bool IsNight => timeOfDay >= nightStart || timeOfDay < dayStart;
        public bool IsDay => !IsNight;
        public int DayNumber { get; private set; } = 1;

        public event Action OnSunrise;
        public event Action OnNightfall;
        public event Action<int> OnNewDay;

        bool _wasNight;

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            _wasNight = IsNight;
        }

        void Update()
        {
            float prev = timeOfDay;
            timeOfDay += Time.deltaTime / (dayLengthMinutes * 60f);
            if (timeOfDay >= 1f)
            {
                timeOfDay -= 1f;
                DayNumber++;
                OnNewDay?.Invoke(DayNumber);
            }

            if (_wasNight && IsDay) OnSunrise?.Invoke();
            else if (!_wasNight && IsNight) OnNightfall?.Invoke();
            _wasNight = IsNight;
        }

        /// <summary>Can a crop with this growsAt window ("day"/"night"/"any") grow right now?</summary>
        public bool GrowWindowOpen(string growsAt) => growsAt switch
        {
            "day" => IsDay,
            "night" => IsNight,
            _ => true,
        };

        /// <summary>Ambient light 0 (deep night) → 1 (noon), for URP 2D global light.</summary>
        public float AmbientIntensity()
        {
            // Smooth curve peaking at noon (0.5), floor of 0.18 at midnight
            float d = Mathf.Cos((timeOfDay - 0.5f) * 2f * Mathf.PI) * 0.5f + 0.5f;
            return Mathf.Lerp(0.18f, 1f, d);
        }
    }
}
