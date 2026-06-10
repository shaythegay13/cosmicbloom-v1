// Boot: local-first auth + save resolution, then hand off to the Game.
import { api } from './api.js';
import { ui } from './ui.js';
import { Game } from './game.js';
import { Tutorial } from './tutorial.js';
import { defaultState, migrateLegacy } from './player.js';
import { loadLocal, pickNewer, clearLocal, saveLocal, flushLocal } from './storage.js';

let game = null;

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const localSave = await loadLocal();

    if (token) {
        api.setToken(token);
        try {
            const user = await api.getMe();
            if (user.selectedCharacter) {
                const serverSave = await loadServerSave();
                await startGame(user, pickNewer(localSave, serverSave));
            } else {
                await showCharacterSelection();
            }
            return;
        } catch (err) {
            // offline with a cached session: play from the local save
            if (localSave && localSave.character) {
                await startGame({ username: localSave.username }, localSave);
                ui.toast('Playing offline — progress will sync when you reconnect.');
                return;
            }
            api.clearToken();
        }
    }
    showAuthScreen();
});

async function loadServerSave() {
    try {
        const data = await api.loadGame();
        if (!data.gameProgress) return null;
        if (data.gameProgress.schema === 2) return data.gameProgress;
        // legacy shape from the old single-farm game
        return migrateLegacy(data.gameProgress, data.selectedCharacter);
    } catch {
        return null;
    }
}

function showAuthScreen() {
    ui.showScreen('auth');
    setupAuthHandlers();
}

function setupAuthHandlers() {
    document.getElementById('login-form').addEventListener('submit', async e => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const response = await api.login(email, password);
            api.setToken(response.token);
            await clearLocal(); // a different account may have been here before
            if (response.user.selectedCharacter) {
                const serverSave = await loadServerSave();
                await startGame(response.user, serverSave);
            } else {
                await showCharacterSelection();
            }
        } catch (error) {
            ui.showError('login-error', error.message || 'Login failed');
        }
    });

    document.getElementById('register-form').addEventListener('submit', async e => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            const response = await api.register(username, email, password);
            api.setToken(response.token);
            await clearLocal();
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
        const confirmBtn = document.getElementById('confirm-character-btn');
        confirmBtn.addEventListener('click', async () => {
            const characterId = confirmBtn.dataset.characterId;
            if (!characterId) return;
            try {
                await api.selectCharacter(characterId);
                const user = await api.getMe();
                await startGame(user, null);
            } catch (error) {
                ui.showError('login-error', 'Failed to select character');
            }
        });
    } catch (error) {
        console.error('Failed to load characters:', error);
    }
}

async function startGame(userData, save) {
    ui.showScreen('loading');

    const stateData = save || defaultState(userData.selectedCharacter, userData.username);
    if (!stateData.character) stateData.character = userData.selectedCharacter;
    if (!stateData.username) stateData.username = userData.username || '';

    game = new Game(ui);
    ui.bindGame(game);
    await game.init(stateData);

    ui.showScreen('game');
    game.start();
    saveLocal(game.state, true);

    new Tutorial(game).start();
    setupGameHandlers();
}

function setupGameHandlers() {
    document.getElementById('save-game-btn').addEventListener('click', async () => {
        const synced = await game.saveGame();
        ui.toast(synced ? '💾 Saved & synced!' : '💾 Saved locally (offline)');
        ui.closeModal(ui.modals.menu);
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
        if (!confirm('Log out? Your progress is saved.')) return;
        game.pause();
        await flushLocal();
        await clearLocal();
        api.clearToken();
        location.reload();
    });

    document.getElementById('delete-account-btn').addEventListener('click', async () => {
        if (!confirm('Permanently delete your account and all progress? This cannot be undone.')) return;
        const password = prompt('Enter your password to confirm deletion:');
        if (!password) return;
        try {
            await api.deleteAccount(password);
            await clearLocal();
            api.clearToken();
            alert('Your account has been deleted. Thank you for playing.');
            location.reload();
        } catch (error) {
            ui.toast(error.message || 'Deletion failed — check your password.');
        }
    });
}
