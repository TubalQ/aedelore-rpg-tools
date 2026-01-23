// Aedelore Character Sheet Service Worker
const CACHE_NAME = 'aedelore-v202';

// Files to cache for offline use
const STATIC_ASSETS = [
  '/character-sheet',
  '/css/styles.css',
  '/js/main.js',
  '/js/dashboard.js',
  '/js/tabs.js',
  '/js/sliders.js',
  '/js/weapons.js',
  '/js/armor.js',
  '/js/spells.js',
  '/js/diceroller.js',
  '/js/system-selector.js',
  '/js/privacy.js',
  '/js/systems/system-config.js',
  '/js/systems/dnd5e.js',
  '/js/systems/pathfinder2e.js',
  '/js/systems/storyteller.js',
  '/js/systems/cod.js',
  '/data/weapons.js',
  '/data/armor.js',
  '/data/spells.js',
  '/data/races.js',
  '/data/classes.js',
  '/data/religions.js',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Cache error:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API calls - always go to network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // For static assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached version, but also fetch update in background
          event.waitUntil(
            fetch(event.request)
              .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                  caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, networkResponse));
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline and not cached - return offline page if available
            if (event.request.mode === 'navigate') {
              return caches.match('/character-sheet');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Handle messages from the main app
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
