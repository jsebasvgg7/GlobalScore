// ============================================
// 🏆 PWA SERVICE - GlobalScore
// ============================================
// Gestiona el registro del Service Worker,
// actualizaciones, y comunicación con el SW
// ============================================

class PWAService {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.listeners = new Map();
  }

  // ============================================
  // 📝 REGISTRAR SERVICE WORKER
  // ============================================
  async register() {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ [PWA] Service Workers no soportados en este navegador');
      return { success: false, reason: 'not_supported' };
    }

    try {
      console.log('🔧 [PWA] Registrando Service Worker...');

      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Siempre buscar actualizaciones
      });

      console.log('✅ [PWA] Service Worker registrado:', this.registration.scope);

      // Configurar listeners
      this.setupUpdateListener();
      this.setupControllerChange();
      this.setupMessages();

      // Verificar actualizaciones cada 30 minutos
      setInterval(() => {
        this.checkForUpdates();
      }, 30 * 60 * 1000);

      return { 
        success: true, 
        registration: this.registration 
      };

    } catch (error) {
      console.error('❌ [PWA] Error registrando Service Worker:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // ============================================
  // 🔄 DETECTAR ACTUALIZACIONES
  // ============================================
  setupUpdateListener() {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration.installing;
      console.log('🆕 [PWA] Nueva versión del Service Worker encontrada');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Hay una actualización disponible
          console.log('⬇️ [PWA] Actualización lista para instalar');
          this.updateAvailable = true;
          this.emit('update-available', { newWorker });
        }
      });
    });
  }

  // ============================================
  // 🎛️ CAMBIO DE CONTROLADOR
  // ============================================
  setupControllerChange() {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 [PWA] Service Worker actualizado');
      this.emit('controller-changed');
    });
  }

  // ============================================
  // 📨 MENSAJES DEL SERVICE WORKER
  // ============================================
  setupMessages() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 [PWA] Mensaje del Service Worker:', event.data);
      
      if (event.data.type) {
        this.emit(event.data.type, event.data);
      }
    });
  }

  // ============================================
  // 🔍 VERIFICAR ACTUALIZACIONES MANUALMENTE
  // ============================================
  async checkForUpdates() {
    if (!this.registration) return;

    try {
      console.log('🔍 [PWA] Verificando actualizaciones...');
      await this.registration.update();
    } catch (error) {
      console.error('❌ [PWA] Error verificando actualizaciones:', error);
    }
  }

  // ============================================
  // ⚡ APLICAR ACTUALIZACIÓN
  // ============================================
  async applyUpdate() {
    if (!this.registration || !this.registration.waiting) {
      console.warn('⚠️ [PWA] No hay actualización esperando');
      return;
    }

    try {
      console.log('⚡ [PWA] Aplicando actualización...');
      
      // Decirle al nuevo SW que tome control
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recargar la página cuando el nuevo SW tome control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

    } catch (error) {
      console.error('❌ [PWA] Error aplicando actualización:', error);
    }
  }

  // ============================================
  // 💬 ENVIAR MENSAJE AL SERVICE WORKER
  // ============================================
  async sendMessage(message) {
    if (!this.registration || !this.registration.active) {
      console.warn('⚠️ [PWA] Service Worker no activo');
      return;
    }

    this.registration.active.postMessage(message);
  }

  // ============================================
  // 🗑️ LIMPIAR CACHÉ
  // ============================================
  async clearCache() {
    try {
      await this.sendMessage({ type: 'CLEAR_CACHE' });
      console.log('🗑️ [PWA] Caché limpiado');
      return { success: true };
    } catch (error) {
      console.error('❌ [PWA] Error limpiando caché:', error);
      return { success: false, error };
    }
  }

  // ============================================
  // 💾 CACHEAR URLs ESPECÍFICAS
  // ============================================
  async cacheUrls(urls = []) {
    try {
      await this.sendMessage({ 
        type: 'CACHE_URLS', 
        urls 
      });
      console.log('💾 [PWA] URLs cacheadas:', urls);
      return { success: true };
    } catch (error) {
      console.error('❌ [PWA] Error cacheando URLs:', error);
      return { success: false, error };
    }
  }

  // ============================================
  // 📊 OBTENER ESTADO
  // ============================================
  getStatus() {
    return {
      supported: 'serviceWorker' in navigator,
      registered: !!this.registration,
      updateAvailable: this.updateAvailable,
      controller: !!navigator.serviceWorker.controller,
      scope: this.registration?.scope || null
    };
  }

  // ============================================
  // 🎧 EVENT EMITTER (simple)
  // ============================================
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ [PWA] Error en listener de ${event}:`, error);
      }
    });
  }

  // ============================================
  // 🔌 DESREGISTRAR SERVICE WORKER
  // ============================================
  async unregister() {
    if (!this.registration) return;

    try {
      const success = await this.registration.unregister();
      
      if (success) {
        console.log('🔌 [PWA] Service Worker desregistrado');
        this.registration = null;
        return { success: true };
      }
      
      return { success: false };
      
    } catch (error) {
      console.error('❌ [PWA] Error desregistrando Service Worker:', error);
      return { success: false, error };
    }
  }
}

// ============================================
// 🌐 EXPORTAR SINGLETON
// ============================================
const pwaService = new PWAService();

export default pwaService;

// ============================================
// 📦 HELPER: REGISTRAR AUTOMÁTICAMENTE
// ============================================
export async function registerPWA() {
  return await pwaService.register();
}

// ============================================
// 📊 HELPER: VERIFICAR SOPORTE
// ============================================
export function isPWASupported() {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// ============================================
// 📱 HELPER: VERIFICAR SI ESTÁ INSTALADO
// ============================================
export function isPWAInstalled() {
  // Detección básica (no 100% precisa)
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true || // iOS
    document.referrer.includes('android-app://') // Android
  );
}

// ============================================
// 🔄 HELPER: VERIFICAR SI HAY ACTUALIZACIÓN
// ============================================
export function hasUpdateAvailable() {
  return pwaService.updateAvailable;
}