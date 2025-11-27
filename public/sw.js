const CACHE_NAME = 'lifelogai-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/apple-touch-icon.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Failed to cache some assets during install:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // For API requests, use network-first strategy
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response to cache it
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // For other requests (HTML, JS, CSS), use stale-while-revalidate
  event.respondWith(
    caches.match(request).then((response) => {
      // Return cached version if available
      if (response) {
        // Revalidate in the background
        fetch(request).then(newResponse => {
          if (newResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, newResponse);
            });
          }
        }).catch(() => {
          // Silently fail - we already have cached version
        });
        return response;
      }

      // If not in cache, fetch from network
      return fetch(request)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Return offline page or cached version
          return caches.match(request);
        });
    })
  );
});

// Background sync for delayed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-entries') {
    event.waitUntil(syncPendingEntries());
  }
});

async function syncPendingEntries() {
  // This would sync any offline entries when connection is restored
  console.log('Syncing pending entries...');
}
