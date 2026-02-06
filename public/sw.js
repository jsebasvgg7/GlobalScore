// ============================================
// 🏆 GLOBALSCORE SERVICE WORKER v2.0
// ============================================
// Features:
// - Network-First con Cache Fallback
// - Offline Support inteligente
// - Push Notifications
// - Background Sync
// - Cache Strategy por tipo de recurso
// ============================================

const CACHE_VERSION = 'globalscore-v2.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// ============================================
// 📦 RECURSOS PARA PRE-CACHE (CRÍTICOS)
// ============================================
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// ============================================
// ⚙️ CONFIGURACIÓN DE CACHE
// ============================================
const CACHE_CONFIG = {
  // No cachear estos dominios
  EXCLUDED_DOMAINS: [
    'supabase.co',
    'googleapis.com',
    'analytics',
    'doubleclick'
  ],
  
  // Tiempo máximo en caché (7 días)
  MAX_AGE: 7 * 24 * 60 * 60 * 1000,
  
  // Máximo de items en caché dinámico
  MAX_DYNAMIC_ITEMS: 50,
  MAX_IMAGE_ITEMS: 100
};

// ============================================
// 🔧 INSTALL EVENT
// ============================================
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Installing Service Worker v2.0...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 [SW] Pre-caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ [SW] Static assets cached successfully');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch(err => {
        console.error('❌ [SW] Error during install:', err);
      })
  );
});

// ============================================
// ✨ ACTIVATE EVENT
// ============================================
self.addEventListener('activate', (event) => {
  console.log('✨ [SW] Activating Service Worker v2.0...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguas
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Eliminar cachés de versiones anteriores
              return cacheName.startsWith('globalscore-') && 
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== IMAGE_CACHE;
            })
            .map(cacheName => {
              console.log('🗑️ [SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Tomar control de todas las páginas inmediatamente
      self.clients.claim()
    ])
    .then(() => {
      console.log('✅ [SW] Service Worker activated and ready');
    })
  );
});

// ============================================
// 🌐 FETCH EVENT - ESTRATEGIA DE CACHE
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // ============================================
  // 🚫 SKIP: Métodos no-GET y dominios excluidos
  // ============================================
  if (request.method !== 'GET') return;
  
  const shouldExclude = CACHE_CONFIG.EXCLUDED_DOMAINS.some(domain => 
    url.hostname.includes(domain)
  );
  
  if (shouldExclude) {
    return event.respondWith(fetch(request));
  }
  
  // ============================================
  // 🎨 ESTRATEGIA: IMÁGENES
  // ============================================
  if (request.destination === 'image' || /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, CACHE_CONFIG.MAX_IMAGE_ITEMS));
    return;
  }
  
  // ============================================
  // 📄 ESTRATEGIA: HTML (Network First)
  // ============================================
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }
  
  // ============================================
  // 📦 ESTRATEGIA: ASSETS ESTÁTICOS (Cache First)
  // ============================================
  if (/\.(css|js|woff2?|ttf|eot)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // ============================================
  // 🔄 DEFAULT: Network First con Cache Fallback
  // ============================================
  event.respondWith(networkFirst(request, DYNAMIC_CACHE, CACHE_CONFIG.MAX_DYNAMIC_ITEMS));
});

// ============================================
// 📡 ESTRATEGIA: NETWORK FIRST
// ============================================
async function networkFirst(request, cacheName, maxItems = 50) {
  try {
    const networkResponse = await fetch(request);
    
    // Solo cachear respuestas exitosas
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Limpiar caché antigua si excede el límite
      trimCache(cacheName, maxItems);
    }
    
    return networkResponse;
  } catch (error) {
    // Si falla la red, buscar en caché
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('📦 [SW] Serving from cache (offline):', request.url);
      return cachedResponse;
    }
    
    // Si no hay caché, respuesta de error
    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// ============================================
