// Bauhaus Calorie Tracker — service worker
// Bump CACHE on every deploy so clients fetch new assets.
const CACHE = 'bauhaus-v2';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './bauhaus-tokens.jsx',
  './bauhaus-data.jsx',
  './bauhaus-search.jsx',
  './bauhaus-foodedit.jsx',
  './bauhaus-today.jsx',
  './bauhaus-history.jsx',
  './bauhaus-myfoods.jsx',
  './bauhaus-addfood.jsx',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // addAll fails atomically; use individual puts so one 404 doesn't kill install
      Promise.all(APP_SHELL.map((url) =>
        fetch(url, { mode: 'no-cors' }).then((res) => c.put(url, res)).catch(() => null)
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Stash successful same-origin + CDN responses for offline use
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached);
    })
  );
});
