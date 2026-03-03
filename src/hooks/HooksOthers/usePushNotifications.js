// ============================================
// 🎣 usePushNotifications Hook - GlobalScore
// ============================================
// Hook para gestionar permisos y suscripciones
// de push notifications
// ============================================

import { useState, useEffect, useCallback } from 'react';
import pushManager from '../services/pushManager';

export function usePushNotifications(userId) {
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // 🔍 VERIFICAR SOPORTE Y ESTADO INICIAL
  // ============================================
  useEffect(() => {
    const checkSupport = async () => {
      try {
        setIsLoading(true);
        
        // Verificar soporte
        const supported = pushManager.isSupported();
        setIsSupported(supported);
        
        if (!supported) {
          setIsLoading(false);
          return;
        }

        // Obtener estado de permisos
        const currentPermission = await pushManager.getPermissionStatus();
        setPermission(currentPermission);

        // Si hay userId, verificar suscripción
        if (userId) {
          const status = await pushManager.getSubscriptionStatus(userId);
          setIsSubscribed(status.isSubscribed);
        }
        
      } catch (err) {
        console.error('❌ [Push Hook] Error verificando estado:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkSupport();
  }, [userId]);

  // ============================================
  // 🙏 SOLICITAR PERMISOS
  // ============================================
  const requestPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await pushManager.requestPermission();
      
      setPermission(result.permission);
      
      return result;
      
    } catch (err) {
      console.error('❌ [Push Hook] Error solicitando permisos:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // ✅ SUSCRIBIRSE A NOTIFICACIONES
  // ============================================
  const subscribe = useCallback(async () => {
    if (!userId) {
      console.warn('⚠️ [Push Hook] userId requerido para suscribirse');
      return { success: false, reason: 'no_user_id' };
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await pushManager.subscribe(userId);
      
      if (result.success) {
        setIsSubscribed(true);
        setPermission('granted');
      }
      
      return result;
      
    } catch (err) {
      console.error('❌ [Push Hook] Error suscribiendo:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ============================================
  // 🔕 DESUSCRIBIRSE
  // ============================================
  const unsubscribe = useCallback(async () => {
    if (!userId) {
      console.warn('⚠️ [Push Hook] userId requerido para desuscribirse');
      return { success: false, reason: 'no_user_id' };
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await pushManager.unsubscribe(userId);
      
      if (result.success) {
        setIsSubscribed(false);
      }
      
      return result;
      
    } catch (err) {
      console.error('❌ [Push Hook] Error desuscribiendo:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ============================================
  // 🔄 TOGGLE SUSCRIPCIÓN
  // ============================================
  const toggleSubscription = useCallback(async () => {
    if (isSubscribed) {
      return await unsubscribe();
    } else {
      return await subscribe();
    }
  }, [isSubscribed, subscribe, unsubscribe]);

  // ============================================
  // 🧪 ENVIAR NOTIFICACIÓN DE PRUEBA
  // ============================================
  const sendTestNotification = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const result = await pushManager.sendTestNotification();
      
      return result;
      
    } catch (err) {
      console.error('❌ [Push Hook] Error enviando notificación de prueba:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // 🔄 REFRESCAR ESTADO
  // ============================================
  const refresh = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      
      const status = await pushManager.getSubscriptionStatus(userId);
      setIsSubscribed(status.isSubscribed);
      
      const currentPermission = await pushManager.getPermissionStatus();
      setPermission(currentPermission);
      
    } catch (err) {
      console.error('❌ [Push Hook] Error refrescando estado:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ============================================
  // 📊 RETORNAR ESTADO Y FUNCIONES
  // ============================================
  return {
    // Estado
    permission,
    isSubscribed,
    isSupported,
    isLoading,
    error,
    
    // Funciones
    requestPermission,
    subscribe,
    unsubscribe,
    toggleSubscription,
    sendTestNotification,
    refresh,
    
    // Información derivada
    canSubscribe: isSupported && permission === 'granted' && !isSubscribed,
    needsPermission: isSupported && permission === 'default',
    isDenied: permission === 'denied'
  };
}

// ============================================
// 🎣 usePushStatus - Hook simplificado
// ============================================
export function usePushStatus() {
  const [status, setStatus] = useState({
    supported: false,
    permission: 'default',
    subscribed: false
  });

  useEffect(() => {
    const checkStatus = () => {
      const supported = (
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
      );

      setStatus({
        supported,
        permission: Notification?.permission || 'default',
        subscribed: false // Requiere verificación con servidor
      });
    };

    checkStatus();
  }, []);

  return status;
}

export default usePushNotifications;