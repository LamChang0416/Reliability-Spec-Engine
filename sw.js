const CACHE_NAME = 'reliability-spec-v3.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './js/app.js',
  './js/core/state.js',
  './js/core/db-loader.js',
  './js/core/ui-renderer.js',
  './js/core/search.js',
  './js/core/pwa.js',
  './js/modules/vib-analysis.js',
  './js/modules/vib-calculator.js',
  './js/modules/calculators.js',
  './js/modules/dashboard.js',
  './js/modules/photo-processor.js',
  './js/modules/report-generator.js',
  './api/validator.js',
  './mil810_database.json',
  './gr63_database.json',
  './astm4169_database.json',
  './iec_database.json',
  './sr332_database.json',
  './ista_database.json',
  './iec60068_database.json',
  './ip_code_database.json',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.plot.ly/plotly-2.27.0.min.js',
  'https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js'
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
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
