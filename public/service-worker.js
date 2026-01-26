// public/service-worker.js - VERSIÓN CORREGIDA
const CACHE_NAME = 'globalscore-v1';

// ============================================
// INSTALL - No cachear nada al instalar
// ============================================
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');
  
  // Activar inmediatamente sin esperar
  self.skipWaiting();
});

// ============================================
// ACTIVATE - Limpiar cachés antiguas
// ============================================
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================
// FETCH - Network First con Cache Fallback
// ============================================
self.addEventListener('fetch', (event) => {
  // Solo cachear GET requests
  if (event.request.method !== 'GET') return;

  // No cachear requests a Supabase
  if (event.request.url.includes('supabase.co')) {
    return event.respondWith(fetch(event.request));
  }

  // No cachear requests a APIs externas
  if (event.request.url.includes('api')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    // Intentar desde red primero
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((err) => {
              console.warn('⚠️ Error guardando en caché:', err);
            });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde caché
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('📦 Sirviendo desde caché:', event.request.url);
              return cachedResponse;
            }
            
            // Si es una navegación y no hay caché, mostrar página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html').then((offlineResponse) => {
                return offlineResponse || new Response('Sin conexión', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'text/html'
                  })
                });
              });
            }
            
            // Para otros recursos, responder con error
            return new Response('Recurso no disponible sin conexión', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  console.log('📬 Push notification recibida');
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('Error parseando push data:', e);
    data = {
      title: '⚽ GlobalScore',
      body: 'Nueva actualización disponible'
    };
  }
  
  const options = {
    body: data.body || 'Nuevo contenido disponible',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      matchId: data.matchId,
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
    ],
    tag: data.tag || `notification-${Date.now()}`,
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '⚽ GlobalScore', options)
  );
});

// ============================================
// NOTIFICATION CLICK
// ============================================
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action !== 'close') {
    // Click en la notificación (no en botón)
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Enfocar ventana existente o abrir nueva
          for (const client of clientList) {
            if (client.url === (event.notification.data.url || '/') && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url || '/');
          }
        })
    );
  }
});

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-predictions') {
    event.waitUntil(syncPredictions());
  }
});

async function syncPredictions() {
  console.log('🔄 Sincronizando predicciones offline...');
  // TODO: Implementar lógica de sincronización
  // Por ahora solo logueamos
}