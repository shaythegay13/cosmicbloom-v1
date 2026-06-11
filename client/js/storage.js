// Local-first persistence: every save lands in local storage immediately
// (the game is fully playable offline); server sync is best-effort with
// last-write-wins by saveVersion. The storage backend is swappable so
// Capacitor Preferences can replace localStorage on native builds.
import { api } from './api.js';

const KEY = 'fag_save_v2';

let backend = {
    async get(key) { return localStorage.getItem(key); },
    async set(key, value) { localStorage.setItem(key, value); },
    async remove(key) { localStorage.removeItem(key); }
};

// Native builds call this with a Capacitor Preferences adapter
export function setStorageBackend(b) { backend = b; }

let saveTimer = null;
let pendingState = null;

export async function loadLocal() {
    try {
        const raw = await backend.get(KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveLocal(state, immediate = false) {
    pendingState = state;
    if (immediate) return flushLocal();
    if (saveTimer) return;
    saveTimer = setTimeout(flushLocal, 800);
}

export async function flushLocal() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    if (!pendingState) return;
    pendingState.savedAt = Date.now();
    try {
        await backend.set(KEY, JSON.stringify(
            pendingState.serialize ? pendingState.serialize() : pendingState));
    } catch (e) {
        console.warn('local save failed', e);
    }
}

export async function clearLocal() {
    await backend.remove(KEY);
}

let syncing = false;

// Push the current snapshot to the server (no-op offline; never throws)
export async function syncToServer(state) {
    if (syncing || !navigator.onLine) return false;
    syncing = true;
    try {
        state.saveVersion++;
        await api.saveGame(state.serialize ? state.serialize() : state);
        return true;
    } catch (e) {
        state.saveVersion--; // version didn't make it to the server
        return false;
    } finally {
        syncing = false;
    }
}

// Choose the freshest save between local and server copies
export function pickNewer(localSave, serverSave) {
    if (!localSave) return serverSave;
    if (!serverSave || serverSave.schema !== 2) return localSave;
    return (serverSave.saveVersion || 0) > (localSave.saveVersion || 0)
        ? serverSave : localSave;
}
