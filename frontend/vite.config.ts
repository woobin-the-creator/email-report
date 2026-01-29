import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 10005,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    hmr: {
      host: 'localhost',
      port: 10005,
      clientPort: 10005
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
