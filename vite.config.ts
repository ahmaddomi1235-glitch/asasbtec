import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Support Android 5+ (Chrome 51+), iOS Safari 10+, Samsung Browser 6+
      // Do NOT set build.target separately — plugin-legacy manages it
      targets: [
        'android >= 5',
        'chrome >= 51',
        'ios_saf >= 10',
        'samsung >= 6',
        'firefox >= 54',
      ],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      // Render legacy polyfills for ALL legacy browsers
      renderLegacyChunks: true,
      // Modernize the legacy build as much as possible
      modernPolyfills: true,
    }),
  ],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 3000,
  },
  build: {
    // Let plugin-legacy control the target — do NOT set build.target here
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // keep console for debugging
        ecma: 5,
      },
      format: {
        ecma: 5,
      },
    },
    rollupOptions: {
      output: {
        // Split vendor code for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
