// Bump this version string whenever you update index.html so the new
// version gets picked up instead of the cached one.
const CACHE_NAME = 'clotilde-sweater-tracker-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './charts/A.png',
  './charts/B.png',
  './charts/C.png',
  './charts/D.png',
  './charts/body.png',
  './charts/sleeve.png',
  './charts/k_k.png',
  './charts/k_k2tog.png',
  './charts/k_ssk.png',
  './charts/k_cdd.png',
  './charts/k_yo.png',
  './charts/k_m1l.png',
  './charts/k_m1r.png',
  './charts/k_rep.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Network-first for index.html so you always get the latest version when
// online; falls back to cache when offline.
self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(function(res) {
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, resClone); });
        return res;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});
