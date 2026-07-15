/**
 * Hamza Crypto Pro - Service Worker
 * Specialized for background monitoring and notification dispatch.
 */

const CACHE_NAME = 'hamza-crypto-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install Event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate Event');
  event.waitUntil(self.clients.claim());
});

// Periodic Sync (experimental/limited support) or just keep it active
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-markets') {
    console.log('[SW] Periodic Sync: Checking markets in background...');
    // In a real app, you would fetch API data here and show notification if needed
  }
});

self.addEventListener('fetch', (event) => {
  // Simple fetch pass-through or cache-first for specific assets
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
  }
});

// Communication with client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_STATUS') {
    event.ports[0].postMessage({ status: 'active', timestamp: Date.now() });
  }
});
