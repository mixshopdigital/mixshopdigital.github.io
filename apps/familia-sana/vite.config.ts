import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg', 'icono-192.png', 'icono-512.png', 'apple-touch-icon.png', 'sw-extra.js'],
      manifest: {
        name: 'Familia Sana',
        short_name: 'Familia Sana',
        description: 'Tu familia, su salud, todo en un solo lugar. Una solución digital de Mix Shop Digital.',
        lang: 'es-PY',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FBF8F3',
        theme_color: '#6E9E84',
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], importScripts: ['sw-extra.js'], navigateFallback: 'index.html' },
    }),
  ],
})
