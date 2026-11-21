# LiveLook — Real-Time Virtual Try-On

**Maintainer:** Shanmukha Pranav Kuruvella

LiveLook is a web-based virtual fitting-room demo. It uses a webcam and Decart's real-time try-on service to preview garments from a small product catalog, with hand gestures and voice commands for hands-free browsing.

## Features

- **Live garment preview:** Connects a webcam stream to Decart's `lucy-vton-latest` real-time model to preview a selected garment.
- **Gesture controls:** Uses MediaPipe hand tracking to move through the catalog, add items to the bag, and start voice search.
- **Voice product search:** Uses the browser's Web Speech API to search the catalog by speaking. Speech recognition support varies by browser.
- **Size guidance:** Displays estimated body measurements and a recommended size based on camera pose analysis. Treat these estimates as a demo, not a reliable fit guarantee.
- **Shopping bag demo:** Add, remove, and try on items in the bag. Checkout is simulated; the app does not process payments or place real orders.
- **Product catalog tools:** Includes local sample products and API routes for searching, uploading, syncing, and serving product images.

## Technology

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Decart SDK for real-time try-on
- MediaPipe Tasks Vision for hand and pose tracking
- Web Speech API for voice search

## Requirements

- Node.js and npm
- A Decart API key for live try-on
- A modern browser with webcam support; allow camera access when prompted

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root and add your own Decart API key:

   ```dotenv
   DECART_API_KEY=your_decart_api_key
   ```

   Replace the placeholder with your actual key. Keep `.env.local` private; it is excluded by `.gitignore`. You can also configure a key through the app's settings.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) and allow camera access.

Other useful commands:

```bash
npm run lint
npm run build
```

## Before publishing

- Never commit `.env.local`, `.settings.json`, or any API key. If a key has been shared or exposed, revoke it with its provider and create a replacement.
- Product imagery and brand assets are sample content; confirm you have permission to publish them before distributing this project.
