import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_NBI_URL': JSON.stringify(process.env.VITE_NBI_URL || '/nbi'),
  },
  server: {
    port: 5173,
    proxy: {
      '/nbi': {
        target: 'http://localhost:7557',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nbi/, ''),
        secure: false,
        ws: true,
      },
      '/devices': {
        target: 'http://localhost:7557',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
})
