import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Allow external connections
    port: 5173,       // Explicitly set port
    proxy: {
      '/api': {
        target: 'http://api:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')  // Remove /api prefix
      },
    },
  },
  // Build configuration for production
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  // Environment variables
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000'),
  },
})
