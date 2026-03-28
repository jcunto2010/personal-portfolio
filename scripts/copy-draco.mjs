/**
 * Copia los binarios del decodificador Draco desde three a public/draco/ (mismo origen, CSP).
 */
import { cpSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const srcDir = join(root, 'node_modules/three/examples/jsm/libs/draco')
const destDir = join(root, 'public/draco')
const files = ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js']

mkdirSync(destDir, { recursive: true })
for (const f of files) {
  cpSync(join(srcDir, f), join(destDir, f))
}
console.log(`copy-draco: ${files.length} files -> ${destDir}`)
