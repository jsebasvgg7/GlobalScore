// ============================================
// 🎣 usePWA Hook - GlobalScore
// ============================================
// Hook para gestionar instalación y estado PWA
// ============================================

import { useState, useEffect, useCallback } from 'react';

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ============================================
  // 📱 DETECTAR SI YA ESTÁ INSTALADO
  // ============================================
  useEffect(() => {
    const checkInstalled = () => {
      const installed = (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true || // iOS
        document.referrer.includes('android-app://')
      );
      
      setIsInstalled(installed);
    };

    checkInstalled();

    // Listener para cambios en display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstalled);

    return () => {
      mediaQuery.removeEventListener('change', checkInstalled);
    };
  }, []);

  // ============================================
  // 📥 CAPTURAR EVENTO DE INSTALACIÓN
  // ============================================
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('📥 [PWA Hook] beforeinstallprompt event fired');
      
      // Prevenir el prompt automático del navegador
      e.preventDefault();
      
      // Guardar el evento para usarlo después
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // ============================================
  // ✅ DETECTAR CUANDO SE INSTALA
  // ============================================
  useEffect(() => {
    const handleAppInstalled = () => {
      console.log('✅ [PWA Hook] App instalada');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // ============================================
  // 🔄 DETECTAR ACTUALIZACIONES DEL SW
  // ============================================
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (!registration) return;

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 [PWA Hook] Actualización disponible');
              setUpdateAvailable(true);
            }
          });
        });
      } catch (error) {
        console.error('❌ [PWA Hook] Error verificando actualizaciones:', error);
      }
    };

    checkForUpdates();

    // Verificar actualizaciones cada 30 minutos
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // ============================================
  // 🌐 DETECTAR CAMBIOS EN CONEXIÓN
  // ============================================
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ [PWA Hook] Online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('⚠️ [PWA Hook] Offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ============================================
  // 🚀 FUNCIÓN PARA INSTALAR LA APP
  // ============================================
  const install = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ [PWA Hook] No hay prompt disponible');
      return { 
        success: false, 
        reason: 'no_prompt',
        message: 'La app no está lista para instalarse aún' 
      };
    }

    try {
      console.log('🚀 [PWA Hook] Mostrando prompt de instalación...');
      
      // Mostrar el prompt
      deferredPrompt.prompt();
      
      // Esperar la respuesta del usuario
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`👤 [PWA Hook] Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
      
      // Limpiar el prompt
      setDeferredPrompt(null);
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        
        return { 
          success: true, 
          outcome,
          message: 'App instalada correctamente' 
        };
      } else {
        return { 
          success: false, 
          outcome,
          message: 'Instalación cancelada' 
        };
      }
      
    } catch (error) {
      console.error('❌ [PWA Hook] Error instalando app:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Error al instalar la app' 
      };
    }
  }, [deferredPrompt]);

  // ============================================
  // 🔄 FUNCIÓN PARA APLICAR ACTUALIZACIÓN
  // ============================================
  const applyUpdate = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration || !registration.waiting) {
        console.warn('⚠️ [PWA Hook] No hay actualización esperando');
        return { success: false, reason: 'no_update' };
      }

      console.log('🔄 [PWA Hook] Aplicando actualización...');
      
      // Decir al nuevo SW que tome control
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recargar cuando el nuevo SW tome control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      return { success: true };
      
    } catch (error) {
      console.error('❌ [PWA Hook] Error aplicando actualización:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ============================================
  // 🔄 FUNCIÓN PARA FORZAR VERIFICACIÓN DE UPDATES
  // ============================================
  const checkForUpdates = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        return { success: false, reason: 'no_registration' };
      }

      console.log('🔍 [PWA Hook] Verificando actualizaciones...');
      await registration.update();
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ [PWA Hook] Error verificando updates:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ============================================
  // 📊 RETORNAR ESTADO Y FUNCIONES
  // ============================================
  return {
    // Estado
    isInstallable,
    isInstalled,
    updateAvailable,
    isOnline,
    
    // Funciones
    install,
    applyUpdate,
    checkForUpdates,
    
    // Información adicional
    canInstall: isInstallable && !isInstalled,
    displayMode: isInstalled ? 'standalone' : 'browser'
  };
}

// ============================================
// 🎣 usePWAStatus - Hook simplificado
// ============================================
export function usePWAStatus() {
  const [status, setStatus] = useState({
    isInstalled: false,
    isOnline: navigator.onLine,
    canInstall: false
  });

  useEffect(() => {
    const checkStatus = () => {
      const installed = (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      );

      setStatus(prev => ({
        ...prev,
        isInstalled: installed
      }));
    };

    checkStatus();

    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}

export default usePWA;