import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js'],
        setupFiles: ['tests/setup.js'],
        testTimeout: 30000,
        hookTimeout: 120000 // first run downloads a MongoDB binary in CI
    }
});
