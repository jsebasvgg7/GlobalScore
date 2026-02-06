// src/components/common/PushNotificationsToggle.jsx
import { useState } from 'react';
import usePushNotifications from '../hooks/usePushNotifications';

export default function PushNotificationsToggle({ userId }) {
  const {
    isSubscribed,
    isSupported,
    permission,
    toggleSubscription,
    isLoading
  } = usePushNotifications(userId);

  if (!isSupported) {
    return null; // No mostrar si no soporta
  }

  const handleToggle = async () => {
    const result = await toggleSubscription();
    
    if (result.success) {
      console.log(isSubscribed ? 'Desuscrito' : 'Suscrito');
    }
  };

  return (
    <div className="push-toggle">
      <label className="switch">
        <input 
          type="checkbox" 
          checked={isSubscribed}
          onChange={handleToggle}
          disabled={isLoading || permission === 'denied'}
        />
        <span className="slider"></span>
      </label>
      
      <span>
        {isSubscribed ? '🔔 Notificaciones ON' : '🔕 Notificaciones OFF'}
      </span>

      {permission === 'denied' && (
        <p className="warning">
          Notificaciones bloqueadas. Actívalas en la configuración del navegador.
        </p>
      )}
    </div>
  );
}