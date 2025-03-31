const CACHE_NAME = 'usmle-simulator-v4';
const CORE_ASSETS = [
    './USMLE Simulator.html',
    './manifest.json',
    './service-worker.js',
    './icon-192x192.png',
    './icon-512x512.png',
    './js/pdf.min.js',       // PDF.js core library
    './js/pdf.worker.min.js', // PDF.js worker
    './js/script.js',        // Your own JS files if you have any
    './css/style.css'        // Your CSS file if you have one
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Install event triggered');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Caching core assets...');
            return cache.addAll(CORE_ASSETS);
        }).catch(error => console.error('[Service Worker] Caching failed:', error))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate event triggered');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Allow PDFs to be accessed directly
    if (requestUrl.pathname.endsWith('.pdf') && requestUrl.origin === location.origin) {
        console.log(`[Service Worker] Allowing local PDF load: ${event.request.url}`);
        return; // Let the request proceed without interference
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
                return cachedResponse;
            }
            return fetch(event.request).then(networkResponse => {
                if (event.request.url.startsWith('http') && networkResponse.status === 200) {
                    return caches.open(CACHE_NAME).then(cache => {
                        console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }
                return networkResponse;
            });
        }).catch(error => {
            console.error(`[Service Worker] Fetch failed for: ${event.request.url}`, error);
        })
    );
});
