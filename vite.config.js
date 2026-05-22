import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://possimon.onrender.com',
        changeOrigin: true,
        ws: false,
        secure: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code !== 'ECONNRESET' && err.code !== 'ECONNABORTED') {
              console.error('proxy error', err);
            }
          });
        },
      },
      '/static': {
        target: 'https://possimon.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
