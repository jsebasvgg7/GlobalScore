// ============================================
// 🏆 GLOBALSCORE SERVICE WORKER (PROD)
// Optimizado + Offline fallback real
// ============================================

const CACHE_VERSION = 'globalscore-v5'; 
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',

  // 🆕 TODOS LOS ICONOS
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
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
      .then(async cache => {
        for (const asset of STATIC_ASSETS) {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn('❌ Error cacheando:', asset);
          }
        }
      })
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
          .filter(n =>
            ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE].includes(n)
          )
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

  // ❌ Supabase siempre online
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(req));
    return;
  }

  // 🖼️ IMAGES
  if (req.destination === 'image') {
    event.respondWith(cacheFirst(req, IMAGE_CACHE, 80));
    return;
  }

  // 📄 NAVEGACIÓN → OFFLINE.HTML SI FALLA
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstPage(req));
    return;
  }

  // 📦 JS/CSS/FONTS
  if (/\.(js|css|woff2?|ttf)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // DEFAULT
  event.respondWith(networkFirst(req, DYNAMIC_CACHE, 50));
});

// ============================================
// NETWORK FIRST NORMAL
// ============================================
async function networkFirst(req, cacheName, limit) {
  try {
    const fresh = await fetch(req);

    if (fresh && fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, fresh.clone());
      if (limit) trimCache(cacheName, limit);
    }

    return fresh;

  } catch {
    return caches.match(req) || new Response('Offline', { status: 503 });
  }
}

// ============================================
// NETWORK FIRST PAGE (FIX)
// ============================================
async function networkFirstPage(req) {
  try {
    const fresh = await fetch(req);

    if (fresh && fresh.ok) return fresh;

    throw new Error('Bad response');

  } catch {
    console.log('📴 Mostrando offline.html');

    const offline = await caches.match('/offline.html');
    return offline || new Response('Offline', { status: 503 });
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

    if (fresh && fresh.ok) {
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
// LIMPIAR CACHE (MEJORADO)
// ============================================
async function trimCache(name, maxItems) {
  const cache = await caches.open(name);
  const keys = await cache.keys();

  while (keys.length > maxItems) {
    await cache.delete(keys.shift());
  }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', event => {
  let data = {
    title: '⚽ GlobalScore',
    body: 'Nueva notificación',
    url: '/'
  };

  try {
    if (event.data) data = { ...data, ...event.data.json() };
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

// CLICK NOTIFICATION
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

console.log('✅ GlobalScore SW listo (offline real)');