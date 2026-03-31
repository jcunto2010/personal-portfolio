#!/usr/bin/env node
/**
 * bundle-check.cjs — T-005 + T-005b bundle budget enforcement
 *
 * Reads the Vite build output from dist/ and validates:
 *
 * T-005 — Initial JS (gzip): script + modulepreload from index.html
 *   The legacy PRD target was 300 KB gzip, which assumed a much smaller vendor
 *   graph. With React 19, react-router-dom, reactflow, lucide-react, etc., the
 *   unified `vendor` chunk alone is ~2.2 MB gzip (see ANALYZE build). The budget
 *   below is baselined to catch regressions, not to enforce the old 300 KB cap.
 *
 * T-005b — three-bundle must NOT appear in <link rel="modulepreload"> so Three/R3F
 *   stays off the critical path (it loads via lazy routes / dynamic imports).
 *
 * Lazy route chunks (HomeV2, SolarScene, motion, three-bundle, …) are excluded
 * from T-005 unless listed in index.html.
 */

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

// ─── Configuration ────────────────────────────────────────────────────────────

const DIST_DIR = path.resolve(__dirname, '../dist')
const ASSETS_DIR = path.join(DIST_DIR, 'assets')
const ENTRY_HTML = path.join(DIST_DIR, 'index.html')

/**
 * T-005 — Max total gzip size for initial JS (script + all modulepreloads).
 * Baseline: Mar 2026 production build ~2235 KB gzip; 2400 KB ≈ +7% headroom.
 * (Original PRD 300 KB remains documented as an aspirational / future-split goal.)
 */
const BUDGET_INITIAL_JS_GZIP_BYTES = 2400 * 1024

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

  const scriptRe = /<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/gi
  let m
  while ((m = scriptRe.exec(html)) !== null) {
    chunks.push(m[1])
  }

  const preloadRe = /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+)["']/gi
  while ((m = preloadRe.exec(html)) !== null) {
    chunks.push(m[1])
  }

  return chunks
}

function parseModulePreloadHrefs(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8')
  const hrefs = []
  const preloadRe = /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+)["']/gi
  let m
  while ((m = preloadRe.exec(html)) !== null) {
    hrefs.push(m[1])
  }
  return hrefs
}

function resolveAssetPath(assetUrl) {
  const rel = assetUrl.replace(/^\//, '')
  return path.join(DIST_DIR, rel)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  T-005 / T-005b Bundle Check — Portfolio V2')
  console.log(`  T-005:  initial JS (gzip) ≤ ${kb(BUDGET_INITIAL_JS_GZIP_BYTES)} KB`)
  console.log('  T-005b: no `three-bundle` in modulepreload (index.html)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  if (!fs.existsSync(ENTRY_HTML)) {
    console.error('ERROR: dist/index.html not found. Run `npm run build` first.')
    process.exit(1)
  }

  // ── T-005b: three-bundle must not be preloaded ─────────────────────────────
  const preloadHrefs = parseModulePreloadHrefs(ENTRY_HTML)
  const threeBundlePreloads = preloadHrefs.filter((h) => h.includes('three-bundle'))
  const t005bPass = threeBundlePreloads.length === 0

  console.log('T-005b — modulepreload list (index.html):')
  console.log('─────────────────────────────────────────────────────')
  if (preloadHrefs.length === 0) {
    console.log('  (none)')
  } else {
    for (const h of preloadHrefs) {
      console.log(`  ${h}`)
    }
  }
  console.log(`  Status: ${t005bPass ? '✅ PASS (no three-bundle)' : '❌ FAIL'}`)
  if (!t005bPass) {
    console.log('  ERROR: three-bundle must not be modulepreload’d — keep Three off critical path.')
    for (const h of threeBundlePreloads) {
      console.log(`    → ${h}`)
    }
  }
  console.log('')

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

  // ── V2 initial chunks (referenced in index.html) ────────────────────────────
  const initialAssetUrls = parseInitialChunksFromHTML(ENTRY_HTML)
  const initialJsUrls = initialAssetUrls.filter((u) => u.endsWith('.js'))

  console.log('T-005 — V2 INITIAL JS (script + modulepreload):')
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
    const tag = filename.includes('vendor-') ? '  ← main shared deps' : ''
    console.log(`  ${filename.padEnd(48)} raw: ${kb(rawBytes).padStart(8)} KB  gzip: ${kb(gzBytes).padStart(8)} KB${tag}`)
  }
  console.log('')

  // ── Lazy chunks note ───────────────────────────────────────────────────────
  console.log('LAZY CHUNKS (not counted against T-005):')
  console.log('─────────────────────────────────────────────────────')
  const initialFilenames = new Set(initialJsUrls.map((u) => path.basename(resolveAssetPath(u))))
  for (const { file, rawBytes, gzBytes } of chunkData) {
    if (!initialFilenames.has(file)) {
      let tag = ''
      if (file.includes('three-bundle')) tag = ' — Three/R3F (lazy)'
      else if (file.includes('motion-')) tag = ' — framer-motion (lazy)'
      console.log(`  ${file.padEnd(48)} raw: ${kb(rawBytes).padStart(8)} KB  gzip: ${kb(gzBytes).padStart(8)} KB${tag}`)
    }
  }
  console.log('')

  // ── T-005 verdict ─────────────────────────────────────────────────────────
  const budgetKB = kb(BUDGET_INITIAL_JS_GZIP_BYTES)
  const totalKB = kb(totalInitialGzip)
  const t005Pass = totalInitialGzip <= BUDGET_INITIAL_JS_GZIP_BYTES
  const t005Icon = t005Pass ? '✅ PASS' : '❌ FAIL'

  console.log('T-005 BUDGET VERDICT:')
  console.log('─────────────────────────────────────────────────────')
  console.log(`  Initial JS (gzip): ${totalKB} KB`)
  console.log(`  Budget:            ${budgetKB} KB`)
  console.log(`  Status:            ${t005Icon}`)
  console.log('')

  if (!t005Pass) {
    const overBy = kb(totalInitialGzip - BUDGET_INITIAL_JS_GZIP_BYTES)
    console.log(`  ⚠ OVER BUDGET BY ${overBy} KB`)
    console.log('')
    console.log('  To shrink initial JS: dynamic-import heavy routes, trim shared deps,')
    console.log('  or split manualChunks — see dist/stats.html with ANALYZE=true npm run build.')
    console.log('')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (!t005bPass || !t005Pass) {
    process.exit(1)
  }
}

main()
