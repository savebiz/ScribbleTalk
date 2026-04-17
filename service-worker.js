const CACHE_NAME = 'scribbletalk-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles/main.css',
  './js/db.js',
  './js/app.js',
  './js/canvas.js',
  './js/parent.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
