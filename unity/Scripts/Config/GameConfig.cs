// Cosmic Bloom — central configuration.
namespace CosmicBloom.Config
{
    public static class GameConfig
    {
        /// <summary>Backend base URL (no trailing slash). Point at your Render
        /// deployment in production builds, localhost during development.</summary>
#if UNITY_EDITOR || DEVELOPMENT_BUILD
        public const string ApiBaseUrl = "http://localhost:5000";
#else
        public const string ApiBaseUrl = "https://YOUR-RENDER-APP.onrender.com";
#endif

        // ── Monetization (free + one-time full unlock + cosmetics; no ads/timers) ──
        /// <summary>RevenueCat non-consumable that opens Acts 2-4.</summary>
        public const string ProductFullUnlock = "cb_full_unlock";
        /// <summary>Act 1 is always free; content beyond it checks fullGameUnlocked.</summary>
        public const int FreeActLimit = 1;

        // ── Charity (dormant scaffold — DO NOT enable without store-policy review) ──
        // The backend keeps 10%-of-proceeds accounting (Transaction.charityAmount,
        // server/routes/charity.js). The client ships with this OFF and shows no
        // donation copy. When enabled later, copy must say "we donate 10% of our
        // proceeds" — never that a purchase IS a donation (Apple 3.2.2).
        public const bool CharityEnabled = false;

        // ── Save/sync cadence ──
        public const float AutoSaveSeconds = 30f;
        public const float ServerSyncSeconds = 60f;
    }
}
