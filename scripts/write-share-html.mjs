/**
 * After `vite build`, writes dist/share/index.html — same shell as the homepage but with
 * og:url (and twitter:url) pointing at /share/. LinkedIn often caches link previews by URL;
 * the composer can lag behind Post Inspector for the root URL, while /share/ is a separate key.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const distIndex = path.join(root, 'dist', 'index.html')
const shareDir = path.join(root, 'dist', 'share')
const shareIndex = path.join(shareDir, 'index.html')

const SHARE_URL = 'https://www.jonathancuntodiaz.com/share/'

if (!fs.existsSync(distIndex)) {
  console.error('write-share-html: dist/index.html missing — run vite build first')
  process.exit(1)
}

let html = fs.readFileSync(distIndex, 'utf8')

html = html.replace(
  /<meta property="og:url" content="[^"]*" \/>/,
  `<meta property="og:url" content="${SHARE_URL}" />`,
)

if (!html.includes(`content="${SHARE_URL}"`)) {
  console.error('write-share-html: failed to patch og:url')
  process.exit(1)
}

const twitterUrlMeta =
  '    <meta name="twitter:url" content="' +
  SHARE_URL +
  '" />\n' +
  '    <!-- Twitter Card -->'

if (!html.includes('name="twitter:url"')) {
  html = html.replace('    <!-- Twitter Card -->', twitterUrlMeta)
}

fs.mkdirSync(shareDir, { recursive: true })
fs.writeFileSync(shareIndex, html, 'utf8')
console.log('write-share-html: wrote', path.relative(root, shareIndex))
