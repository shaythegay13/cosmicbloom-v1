# Store Submission Checklist — Farm & Give

Work through this top to bottom. Items marked **(code: done)** are already
implemented in this repo; the rest are dashboard/account tasks only you can do.

## 0. Accounts & money (start immediately — lead times apply)

- [ ] **Apple Developer Program** ($99/yr) — enroll at developer.apple.com.
      Individual is fine; an LLC needs a D-U-N-S number (1–2 week lead time).
- [ ] **Google Play Console** ($25 one-time) — play.google.com/console.
      ⚠️ New *personal* accounts must run a **closed test with 12+ testers for
      14 days** before production access. Budget this into the schedule or use
      an organization account.
- [ ] **RevenueCat** account (free tier) — app.revenuecat.com.
- [ ] **MongoDB Atlas** M0 cluster (free) + **Render** account for the backend.
- [ ] Paid Apps agreements + banking/tax forms in App Store Connect AND
      Play Console (payouts blocked until complete).

## 1. Backend deployment

- [ ] Create Atlas cluster, get `MONGODB_URI`.
- [ ] Deploy via `render.yaml` (Blueprints → connect repo). Set env vars:
      `MONGODB_URI`, `REVENUECAT_WEBHOOK_AUTH`, `CLIENT_URL`.
- [ ] Seed charities: `npm run seed` against the production DB.
- [ ] Verify `https://<app>.onrender.com/api/health`, `/privacy`, `/terms`.

## 2. RevenueCat & products

Products (create with EXACTLY these IDs in App Store Connect → In-App
Purchases (type: Consumable) and Play Console → In-app products, then add
to RevenueCat as one Offering): **(code: done — server/config/products.js)**

| Product ID | Name | Suggested price |
|---|---|---|
| `fag_coins_pouch` | Coin Pouch (500) | $1.99 |
| `fag_coins_chest` | Coin Chest (1,500) | $4.99 |
| `fag_coins_wagon` | Coin Wagon (4,000) | $9.99 |
| `fag_supporter_pack` | Supporter Pack (2,500) | $9.99 |

- [ ] RevenueCat: create iOS + Android apps, paste store credentials
      (App Store Connect API key; Play service account JSON).
- [ ] RevenueCat → Integrations → Webhooks: URL
      `https://<backend>/api/payments/revenuecat/webhook`, Authorization
      header = the `REVENUECAT_WEBHOOK_AUTH` env value. **(code: done)**
- [ ] Put the public SDK keys in `.env.production`:
      `VITE_REVENUECAT_KEY_IOS=appl_…`, `VITE_REVENUECAT_KEY_ANDROID=goog_…`,
      plus `VITE_API_URL=https://<backend>/api`, then rebuild
      (`npm run client:build && npx cap sync`).
- [ ] Sandbox-test a purchase on TestFlight + Play internal track; confirm
      coins arrive and a Transaction row exists with the charity split.

## 3. Build & sign

iOS (needs a Mac with Xcode):
- [ ] `npx cap open ios` → Signing & Capabilities → select your Team.
- [ ] Add the **In-App Purchase** capability.
- [ ] Bump `MARKETING_VERSION`/build number; Product → Archive → upload.
- Portrait-only + `ITSAppUsesNonExemptEncryption=false` **(code: done)**

Android:
- [ ] `npx cap open android`; create an upload keystore
      (`keytool -genkey -v -keystore upload.keystore …`), configure signing in
      `android/app/build.gradle`, enroll in **Play App Signing**.
- [ ] Build AAB: `cd android && ./gradlew bundleRelease`.
- Portrait-only **(code: done)**; minSdk per Capacitor default (23+).

## 4. Store listings

Both stores:
- [ ] Privacy policy URL: `https://<backend>/privacy` **(page: done)**
- [ ] Support URL/email; marketing screenshots from real builds
      (iPhone 6.9" + 6.5" required; Play: phone + 7" + 10" tablet + 1024x500
      feature graphic). Suggested shots: lush vs barren same-farm comparison,
      world map with rewind rings, creature petting, shop with charity note.
- [ ] Description leading with the hook: *travel the world, start farms,
      rewind the planet — and 10% of proceeds fund real community gardens.*

Apple privacy nutrition label (App Store Connect → App Privacy):
- Data used to track you: **none**
- Data linked to you: Contact Info (email), Identifiers (user ID),
  Purchases (purchase history) — all "App Functionality"
- [ ] Fill exactly as above (matches the app's actual behavior).

Google Data Safety form:
- [ ] Collected: email, user IDs, purchase history. Encrypted in transit: yes.
      Deletion mechanism: yes (in-app). No data shared with third parties for
      ads/analytics.

Age rating questionnaires:
- [ ] Apple: expect 4+. Google IARC: expect Everyone. Declare target
      audience 13+ (the app has accounts; avoids child-data obligations).
      Do NOT enroll in Apple Kids Category.

## 5. Review readiness

- [ ] Create a **demo account** for reviewers (pre-leveled, 2 regions
      unlocked, some coins) and put its credentials in App Review notes.
- [ ] Review notes: "IAP are consumable coin packs via RevenueCat. The app
      is fully playable offline; account features need connectivity. We donate
      10% of our proceeds to community gardens (we are not collecting
      donations from users — see /terms)."
- [ ] Charity copy audit (Apple 3.2.2 / Play donations policy): all strings
      say "**we donate** 10% of proceeds"; purchases are never called
      donations. **(code: done — audit again before each release)**
- [ ] Account deletion works end-to-end. **(code: done — test on device)**

## 6. Rollout

- [ ] TestFlight internal → external beta (≥1 week soak, watch crash logs).
- [ ] Play internal testing → closed testing (the 12-tester/14-day gate for
      personal accounts) → production.
- [ ] Phased release on both stores; monitor RevenueCat dashboard + server
      logs for webhook errors in week 1.

## 7. Post-launch hygiene

- [ ] Respond to reviews; watch for refund webhooks reversing charity totals.
- [ ] Publish a donation transparency post periodically (builds trust in the
      10% pledge and is good marketing).
