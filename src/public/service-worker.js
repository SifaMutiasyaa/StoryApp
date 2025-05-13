import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { skipWaiting, clientsClaim } from 'workbox-core';

skipWaiting();
clientsClaim();

// Precache assets from __WB_MANIFEST
precacheAndRoute(self.__WB_MANIFEST);

// === ROUTES ===

// HTML pages (navigate)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({ cacheName: 'pages' })
);

// CSS & JS (static)
registerRoute(
  ({ request }) => ['style', 'script'].includes(request.destination),
  new CacheFirst({ cacheName: 'static-resources' })
);

// Images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'images' })
);

// API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api-cache' })
);

// === OFFLINE FALLBACK ===
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

// === PUSH NOTIFICATION ===
self.addEventListener('push', (event) => {
  let data = {
    title: 'Notifikasi',
    body: 'Ada pesan masuk!',
    url: '/',
  };

  if (event.data) {
    try {
      // Coba parse sebagai JSON
      data = event.data.json();
    } catch (err) {
      // Fallback: plain text untuk body
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
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notifikasi', options)
  );
});

// === CLICK NOTIFICATION ===
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
