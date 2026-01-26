// src/components/InstallPWAButton.jsx
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import '../styles/InstallPWAButton.css';

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    console.log('🎯 InstallPWAButton montado');
    
    const handler = (e) => {
      console.log('📥 beforeinstallprompt recibido');
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ Ya está instalada como PWA');
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} instalar`);
    
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="install-pwa-banner">
      <div className="install-pwa-content">
        <div className="install-pwa-icon">
          <Download size={24} />
        </div>
        <div className="install-pwa-text">
          <div className="install-pwa-title">Instalar GlobalScore</div>
          <div className="install-pwa-subtitle">
            Accede más rápido y recibe notificaciones
          </div>
        </div>
        <button className="install-pwa-btn" onClick={handleInstall}>
          Instalar
        </button>
        <button 
          className="install-pwa-close" 
          onClick={() => setShowBanner(false)}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}