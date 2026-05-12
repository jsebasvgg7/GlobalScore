export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);

          // Verificar actualizaciones cada hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Escuchar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Hay una actualización disponible
                showUpdateNotification();
              }
            });
          });
        })
        .catch((error) => {
          console.error('❌ Error registrando Service Worker:', error);
        });
    });
  }
}

/**
 * Muestra notificación de actualización disponible
 */
function showUpdateNotification() {
  const updateBanner = document.createElement('div');
  updateBanner.id = 'update-banner';
  updateBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 90%;
      animation: slideUp 0.3s ease;
    ">
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">
          Nueva versión disponible 🎉
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
          Actualiza para obtener las últimas mejoras
        </div>
      </div>
      <button onclick="location.reload()" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      ">
        Actualizar
      </button>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: transparent;
        color: white;
        border: none;
        padding: 8px;
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
      ">
        ×
      </button>
    </div>
  `;
  
  document.body.appendChild(updateBanner);

  // Auto-remover después de 10 segundos si no interactúa
  setTimeout(() => {
    updateBanner.remove();
  }, 10000);
}

/**
 * Desregistra el Service Worker (útil para desarrollo)
 */
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('🗑️ Service Worker desregistrado');
      })
      .catch((error) => {
        console.error('❌ Error desregistrando Service Worker:', error);
      });
  }
}

/**
 * Solicita permiso para notificaciones push
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Suscribe al usuario a push notifications
 */
export async function subscribeToPushNotifications(vapidPublicKey) {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Verificar si ya tiene suscripción
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Crear nueva suscripción
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
    }

    return subscription;
  } catch (error) {
    console.error('Error suscribiendo a push:', error);
    return null;
  }
}

/**
 * Desuscribe de push notifications
 */
export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.log('❌ Desuscrito de push notifications');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error desuscribiendo:', error);
    return false;
  }
}

/**
 * Convierte VAPID key a Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
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

/**
 * Verifica si la app está instalada como PWA
 */
export function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

/**
 * Muestra prompt de instalación de PWA
 */
let deferredPrompt;

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar botón de instalación personalizado
    showInstallButton();
  });

  // Detectar cuando se instala
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalada correctamente');
    deferredPrompt = null;
    hideInstallButton();
  });
}

/**
 * Muestra botón de instalación
 */
function showInstallButton() {
  const installBtn = document.getElementById('install-pwa-btn');
  if (installBtn) {
    installBtn.style.display = 'block';
    
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} instalar`);
      deferredPrompt = null;
      hideInstallButton();
    });
  }
}

/**
 * Oculta botón de instalación
 */
function hideInstallButton() {
  const installBtn = document.getElementById('install-pwa-btn');
  if (installBtn) {
    installBtn.style.display = 'none';
  }
}