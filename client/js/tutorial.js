// First-time user experience: a gentle contextual coach card that advances
// as the player performs each step. Progress persists in state.tutorialStep.
const STEPS = [
    { text: '🌍 Welcome to Farm & Give! This prairie has gone barren — let\'s rewind it back to life. Tap any grassy tile to till the soil.', event: 'tilled' },
    { text: '🌱 Lovely! Now tap the tilled soil to plant a seed. Your selected seed is shown at the bottom.', event: 'planted' },
    { text: '💧 Seeds are thirsty. Tap the planted crop to water it.', event: 'watered' },
    { text: '⏳ Crops grow in real time — even while you\'re away. When the bubble shows a star, tap to harvest! (Water it again between stages.)', event: 'harvested' },
    { text: '🪙 You earned coins and healed the land — see the Rewind meter up top. Sunflowers are native here: they restore extra. Buy seeds in the shop. 🛒', event: 'seedBought' },
    { text: '🌿 Keep farming to rewind this region. At 50% you can travel onward. Tap the 🗺️ map button to see the planet.', event: 'mapOpened' },
    { text: '💚 One more thing: 10% of what we earn goes to real community gardens. Pick yours in the Charity menu anytime. Happy farming!', event: 'harvested' }
];

export class Tutorial {
    constructor(game) {
        this.game = game;
        this.card = document.getElementById('tutorial-card');
        this.textEl = document.getElementById('tutorial-text');
        this.skipBtn = document.getElementById('tutorial-skip');
        this._bound = new Set();
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => this.finish());
        }
    }

    start() {
        const step = this.game.state.tutorialStep || 0;
        if (step >= STEPS.length) {
            this.hide();
            return;
        }
        this.show(step);
    }

    show(stepIdx) {
        const step = STEPS[stepIdx];
        if (!step) return this.finish();
        this.textEl.textContent = step.text;
        this.card.classList.add('show');
        if (!this._bound.has(step.event)) {
            this._bound.add(step.event);
            this.game.on(step.event, () => this._advanceIfWaiting(step.event));
        }
        this._waiting = step.event;
    }

    _advanceIfWaiting(event) {
        if (this._waiting !== event) return;
        this._waiting = null;
        const next = (this.game.state.tutorialStep || 0) + 1;
        this.game.state.tutorialStep = next;
        this.game.state._changed();
        if (next >= STEPS.length) {
            this.finish();
        } else {
            setTimeout(() => this.show(next), 700);
        }
    }

    finish() {
        this.game.state.tutorialStep = STEPS.length;
        this.game.state._changed();
        this.hide();
    }

    hide() {
        this.card.classList.remove('show');
    }
}
