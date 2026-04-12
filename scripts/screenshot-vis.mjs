// Takes a screenshot of a vis HTML file using a headless browser.
// npm run dev installs playwright chromium automatically on first run.
//
// Usage:
//   node scripts/screenshot-vis.mjs <node-id> <vis-filename>
//   node scripts/screenshot-vis.mjs math-to-nn dot-product.html

import { chromium } from 'playwright'
import { createServer } from 'http'
import { readFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname, extname, basename } from 'path'
import { fileURLToPath } from 'url'

import { config } from 'dotenv'
config()

const [nodeId, visFile] = process.argv.slice(2)
if (!nodeId || !visFile) {
  console.error('Usage: node scripts/screenshot-vis.mjs <node-id> <vis-filename>')
  process.exit(1)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const visDir    = resolve(__dirname, `../src/modules/data/lessons/${nodeId}/vis`)
const visPath   = resolve(visDir, visFile)

if (!existsSync(visPath)) {
  console.error(`File not found: ${visPath}`)
  process.exit(1)
}

const screenshotDir  = resolve(visDir, '.screenshots')
mkdirSync(screenshotDir, { recursive: true })
const screenshotPath = resolve(screenshotDir, `${basename(visFile, '.html')}.png`)

// ── local file server (avoids CDN CORS issues with file://) ───────────────────
const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' }

const server = createServer((req, res) => {
  const filePath = resolve(visDir, req.url.slice(1) || visFile)
  try {
    const content = readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] ?? 'text/plain' })
    res.end(content)
  } catch {
    res.writeHead(404)
    res.end('not found')
  }
})

await new Promise(r => server.listen(0, r))
const { port } = server.address()

// ── screenshot ────────────────────────────────────────────────────────────────
const browser = await chromium.launch()
const page    = await browser.newPage()

await page.setViewportSize({ width: 400, height: 280 })
await page.goto(`http://localhost:${port}/${visFile}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)   // let p5/three animations settle
await page.screenshot({ path: screenshotPath })

await browser.close()
server.close()

console.log(`screenshot saved → ${screenshotPath}`)
