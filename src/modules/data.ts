// Central data layer — types + local loaders.
// Route loaders and components both import from here.

// ── types ─────────────────────────────────────────────────────────────────────

export interface RoadmapNode {
  id: string
  label: string
  description: string
  dependsOn: string[]
}

export interface RoadmapEdge {
  from: string
  to: string
}

export type Block =
  | { type: 'text'; content: string }
  | { type: 'vis'; file: string; caption?: string; prompt?: string; height?: number }

export interface LessonNode {
  slug: string
  title: string
  blocks: Block[]
  children?: LessonNode[]
}

export interface Metadata {
  title: string
  subtitle: string
  version: string
}

// ── local loaders (file-based, for creator / dev mode) ────────────────────────

const roadmapModules = import.meta.glob<{ default: { nodes: RoadmapNode[] } }>(
  './data/roadmap.json',
  { eager: true },
)

const metadataModules = import.meta.glob<{ default: Metadata }>(
  './data/metadata.json',
  { eager: true },
)

const lessonModules = import.meta.glob<{ default: { nodes: LessonNode[] } }>(
  './data/lessons/*/lesson.json',
  { eager: true },
)

const visModules = import.meta.glob<{ default: string }>(
  './data/lessons/*/vis/*.html',
  { eager: true, query: '?raw' },
)

export function loadRoadmap(): { nodes: RoadmapNode[]; edges: RoadmapEdge[] } {
  const mod = roadmapModules['./data/roadmap.json']
  const nodes = mod?.default?.nodes ?? []
  return { nodes, edges: deriveEdges(nodes) }
}

export function loadLesson(nodeId: string): LessonNode[] {
  const key = `./data/lessons/${nodeId}/lesson.json`
  return lessonModules[key]?.default?.nodes ?? []
}

export function loadVis(nodeId: string, file: string): string | null {
  const key = `./data/lessons/${nodeId}/${file}`
  return visModules[key]?.default ?? null
}

export const metadata: Metadata =
  metadataModules['./data/metadata.json']?.default ?? {
    title: 'Waymark',
    subtitle: '',
    version: '0.1.0',
  }

// ── helpers ───────────────────────────────────────────────────────────────────

export function deriveEdges(nodes: RoadmapNode[]): RoadmapEdge[] {
  return nodes.flatMap((n) =>
    n.dependsOn.map((dep) => ({ from: dep, to: n.id })),
  )
}

export function flattenLesson(nodes: LessonNode[]): LessonNode[] {
  return nodes.flatMap((n) => [n, ...flattenLesson(n.children ?? [])])
}
