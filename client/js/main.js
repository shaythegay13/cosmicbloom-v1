// Main entry point for Farm & Give
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌱 Farm & Give - Initializing...');

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    
    if (token) {
        api.setToken(token);
        try {
            const user = await api.getMe();
            
            if (user.selectedCharacter) {
                // User has a character, load game
                await startGame(user);
            } else {
                // User needs to select a character
                await showCharacterSelection();
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('token');
            showAuthScreen();
        }
    } else {
        showAuthScreen();
    }
});

function showAuthScreen() {
    ui.showScreen('auth');
    setupAuthHandlers();
}

function setupAuthHandlers() {
    // Login form
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await api.login(email, password);
            api.setToken(response.token);
            
            if (response.user.selectedCharacter) {
                await startGame(response.user);
            } else {
                await showCharacterSelection();
            }
        } catch (error) {
            ui.showError('login-error', error.message || 'Login failed');
        }
    });

    // Register form
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await api.register(username, email, password);
            api.setToken(response.token);
            await showCharacterSelection();
        } catch (error) {
            ui.showError('register-error', error.message || 'Registration failed');
        }
    });
}

async function showCharacterSelection() {
    ui.showScreen('character');
    
    try {
        const characters = await api.getCharacters();
        ui.renderCharacters(characters);
        
        // Setup confirm button
        const confirmBtn = document.getElementById('confirm-character-btn');
        confirmBtn.addEventListener('click', async () => {
            const characterId = confirmBtn.dataset.characterId;
            if (!characterId) return;
            
            try {
                await api.selectCharacter(characterId);
                const user = await api.getMe();
                await startGame(user);
            } catch (error) {
                console.error('Character selection failed:', error);
                alert('Failed to select character');
            }
        });
    } catch (error) {
        console.error('Failed to load characters:', error);
    }
}

async function startGame(userData) {
    ui.showScreen('game');
    
    // Initialize game
    game = new Game();
    await game.init(userData);
    game.start();
    
    // Setup game UI handlers
    setupGameHandlers();
    
    console.log('🎮 Game started!');
}

function setupGameHandlers() {
    // Save game button
    document.getElementById('save-game-btn').addEventListener('click', async () => {
        try {
            await game.saveGame();
            alert('Game saved successfully!');
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save game');
        }
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout? Make sure to save your game!')) {
            game.stop();
            api.clearToken();
            location.reload();
        }
    });

    // Shop tabs
    document.querySelectorAll('.shop-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.shop-tab-btn').forEach(b => {
                b.classList.remove('active');
            });
            e.target.classList.add('active');
            
            const category = e.target.dataset.category;
            ui.renderShopItems(category);
        });
    });

    // Load initial shop items
    ui.renderShopItems('seeds');

    // Charity search
    document.getElementById('search-charities-btn').addEventListener('click', () => {
        const city = document.getElementById('charity-city').value;
        const state = document.getElementById('charity-state').value;
        
        const filters = {};
        if (city) filters.city = city;
        if (state) filters.state = state;
        
        ui.renderCharities(filters);
    });

    // Load initial charities
    ui.renderCharities();
}

// Handle page visibility for auto-save
document.addEventListener('visibilitychange', () => {
    if (document.hidden && game && game.running) {
        game.autoSave();
    }
});

// Handle before unload
window.addEventListener('beforeunload', (e) => {
    if (game && game.running) {
        game.autoSave();
    }
});
