#!/usr/bin/env node
/**
 * Syncs the latest learn template from GitHub without overwriting course content.
 * Preserves: src/modules/data/, .env, CLAUDE.md
 */
import { execSync } from 'child_process'
import { mkdtempSync, rmSync, readdirSync, cpSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

const REPO = 'git@github.com:LearnStud-io/learn.git'
const SKIP_TOP = new Set(['src', '.env', 'node_modules', '.git'])

const root = process.cwd()
const tmp = mkdtempSync(join(tmpdir(), 'learn-sync-'))

try {
  console.log('Cloning latest template...')
  execSync(`git clone --depth 1 ${REPO} "${tmp}/learn"`, { stdio: 'pipe' })

  const clone = join(tmp, 'learn')
  rmSync(join(clone, '.git'), { recursive: true, force: true })

  // 1. Copy top-level entries (skip src, .env, CLAUDE.md, node_modules, .git)
  for (const entry of readdirSync(clone)) {
    if (SKIP_TOP.has(entry)) continue
    rmSync(join(root, entry), { recursive: true, force: true })
    cpSync(join(clone, entry), join(root, entry), { recursive: true })
  }

  // 2. Copy src/ entries (skip modules)
  for (const entry of readdirSync(join(clone, 'src'))) {
    if (entry === 'modules') continue
    rmSync(join(root, 'src', entry), { recursive: true, force: true })
    cpSync(join(clone, 'src', entry), join(root, 'src', entry), { recursive: true })
  }

  // 3. Copy src/modules/ entries (skip data)
  const cloneModules = join(clone, 'src', 'modules')
  if (existsSync(cloneModules)) {
    for (const entry of readdirSync(cloneModules)) {
      if (entry === 'data') continue
      rmSync(join(root, 'src', 'modules', entry), { recursive: true, force: true })
      cpSync(join(cloneModules, entry), join(root, 'src', 'modules', entry), { recursive: true })
    }
  }

  console.log('✓ Synced latest template from GitHub')
  console.log('  Preserved: src/modules/data/, .env, CLAUDE.md')
  console.log('  Run "npm install" if dependencies changed.')
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
