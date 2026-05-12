import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-sw',
      closeBundle() {
        try {
          copyFileSync(
            resolve('public/sw.js'),
            resolve('dist/sw.js')
          );
          console.log('✅ Service Worker copiado a dist/');
        } catch (err) {
          console.error('❌ Error copiando SW:', err);
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});