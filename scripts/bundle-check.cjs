#!/usr/bin/env node
/**
 * bundle-check.cjs — T-005 bundle budget enforcement
 *
 * Reads the Vite build output from dist/ and validates that the V2 initial
 * JavaScript load (gzip) stays within the PRD budget of 300 KB.
 *
 * Budget definition (from docs/cursor-orchestrator-prompt.md):
 *   js_initial_kb_gzip: 300   (KB)
 *
 * What counts as "initial" for V2:
 *   - The chunk referenced directly in index.v2.html <script type="module">
 *   - Its <link rel="modulepreload"> dependencies
 *   - R3F and page-level chunks (HomeV2, AmbientScene, etc.) are lazy → excluded
 *
 * The script also reports ALL chunk sizes so the full picture is visible.
 */

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

// ─── Configuration ────────────────────────────────────────────────────────────

const DIST_DIR = path.resolve(__dirname, '../dist')
const ASSETS_DIR = path.join(DIST_DIR, 'assets')
const V2_HTML = path.join(DIST_DIR, 'index.v2.html')

/**
 * Budget in bytes (gzip).
 * 300 KB = 300 * 1024 = 307 200 bytes
 */
const BUDGET_INITIAL_JS_GZIP_BYTES = 300 * 1024

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gzipSize(filePath) {
  const content = fs.readFileSync(filePath)
  return zlib.gzipSync(content, { level: 9 }).length
}

function kb(bytes) {
  return (bytes / 1024).toFixed(2)
}

function parseInitialChunksFromHTML(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8')

  const chunks = []

  // <script type="module" ... src="...">
  const scriptRe = /<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/gi
  let m
  while ((m = scriptRe.exec(html)) !== null) {
    chunks.push(m[1])
  }

  // <link rel="modulepreload" ... href="...">
  const preloadRe = /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+)["']/gi
  while ((m = preloadRe.exec(html)) !== null) {
    chunks.push(m[1])
  }

  return chunks
}

function resolveAssetPath(assetUrl) {
  // assetUrl looks like /assets/v2-aIAsHqPE.js
  const rel = assetUrl.replace(/^\//, '')
  return path.join(DIST_DIR, rel)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  T-005 Bundle Check — Portfolio V2')
  console.log('  Budget: JS initial load ≤ 300 KB (gzip)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  if (!fs.existsSync(V2_HTML)) {
    console.error('ERROR: dist/index.v2.html not found. Run `npm run build` first.')
    process.exit(1)
  }

  // ── All JS assets in dist/assets/ ──────────────────────────────────────────
  console.log('ALL JS CHUNKS (minified, gzip):')
  console.log('─────────────────────────────────────────────────────')

  const allJsFiles = fs
    .readdirSync(ASSETS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort()

  const chunkData = []
  for (const file of allJsFiles) {
    const fullPath = path.join(ASSETS_DIR, file)
    const rawBytes = fs.statSync(fullPath).size
    const gzBytes = gzipSize(fullPath)
    chunkData.push({ file, rawBytes, gzBytes })
    console.log(`  ${file.padEnd(48)} raw: ${kb(rawBytes).padStart(8)} KB  gzip: ${kb(gzBytes).padStart(8)} KB`)
  }
  console.log('')

  // ── V2 initial chunks (referenced in index.v2.html) ────────────────────────
  const initialAssetUrls = parseInitialChunksFromHTML(V2_HTML)
  const initialJsUrls = initialAssetUrls.filter((u) => u.endsWith('.js'))

  console.log('V2 INITIAL JS (from index.v2.html script + modulepreload):')
  console.log('─────────────────────────────────────────────────────')

  let totalInitialGzip = 0
  for (const url of initialJsUrls) {
    const filePath = resolveAssetPath(url)
    if (!fs.existsSync(filePath)) {
      console.warn(`  WARN: could not find resolved path for ${url}`)
      continue
    }
    const rawBytes = fs.statSync(filePath).size
    const gzBytes = gzipSize(filePath)
    totalInitialGzip += gzBytes
    const filename = path.basename(filePath)
    console.log(`  ${filename.padEnd(48)} raw: ${kb(rawBytes).padStart(8)} KB  gzip: ${kb(gzBytes).padStart(8)} KB`)
  }
  console.log('')

  // ── Lazy chunks note ───────────────────────────────────────────────────────
  console.log('LAZY CHUNKS (not counted against initial budget):')
  console.log('─────────────────────────────────────────────────────')
  const initialFilenames = new Set(initialJsUrls.map((u) => path.basename(resolveAssetPath(u))))
  for (const { file, rawBytes, gzBytes } of chunkData) {
    if (!initialFilenames.has(file)) {
      const tag = file.includes('react-three-fiber') ? ' ⚠ R3F — large, lazy' : ''
      console.log(`  ${file.padEnd(48)} raw: ${kb(rawBytes).padStart(8)} KB  gzip: ${kb(gzBytes).padStart(8)} KB${tag}`)
    }
  }
  console.log('')

  // ── Budget verdict ─────────────────────────────────────────────────────────
  const budgetKB = kb(BUDGET_INITIAL_JS_GZIP_BYTES)
  const totalKB = kb(totalInitialGzip)
  const passed = totalInitialGzip <= BUDGET_INITIAL_JS_GZIP_BYTES
  const statusIcon = passed ? '✅ PASS' : '❌ FAIL'

  console.log('BUDGET VERDICT:')
  console.log('─────────────────────────────────────────────────────')
  console.log(`  Initial JS (gzip): ${totalKB} KB`)
  console.log(`  Budget:            ${budgetKB} KB`)
  console.log(`  Status:            ${statusIcon}`)
  console.log('')

  if (!passed) {
    const overBy = kb(totalInitialGzip - BUDGET_INITIAL_JS_GZIP_BYTES)
    console.log(`  ⚠ OVER BUDGET BY ${overBy} KB`)
    console.log('')
    console.log('  RISK — R3F chunk note:')
    console.log('  react-three-fiber.esm is lazy and NOT counted in the initial budget.')
    console.log('  It is loaded on demand by WebGLLayer → AmbientScene.')
    console.log('  If initial budget still fails, consider:')
    console.log('    1. Dynamic import of AppV2 shell with router-level splitting')
    console.log('    2. Reducing react-router-dom or other shared dependencies')
    console.log('')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (!passed) {
    process.exit(1)
  }
}

main()
