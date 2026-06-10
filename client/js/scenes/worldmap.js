// WorldMapScene: the planet view. Seven region nodes on a stylized globe,
// each with a restoration ring — the planet visibly "rewinds" to green as
// regions are restored. Tap an unlocked node to travel; tap an unlockable
// node to open the travel/unlock panel (DOM, handled by ui.js).
import { BIOMES, tierForScore } from '../data/biomes.mjs';
import { regionStatus, planetProgress } from '../restoration.js';

// node layout on a 0..1 square around the globe
const NODE_POS = {
    prairie: [0.26, 0.34],
    countryside: [0.52, 0.26],
    terraces: [0.74, 0.34],
    savanna: [0.56, 0.52],
    rainforest: [0.32, 0.60],
    outback: [0.74, 0.66],
    tundra: [0.50, 0.10]
};

export class WorldMapScene {
    constructor(game) {
        this.game = game;
        this.t = 0;
    }

    enter() {
        this.game.audio.setBiome(null);
        this.game.audio.stopMusic();
        this.game.ui.showMapHud(planetProgress(this.game.state));
    }

    resize() {}

    _layout() {
        const w = this.game.viewWidth, h = this.game.viewHeight;
        const r = Math.min(w, h) * 0.40;
        return { w, h, cx: w / 2, cy: h / 2 + 10, r };
    }

    _nodeXY(id, L) {
        const [nx, ny] = NODE_POS[id];
        return {
            x: L.cx + (nx - 0.5) * L.r * 2.25,
            y: L.cy + (ny - 0.4) * L.r * 2.1
        };
    }

    onTap(sx, sy) {
        const L = this._layout();
        for (const biome of BIOMES) {
            const p = this._nodeXY(biome.id, L);
            if (Math.hypot(sx - p.x, sy - p.y) < 34) {
                const status = regionStatus(this.game.state, biome.id);
                if (status === 'open') {
                    this.game.audio.sfx('travel');
                    this.game.travelTo(biome.id);
                } else if (status === 'unlockable') {
                    this.game.audio.sfx('ui');
                    this.game.ui.showUnlockPanel(biome);
                } else {
                    this.game.audio.sfx('error');
                    this.game.ui.toast('Restore the previous region to 50% first!');
                }
                return;
            }
        }
    }

    onDrag() {}

    update(dt) {
        this.t += dt;
    }

    render(ctx) {
        const L = this._layout();
        const state = this.game.state;

        // night-sky backdrop
        const sky = ctx.createLinearGradient(0, 0, 0, L.h);
        sky.addColorStop(0, '#1d2440');
        sky.addColorStop(1, '#3a3658');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, L.w, L.h);

        // twinkling stars (fixed pseudo-random positions)
        ctx.fillStyle = '#fff3b0';
        for (let i = 0; i < 40; i++) {
            const x = ((i * 137.5) % L.w);
            const y = ((i * 89.7) % (L.h * 0.9));
            const tw = 0.5 + 0.5 * Math.sin(this.t * 2 + i);
            ctx.globalAlpha = 0.25 + tw * 0.4;
            ctx.fillRect(x, y, 2, 2);
        }
        ctx.globalAlpha = 1;

        // the planet: ocean disc + green "healing" sweep proportional to progress
        const progress = planetProgress(state) / 100;
        ctx.fillStyle = '#3d6ea5';
        ctx.beginPath();
        ctx.arc(L.cx, L.cy, L.r, 0, Math.PI * 2);
        ctx.fill();
        // soft highlight
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.beginPath();
        ctx.arc(L.cx - L.r * 0.3, L.cy - L.r * 0.3, L.r * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // continents tint from brown to green with overall progress
        const browns = [122, 95, 60], greens = [92, 181, 107];
        const mix = browns.map((b, i) => Math.round(b + (greens[i] - b) * progress));
        ctx.fillStyle = `rgb(${mix.join(',')})`;
        for (const biome of BIOMES) {
            const p = this._nodeXY(biome.id, L);
            ctx.beginPath();
            ctx.ellipse(p.x, p.y + 6, 30, 20, (p.x % 7) / 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(L.cx, L.cy, L.r, 0, Math.PI * 2);
        ctx.stroke();

        // region nodes
        for (const biome of BIOMES) {
            const p = this._nodeXY(biome.id, L);
            const status = regionStatus(state, biome.id);
            const farm = state.farms[biome.id];
            const score = (farm && farm.restoration) || 0;
            const tier = tierForScore(score);
            const isCurrent = state.currentRegion === biome.id && status === 'open';

            // restoration ring
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 26, 0, Math.PI * 2);
            ctx.stroke();
            if (score > 0) {
                ctx.strokeStyle = ['#c9a45c', '#a8c94f', '#5cb56b'][tier];
                ctx.beginPath();
                ctx.arc(p.x, p.y, 26, -Math.PI / 2, -Math.PI / 2 + (score / 100) * Math.PI * 2);
                ctx.stroke();
            }

            // node disc
            const g = biome.ground[status === 'open' ? tier : 0];
            ctx.fillStyle = status === 'locked' ? '#5a5f6e' : g.base;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 21, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isCurrent ? '#fff3b0' : 'rgba(0,0,0,0.35)';
            ctx.lineWidth = isCurrent ? 3 : 2;
            ctx.stroke();

            // glyph
            ctx.font = '18px system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(status === 'locked' ? '🔒' : biome.emoji, p.x, p.y + 1);

            // label
            ctx.font = 'bold 11px system-ui';
            ctx.fillStyle = status === 'locked' ? 'rgba(255,255,255,0.5)' : '#fff';
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 4;
            ctx.fillText(biome.name, p.x, p.y + 40);
            if (status === 'unlockable') {
                ctx.fillStyle = '#f2c94c';
                ctx.fillText(`🔓 ${biome.unlock.coins} coins · Lv ${biome.unlock.level}`, p.x, p.y + 53);
            } else if (status === 'open' && score > 0) {
                ctx.fillStyle = '#b8e8c0';
                ctx.fillText(`${Math.floor(score)}% rewound`, p.x, p.y + 53);
            }
            ctx.shadowBlur = 0;
        }
    }
}
