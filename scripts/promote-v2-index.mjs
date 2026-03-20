/**
 * After `vite build`, `dist/index.html` is V1 and `dist/index.v2.html` is V2.
 * Vercel serves `/` from `index.html` before rewrites, so copy V2 over `index.html`
 * so production shows Portfolio V2 at the root URL.
 */
import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

const dist = join(process.cwd(), 'dist')
const v2 = join(dist, 'index.v2.html')
const idx = join(dist, 'index.html')

if (!existsSync(v2)) {
  console.error('promote-v2-index: dist/index.v2.html missing — run vite build first')
  process.exit(1)
}

copyFileSync(v2, idx)
console.log('promote-v2-index: dist/index.html now serves V2 (copied from index.v2.html)')
