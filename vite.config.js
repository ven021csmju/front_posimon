import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
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
