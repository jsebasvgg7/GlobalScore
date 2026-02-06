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
        // Copiar service worker al dist después del build
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
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});