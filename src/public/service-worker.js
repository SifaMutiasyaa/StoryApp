const CACHE_NAME = 'story-app-cache-v1';
const STATIC_CACHE = 'story-app-static-v1';
const DYNAMIC_CACHE = 'story-app-dynamic-v1';
const API_CACHE = 'story-app-api-v1';

const assetsToCache = [
  '/',
  '/index.html',
  '/app.bundle.js',
  '/app.webmanifest',
  '/favicon.ico',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching assets...');
      return cache.addAll(assetsToCache).then(() => {
        console.log('[Service Worker] Assets cached successfully');
      }).catch(error => {
        console.error('[Service Worker] Caching error:', error);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
 
  event.waitUntil(clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName.startsWith('story-app-') && 
            cacheName !== STATIC_CACHE && 
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== API_CACHE
          )
          .map((cacheName) => {
            console.log(`Service Worker: Deleting old cache ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith('/api') || url.hostname.includes('dicoding.dev')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
 
  event.respondWith(cacheFirstStrategy(request));
});

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    const responseToCache = networkResponse.clone();
    
    caches.open(API_CACHE).then(cache => {
      if (request.method === 'GET') {
        cache.put(request, responseToCache);
      }
    });
    
    return networkResponse;
  } catch (error) {
    console.log('Fetch failed, serving from cache', error);
    
    const cachedResponse = await caches.match(request);
    return cachedResponse || caches.match('/offline.html');
  }
}


async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
 
    caches.open(DYNAMIC_CACHE).then(cache => {
      if (request.method === 'GET') {
        cache.put(request, networkResponse.clone());
      }
    });
    
    return networkResponse;
  } catch (error) {
    console.log('Fetch failed, serving fallback', error);
    
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

self.addEventListener('push', (event) => {
  let data = {
    title: 'Notifikasi',
    body: 'Ada pesan masuk!',
    url: '/',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'Pesan baru diterima.',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-512x512.png',
    data: {
      url: data.url || '/',
    },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notifikasi', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
