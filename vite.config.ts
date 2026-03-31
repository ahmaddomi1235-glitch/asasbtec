import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Target Android WebView Chrome 67+ and similar older browsers
      targets: ['chrome >= 67', 'android >= 6'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 3000,
  },
  build: {
    // Ensure assets are compatible
    target: 'es2015',
  },
})
