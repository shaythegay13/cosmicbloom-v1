// Main Game shell: canvas, fixed-timestep loop, scene management,
// save/sync orchestration and cross-cutting events.
import {
    STEP_MS,
    AUTO_SAVE_INTERVAL_MS,
    SERVER_SYNC_INTERVAL_MS,
    MAX_DEVICE_PIXEL_RATIO
} from './config.js';
import { Assets } from './engine/assets.js';
import { Input } from './engine/input.js';
import { AudioEngine } from './engine/audio.js';
import { PlayerState } from './player.js';
import { FarmScene } from './scenes/farm.js';
import { WorldMapScene } from './scenes/worldmap.js';
import { saveLocal, flushLocal, syncToServer } from './storage.js';
import { getBiome } from './data/biomes.mjs';
import { addRestoration } from './restoration.js';

export class Game {
    constructor(ui) {
        this.ui = ui;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.running = false;
        this.viewWidth = 0;
        this.viewHeight = 0;

        this.assets = new Assets();
        this.input = new Input(this.canvas);
        this.scene = null;
        this.farmScenes = new Map(); // regionId -> FarmScene (kept warm)
        this.listeners = new Map();

        this._acc = 0;
        this._lastTime = 0;
        this._lastLocalSave = Date.now();
        this._lastSync = Date.now();

        this._setupCanvas();
        this._wireInput();
        this._wireLifecycle();
    }

    // ---- events -------------------------------------------------------
    on(name, fn) {
        if (!this.listeners.has(name)) this.listeners.set(name, []);
        this.listeners.get(name).push(fn);
    }

    emit(name, payload) {
        (this.listeners.get(name) || []).forEach(fn => fn(payload));
    }

