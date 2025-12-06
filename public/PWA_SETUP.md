# PWA Setup Instructions

## Icons Required

The manifest.json references two icon files that need to be created:

1. `/public/icon-192.png` - 192x192 pixels
2. `/public/icon-512.png` - 512x512 pixels

### Creating Icons

You can create these icons using:
- Online tools like [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- Design tools like Figma, Photoshop, etc.
- Or use a simple placeholder generator

The icons should:
- Be square PNG images
- Have a dark theme to match the app (#0E0E0E background)
- Be recognizable at small sizes
- Support maskable icons (safe zone for Android)

### Quick Placeholder Icons

For development, you can create simple placeholder icons using ImageMagick or online tools:

```bash
# Using ImageMagick (if installed)
convert -size 192x192 xc:#0E0E0E -pointsize 72 -fill white -gravity center -annotate +0+0 "GD" icon-192.png
convert -size 512x512 xc:#0E0E0E -pointsize 192 -fill white -gravity center -annotate +0+0 "GD" icon-512.png
```

Or use an online tool like [RealFaviconGenerator](https://realfavicongenerator.net/) to generate all PWA icons.

## Testing PWA

1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Open in Chrome/Edge
4. Check "Application" tab in DevTools for Service Worker status
5. Use "Install" prompt or "Add to Home Screen" on mobile

## Service Worker

The service worker (`/public/sw.js`) is automatically registered in production mode only.
It caches static pages and assets for offline access.

