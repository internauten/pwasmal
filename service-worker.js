// Service Worker for PWA
const CACHE_NAME = 'pwa-app-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-72.png',
    '/icons/icon-96.png',
    '/icons/icon-128.png',
    '/icons/icon-144.png',
    '/icons/icon-152.png',
    '/icons/icon-167.png',
    '/icons/icon-180.png',
    '/icons/icon-192.png',
    '/icons/icon-384.png',
    '/icons/icon-512.png',
    '/gong1.mp3'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // iOS 12 compatibility: Handle both relative and absolute URLs
    const requestUrl = new URL(event.request.url);

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // iOS 12 workaround: Try matching by pathname for same-origin requests
                if (requestUrl.origin === location.origin) {
                    return caches.match(requestUrl.pathname).then(pathResponse => {
                        if (pathResponse) {
                            return pathResponse;
                        }

                        // Try fetching from network
                        return fetchAndCache(event.request);
                    });
                }

                // For cross-origin requests, just fetch
                return fetch(event.request);
            })
            .catch(error => {
                console.log('Fetch failed; returning offline page instead.', error);
                // Return a custom offline page if available
                return caches.match('/index.html');
            })
    );
});

// Helper function to fetch and cache
function fetchAndCache(request) {
    return fetch(request).then(response => {
        // Check if valid response
        if (!response || response.status !== 200) {
            return response;
        }

        // Don't cache non-GET requests or responses with specific types
        if (request.method !== 'GET') {
            return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache the new response
        caches.open(CACHE_NAME)
            .then(cache => {
                cache.put(request, responseToCache);
            })
            .catch(err => {
                console.log('Cache put failed:', err);
            });

        return response;
    }).catch(error => {
        console.log('Network fetch failed:', error);
        throw error;
    });
}

// Background sync (if supported)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

function syncData() {
    // Implement your background sync logic here
    return Promise.resolve();
}

// Push notification
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('PWA App', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});
