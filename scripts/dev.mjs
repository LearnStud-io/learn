// Wrapper around `vite dev`.
// Ensures playwright chromium is installed for everyone (screenshot-vis works for all).

import { execSync, spawn } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── playwright chromium — everyone needs this for screenshot-vis ──────────────
const browsersPath = resolve(__dirname, '../node_modules/playwright/.local-browsers')
const chromiumMissing = !existsSync(browsersPath) ||
  execSync(`ls "${browsersPath}" 2>/dev/null || echo ""`)
    .toString().trim().split('\n')
    .every(d => !d.startsWith('chromium'))

if (chromiumMissing) {
  console.log('[setup] installing playwright chromium browser...')
  execSync('npx playwright install chromium', { stdio: 'inherit' })
  console.log('[setup] playwright chromium ready.')
}

// Start vite dev — pass through any extra args
const vite = spawn('npx', ['vite', 'dev', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
})

vite.on('exit', code => process.exit(code ?? 0))
