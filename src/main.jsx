import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// ✅ NUEVO: Importar registro de Service Worker
import { 
  registerServiceWorker, 
  setupInstallPrompt,
  isPWAInstalled 
} from './utils/registerServiceWorker';

// Registrar Service Worker
if (import.meta.env.PROD) {
  registerServiceWorker();
  setupInstallPrompt();
  
  // Log si está instalada
  if (isPWAInstalled()) {
    console.log('✅ App ejecutándose como PWA instalada');
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);