// src/components/InstallPWAButton.jsx
import { useState } from 'react';
import usePWA from '../../hooks/usePWA';
import '../../styles/common/InstallPWAButton.css';

export default function InstallPWAButton() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline,
    install 
  } = usePWA();
  
  const [showPrompt, setShowPrompt] = useState(false);

  // No mostrar si ya está instalado o no es instalable
  if (isInstalled || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const result = await install();
    
    if (result.success) {
      console.log('✅ App instalada');
      setShowPrompt(false);
    }
  };

  return (
    <div className="install-pwa-container">
      <button 
        onClick={() => setShowPrompt(true)}
        className="install-pwa-button"
      >
        📥 Instalar App
      </button>

      {showPrompt && (
        <div className="install-prompt-overlay">
          <div className="install-prompt">
            <h3>⚽ Instalar GlobalScore</h3>
            <p>Accede más rápido y recibe notificaciones de partidos</p>
            
            <div className="prompt-buttons">
              <button onClick={handleInstall} className="btn-primary">
                Instalar
              </button>
              <button onClick={() => setShowPrompt(false)} className="btn-secondary">
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}