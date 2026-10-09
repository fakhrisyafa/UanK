/**
 * UANK - Service Worker
 * Caches static assets untuk offline functionality
 */

const CACHE_NAME = 'uank-v1';
const ASSETS_TO_CACHE = [
    '/UanK/',
    '/UanK/index.html',
    '/UanK/style.css',
    '/UanK/app.js',
    '/UanK/manifest.json',
    '/UanK/js/db.js',
    '/UanK/js/ui.js',
    '/UanK/js/transactions.js',
    '/UanK/js/budget.js',
    '/UanK/js/savings.js',
    '/UanK/js/reports.js',
    '/UanK/js/settings.js',
    '/UanK/js/backup.js',
    '/UanK/js/utils.js',
    '/UanK/icons/icon-192.svg',
    '/UanK/icons/icon-512.svg'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching app assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached response if available
            if (response) {
                return response;
            }

            // Otherwise fetch from network
            return fetch(event.request)
                .then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone response for caching
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                })
                .catch(() => {
                    // Return offline page or cached version
                    console.log('[SW] Fetch failed, offline');
                    return caches.match(event.request);
                });
        })
    );
});
