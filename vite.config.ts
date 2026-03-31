import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

function vendorManualChunks(id: string): string | undefined {
  // Keep Vite's async-chunk preload helper in `vendor` so it is not merged with
  // @react-three/drei / three (see vite `preloadHelperId` = "\0vite/preload-helper.js").
  if (id === '\0vite/preload-helper.js') {
    return 'vendor'
  }

  const normalized = id.replace(/\\/g, '/')
  if (!normalized.includes('/node_modules/')) {
    return undefined
  }

  if (normalized.includes('/framer-motion/')) {
    return 'motion'
  }

  const isThreeCore =
    /\/node_modules\/three(\/|$)/.test(normalized) ||
    normalized.endsWith('/node_modules/three')
  const isFiber = normalized.includes('/node_modules/@react-three/fiber/')
  const isDrei = normalized.includes('/node_modules/@react-three/drei/')
  // Transitive deps of drei/fiber that import `three` (avoid circular three-bundle ↔ other chunks).
  const isThreeSatellite =
    /\/node_modules\/(three-stdlib|three-mesh-bvh|maath|meshline|troika-three-text|troika-three-utils)(\/|$)/.test(
      normalized,
    ) || normalized.includes('/node_modules/@monogrid/gainmap-js/')

  if (isThreeCore || isFiber || isDrei || isThreeSatellite) {
    return 'three-bundle'
  }

  // Remaining dependencies → single `vendor` chunk so shared React/router code stays
  // in one place. This pairs with forcing `\0vite/preload-helper.js` into `vendor`:
  // otherwise Rollup co-locates the helper with @react-three/drei and the entry chunk
  // ends up importing `three-bundle` + preloading Three.js on first paint.
  return 'vendor'
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'add-charset-header',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith('.html') || req.url === '/') {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
          }
          next()
        })
      },
    },
    react(),
    ...(process.env.ANALYZE === 'true'
      ? [
          visualizer({
            filename: 'dist/stats.html',
            gzipSize: true,
            template: 'treemap',
          }),
        ]
      : []),
  ],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: vendorManualChunks,
      },
    },
  },
})
