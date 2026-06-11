// Shared client configuration for Farm & Give
export const TILE_SIZE = 32;     // logical tile size (world units are tiles)
export const ZOOM = 2;           // logical px -> screen px (atlas is authored at 2x)
export const TILE_PX = TILE_SIZE * ZOOM; // on-screen tile size in CSS px
export const WORLD_WIDTH = 30;
export const WORLD_HEIGHT = 30;
export const STEP_MS = 1000 / 60;        // fixed update timestep
export const AUTO_SAVE_INTERVAL_MS = 30000; // local autosave cadence
export const SERVER_SYNC_INTERVAL_MS = 60000; // server snapshot cadence
export const MAX_DEVICE_PIXEL_RATIO = 2;
export const PLAYER_SPEED = 4.5;         // tiles per second

// Under Capacitor the app is served from capacitor://localhost, so the API
// host must come from the build environment rather than window.location.
export const API_BASE_URL =
    (import.meta.env && import.meta.env.VITE_API_URL) ||
    (typeof window !== 'undefined' ? window.location.origin + '/api' : '/api');
