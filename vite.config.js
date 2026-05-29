import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.jpg', 'favicon.svg', 'hero-animation.mp4', 'about-store.jpg'],
      manifest: {
        name: 'QuickStock Supply',
        short_name: 'QuickStock',
        description: 'Fast and reliable supply delivery for sari-sari stores and small businesses.',
        theme_color: '#168AFF',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
          {
            src: '/logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Only pre-cache the app's own static files (JS, CSS, HTML)
        // This makes the app shell load fast, but ALL live data goes through the network
        globPatterns: ['**/*.{js,css,html,woff2}'],

        runtimeCaching: [
          {
            // Supabase database + auth — NEVER cache, always require live internet
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/(rest|auth|realtime)\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            // Supabase storage product images — cache for performance (images don't change)
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'product-images',
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
})
