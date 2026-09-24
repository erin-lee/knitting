// Bump this version string whenever you update index.html so the new
// version gets picked up instead of the cached one.
const CACHE_NAME = 'blair-tracker-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './blair/back.png',
  './blair/leftFront.png',
  './blair/rightFront.png',
  './blair/sleeve.png',
  './blair/icon-knit.png',
  './blair/icon-purl.png',
  './blair/icon-inc.png',
  './blair/icon-yo.png',
  './blair/icon-cdd.png',
  './blair/icon-k2tog.png',
  './blair/icon-skpo.png'
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
