import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: false,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
