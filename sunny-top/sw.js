// Bump this version string whenever you update index.html so the new
// version gets picked up instead of the cached one.
const CACHE_NAME = 'sunny-top-tracker-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './sunny/body.png',
  './sunny/lf.png',
  './sunny/rf.png',
  './sunny/rb.png',
  './sunny/lb.png',
  './sunny/i_knit.png',
  './sunny/i_purl.png',
  './sunny/i_c4b.png',
  './sunny/i_c4f.png',
  './sunny/i_k2tog.png',
  './sunny/i_skpo.png',
  './sunny/i_yo.png',
  './sunny/i_m1p.png',
  './sunny/i_s2kpo.png',
  './sunny/i_sl.png',
  './sunny/i_kpfb.png'
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
