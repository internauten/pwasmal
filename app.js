// App initialization
let deferredPrompt;
let isStandalone = false;

// Debug function to show messages on screen
function showDebugMessage(message) {
    console.log(message);

    // Create or get debug div
    let debugDiv = document.getElementById('debug-messages');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'debug-messages';
        debugDiv.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); color: #0f0; padding: 10px; font-size: 12px; max-height: 150px; overflow-y: auto; z-index: 9999; font-family: monospace;';
        document.body.appendChild(debugDiv);
    }

    const time = new Date().toLocaleTimeString();
    const msgEl = document.createElement('div');
    msgEl.textContent = `[${time}] ${message}`;
    debugDiv.appendChild(msgEl);

    // Auto-scroll to bottom
    debugDiv.scrollTop = debugDiv.scrollHeight;
}

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

    // Restore scheduled gong time
    restoreSchedule();

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
let audioContext = null;
let audioBuffer = null;
let gongScheduleInterval = null;
let scheduledTime = null;

function playGong() {
    showDebugMessage('playGong() called');

    // iOS 12 compatibility: Use Web Audio API instead of Audio element
    if (!audioContext) {
        showDebugMessage('Creating AudioContext...');
        // Create AudioContext (iOS 12 requires webkitAudioContext)
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioContext = new AudioContextClass();
            showDebugMessage('AudioContext created: ' + audioContext.state);
        } else {
            showDebugMessage('ERROR: Web Audio API not supported');
            fallbackPlayAudio();
            return;
        }
    }

    // Resume audio context if suspended (iOS requirement)
    if (audioContext.state === 'suspended') {
        showDebugMessage('AudioContext suspended, resuming...');
        audioContext.resume().then(() => {
            showDebugMessage('AudioContext resumed');
            playAudioBuffer();
        }).catch(err => {
            showDebugMessage('ERROR resuming context: ' + err.message);
            fallbackPlayAudio();
        });
    } else {
        showDebugMessage('AudioContext state: ' + audioContext.state);
        playAudioBuffer();
    }
}

function playAudioBuffer() {
    if (audioBuffer) {
        showDebugMessage('Using cached audio buffer');
        // Play the already loaded buffer
        playSound(audioBuffer);
    } else {
        showDebugMessage('Fetching gong1.mp3...');
        // Load the audio file
        fetch('gong1.mp3')
            .then(response => {
                showDebugMessage('Fetch response: ' + response.status);
                if (!response.ok) {
                    throw new Error('Failed to fetch audio file');
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                showDebugMessage('Got arrayBuffer, size: ' + arrayBuffer.byteLength);
                // iOS 12 compatibility: decodeAudioData might use callbacks instead of promises
                return new Promise((resolve, reject) => {
                    const decodePromise = audioContext.decodeAudioData(
                        arrayBuffer,
                        // Success callback (for older browsers)
                        (decodedBuffer) => {
                            showDebugMessage('Audio decoded (callback)');
                            resolve(decodedBuffer);
                        },
                        // Error callback (for older browsers)
                        (error) => {
                            showDebugMessage('Decode error (callback): ' + error);
                            reject(error);
                        }
                    );

                    // If it returns a promise (newer browsers), use that
                    if (decodePromise && decodePromise.then) {
                        showDebugMessage('Using promise-based decode');
                        decodePromise.then(resolve).catch(reject);
                    }
                });
            })
            .then(decodedBuffer => {
                audioBuffer = decodedBuffer;
                showDebugMessage('Audio buffer loaded successfully');
                playSound(audioBuffer);
            })
            .catch(error => {
                showDebugMessage('ERROR loading audio: ' + error.message);
                fallbackPlayAudio();
            });
    }
}

function playSound(buffer) {
    try {
        showDebugMessage('Creating audio source...');
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        showDebugMessage('Sound playing!');
    } catch (error) {
        showDebugMessage('ERROR playing sound: ' + error.message);
        fallbackPlayAudio();
    }
}

// Fallback for browsers that don't support Web Audio API
function fallbackPlayAudio() {
    showDebugMessage('Using fallback Audio element');
    const audio = new Audio('gong1.mp3');
    audio.play().then(() => {
        showDebugMessage('Fallback audio playing');
    }).catch(error => {
        showDebugMessage('ERROR fallback audio: ' + error.message);
    });
}

// Schedule gong to play at specific time
function scheduleGong() {
    const timeInput = document.getElementById('gong-time');
    const statusDiv = document.getElementById('schedule-status');

    if (!timeInput.value) {
        alert('Please select a time first');
        return;
    }

    // Clear any existing schedule
    clearSchedule();

    scheduledTime = timeInput.value;

    // Save to localStorage
    localStorage.setItem('gongScheduledTime', scheduledTime);

    // Update status
    updateScheduleStatus();

    // Check every minute if it's time to play
    gongScheduleInterval = setInterval(checkScheduledTime, 60000);

    // Also check immediately
    checkScheduledTime();

    showDebugMessage('Gong scheduled for ' + scheduledTime);
}

function checkScheduledTime() {
    if (!scheduledTime) return;

    const now = new Date();
    const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    showDebugMessage('Checking time: ' + currentTime + ' vs ' + scheduledTime);

    if (currentTime === scheduledTime) {
        showDebugMessage('Time match! Playing gong...');
        playGong();

        // Show notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Gong Time!', {
                body: 'Your scheduled gong is playing',
                icon: 'icons/icon-192.png'
            });
        }
    }
}

function clearSchedule() {
    if (gongScheduleInterval) {
        clearInterval(gongScheduleInterval);
        gongScheduleInterval = null;
    }

    scheduledTime = null;
    localStorage.removeItem('gongScheduledTime');

    updateScheduleStatus();
    showDebugMessage('Schedule cleared');
}

function updateScheduleStatus() {
    const statusDiv = document.getElementById('schedule-status');
    if (!statusDiv) return;

    if (scheduledTime) {
        statusDiv.textContent = `⏰ Gong scheduled for ${scheduledTime} daily`;
        statusDiv.className = 'schedule-status active';
    } else {
        statusDiv.textContent = 'No schedule set';
        statusDiv.className = 'schedule-status';
    }
}

// Restore schedule on page load
function restoreSchedule() {
    const savedTime = localStorage.getItem('gongScheduledTime');
    if (savedTime) {
        scheduledTime = savedTime;
        const timeInput = document.getElementById('gong-time');
        if (timeInput) {
            timeInput.value = savedTime;
        }
        updateScheduleStatus();
        gongScheduleInterval = setInterval(checkScheduledTime, 60000);
        showDebugMessage('Restored schedule: ' + savedTime);
    }
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
