// Native in-app purchases via RevenueCat. Coin packs are consumables; the
// server webhook is the source of truth for grants — after a purchase the
// client calls /payments/sync to claim coins (works even if the app died
// mid-purchase: credits wait server-side until the next sync).
import { isNative, platform } from './native.js';
import { api } from './api.js';

const API_KEYS = {
    ios: (import.meta.env && import.meta.env.VITE_REVENUECAT_KEY_IOS) || '',
    android: (import.meta.env && import.meta.env.VITE_REVENUECAT_KEY_ANDROID) || ''
};

let Purchases = null;
let offerings = null;

export async function initIap(game, ui, userId) {
    if (!isNative || !API_KEYS[platform]) return false;
    try {
        ({ Purchases } = await import('@revenuecat/purchases-capacitor'));
        await Purchases.configure({
            apiKey: API_KEYS[platform],
            appUserID: userId // our Mongo user id — matches webhook app_user_id
        });
        const res = await Purchases.getOfferings();
        offerings = res.current;
        renderIapSection(game, ui);
        await claimPendingCoins(game, ui, true);
        return true;
    } catch (e) {
        console.warn('IAP unavailable:', e);
        return false;
    }
}

// Pull any server-credited coins into the local save
export async function claimPendingCoins(game, ui, silent = false) {
    try {
        const { coins } = await api.syncPurchases();
        if (coins > 0) {
            game.state.addCoins(coins);
            game.audio.sfx('coin');
            if (!silent) ui.toast(`🪙 +${coins.toLocaleString()} coins added!`);
            else ui.banner('🪙 Purchase complete!', `+${coins.toLocaleString()} coins`);
        }
        return coins;
    } catch {
        return 0;
    }
}

function renderIapSection(game, ui) {
    const host = document.getElementById('iap-section');
    if (!host || !offerings || !offerings.availablePackages.length) return;
    host.style.display = '';
    const grid = document.getElementById('iap-items');
    grid.innerHTML = '';
    for (const pkg of offerings.availablePackages) {
        const p = pkg.product;
        const item = document.createElement('div');
        item.className = 'shop-item iap-item';
        item.innerHTML = `
            <div class="shop-item-icon">🪙</div>
            <div class="shop-item-name"></div>
            <div class="shop-item-price"></div>
            <div class="shop-item-info">10% of proceeds donated</div>`;
        item.querySelector('.shop-item-name').textContent = p.title.replace(/\(.*\)$/, '').trim();
        item.querySelector('.shop-item-price').textContent = p.priceString;
        item.addEventListener('click', async () => {
            try {
                await Purchases.purchasePackage({ aPackage: pkg });
                // webhook credits coins server-side; claim them now
                setTimeout(() => claimPendingCoins(game, ui), 1200);
            } catch (e) {
                if (!e.userCancelled) ui.toast('Purchase did not complete.');
            }
        });
        grid.appendChild(item);
    }
}
