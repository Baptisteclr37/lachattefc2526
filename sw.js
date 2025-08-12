self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('la-chatte-cache').then(cache => {
      return cache.addAll([
        '/', // page d'accueil
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
