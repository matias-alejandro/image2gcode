import { defineConfig } from 'vite';
import path from 'path';
import pkg from './package.json';

export default defineConfig({
    define: {
        '__APP_VERSION__': JSON.stringify(pkg.version),
    },
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
