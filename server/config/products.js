// IAP catalog: maps store product IDs (configured identically in App Store
// Connect, Google Play Console and the RevenueCat dashboard) to in-game
// grants. The server is the source of truth for what each product awards.
module.exports = {
  'fag_coins_pouch': { name: 'Coin Pouch', coins: 500 },
  'fag_coins_chest': { name: 'Coin Chest', coins: 1500 },
  'fag_coins_wagon': { name: 'Coin Wagon', coins: 4000 },
  'fag_supporter_pack': { name: 'Supporter Pack', coins: 2500 }
};
