// Cosmic Bloom — REST client for the existing Farm & Give backend (server/).
// Endpoints: /api/auth/register, /api/auth/login, /api/game/save, /api/game/load.
// JWT is stored in PlayerPrefs; the server issues 30-day sliding tokens via
// the X-Refreshed-Token response header.
using System;
using System.Collections;
using CosmicBloom.Core;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using UnityEngine;
using UnityEngine.Networking;

namespace CosmicBloom.Net
{
    public static class ApiClient
    {
        const string TokenKey = "cb_jwt";

        public static string Token
        {
            get => PlayerPrefs.GetString(TokenKey, null);
            set { PlayerPrefs.SetString(TokenKey, value ?? ""); PlayerPrefs.Save(); }
        }

        public static bool IsAuthenticated => !string.IsNullOrEmpty(Token);

        public static IEnumerator Register(string username, string email, string password,
                                           Action<bool, string> done)
            => Auth("/api/auth/register", new { username, email, password }, done);

        public static IEnumerator Login(string email, string password, Action<bool, string> done)
            => Auth("/api/auth/login", new { email, password }, done);

        static IEnumerator Auth(string path, object body, Action<bool, string> done)
        {
            using var req = JsonPost(path, body);
            yield return req.SendWebRequest();
            if (req.result != UnityWebRequest.Result.Success)
            {
                done?.Invoke(false, ErrorOf(req));
                yield break;
            }
            var json = JObject.Parse(req.downloadHandler.text);
            Token = (string)json["token"];
            done?.Invoke(true, null);
        }

        public static IEnumerator SaveToServer(SaveSnapshot save, Action<bool> done)
        {
            using var req = JsonPost("/api/game/save", new { gameProgress = save });
            Authorize(req);
            yield return req.SendWebRequest();
            CaptureRefreshedToken(req);
            done?.Invoke(req.result == UnityWebRequest.Result.Success);
        }

        public static IEnumerator LoadFromServer(Action<SaveSnapshot> done)
        {
            using var req = UnityWebRequest.Get(Config.GameConfig.ApiBaseUrl + "/api/game/load");
            Authorize(req);
            yield return req.SendWebRequest();
            CaptureRefreshedToken(req);
            if (req.result != UnityWebRequest.Result.Success)
            {
                done?.Invoke(null);
                yield break;
            }
            var json = JObject.Parse(req.downloadHandler.text);
            var progress = json["gameProgress"];
            done?.Invoke(progress != null && progress.Type != JTokenType.Null
                ? progress.ToObject<SaveSnapshot>()
                : null);
        }

        public static void Logout() => Token = null;

        // ── helpers ──
        static UnityWebRequest JsonPost(string path, object body)
        {
            var req = new UnityWebRequest(Config.GameConfig.ApiBaseUrl + path, "POST");
            byte[] payload = System.Text.Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(body));
            req.uploadHandler = new UploadHandlerRaw(payload);
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");
            return req;
        }

        static void Authorize(UnityWebRequest req)
        {
            if (IsAuthenticated) req.SetRequestHeader("Authorization", "Bearer " + Token);
        }

        static void CaptureRefreshedToken(UnityWebRequest req)
        {
            var refreshed = req.GetResponseHeader("X-Refreshed-Token");
            if (!string.IsNullOrEmpty(refreshed)) Token = refreshed;
        }

        static string ErrorOf(UnityWebRequest req)
        {
            try
            {
                var json = JObject.Parse(req.downloadHandler.text);
                return (string)json["error"] ?? req.error;
            }
            catch { return req.error; }
        }
    }
}
