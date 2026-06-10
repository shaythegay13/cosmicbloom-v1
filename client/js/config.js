// Shared client configuration for Farm & Give
export const TILE_SIZE = 32;
export const WORLD_WIDTH = 30;
export const WORLD_HEIGHT = 30;
export const AUTO_SAVE_INTERVAL_MS = 30000;
export const MAX_DEVICE_PIXEL_RATIO = 2;

// Under Capacitor the app is served from capacitor://localhost, so the API
// host must come from the build environment rather than window.location.
export const API_BASE_URL =
    (import.meta.env && import.meta.env.VITE_API_URL) ||
    window.location.origin + '/api';
