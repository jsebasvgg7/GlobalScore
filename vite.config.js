import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Generar service worker en build
    rollupOptions: {
      input: {
        main: './index.html',
        sw: './public/service-worker.js'
      }
    }
  }
});