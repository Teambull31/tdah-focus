// Service Worker — Cerveau.exe PWA
const CACHE = 'cerveau-v3';

const LOCAL_ASSETS = [
  './Cerveau.html',
  './timer-pip.html',
  './styles.css',
  './helpers.js',
  './i18n.js',
  './data.js',
  './app.jsx',
  './features.jsx',
  './views.jsx',
  './tweaks-panel.jsx',
  './manifest.json',
  './icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(LOCAL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Only handle http(s) — skip chrome-extension etc.
  if (!url.protocol.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      // Always try to refresh cached entry in background
      const fromNet = fetch(e.request).then((res) => {
        if (res && res.ok) {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => null);

      return cached || fromNet;
    })
  );
});