    // ---- setup ----------------------------------------------------------
    _setupCanvas() {
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
            this.viewWidth = this.canvas.clientWidth;
            this.viewHeight = this.canvas.clientHeight;
            this.canvas.width = Math.round(this.viewWidth * dpr);
            this.canvas.height = Math.round(this.viewHeight * dpr);
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.ctx.imageSmoothingEnabled = false;
            if (this.scene) this.scene.resize();
        };
        window.addEventListener('resize', resize);
        this._resize = resize;
    }

    _wireInput() {
        this.input.onTap = (x, y) => {
            if (this.audio) this.audio.unlock();
            if (this.scene) this.scene.onTap(x, y);
        };
        this.input.onDrag = (dx, dy) => {
            if (this.scene) this.scene.onDrag(dx, dy);
        };
    }

    _wireLifecycle() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        window.addEventListener('beforeunload', () => {
            if (this.state) saveLocal(this.state, true);
        });
    }

    // ---- boot -----------------------------------------------------------
    async init(stateData) {
        this.state = new PlayerState(stateData, {
            onChange: () => {
                this.ui.updateHud(this.state);
                saveLocal(this.state);
            },
            onLevelUp: (level) => {
                this.audio.sfx('level');
                this.ui.banner(`⭐ Level ${level}!`, 'You feel more capable.');
            }
        });
        this.audio = new AudioEngine(this.state.settings);

        await this.assets.load('core');
        await this.assets.loadBiome(this.state.currentRegion);

        this._wireFarmEvents();
        this._resize();
        await this.showRegion(this.state.currentRegion);
        this.ui.updateHud(this.state);
    }

    _wireFarmEvents() {
        this.on('harvested', ({ coins, restoration }) => {
            this.audio.sfx('harvest');
            setTimeout(() => this.audio.sfx('coin'), 120);
            if (restoration.milestones.length) {
                const m = restoration.milestones[restoration.milestones.length - 1];
                this.audio.sfx('milestone');
                this.state.addCoins(m.coins);
                const biome = this.scene && this.scene.biome;
                this.ui.banner(`🌿 ${m.label}!`,
                    `${biome ? biome.name : 'This region'} is ${m.score}% rewound · +${m.coins} coins`);
                if (this.scene && this.scene.spawnFx) {
                    this.scene.spawnFx('milestone');
                }
            }
            this.ui.updateRestoration(this.scene.farm);
        });
        this.on('tilled', () => this.audio.sfx('till'));
        this.on('planted', () => this.audio.sfx('plant'));
        this.on('watered', () => this.audio.sfx('water'));
        this.on('noSeeds', () => {
            this.audio.sfx('error');
            this.ui.toast('Out of seeds! Buy more in the shop. 🛒');
            this.ui.openShop();
        });
    }

    // particle hook used by FarmingSystem
    fx(kind, x, y) {
        if (this.scene && this.scene.spawnFx) this.scene.spawnFx(kind, x, y);
    }

    // ---- scenes -----------------------------------------------------------
    async showRegion(regionId) {
        await this.assets.loadBiome(regionId);
        const biome = getBiome(regionId);
        let scene = this.farmScenes.get(regionId);
        if (!scene) {
            scene = new FarmScene(this, biome);
            this.farmScenes.set(regionId, scene);
        } else {
            scene.farming.fastForward();
        }
        this.state.currentRegion = regionId;
        this._setScene(scene);
    }

    showWorldMap() {
        this.audio.unlock();
        if (!this._mapScene) this._mapScene = new WorldMapScene(this);
        this._setScene(this._mapScene);
        this.emit('mapOpened');
    }

    async travelTo(regionId) {
        await this.showRegion(regionId);
        const biome = getBiome(regionId);
        this.ui.toast(`✈️ Welcome to ${biome.name} — ${biome.place}`);
        saveLocal(this.state);
        this.emit('traveled', { regionId });
    }

    async unlockAndTravel(biome) {
        const status = this.state.unlockRegion(biome.id);
        if (!status) {
            this.audio.sfx('error');
            this.ui.toast('Not enough coins yet!');
            return false;
        }
        this.audio.sfx('travel');
        // seed the new farm and grant its starter seeds
        this.state.farm(biome.id);
        const starter = biome.crops.find(c => c.native) || biome.crops[0];
        this.state.addSeeds(starter.id, 3);
        this.state.selectedSeed = starter.id;
        await this.travelTo(biome.id);
        return true;
    }

    _setScene(scene) {
        if (this.scene && this.scene.exit) this.scene.exit();
        this.scene = scene;
        scene.resize();
        if (scene.enter) scene.enter();
    }

    get currentFarmScene() {
        return this.farmScenes.get(this.state.currentRegion) || null;
    }

    // ---- loop -------------------------------------------------------------
    start() {
        // init() measures the canvas while #game-screen is still display:none,
        // which reports 0×0. Measure again now that the screen is visible.
        this._resize();
        this.running = true;
        this._lastTime = performance.now();
        requestAnimationFrame(t => this._frame(t));
    }

    stop() {
        this.running = false;
        flushLocal();
    }

    pause() {
        this._paused = true;
        if (this.audio) this.audio.suspend();
        if (this.state) {
            saveLocal(this.state, true);
            syncToServer(this.state);
        }
    }

    resume() {
        this._paused = false;
        this._lastTime = performance.now();
        if (this.audio) this.audio.resume();
        // crops kept growing while we were away
        for (const scene of this.farmScenes.values()) {
            scene.farming.fastForward();
        }
    }

    _frame(now) {
        if (!this.running) return;
        requestAnimationFrame(t => this._frame(t));
        if (this._paused) return;

        let dtMs = now - this._lastTime;
        this._lastTime = now;
        if (dtMs > 250) dtMs = 250; // tab-switch hiccup guard

        this._acc += dtMs;
        const stepSec = STEP_MS / 1000;
        let steps = 0;
        while (this._acc >= STEP_MS && steps < 5) {
            if (this.scene) this.scene.update(stepSec);
            this._acc -= STEP_MS;
            steps++;
        }
        if (steps === 5) this._acc = 0;

        if (this.scene) this.scene.render(this.ctx, now);

        // periodic persistence
        const nowMs = Date.now();
        if (nowMs - this._lastLocalSave > AUTO_SAVE_INTERVAL_MS) {
            this._lastLocalSave = nowMs;
            saveLocal(this.state);
        }
        if (nowMs - this._lastSync > SERVER_SYNC_INTERVAL_MS) {
            this._lastSync = nowMs;
            syncToServer(this.state);
        }
    }

    async saveGame() {
        saveLocal(this.state, true);
        const ok = await syncToServer(this.state);
        return ok;
    }
}
