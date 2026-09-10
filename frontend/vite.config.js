import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/tripist/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // change to your backend local port
        changeOrigin: true,
        secure: false,
      },
      // If your endpoints in api.js do not start with /api (e.g. /notice, /packages directly):
      '/notice': 'http://localhost:5000',
      '/destinations': 'http://localhost:5000',
      '/packages': 'http://localhost:5000',
    },
  },
})