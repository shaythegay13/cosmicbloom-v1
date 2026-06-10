# Manual QA Checklist — Farm & Give

Run before every store submission. Device matrix: iPhone SE (small/no notch),
iPhone 15/16 Pro (notch + ProMotion), a mid-range Android (e.g. Moto G/Pixel a),
one Android tablet (layout stretch).

## First-run & accounts
- [ ] Fresh install → register → character select → tutorial completes
- [ ] All 7 tutorial steps trigger from real actions; Skip works
- [ ] Log out → log in restores the exact save (coins/plots/restoration)
- [ ] Login on a second device picks the newer save (play on A, open B)
- [ ] Delete account: wrong password rejected; correct password deletes;
      re-registering the same email starts fresh

## Core loop (each on at least 2 devices)
- [ ] Tap-to-move paths around trees/rocks/water; avatar never clips walls
- [ ] Tap far farm tile: walks adjacent, then performs the action
- [ ] Till → plant → water → bubble shows star → harvest; coins/XP correct
- [ ] Out of seeds → toast + shop opens; buying seeds updates chips
- [ ] Crops grow while app is closed (plant, kill app, wait a stage, reopen)
- [ ] Restoration meter rises on harvest; at 34% ground/trees visibly improve;
      at 40%+ creatures appear; petting a creature shows hearts + haptic
- [ ] Milestone banners at 25/50/75/100% with coin rewards (once each)

## Travel
- [ ] Map shows planet + 7 nodes with correct lock/unlock states
- [ ] Unlock panel math (coins + level gates) correct; unlocking deducts coins
- [ ] Each biome loads with its own tiles/crops/creatures/music
- [ ] Return travel keeps every farm's state intact

## Offline & sync
- [ ] Airplane mode: game boots from local save and plays fully
- [ ] Charity modal shows a friendly offline message
- [ ] Reconnect: save syncs (verify via second device or DB)
- [ ] Interruption: background mid-action, take a call, return — no freeze,
      no double-save corruption

## IAP (sandbox accounts)
- [ ] Coin packs listed with localized store prices
- [ ] Purchase happy path: coins credited (banner), Transaction recorded
      server-side with 10% charity allocation
- [ ] Cancel mid-purchase: no coins, no crash, no stuck spinner
- [ ] Kill app immediately after purchase → relaunch → coins still arrive
      (server credit + sync)
- [ ] Refund (sandbox/console) → coins clawed back on next sync

## Mobile chrome
- [ ] Safe areas: HUD clear of notch/home indicator on iPhone Pro + SE
- [ ] Portrait locked; no layout break on tablet
- [ ] Android back button: closes open modal first, then backgrounds app
- [ ] Status bar legible on both platforms
- [ ] Audio: starts only after first tap (iOS), mute toggles persist,
      music changes per biome, no audio after backgrounding

## Performance & stability
- [ ] 30-minute soak on mid-range Android: steady frame rate, no heat/battery
      red flags, memory stable (Chrome devtools / Xcode instruments)
- [ ] Rapid-tap spam on tiles/buttons: no crashes or duplicated actions
- [ ] Fully restored region (100%) renders correctly with max creatures

## Legal & copy
- [ ] /privacy and /terms reachable from the in-app menu links
- [ ] No string anywhere calls a purchase a "donation"
