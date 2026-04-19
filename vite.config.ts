// vite.config.ts

import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      // Auto-updates the SW in the background, no prompt needed
      registerType: 'autoUpdate',

      // Let the plugin generate the service worker (no manual sw file needed)
      injectRegister: 'auto',

      // SvelteKit-specific: scope matches the base path
      scope: '/',
      base: '/',

      manifest: {
        name: 'Sabify',
        short_name: 'Sabify',
        description: 'Faculty, College, Department, Level — whatever your university calls it, Sabify adapts.',
        theme_color: '#7C3AED',
        background_color: '#1E1B2E',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },

      workbox: {
        // Pre-cache all SvelteKit build assets
        globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],

        // Don't cache API routes or server routes
        navigateFallback: '/',
        navigateFallbackDenylist: [/^\/api\//],

        runtimeCaching: [
          {
            // Cache university icon images from lib/data
            urlPattern: /\/src\/lib\/data\/uni-icons\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'uni-icons',
              expiration: {
                maxEntries: 250,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            // Cache page navigations (HTML) — network first so updates land
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 5
            }
          }
        ]
      },

      // Required for SvelteKit — tells the plugin where kit outputs assets
      kit: {
        includeVersionFile: true
      }
    })
  ]
});