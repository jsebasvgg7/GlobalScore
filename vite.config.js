import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'app-route-entry',
      writeBundle({ dir }) {
        // Serve direct /app visits even when the host's SPA rewrite is missing.
        const appDir = resolve(dir, 'app');
        mkdirSync(appDir, { recursive: true });
        copyFileSync(resolve(dir, 'index.html'), resolve(appDir, 'index.html'));
      }
    },
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
