import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Support Android 5+ (Chrome 51+), iOS Safari 10+, Samsung Browser 6+
      // plugin-legacy manages its own build target — do NOT set build.target separately
      targets: [
        'android >= 5',
        'chrome >= 51',
        'ios_saf >= 10',
        'samsung >= 6',
        'firefox >= 54',
      ],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      // IMPORTANT: modernPolyfills: true was removed.
      // Setting it to true generates an extra polyfill chunk that modern browsers
      // (iPhone 15 Pro Max / Safari 17+) must fetch at startup via dynamic import.
      // On unstable mobile connections this fetch can fail silently, preventing
      // the app from booting. Modern browsers in our target range don't need it.
      modernPolyfills: false,
    }),
  ],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 3000,
  },
  build: {
    // plugin-legacy controls transpilation target — no manual build.target needed
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // keep console logs for debugging production issues
        // IMPORTANT: ecma:5 was removed from compress options.
        // Setting ecma:5 here overrode the modern-build output to ES5 syntax,
        // conflicting with plugin-legacy's dual-build system and potentially
        // breaking the module build for modern browsers.
      },
      format: {
        // Let terser decide the output format per build; plugin-legacy handles it
      },
    },
    rollupOptions: {
      output: {
        // Split vendor code for better long-term caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
