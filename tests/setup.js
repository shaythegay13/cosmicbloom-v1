// Shared test setup: env + browser-global stubs so client modules import
// cleanly under Node.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.CHARITY_PERCENTAGE = '10';
process.env.REVENUECAT_WEBHOOK_AUTH = 'Bearer test_webhook_secret';

if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map();
    globalThis.localStorage = {
        getItem: k => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: k => store.delete(k)
    };
}
