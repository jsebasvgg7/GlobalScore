// ============================================
// 🔔 PUSH NOTIFICATIONS MANAGER - GlobalScore
// ============================================
// Gestiona suscripciones, permisos y envío
// de push notifications con Supabase
// ============================================

import { supabase } from '../utils/supabaseClient';

class PushNotificationsManager {
  constructor() {
    this.subscription = null;
    this.permission = 'default';
    this.vapidPublicKey = null; // Se obtiene de Supabase
  }

  // ============================================
  // 🔑 OBTENER VAPID KEY DESDE SUPABASE
  // ============================================
  async getVapidKey() {
    try {
      // Opción 1: Desde variable de entorno
      if (import.meta.env.VITE_VAPID_PUBLIC_KEY) {
        this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        return this.vapidPublicKey;
      }

      // Opción 2: Desde tabla de configuración en Supabase
      const { data, error } = await supabase
        .from('app_config')
        .select('vapid_public_key')
        .single();

      if (error) throw error;

      this.vapidPublicKey = data?.vapid_public_key;
      return this.vapidPublicKey;

    } catch (error) {
      console.error('❌ [Push] Error obteniendo VAPID key:', error);
      
      // Fallback: usar una key hardcodeada (solo para desarrollo)
      console.warn('⚠️ [Push] Usando VAPID key de desarrollo');
      return null;
    }
  }

  // ============================================
  // ✅ VERIFICAR SOPORTE
  // ============================================
  isSupported() {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // ============================================
  // 🔐 OBTENER ESTADO DE PERMISOS
  // ============================================
  async getPermissionStatus() {
    if (!this.isSupported()) {
      return 'not_supported';
    }

    this.permission = Notification.permission;
    return this.permission;
  }

  // ============================================
  // 🙏 SOLICITAR PERMISOS
  // ============================================
  async requestPermission() {
    if (!this.isSupported()) {
      console.warn('⚠️ [Push] Notificaciones no soportadas');
      return { 
        success: false, 
        permission: 'not_supported',
        message: 'Tu navegador no soporta notificaciones push' 
      };
    }

    try {
      console.log('🙏 [Push] Solicitando permisos...');
      
      const permission = await Notification.requestPermission();
      this.permission = permission;

      console.log('✅ [Push] Permisos:', permission);

      return {
        success: permission === 'granted',
        permission,
        message: this.getPermissionMessage(permission)
      };

    } catch (error) {
      console.error('❌ [Push] Error solicitando permisos:', error);
      return {
        success: false,
        permission: 'denied',
        error: error.message
      };
    }
  }

  // ============================================
  // 📱 SUSCRIBIRSE A PUSH NOTIFICATIONS
  // ============================================
  async subscribe(userId) {
    if (!this.isSupported()) {
      return { success: false, reason: 'not_supported' };
    }

    if (this.permission !== 'granted') {
      const result = await this.requestPermission();
      if (!result.success) {
        return result;
      }
    }

    try {
      console.log('📱 [Push] Suscribiendo usuario...', userId);

      // Obtener service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Obtener VAPID public key
      const vapidKey = await this.getVapidKey();
      
      if (!vapidKey) {
        throw new Error('No se pudo obtener VAPID public key');
      }

      // Crear suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      console.log('✅ [Push] Suscripción creada:', subscription);

      // Guardar suscripción en Supabase
      const saved = await this.saveSubscription(userId, subscription);

      if (!saved.success) {
        throw new Error('Error guardando suscripción en Supabase');
      }

      this.subscription = subscription;

      return {
        success: true,
        subscription,
        message: 'Notificaciones activadas correctamente'
      };

    } catch (error) {
      console.error('❌ [Push] Error en suscripción:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'No se pudieron activar las notificaciones'
      };
    }
  }

  // ============================================
  // 💾 GUARDAR SUSCRIPCIÓN EN SUPABASE
  // ============================================
  async saveSubscription(userId, subscription) {
    try {
      console.log('💾 [Push] Guardando suscripción en Supabase...');

      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          subscription: subscription.toJSON(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ [Push] Suscripción guardada:', data);

      return { success: true, data };

    } catch (error) {
      console.error('❌ [Push] Error guardando suscripción:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // 🔕 DESUSCRIBIRSE
  // ============================================
  async unsubscribe(userId) {
    try {
      console.log('🔕 [Push] Desuscribiendo usuario...', userId);

      // Obtener suscripción actual
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Cancelar suscripción en el navegador
        await subscription.unsubscribe();
        console.log('✅ [Push] Suscripción cancelada en navegador');
      }

      // Eliminar de Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      console.log('✅ [Push] Suscripción eliminada de Supabase');

      this.subscription = null;

      return {
        success: true,
        message: 'Notificaciones desactivadas'
      };

    } catch (error) {
      console.error('❌ [Push] Error desuscribiendo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 📊 OBTENER ESTADO DE SUSCRIPCIÓN
  // ============================================
  async getSubscriptionStatus(userId) {
    try {
      // Verificar en navegador
      const registration = await navigator.serviceWorker.ready;
      const browserSubscription = await registration.pushManager.getSubscription();

      // Verificar en Supabase
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      const isSubscribed = !!(browserSubscription && data);

      return {
        isSubscribed,
        browserSubscription: !!browserSubscription,
        serverSubscription: !!data,
        permission: this.permission,
        subscription: browserSubscription || data?.subscription || null
      };

    } catch (error) {
      console.error('❌ [Push] Error obteniendo estado:', error);
      return {
        isSubscribed: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 🧪 ENVIAR NOTIFICACIÓN DE PRUEBA
  // ============================================
  async sendTestNotification() {
    if (!this.isSupported() || this.permission !== 'granted') {
      return { success: false, reason: 'no_permission' };
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification('🎯 Prueba de Notificación', {
        body: '¡Las notificaciones de GlobalScore están funcionando!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification',
        data: {
          url: '/app',
          timestamp: Date.now()
        },
        actions: [
          {
            action: 'view',
            title: '👀 Ver'
          },
          {
            action: 'close',
            title: '✖️ Cerrar'
          }
        ]
      });

      return { success: true };

    } catch (error) {
      console.error('❌ [Push] Error enviando notificación de prueba:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // 🛠️ HELPERS
  // ============================================
  
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  getPermissionMessage(permission) {
    const messages = {
      granted: 'Notificaciones activadas correctamente',
      denied: 'Has bloqueado las notificaciones. Actívalas en la configuración de tu navegador.',
      default: 'Debes permitir las notificaciones para recibir alertas'
    };

    return messages[permission] || messages.default;
  }
}

// ============================================
// 🌐 EXPORTAR SINGLETON
// ============================================
const pushManager = new PushNotificationsManager();

export default pushManager;

// ============================================
// 🚀 HELPERS DE EXPORTACIÓN
// ============================================

export async function subscribeToPush(userId) {
  return await pushManager.subscribe(userId);
}

export async function unsubscribeFromPush(userId) {
  return await pushManager.unsubscribe(userId);
}

export async function checkPushStatus(userId) {
  return await pushManager.getSubscriptionStatus(userId);
}

export async function requestPushPermission() {
  return await pushManager.requestPermission();
}

export function isPushSupported() {
  return pushManager.isSupported();
}