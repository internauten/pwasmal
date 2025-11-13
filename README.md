# PWA App

A Progressive Web App compatible with iOS 12+ and Windows.

## Features

- ✅ **Offline Support**: Works without internet connection using Service Workers
- ✅ **Installable**: Can be installed on home screen (iOS) or as desktop app (Windows)
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **iOS 12+ Compatible**: Fully compatible with older iOS devices
- ✅ **Windows Compatible**: Works on all modern Windows browsers
- ✅ **Fast Loading**: Caches resources for instant loading
- ✅ **Push Notifications**: Support for web push notifications (where available)

## Setup Instructions

### 1. Generate Icons

Before deploying, you need to generate the app icons:

1. Open `generate-icons.html` in your browser
2. Click "Generate Icons" button
3. Download all generated icons
4. Create an `icons` folder in your project root
5. Save all downloaded icons in the `icons` folder

### 2. Local Development

To test the PWA locally:

1. Install a local server. For example, using Python:
   ```bash
   python -m http.server 8000
   ```
   Or using Node.js:
   ```bash
   npx http-server -p 8000
   ```

2. Open your browser and navigate to `http://localhost:8000`

### 3. Deploy to Production

For the PWA to work properly, you need to deploy it to a server with HTTPS.

#### Option A: Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Push your code to the repository
3. Go to Settings > Pages
4. Select your branch and root folder
5. Your PWA will be available at `https://yourusername.github.io/repository-name`

#### Option B: Deploy to Netlify/Vercel

1. Create an account on [Netlify](https://netlify.com) or [Vercel](https://vercel.com)
2. Connect your Git repository or drag and drop your folder
3. Deploy with default settings
4. Your PWA will be automatically deployed with HTTPS

## iOS Installation

To install on iOS 12+:

1. Open the app in Safari
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right corner
5. The app icon will appear on your home screen

## Windows Installation

To install on Windows:

1. Open the app in Edge or Chrome
2. Click the install icon in the address bar (or look for "Install App" prompt)
3. Click "Install"
4. The app will open in its own window and appear in your Start Menu

## Browser Support

- **iOS Safari**: 12.0+
- **Chrome**: 58+
- **Edge**: 79+
- **Firefox**: 44+
- **Samsung Internet**: 4+

## File Structure

```
pwasmal/
├── index.html          # Main HTML file
├── app.js              # Application JavaScript
├── styles.css          # Application styles
├── service-worker.js   # Service Worker for offline support
├── manifest.json       # PWA manifest file
├── generate-icons.html # Icon generator tool
├── icons/              # App icons (create this folder)
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-167.png
│   ├── icon-180.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
└── README.md           # This file
```

## Customization

### Change App Name

1. Edit `manifest.json`: Update `name` and `short_name`
2. Edit `index.html`: Update `<title>` and `<h1>` tags
3. Edit `service-worker.js`: Update notification title if needed

### Change App Colors

1. Edit `manifest.json`: Update `theme_color` and `background_color`
2. Edit `styles.css`: Update CSS variables in `:root`

### Add More Features

You can extend the app by:
- Adding more pages and routing
- Implementing a backend API
- Adding authentication
- Integrating with device features (camera, geolocation, etc.)

## Testing

### Test Service Worker

1. Open DevTools (F12)
2. Go to Application tab
3. Check Service Workers section
4. Verify the service worker is registered and running

### Test Offline Mode

1. Open the app
2. Open DevTools (F12)
3. Go to Network tab
4. Select "Offline" from the throttling dropdown
5. Reload the page - it should still work

### Test Installation

1. Open the app in a supported browser
2. Look for the install prompt or button
3. Install the app
4. Verify it opens in standalone mode

## Troubleshooting

### Icons not showing
- Make sure all icons are in the `icons/` folder
- Check that icon paths in `manifest.json` are correct
- Clear cache and reload

### Service Worker not registering
- Ensure you're using HTTPS (required for service workers)
- Check browser console for errors
- Verify `service-worker.js` path is correct

### Install prompt not appearing
- iOS Safari doesn't show automatic prompts (users must manually add to home screen)
- Chrome/Edge require HTTPS and certain criteria to be met
- Check if the app is already installed

## License

MIT License - feel free to use this template for your own projects!