// 📡 ESTRATEGIA: NETWORK FIRST CON OFFLINE PAGE
// ============================================
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Intentar desde caché
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Mostrar página offline personalizada
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// ============================================
// 💾 ESTRATEGIA: CACHE FIRST
// ============================================
async function cacheFirst(request, cacheName, maxItems) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Verificar edad del caché
    const cacheDate = new Date(cachedResponse.headers.get('date'));
    const age = Date.now() - cacheDate.getTime();
    
    if (age < CACHE_CONFIG.MAX_AGE) {
      return cachedResponse;
    }
  }
  
  // Si no hay caché o está viejo, fetch de red
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      if (maxItems) {
        trimCache(cacheName, maxItems);
      }
    }
    
    return networkResponse;
  } catch (error) {
    // Si falla la red y hay caché (aunque viejo), usarlo
    return cachedResponse || new Response('Resource not available', { 
      status: 503 
    });
  }
}

// ============================================
// 🗑️ LIMPIAR CACHÉ ANTIGUO
// ============================================
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const itemsToDelete = keys.length - maxItems;
    
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
    
    console.log(`🗑️ [SW] Trimmed ${itemsToDelete} items from ${cacheName}`);
  }
}

// ============================================
// 📬 PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  console.log('📬 [SW] Push notification received');
  
  let data = {
    title: '⚽ GlobalScore',
    body: 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png'
  };
  
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    console.warn('⚠️ [SW] Error parsing push data:', e);
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/app',
      matchId: data.matchId,
      type: data.type || 'general',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: '👀 Ver',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: '✖️ Cerrar'
      }
    ],
    tag: data.tag || `notification-${Date.now()}`,
    requireInteraction: data.requireInteraction || false,
    silent: false,
    renotify: true
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================
// 🖱️ NOTIFICATION CLICK
// ============================================
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ [SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/app';
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
    .then(clientList => {
      // Si hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si no, abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================
// 🔄 BACKGROUND SYNC (para predicciones offline)
// ============================================
self.addEventListener('sync', (event) => {
  console.log('🔄 [SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-predictions') {
    event.waitUntil(syncPredictions());
  }
  
  if (event.tag === 'sync-profile-updates') {
    event.waitUntil(syncProfileUpdates());
  }
});

async function syncPredictions() {
  console.log('🔄 [SW] Syncing offline predictions...');
  
  try {
    // Obtener predicciones pendientes del IndexedDB
    const pendingPredictions = await getPendingPredictions();
    
    if (pendingPredictions.length === 0) {
      console.log('✅ [SW] No pending predictions to sync');
      return;
    }
    
    // Intentar enviar cada predicción
    for (const prediction of pendingPredictions) {
      try {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prediction)
        });
        
        if (response.ok) {
          await removePendingPrediction(prediction.id);
          console.log('✅ [SW] Synced prediction:', prediction.id);
        }
      } catch (err) {
        console.error('❌ [SW] Error syncing prediction:', err);
      }
    }
    
    // Notificar al usuario
    await self.registration.showNotification('🔄 Sincronización completada', {
      body: `${pendingPredictions.length} predicciones sincronizadas`,
      icon: '/icons/icon-192x192.png',
      tag: 'sync-complete'
    });
    
  } catch (error) {
    console.error('❌ [SW] Sync error:', error);
  }
}

async function syncProfileUpdates() {
  console.log('🔄 [SW] Syncing profile updates...');
  // TODO: Implementar sync de actualizaciones de perfil
}

// ============================================
// 💾 HELPERS DE INDEXEDDB (PLACEHOLDER)
// ============================================
async function getPendingPredictions() {
  // TODO: Implementar lectura de IndexedDB
  return [];
}

async function removePendingPrediction(id) {
  // TODO: Implementar eliminación de IndexedDB
  return true;
}

// ============================================
// 📊 MESSAGE HANDLER (comunicación con app)
// ============================================
self.addEventListener('message', (event) => {
  console.log('📨 [SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls || [];
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return cache.addAll(urlsToCache);
      })
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('✅ [SW] Service Worker loaded successfully');