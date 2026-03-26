const CACHE_NAME = 'reliability-spec-v2.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './mil810_database.json',
  './gr63_database.json',
  './astm4169_database.json',
  './iec_database.json',
  './sr332_database.json',
  './ista_database.json',
  './iec60068_database.json',
  './ip_code_database.json',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.plot.ly/plotly-2.27.0.min.js'
];

// Install: cache all assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: clean up old cache versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first strategy (offline first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache new network responses for our origin and cors (CDN)
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
