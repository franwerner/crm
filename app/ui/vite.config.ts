import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { Runtime, viteTooltify } from "@tooltify/integration-vite"

export default defineConfig({
  plugins: [
    viteTooltify({
      enabled: true,
      runtime: { type: Runtime.REACT }
    }), tailwindcss()],
  server: {
    port: 5174,
    watch: {
      usePolling: process.env['CHOKIDAR_USEPOLLING'] === 'true',
    },
    proxy: {
      '/api': {
        target: process.env['VITE_API_URL'] ?? 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
})
