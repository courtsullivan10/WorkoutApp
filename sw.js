// Service Worker - Network First Strategy
// Version is updated automatically on each deploy
const CACHE_NAME = 'workout-tracker-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Network first - always try to get fresh version
  e.respondWith(
    fetch(e.request).then(function(response) {
      // Cache a copy of the fresh response
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, clone);
      });
      return response;
    }).catch(function() {
      // If offline, fall back to cache
      return caches.match(e.request);
    })
  );
});
