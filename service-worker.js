// Service Worker for PWA
const CACHE_NAME = 'pwa-app-v6';
const urlsToCache = [
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './gong1.mp3',
    './icons/icon-72.png',
    './icons/icon-96.png',
    './icons/icon-128.png',
    './icons/icon-144.png',
    './icons/icon-152.png',
    './icons/icon-167.png',
    './icons/icon-180.png',
    './icons/icon-192.png',
    './icons/icon-384.png',
    './icons/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                // iOS 12 fix: Cache files individually instead of using addAll
                const cachePromises = urlsToCache.map(url => {
                    return cache.add(url).catch(err => {
                        console.log('Failed to cache:', url, err);
                    });
                });
                return Promise.all(cachePromises);
            })
            .then(() => {
                console.log('Service Worker: All files cached');
                return self.skipWaiting();
            })
            .catch(err => {
                console.log('Service Worker: Install failed', err);
            })
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
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                if (response) {
                    console.log('Cache hit:', event.request.url);
                    return response;
                }

                console.log('Fetching from network:', event.request.url);
                return fetch(event.request).then(networkResponse => {
                    // Only cache successful GET requests
                    if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone()).catch(err => {
                            console.log('Cache put failed:', err);
                        });
                    }
                    return networkResponse;
                }).catch(err => {
                    console.log('Fetch failed:', event.request.url, err);
                    // Return index.html for navigation requests when offline
                    if (event.request.mode === 'navigate') {
                        return cache.match('./index.html');
                    }
                    throw err;
                });
            });
        })
    );
});

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
