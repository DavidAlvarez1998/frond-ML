import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/signals':    { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/backtest':   { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/predict':    { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/chat':       { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/model-info': { target: 'http://127.0.0.1:8001', changeOrigin: true },
    },
  },
})
