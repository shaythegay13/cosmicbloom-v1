// UI Manager: HUD, modals, toasts, shop, charity, world-map panels.
// DOM-based chrome around the canvas; sprite icons are drawn from atlases.
import { api } from './api.js';
import { getBiome, tierForScore } from './data/biomes.mjs';

const TIER_LABELS = ['Barren', 'Recovering', 'Thriving'];

export class UIManager {
    constructor() {
        this.game = null;
        this.screens = {};
        this.modals = {};
        this.init();
    }

    bindGame(game) {
        this.game = game;
    }

    init() {
        this.screens = {
            loading: document.getElementById('loading-screen'),
            auth: document.getElementById('auth-screen'),
            character: document.getElementById('character-screen'),
            game: document.getElementById('game-screen')
        };
        this.modals = {
            shop: document.getElementById('shop-modal'),
            charity: document.getElementById('charity-modal'),
            menu: document.getElementById('menu-modal'),
            unlock: document.getElementById('unlock-modal')
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', e => this.switchAuthTab(e.target.dataset.tab));
        });
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', e => this.closeModal(e.target.closest('.modal')));
        });
        Object.values(this.modals).forEach(modal => {
            if (!modal) return;
            modal.addEventListener('click', e => {
                if (e.target === modal) this.closeModal(modal);
            });
        });

        document.getElementById('shop-btn')?.addEventListener('click', () => this.openShop());
        document.getElementById('charity-btn')?.addEventListener('click', () => {
            this.openModal(this.modals.charity);
            this.loadCharityData();
        });
        document.getElementById('menu-btn')?.addEventListener('click', () => {
            this.openModal(this.modals.menu);
        });
        document.getElementById('map-btn')?.addEventListener('click', () => {
            this.game.showWorldMap();
        });
        document.getElementById('map-back-btn')?.addEventListener('click', () => {
            this.game.showRegion(this.game.state.currentRegion);
        });

        // settings toggles
        document.getElementById('toggle-music')?.addEventListener('change', e => {
            this.game.state.settings.music = e.target.checked;
            this.game.state._changed();
        });
        document.getElementById('toggle-sfx')?.addEventListener('change', e => {
            this.game.state.settings.sfx = e.target.checked;
            this.game.state._changed();
        });
    }

    // ---- screens ---------------------------------------------------------
    showScreen(name) {
        Object.values(this.screens).forEach(s => s && s.classList.remove('active'));
        if (this.screens[name]) this.screens[name].classList.add('active');
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}-form`);
        });
    }

    openModal(modal) { if (modal) modal.classList.add('active'); }
    closeModal(modal) { if (modal) modal.classList.remove('active'); }

    showError(elementId, message) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.textContent = message;
        setTimeout(() => { el.textContent = ''; }, 5000);
    }

    // ---- HUD ---------------------------------------------------------------
    updateHud(state) {
        const set = (id, v) => {
            const el = document.getElementById(id);
            if (el) el.textContent = v;
        };
        set('player-name', state.username || '');
        set('player-level', state.level);
        set('player-coins', state.coins.toLocaleString());
        const xpBar = document.getElementById('xp-fill');
        if (xpBar) xpBar.style.width = `${Math.min(100, (state.xp / state.xpNeeded()) * 100)}%`;

        // settings checkboxes reflect state
        const music = document.getElementById('toggle-music');
        if (music) music.checked = !!state.settings.music;
        const sfx = document.getElementById('toggle-sfx');
        if (sfx) sfx.checked = !!state.settings.sfx;

        this.renderSeedChips(state);
    }

    showFarmHud(biome, farm) {
        document.getElementById('hud-bottom').style.display = '';
        document.getElementById('region-pill').style.display = '';
        document.getElementById('map-hud').style.display = 'none';
        document.getElementById('region-name').textContent = `${biome.emoji} ${biome.name}`;
        this.updateRestoration(farm);
        this.renderSeedChips(this.game.state);
    }

    showMapHud(planetPct) {
        document.getElementById('hud-bottom').style.display = 'none';
        document.getElementById('region-pill').style.display = 'none';
        const mapHud = document.getElementById('map-hud');
        mapHud.style.display = '';
        document.getElementById('planet-progress').textContent = `🌍 Planet ${planetPct}% rewound`;
    }

    updateRestoration(farm) {
        const fill = document.getElementById('restore-fill');
        const label = document.getElementById('restore-label');
        if (!fill) return;
        const score = farm.restoration || 0;
        fill.style.width = `${score}%`;
        label.textContent = `${Math.floor(score)}% · ${TIER_LABELS[tierForScore(score)]}`;
    }

    // ---- seed selector -------------------------------------------------------
    renderSeedChips(state) {
        const bar = document.getElementById('seed-bar');
        if (!bar || !this.game) return;
        const biome = getBiome(state.currentRegion);
        if (!biome) return;
        bar.innerHTML = '';
        for (const crop of biome.crops) {
            const qty = state.seeds[crop.id] || 0;
            const chip = document.createElement('button');
            chip.className = 'seed-chip' + (state.selectedSeed === crop.id ? ' selected' : '');
            chip.title = `${crop.name} (${qty})`;
            const icon = this.atlasIcon(`biome-${biome.id}`, `seed/${crop.id}`, 36);
            if (icon) chip.appendChild(icon);
            const count = document.createElement('span');
            count.className = 'seed-count';
            count.textContent = qty;
            chip.appendChild(count);
            chip.addEventListener('click', () => {
                state.selectedSeed = crop.id;
                this.game.audio.unlock();
                this.game.audio.sfx('ui');
                this.renderSeedChips(state);
            });
            bar.appendChild(chip);
        }
    }

    // small canvas with an atlas frame drawn into it
    atlasIcon(atlasName, frame, size = 36) {
        const atlas = this.game.assets.atlases.get(atlasName);
        if (!atlas || !atlas.has(frame)) return null;
        const f = atlas.frames[frame];
        const c = document.createElement('canvas');
        c.width = size; c.height = size;
        c.className = 'pixel-icon';
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const s = Math.min(size / f.w, size / f.h);
        ctx.drawImage(atlas.image, f.x, f.y, f.w, f.h,
            (size - f.w * s) / 2, (size - f.h * s) / 2, f.w * s, f.h * s);
        return c;
    }

    // ---- shop -------------------------------------------------------------
    openShop() {
        this.openModal(this.modals.shop);
        this.renderShop();
    }

    renderShop() {
        const container = document.getElementById('shop-items');
        const state = this.game.state;
        const biome = getBiome(state.currentRegion);
        container.innerHTML = '';
        for (const crop of biome.crops) {
            const item = document.createElement('div');
            item.className = 'shop-item';
            const icon = this.atlasIcon(`biome-${biome.id}`, `seed/${crop.id}`, 48);
            if (icon) item.appendChild(icon);
            const name = document.createElement('div');
            name.className = 'shop-item-name';
            name.textContent = `${crop.name} Seeds${crop.native ? ' ★' : ''}`;
            const info = document.createElement('div');
            info.className = 'shop-item-info';
            info.textContent = `Sells ${crop.sellPrice} · +${crop.restore}🌿${crop.native ? ' x1.5' : ''}`;
            const price = document.createElement('div');
            price.className = 'shop-item-price';
            price.textContent = `🪙 ${crop.seedPrice}`;
            const owned = document.createElement('div');
            owned.className = 'shop-item-owned';
            owned.textContent = `owned: ${state.seeds[crop.id] || 0}`;
            item.append(name, info, price, owned);
            item.addEventListener('click', () => {
                if (state.spendCoins(crop.seedPrice)) {
                    state.addSeeds(crop.id, 1);
                    state.selectedSeed = crop.id;
                    this.game.audio.sfx('coin');
                    this.renderShop();
                    this.game.emit('seedBought', { id: crop.id });
                } else {
                    this.game.audio.sfx('error');
                    this.toast('Not enough coins — harvest some crops!');
                }
            });
            container.appendChild(item);
        }
    }

    // ---- unlock/travel panel -------------------------------------------------
    showUnlockPanel(biome) {
        const modal = this.modals.unlock;
        document.getElementById('unlock-title').textContent = `${biome.emoji} ${biome.name}`;
        document.getElementById('unlock-desc').textContent =
            `${biome.place} — this land has been worn down and needs a farmer's care. ` +
            `Travel there to start a new farm and rewind it back to life.`;
        document.getElementById('unlock-cost').textContent =
            `🪙 ${biome.unlock.coins} · requires Level ${biome.unlock.level}`;
        const btn = document.getElementById('unlock-confirm-btn');
        const state = this.game.state;
        const affordable = state.coins >= biome.unlock.coins && state.level >= biome.unlock.level;
        btn.disabled = !affordable;
        btn.textContent = affordable ? 'Travel & Restore' :
            (state.level < biome.unlock.level ? `Reach Level ${biome.unlock.level}` : 'Not enough coins');
        btn.onclick = async () => {
            this.closeModal(modal);
            await this.game.unlockAndTravel(biome);
        };
        this.openModal(modal);
    }

    // ---- toasts & banners ------------------------------------------------------
    toast(message, ms = 2600) {
        const host = document.getElementById('toast-host');
        const el = document.createElement('div');
        el.className = 'toast';
        el.textContent = message;
        host.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 350);
        }, ms);
    }

    banner(title, subtitle = '') {
        const host = document.getElementById('toast-host');
        const el = document.createElement('div');
        el.className = 'banner';
        el.innerHTML = `<div class="banner-title"></div><div class="banner-sub"></div>`;
        el.querySelector('.banner-title').textContent = title;
        el.querySelector('.banner-sub').textContent = subtitle;
        host.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 400);
        }, 3600);
    }

    // ---- charity ------------------------------------------------------------
    async loadCharityData() {
        try {
            const impact = await api.getMyImpact();
            document.getElementById('my-contribution').textContent =
                `$${impact.totalContributed.toFixed(2)}`;
            const stats = await api.getImpactStats();
            document.getElementById('total-donated').textContent =
                `$${stats.totalDonated.toFixed(2)}`;
        } catch {
            // offline — leave defaults
        }
        this.renderCharities();
    }

    async renderCharities(filters = {}) {
        const container = document.getElementById('charity-list');
        try {
            const charities = await api.getCharities(filters);
            container.innerHTML = '';
            if (!charities.length) {
                container.innerHTML = '<p>No community gardens found in this area.</p>';
                return;
            }
            charities.forEach(charity => {
                const item = document.createElement('div');
                item.className = 'charity-item';
                item.innerHTML = `
                    <h4></h4>
                    <p class="charity-loc"></p>
                    <p class="charity-desc"></p>
                    <p><strong class="charity-supporters"></strong></p>`;
                item.querySelector('h4').textContent = charity.name;
                item.querySelector('.charity-loc').textContent =
                    `📍 ${charity.location.city}, ${charity.location.state}`;
                item.querySelector('.charity-desc').textContent = charity.description;
                item.querySelector('.charity-supporters').textContent =
                    `💚 ${charity.supporters} supporters · $${charity.totalReceived.toFixed(2)} received`;
                item.addEventListener('click', async () => {
                    try {
                        await api.selectCharity(charity._id);
                        container.querySelectorAll('.charity-item').forEach(el =>
                            el.classList.remove('selected'));
                        item.classList.add('selected');
                        this.toast(`💚 You're now supporting ${charity.name}!`);
                    } catch {
                        this.toast('Could not select garden — try again online.');
                    }
                });
                container.appendChild(item);
            });
        } catch {
            container.innerHTML = '<p>Connect to the internet to browse community gardens.</p>';
        }
    }

    // ---- character select -------------------------------------------------------
    renderCharacters(characters) {
        const grid = document.getElementById('character-grid');
        grid.innerHTML = '';
        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.dataset.characterId = char.id;
            const bonusText = char.bonus.replace(/_/g, ' ');
            card.innerHTML = `
                <div class="character-avatar"></div>
                <h3></h3><p></p>
                <div class="character-bonus"></div>`;
            card.querySelector('h3').textContent = char.name;
            card.querySelector('p').textContent = char.description;
            card.querySelector('.character-bonus').textContent = `+${bonusText}`;
            const avatar = card.querySelector('.character-avatar');
            avatar.style.backgroundColor = char.color + '33';
            const icon = this.game && this.game.assets.core
                ? this.atlasIcon('core', `char/${char.id}/down/0`, 72)
                : null;
            if (icon) avatar.appendChild(icon);
            else avatar.textContent = { sunny: '☀️', luna: '🌙', terra: '🌍', river: '💧', sage: '🧙' }[char.id] || '👤';
            card.addEventListener('click', () => this.selectCharacter(char.id));
            grid.appendChild(card);
        });
    }

    selectCharacter(characterId) {
        document.querySelectorAll('.character-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.characterId === characterId);
        });
        const confirmBtn = document.getElementById('confirm-character-btn');
        confirmBtn.disabled = false;
        confirmBtn.dataset.characterId = characterId;
    }
}

export const ui = new UIManager();
