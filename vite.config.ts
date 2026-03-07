import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        // V1 — original entry point (unchanged)
        main: resolve(__dirname, 'index.html'),
        // V2 — isolated entry point
        v2: resolve(__dirname, 'index.v2.html'),
      },
    },
  },
})
