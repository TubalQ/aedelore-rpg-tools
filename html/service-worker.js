// Aedelore Character Sheet Service Worker
// Strategy: stale-while-revalidate (no manual version bumps needed)
const CACHE_NAME = 'aedelore-cache';

// Files to pre-cache on first install
const STATIC_ASSETS = [
  '/character-sheet',
  '/dm-session',
  '/wiki',
  '/wiki-admin',
  '/js/dm-session.js',
  '/js/wiki.js',
  '/js/wiki-admin.js',
  '/data/npc-names.js',
  '/css/styles.css',
  '/css/fonts.css',
  '/fonts/inter/inter-300.woff2',
  '/fonts/inter/inter-400.woff2',
  '/fonts/inter/inter-500.woff2',
  '/fonts/inter/inter-600.woff2',
  '/fonts/inter/inter-700.woff2',
  '/fonts/crimson-text/crimson-400.woff2',
  '/fonts/crimson-text/crimson-400-italic.woff2',
  '/fonts/crimson-text/crimson-600.woff2',
  '/js/main.js',
  '/js/error-logger.js',
  '/js/dashboard.js',
  '/js/tabs.js',
  '/js/sliders.js',
  '/js/weapons.js',
  '/js/armor.js',
  '/js/spells.js',
  '/js/diceroller.js',
  '/js/system-selector.js',
  '/js/privacy.js',
  // Character sheet modules
  '/js/modules/core-api.js',
  '/js/modules/character-data.js',
  '/js/modules/ui-common.js',
  '/js/modules/auth.js',
  '/js/modules/persistence.js',
  '/js/modules/campaigns.js',
  '/js/modules/progression.js',
  '/js/modules/onboarding.js',
  '/js/modules/activity-monitor.js',
  // RPG system modules
  '/js/systems/system-config.js',
  '/js/systems/dnd5e.js',
  '/js/systems/pathfinder2e.js',
  '/js/systems/storyteller.js',
  '/js/systems/cod.js',
  // Data files
  '/data/weapons.js',
  '/data/armor.js',
  '/data/spells.js',
  '/data/races.js',
  '/data/classes.js',
  '/data/starting-equipment.js',
  '/data/religions.js',
  '/manifest.json'
];

// Install event - pre-cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Pre-cache error:', err))
  );
});

// Activate event - clean up old versioned caches, claim clients
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => {
          console.log('[SW] Deleting old cache:', n);
          return caches.delete(n);
        })
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch event - stale-while-revalidate
// Serves cached version instantly, fetches fresh copy in background
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // API calls always go to network
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // Always fetch fresh version in background
      const networkFetch = fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => null);

      if (cached) {
        // Serve from cache immediately, update in background
        event.waitUntil(networkFetch);
        return cached;
      }

      // Not in cache — wait for network
      return networkFetch.then(response => {
        if (response) return response;
        // Offline fallback
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
