import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-sw',
      closeBundle() {
        const swPath = resolve('public/sw.js');

        if (existsSync(swPath)) {
          copyFileSync(
            swPath,
            resolve('dist/sw.js')
          );

          console.log('✅ Service Worker copiado');
        } else {
          console.log('⚠️ sw.js no encontrado');
        }
      }
    }
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});