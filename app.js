// App initialization
let deferredPrompt;
let isStandalone = false;

// Check if app is running in standalone mode
if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
    isStandalone = true;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    // Register service worker
    registerServiceWorker();

    // Update device information
    updateDeviceInfo();

    // Update installation status
    updateInstallStatus();

    // Setup install button
    setupInstallButton();

    // Setup online/offline listeners
    setupConnectivityListeners();

    console.log('PWA App initialized');

    // Play gong sound when everything is loaded (only in PWA mode or after user interaction)
    window.addEventListener('load', () => {
        if (isStandalone) {
            // In PWA mode, try to play immediately
            playGong();
        } else {
            // In browser mode, play on first user interaction
            const playOnInteraction = () => {
                playGong();
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
            };
            document.addEventListener('click', playOnInteraction, { once: true });
            document.addEventListener('touchstart', playOnInteraction, { once: true });
        }
    });
}

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration.scope);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('New content available, please refresh.');
                            }
                        });
                    });
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    } else {
        console.log('Service Workers not supported');
    }
}

// Update device information
function updateDeviceInfo() {
    // Platform
    const platform = document.getElementById('platform');
    if (platform) {
        const userAgent = navigator.userAgent;
        let platformName = 'Unknown';

        if (/iPhone|iPad|iPod/.test(userAgent)) {
            platformName = 'iOS';
        } else if (/Windows/.test(userAgent)) {
            platformName = 'Windows';
        } else if (/Mac/.test(userAgent)) {
            platformName = 'macOS';
        } else if (/Android/.test(userAgent)) {
            platformName = 'Android';
        } else if (/Linux/.test(userAgent)) {
            platformName = 'Linux';
        }

        platform.textContent = platformName;
    }

    // Online status
    updateOnlineStatus();

    // Screen size
    const screenSize = document.getElementById('screen-size');
    if (screenSize) {
        screenSize.textContent = `${window.innerWidth} × ${window.innerHeight}`;
    }
}

// Update online status
function updateOnlineStatus() {
    const onlineStatus = document.getElementById('online-status');
    if (onlineStatus) {
        const isOnline = navigator.onLine;
        onlineStatus.textContent = isOnline ? 'Online' : 'Offline';
        onlineStatus.className = isOnline ? 'online' : 'offline';
    }
}

// Setup connectivity listeners
function setupConnectivityListeners() {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

// Update installation status
function updateInstallStatus() {
    const statusDiv = document.getElementById('install-status');
    if (!statusDiv) return;

    if (isStandalone) {
        statusDiv.innerHTML = '<p>✅ App is installed and running in standalone mode</p>';
        statusDiv.className = 'status-info installed';
    } else {
        statusDiv.innerHTML = '<p>ℹ️ App is running in browser mode. You can install it for a better experience.</p>';
        statusDiv.className = 'status-info not-installed';
    }
}

// Setup install button
function setupInstallButton() {
    const installButton = document.getElementById('install-button');
    if (!installButton) return;

    // Don't show install button if already installed
    if (isStandalone) {
        installButton.style.display = 'none';
        return;
    }

    // For iOS Safari - show manual instructions
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
        installButton.textContent = 'How to Install on iOS';
        installButton.style.display = 'block';
        installButton.addEventListener('click', showIOSInstructions);
        return;
    }

    // For browsers that support beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installButton.style.display = 'block';
    });

    installButton.addEventListener('click', installApp);
}

// Install app (for supported browsers)
async function installApp() {
    if (!deferredPrompt) {
        return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
    } else {
        console.log('User dismissed the install prompt');
    }

    deferredPrompt = null;
    document.getElementById('install-button').style.display = 'none';
}

// Show iOS installation instructions
function showIOSInstructions() {
    alert(
        'To install this app on iOS:\n\n' +
        '1. Tap the Share button (square with arrow)\n' +
        '2. Scroll down and tap "Add to Home Screen"\n' +
        '3. Tap "Add" in the top right corner\n\n' +
        'The app will appear on your home screen!'
    );
}

// Test notification
function testNotification() {
    if (!('Notification' in window)) {
        alert('This browser does not support notifications');
        return;
    }

    if (Notification.permission === 'granted') {
        showNotification();
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification();
            }
        });
    } else {
        alert('Notifications are blocked. Please enable them in your browser settings.');
    }
}

function showNotification() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('PWA App', {
                body: 'This is a test notification!',
                icon: 'icons/icon-192.png',
                badge: 'icons/icon-72.png',
                vibrate: [200, 100, 200]
            });
        });
    } else {
        new Notification('PWA App', {
            body: 'This is a test notification!',
            icon: 'icons/icon-192.png'
        });
    }
}

// Play gong sound
function playGong() {
    const audio = new Audio('gong1.mp3');
    audio.play().catch(error => {
        console.error('Error playing gong:', error);
        alert('Could not play gong. Make sure gong1.mp3 is in the same folder.');
    });
}

// Clear cache
function clearCache() {
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
        alert('Cache cleared! Please reload the page.');
    } else {
        alert('Cache API not supported in this browser');
    }
}

// Refresh data
function refreshData() {
    updateDeviceInfo();
    updateInstallStatus();
    alert('Data refreshed!');
}

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const screenSize = document.getElementById('screen-size');
        if (screenSize) {
            screenSize.textContent = `${window.innerWidth} × ${window.innerHeight}`;
        }
    }, 250);
});
