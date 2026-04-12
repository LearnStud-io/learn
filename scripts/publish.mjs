#!/usr/bin/env node
/**
 * Publishes the course to LearnStudio platform.
 * Reads LEARNSTUDIO_API_KEY and LEARNSTUDIO_COURSE_ID from .env
 * Writes LEARNSTUDIO_COURSE_ID back to .env after first publish.
 *
 * Sends a diff-ready payload — the platform only writes what changed.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DATA = join(ROOT, 'src', 'modules', 'data')
const ENV_PATH = join(ROOT, '.env')
const PLATFORM_URL = process.env.LEARNSTUDIO_PLATFORM_URL ?? 'http://localhost:3001'

// ── .env helpers ──────────────────────────────────────────────────────────────

function readEnv() {
  if (!existsSync(ENV_PATH)) return {}
  const lines = readFileSync(ENV_PATH, 'utf8').split('\n')
  return Object.fromEntries(
    lines
      .filter(l => l.includes('=') && !l.startsWith('#'))
      .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
  )
}

function writeEnvKey(key, value) {
  let content = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : ''
  const regex = new RegExp(`^${key}=.*$`, 'm')
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`)
  } else {
    content = content.trimEnd() + `\n${key}=${value}\n`
  }
  writeFileSync(ENV_PATH, content)
}

// ── Flatten lesson tree into sections + blocks ────────────────────────────────

function flattenSections(nodes, nodeId, parentSlug = null, out = { sections: [], blocks: [] }) {
  nodes.forEach((node, i) => {
    if (!node.slug) {
      console.error(`Error: lesson node "${node.title}" in ${nodeId} is missing a "slug" field.`)
      process.exit(1)
    }

    out.sections.push({
      nodeId,
      slug: node.slug,
      parentSlug,
      title: node.title,
      position: i,
    })

    ;(node.blocks ?? []).forEach((block, j) => {
      out.blocks.push({
        nodeId,
        sectionSlug: node.slug,
        type: block.type,
        content: block.type === 'text' ? block.content : undefined,
        file: block.type === 'vis' ? block.file : undefined,
        caption: block.caption ?? undefined,
        position: j,
      })
    })

    if (node.children?.length) {
      flattenSections(node.children, nodeId, node.slug, out)
    }
  })
  return out
}

// ── Load course data ──────────────────────────────────────────────────────────

function loadCourse() {
  const metadata = JSON.parse(readFileSync(join(DATA, 'metadata.json'), 'utf8'))
  const roadmap = JSON.parse(readFileSync(join(DATA, 'roadmap.json'), 'utf8'))

  const sections = []
  const blocks = []
  const visFiles = []

  const lessonsDir = join(DATA, 'lessons')
  if (existsSync(lessonsDir)) {
    for (const nodeId of readdirSync(lessonsDir)) {
      const lessonPath = join(lessonsDir, nodeId, 'lesson.json')
      if (existsSync(lessonPath)) {
        const lesson = JSON.parse(readFileSync(lessonPath, 'utf8'))
        const flat = flattenSections(lesson.nodes ?? [], nodeId)
        sections.push(...flat.sections)
        blocks.push(...flat.blocks)
      }

      const visDir = join(lessonsDir, nodeId, 'vis')
      if (existsSync(visDir)) {
        for (const file of readdirSync(visDir).filter(f => f.endsWith('.html'))) {
          const content = readFileSync(join(visDir, file), 'utf8')
          visFiles.push({ nodeId, filename: `vis/${file}`, content })
        }
      }
    }
  }

  return {
    title: metadata.title,
    subtitle: metadata.subtitle,
    version: metadata.version,
    nodes: roadmap.nodes,
    sections,
    blocks,
    visFiles,
  }
}

// ── Publish ───────────────────────────────────────────────────────────────────

async function main() {
  const env = readEnv()
  const apiKey = env.LEARNSTUDIO_API_KEY ?? process.env.LEARNSTUDIO_API_KEY
  if (!apiKey) {
    console.error('Error: LEARNSTUDIO_API_KEY not set in .env')
    process.exit(1)
  }

  const courseId = env.LEARNSTUDIO_COURSE_ID ?? process.env.LEARNSTUDIO_COURSE_ID
  const payload = loadCourse()

  console.log(`Sections: ${payload.sections.length}  Blocks: ${payload.blocks.length}  Vis: ${payload.visFiles.length}`)

  let url = courseId ? `${PLATFORM_URL}/api/publish/${courseId}` : `${PLATFORM_URL}/api/publish`
  let method = courseId ? 'PUT' : 'POST'

  console.log(courseId ? `Updating course ${courseId}…` : 'Publishing new course…')

  let res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify(payload),
  })

  // If course no longer exists on platform, publish as new
  if (res.status === 404 && courseId) {
    console.log('Course not found on platform, publishing as new…')
    writeEnvKey('LEARNSTUDIO_COURSE_ID', '')
    url = `${PLATFORM_URL}/api/publish`
    method = 'POST'
    res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(payload),
    })
  }

  if (!res.ok) {
    const text = await res.text()
    console.error(`Publish failed (${res.status}): ${text}`)
    process.exit(1)
  }

  const data = await res.json()
  if (!courseId || method === 'POST') {
    writeEnvKey('LEARNSTUDIO_COURSE_ID', data.courseId)
    console.log(`Published! Course ID: ${data.courseId} (saved to .env)`)
  } else {
    console.log(`Updated! Course ID: ${data.courseId}`)
  }
}

main()
