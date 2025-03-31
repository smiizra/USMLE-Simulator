const CACHE_NAME = 'usmle-simulator-v1';
const ASSETS_TO_CACHE = [
    './index.html'
    // Local files only; External URLs are handled separately.
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching local assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Forces the waiting service worker to become the active service worker
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Takes control of all clients without reloading them
});

// Fetch Event
self.addEventListener('fetch', event => {
    if (event.request.url.startsWith(self.location.origin)) {
        // Handle local files
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } else {
        // Handle external resources (e.g., jQuery, PDF.js)
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    }
});
