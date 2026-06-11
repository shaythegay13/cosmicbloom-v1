// Lightweight pooled particle effects drawn from the core atlas.
export class Particles {
    constructor() {
        this.items = [];
    }

    spawn(frame, x, y, opts = {}) {
        this.items.push({
            frame, x, y,
            vx: opts.vx ?? (Math.random() - 0.5) * 30,
            vy: opts.vy ?? (-30 - Math.random() * 30),
            g: opts.g ?? 40,
            life: opts.life ?? 0.8,
            t: 0,
            frames: opts.frames || null, // e.g. ['fx/sparkle/0','fx/sparkle/1']
            fps: opts.fps ?? 8
        });
    }

    burst(frames, x, y, count, opts = {}) {
        for (let i = 0; i < count; i++) {
            const frame = Array.isArray(frames)
                ? frames[Math.floor(Math.random() * frames.length)]
                : frames;
            this.spawn(frame, x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 10, opts);
        }
    }

    update(dt) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const p = this.items[i];
            p.t += dt;
            if (p.t >= p.life) { this.items.splice(i, 1); continue; }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.g * dt;
        }
    }

    draw(ctx, atlas, camToScreen) {
        for (const p of this.items) {
            const frame = p.frames
                ? p.frames[Math.floor(p.t * p.fps) % p.frames.length]
                : p.frame;
            const s = camToScreen(p.x, p.y);
            ctx.globalAlpha = Math.max(0, 1 - (p.t / p.life) * 0.9);
            atlas.draw(ctx, frame, s.x - 8, s.y - 8);
        }
        ctx.globalAlpha = 1;
    }
}
