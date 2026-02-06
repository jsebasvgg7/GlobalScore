import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { registerPWA } from './services/pwaService';

if (import.meta.env.PROD) {
  registerPWA()
    .then(result => {
      if (result.success) {
        console.log('✅ PWA registrada correctamente');
      }
    })
    .catch(err => {
      console.error('❌ Error registrando PWA:', err);
    });
} else {
  console.log('🔧 PWA deshabilitada en desarrollo');
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
