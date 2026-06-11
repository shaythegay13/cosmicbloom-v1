// Single integration point for Capacitor. Every call is guarded so the
// same bundle runs unchanged in the browser (where this module no-ops).
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { setStorageBackend, saveLocal, syncToServer } from './storage.js';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

// Call once at boot, before any saves are loaded
export function initNativeStorage() {
    if (!isNative) return;
    setStorageBackend({
        async get(key) {
            const { value } = await Preferences.get({ key });
            return value;
        },
        async set(key, value) {
            await Preferences.set({ key, value });
        },
        async remove(key) {
            await Preferences.remove({ key });
        }
    });
}

// Call after the game has started
export async function initNativeLifecycle(game, ui) {
    if (!isNative) return;

    try {
        await StatusBar.setStyle({ style: Style.Dark });
    } catch { /* iOS only options may differ */ }
    SplashScreen.hide().catch(() => {});

    App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) game.resume();
        else game.pause();
    });

    // Android hardware back: close any open modal, otherwise background the app
    App.addListener('backButton', () => {
        const open = document.querySelector('.modal.active');
        if (open) {
            ui.closeModal(open);
        } else {
            App.minimizeApp();
        }
    });

    Network.addListener('networkStatusChange', ({ connected }) => {
        if (connected && game.state) {
            saveLocal(game.state, true);
            syncToServer(game.state);
        }
    });

    // gentle haptics on satisfying moments
    game.on('harvested', () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}));
    game.on('planted', () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}));
    game.on('traveled', () => Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}));
    game.on('harvested', ({ restoration }) => {
        if (restoration && restoration.milestones.length) {
            Haptics.notification({ type: NotificationType.Success }).catch(() => {});
        }
    });
}
