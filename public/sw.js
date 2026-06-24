const CACHE_NAME = 'direskill-v2';
const ASSETS_TO_CACHE = [
  '/site.webmanifest',
  '/icon-192.svg',
  '/icon-512.svg',
  '/noise.svg'
];

// 1. Install - Cache static assets only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate - Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET, API calls, and Next.js internal data
  if (
    event.request.method !== 'GET' || 
    url.pathname.startsWith('/api/') || 
    url.pathname.startsWith('/_next/data/') ||
    url.search.includes('_next_data')
  ) {
    return;
  }

  // STRATEGY: Network-First for HTML pages (to prevent stale white screens)
  if (event.request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // STRATEGY: Stale-While-Revalidate for other assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Only cache successful local responses and http/https schemes
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' && url.protocol.startsWith('http')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(err => console.log('[SW] Cache put error:', err));
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.log('[SW] Fetch failed, using cache if available', err);
        return cachedResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
