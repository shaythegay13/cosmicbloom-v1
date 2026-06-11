// WebAudio sound: synthesized SFX recipes + a procedural per-biome music
// sequencer (seeded pentatonic patterns — no audio assets needed).
// Everything is created lazily on the first user gesture (iOS requirement).
import { hashStr, mulberry32 } from './rand.js';

const PENTATONIC = [0, 2, 4, 7, 9]; // major pentatonic intervals

export class AudioEngine {
    constructor(settings) {
        this.settings = settings; // { music: bool, sfx: bool } — live reference
        this.ctx = null;
        this.musicGain = null;
        this.sfxGain = null;
        this._musicTimer = null;
        this._biomeId = null;
        this._beat = 0;
    }

    // Must be called from a user gesture at least once
    unlock() {
        if (this.ctx) {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            return;
        }
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.5;
        this.sfxGain.connect(this.ctx.destination);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.16;
        this.musicGain.connect(this.ctx.destination);
        if (this._biomeId) this._startSequencer();
    }

    suspend() { if (this.ctx) this.ctx.suspend(); }
    resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

    // ---- SFX ------------------------------------------------------------
    _tone({ freq = 440, end = null, dur = 0.15, type = 'sine', vol = 0.5, delay = 0 }) {
        if (!this.ctx || !this.settings.sfx) return;
        const t0 = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        if (end) osc.frequency.exponentialRampToValueAtTime(end, t0 + dur);
        g.gain.setValueAtTime(vol, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.connect(g); g.connect(this.sfxGain);
        osc.start(t0); osc.stop(t0 + dur + 0.02);
    }

    _noise({ dur = 0.2, vol = 0.3, freq = 1200, delay = 0 }) {
        if (!this.ctx || !this.settings.sfx) return;
        const t0 = this.ctx.currentTime + delay;
        const len = Math.ceil(this.ctx.sampleRate * dur);
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = freq;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        src.connect(filter); filter.connect(g); g.connect(this.sfxGain);
        src.start(t0);
    }

    sfx(name) {
        if (!this.ctx) return;
        switch (name) {
            case 'till':
                this._noise({ dur: 0.18, vol: 0.4, freq: 700 });
                this._tone({ freq: 130, end: 70, dur: 0.16, type: 'triangle', vol: 0.4 });
                break;
            case 'plant':
                this._tone({ freq: 520, end: 760, dur: 0.1, type: 'sine', vol: 0.35 });
                this._tone({ freq: 760, end: 920, dur: 0.08, type: 'sine', vol: 0.25, delay: 0.08 });
                break;
            case 'water':
                this._noise({ dur: 0.3, vol: 0.25, freq: 2200 });
                this._tone({ freq: 900, end: 380, dur: 0.22, type: 'sine', vol: 0.18 });
                break;
            case 'harvest':
                this._tone({ freq: 660, dur: 0.08, type: 'triangle', vol: 0.4 });
                this._tone({ freq: 880, dur: 0.1, type: 'triangle', vol: 0.4, delay: 0.07 });
                break;
            case 'coin':
                this._tone({ freq: 1180, dur: 0.07, type: 'square', vol: 0.12 });
                this._tone({ freq: 1570, dur: 0.18, type: 'square', vol: 0.12, delay: 0.06 });
                break;
            case 'level':
                [523, 659, 784, 1046].forEach((f, i) =>
                    this._tone({ freq: f, dur: 0.16, type: 'triangle', vol: 0.35, delay: i * 0.09 }));
                break;
            case 'milestone':
                [392, 523, 659, 784, 1046].forEach((f, i) =>
                    this._tone({ freq: f, dur: 0.22, type: 'sine', vol: 0.35, delay: i * 0.11 }));
                break;
            case 'ui':
                this._tone({ freq: 700, dur: 0.05, type: 'sine', vol: 0.2 });
                break;
            case 'error':
                this._tone({ freq: 220, end: 180, dur: 0.18, type: 'square', vol: 0.15 });
                break;
            case 'travel':
                this._tone({ freq: 300, end: 900, dur: 0.5, type: 'sine', vol: 0.3 });
                this._noise({ dur: 0.5, vol: 0.1, freq: 3000 });
                break;
            case 'creature':
                this._tone({ freq: 880, end: 1100, dur: 0.09, type: 'sine', vol: 0.25 });
                break;
        }
    }

    // ---- music ------------------------------------------------------------
    setBiome(biomeId) {
        if (this._biomeId === biomeId) return;
        this._biomeId = biomeId;
        if (this.ctx) this._startSequencer();
    }

    stopMusic() {
        if (this._musicTimer) { clearInterval(this._musicTimer); this._musicTimer = null; }
    }

    _startSequencer() {
        this.stopMusic();
        if (!this._biomeId) return;
        const seed = hashStr(this._biomeId);
        const rng = mulberry32(seed);
        const root = 196 + (seed % 5) * 22;            // per-biome key
        const beatMs = 280 + (seed % 4) * 40;          // per-biome tempo
        let degree = 2;
        this._beat = 0;

        this._musicTimer = setInterval(() => {
            if (!this.ctx || !this.settings.music || this.ctx.state !== 'running') return;
            const t0 = this.ctx.currentTime + 0.02;
            this._beat++;
            // melody: random-walk over two octaves of the pentatonic scale
            if (rng() < 0.82) {
                degree = Math.max(0, Math.min(9, degree + (rng() < 0.5 ? -1 : 1) * (rng() < 0.25 ? 2 : 1)));
                const interval = PENTATONIC[degree % 5] + 12 * Math.floor(degree / 5);
                const freq = root * 2 * Math.pow(2, interval / 12);
                this._pluck(freq, t0, 0.35, 'triangle', 0.16);
            }
            // soft bass on every 4th beat
            if (this._beat % 4 === 1) {
                const bassDeg = [0, 7, 4, 9][((this._beat / 4) | 0) % 4];
                this._pluck(root * Math.pow(2, bassDeg / 12) / 2, t0, 0.9, 'sine', 0.2);
            }
        }, beatMs);
    }

    _pluck(freq, t0, dur, type, vol) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.connect(g); g.connect(this.musicGain);
        osc.start(t0); osc.stop(t0 + dur + 0.02);
    }
}
