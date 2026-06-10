import { defineConfig } from 'vite';

export default defineConfig({
    root: 'client',
    build: {
        outDir: '../www',
        emptyOutDir: true
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        }
    }
});
