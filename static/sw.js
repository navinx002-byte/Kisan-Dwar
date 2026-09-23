const CACHE_NAME = 'kisandwar-v3';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Always network-first to ensure live Render updates show immediately
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
