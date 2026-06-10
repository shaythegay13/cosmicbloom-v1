// Unified pointer + keyboard input. Distinguishes taps from drags so the
// camera can pan without triggering farm actions; keyboard kept for desktop.
const TAP_MAX_MOVE = 10;   // CSS px
const TAP_MAX_MS = 350;

export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.pointer = { x: 0, y: 0, down: false };
        this.onTap = null;       // (x, y) CSS px
        this.onDrag = null;      // (dx, dy) CSS px while dragging
        this.onPointerMove = null;
        this._start = null;
        this._dragging = false;

        canvas.style.touchAction = 'none';
        canvas.addEventListener('pointerdown', e => this._down(e));
        canvas.addEventListener('pointermove', e => this._move(e));
        canvas.addEventListener('pointerup', e => this._up(e));
        canvas.addEventListener('pointercancel', () => { this._start = null; this._dragging = false; });
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        window.addEventListener('keydown', e => {
            this.keys[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => { this.keys[e.key] = false; });
    }

    _pos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    _down(e) {
        if (this._start) return; // ignore extra touches
        const p = this._pos(e);
        this.pointer = { ...p, down: true };
        this._start = { ...p, id: e.pointerId, t: performance.now() };
        this._dragging = false;
        this.canvas.setPointerCapture(e.pointerId);
    }

    _move(e) {
        const p = this._pos(e);
        this.pointer.x = p.x;
        this.pointer.y = p.y;
        if (this.onPointerMove) this.onPointerMove(p.x, p.y);
        if (!this._start || e.pointerId !== this._start.id) return;
        const dx = p.x - this._start.x, dy = p.y - this._start.y;
        if (this._dragging) {
            if (this.onDrag) this.onDrag(e.movementX, e.movementY);
        } else if (Math.hypot(dx, dy) > TAP_MAX_MOVE) {
            this._dragging = true;
        }
    }

    _up(e) {
        if (!this._start || e.pointerId !== this._start.id) return;
        const p = this._pos(e);
        const wasTap = !this._dragging && (performance.now() - this._start.t) < TAP_MAX_MS;
        this._start = null;
        this._dragging = false;
        this.pointer.down = false;
        if (wasTap && this.onTap) this.onTap(p.x, p.y);
    }

    // Keyboard movement vector (-1..1 per axis)
    moveVector() {
        const k = this.keys;
        let x = 0, y = 0;
        if (k['ArrowUp'] || k['w'] || k['W']) y -= 1;
        if (k['ArrowDown'] || k['s'] || k['S']) y += 1;
        if (k['ArrowLeft'] || k['a'] || k['A']) x -= 1;
        if (k['ArrowRight'] || k['d'] || k['D']) x += 1;
        return { x, y };
    }

    actionPressed() {
        return this.keys[' '] || this.keys['Enter'];
    }
}
