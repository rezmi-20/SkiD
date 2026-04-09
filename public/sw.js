// A basic service worker to pass the browser's PWA install criteria
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Empty fetch handler is required by Chrome to trigger "Add to Home Screen"
});
