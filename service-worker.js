const CACHE_NAME = 'usmle-simulator-v1';
const ASSETS_TO_CACHE = [
    './index.html',
    'https://code.jquery.com/jquery-3.6.0.min.js',
    'https://code.jquery.com/ui/1.13.2/jquery-ui.min.js',
    'https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.mjs',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.mjs'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
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
});

self.addEventListener('fetch', event => {
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
});
