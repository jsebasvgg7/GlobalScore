// ============================================
// 🏆 GLOBALSCORE SERVICE WORKER (PROD)
// Optimizado para estabilidad, instalación PWA
// ============================================

const CACHE_VERSION = 'globalscore-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// ⚠️ SOLO recursos que EXISTEN 100%
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// ============================================
// INSTALL
// ============================================
self.addEventListener('install', event => {
  console.log('🔧 Installing SW...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache =>
        Promise.allSettled(
          STATIC_ASSETS.map(url => cache.add(url))
        )
      )
      .then(() => self.skipWaiting())
  );
});

// ============================================
// ACTIVATE
// ============================================
self.addEventListener('activate', event => {
  console.log('✨ Activating SW...');

  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(n => n !== STATIC_CACHE && n !== DYNAMIC_CACHE && n !== IMAGE_CACHE)
          .map(n => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// ============================================
// FETCH
// ============================================
self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // ❌ No cache APIs externas sensibles
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(req));
    return;
  }

  // 🖼️ IMAGES → Cache First
  if (req.destination === 'image') {
    event.respondWith(cacheFirst(req, IMAGE_CACHE, 80));
    return;
  }

  // 📄 HTML → Network First + Offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstPage(req));
    return;
  }

  // 📦 Assets JS/CSS/fonts
  if (/\.(js|css|woff2?|ttf)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // Default
  event.respondWith(networkFirst(req, DYNAMIC_CACHE, 50));
});

// ============================================
// NETWORK FIRST
// ============================================
async function networkFirst(req, cacheName, limit) {
  try {
    const fresh = await fetch(req);

    if (fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, fresh.clone());
      trimCache(cacheName, limit);
    }

    return fresh;

  } catch {
    const cached = await caches.match(req);
    return cached || new Response('Offline', { status: 503 });
  }
}

// ============================================
// NETWORK FIRST PAGE
// ============================================
async function networkFirstPage(req) {
  try {
    const response = await fetch(req);

    // Si la respuesta es válida → usarla
    if (response && response.ok) {
      return response;
    }

    throw new Error('Network response not ok');

  } catch (error) {
    console.log('📴 Offline fallback triggered');

    const cachedPage = await caches.match(req);
    if (cachedPage) return cachedPage;

    return await caches.match('/offline.html');
  }
}


// ============================================
// CACHE FIRST
// ============================================
async function cacheFirst(req, cacheName, limit) {
  const cached = await caches.match(req);
  if (cached) return cached;

  try {
    const fresh = await fetch(req);

    if (fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, fresh.clone());
      if (limit) trimCache(cacheName, limit);
    }

    return fresh;

  } catch {
    return new Response('Offline resource', { status: 503 });
  }
}

// ============================================
// LIMPIAR CACHE
// ============================================
async function trimCache(name, maxItems) {
  const cache = await caches.open(name);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    for (let i = 0; i < keys.length - maxItems; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// ============================================
// PUSH NOTIFICATIONS ROBUSTAS
// ============================================
self.addEventListener('push', event => {
  let data = {
    title: '⚽ GlobalScore',
    body: 'Nueva notificación',
    url: '/'
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    data.body = event.data?.text() || data.body;
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      data: { url: data.url }
    })
  );
});

// ============================================
// CLICK NOTIFICATION
// ============================================
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const client of list) {
        if (client.url.includes(url)) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

console.log('✅ SW listo para producción');
