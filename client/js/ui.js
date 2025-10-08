// UI Manager for Farm & Give
class UIManager {
    constructor() {
        this.currentScreen = null;
        this.modals = {};
        this.init();
    }

    init() {
        // Get all screens
        this.screens = {
            loading: document.getElementById('loading-screen'),
            auth: document.getElementById('auth-screen'),
            character: document.getElementById('character-screen'),
            game: document.getElementById('game-screen')
        };

        // Get all modals
        this.modals = {
            shop: document.getElementById('shop-modal'),
            charity: document.getElementById('charity-modal'),
            menu: document.getElementById('menu-modal')
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auth tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchAuthTab(tab);
            });
        });

        // Close modal buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Click outside modal to close
        Object.values(this.modals).forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // HUD buttons
        document.getElementById('shop-btn')?.addEventListener('click', () => {
            this.openModal(this.modals.shop);
        });

        document.getElementById('charity-btn')?.addEventListener('click', () => {
            this.openModal(this.modals.charity);
            this.loadCharityData();
        });

        document.getElementById('menu-btn')?.addEventListener('click', () => {
            this.openModal(this.modals.menu);
        });
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // Show requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
    }

    switchAuthTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}-form`);
        });
    }

    openModal(modal) {
        modal.classList.add('active');
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            setTimeout(() => {
                element.textContent = '';
            }, 5000);
        }
    }

    updateHUD(player) {
        document.getElementById('player-name').textContent = player.username;
        document.getElementById('player-level').textContent = player.gameProgress.level;
        document.getElementById('player-coins').textContent = player.gameProgress.coins;
    }

    async loadCharityData() {
        try {
            const impact = await api.getMyImpact();
            document.getElementById('my-contribution').textContent = 
                `$${impact.totalContributed.toFixed(2)}`;

            const stats = await api.getImpactStats();
            document.getElementById('total-donated').textContent = 
                `$${stats.totalDonated.toFixed(2)}`;
        } catch (error) {
            console.error('Error loading charity data:', error);
        }
    }

    renderCharacters(characters) {
        const grid = document.getElementById('character-grid');
        grid.innerHTML = '';

        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.dataset.characterId = char.id;

            const bonusText = char.bonus.replace(/_/g, ' ');

            card.innerHTML = `
                <div class="character-avatar" style="background-color: ${char.color}">
                    ${this.getCharacterEmoji(char.id)}
                </div>
                <h3>${char.name}</h3>
                <p>${char.description}</p>
                <div class="character-bonus">+${bonusText}</div>
            `;

            card.addEventListener('click', () => {
                this.selectCharacter(char.id);
            });

            grid.appendChild(card);
        });
    }

    getCharacterEmoji(characterId) {
        const emojis = {
            sunny: '☀️',
            luna: '🌙',
            terra: '🌍',
            river: '💧',
            sage: '🧙'
        };
        return emojis[characterId] || '👤';
    }

    selectCharacter(characterId) {
        document.querySelectorAll('.character-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.characterId === characterId);
        });

        const confirmBtn = document.getElementById('confirm-character-btn');
        confirmBtn.disabled = false;
        confirmBtn.dataset.characterId = characterId;
    }

    renderShopItems(category) {
        const container = document.getElementById('shop-items');
        const items = this.getShopItems(category);

        container.innerHTML = '';

        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'shop-item';
            itemEl.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-price">💰 ${item.price}</div>
            `;

            itemEl.addEventListener('click', () => {
                this.purchaseItem(item);
            });

            container.appendChild(itemEl);
        });
    }

    getShopItems(category) {
        const items = {
            seeds: [
                { id: 'carrot_seeds', name: 'Carrot Seeds', icon: '🥕', price: 10 },
                { id: 'tomato_seeds', name: 'Tomato Seeds', icon: '🍅', price: 15 },
                { id: 'wheat_seeds', name: 'Wheat Seeds', icon: '🌾', price: 8 },
                { id: 'corn_seeds', name: 'Corn Seeds', icon: '🌽', price: 12 }
            ],
            tools: [
                { id: 'watering_can', name: 'Watering Can', icon: '🚿', price: 50 },
                { id: 'fertilizer', name: 'Fertilizer', icon: '💩', price: 25 },
                { id: 'sprinkler', name: 'Sprinkler', icon: '💦', price: 100 }
            ],
            decorations: [
                { id: 'fence', name: 'Fence', icon: '🚧', price: 20 },
                { id: 'scarecrow', name: 'Scarecrow', icon: '🧑‍🌾', price: 30 },
                { id: 'flower', name: 'Flower', icon: '🌸', price: 15 }
            ]
        };

        return items[category] || [];
    }

    async purchaseItem(item) {
        // This would integrate with Stripe for real payments
        // For now, just use in-game coins
        if (confirm(`Purchase ${item.name} for ${item.price} coins?`)) {
            try {
                // Deduct coins and add to inventory
                console.log('Purchasing:', item);
                alert('Purchase successful! (Payment integration coming soon)');
            } catch (error) {
                console.error('Purchase error:', error);
                alert('Purchase failed');
            }
        }
    }

    async renderCharities(filters = {}) {
        try {
            const charities = await api.getCharities(filters);
            const container = document.getElementById('charity-list');
            container.innerHTML = '';

            if (charities.length === 0) {
                container.innerHTML = '<p>No community gardens found in this area.</p>';
                return;
            }

            charities.forEach(charity => {
                const item = document.createElement('div');
                item.className = 'charity-item';
                item.dataset.charityId = charity._id;

                item.innerHTML = `
                    <h4>${charity.name}</h4>
                    <p>📍 ${charity.location.city}, ${charity.location.state}</p>
                    <p>${charity.description}</p>
                    <p><strong>💚 ${charity.supporters} supporters</strong> | 
                       <strong>$${charity.totalReceived.toFixed(2)} received</strong></p>
                `;

                item.addEventListener('click', async () => {
                    try {
                        await api.selectCharity(charity._id);
                        document.querySelectorAll('.charity-item').forEach(el => {
                            el.classList.remove('selected');
                        });
                        item.classList.add('selected');
                        alert(`You're now supporting ${charity.name}!`);
                    } catch (error) {
                        console.error('Error selecting charity:', error);
                    }
                });

                container.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading charities:', error);
        }
    }
}

// Create global UI instance
const ui = new UIManager();
