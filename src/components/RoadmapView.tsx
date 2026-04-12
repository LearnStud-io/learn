import { useRef, useState, useCallback, useEffect } from 'react'
import dagre from 'dagre'
import type { RoadmapNode, RoadmapEdge } from '../modules/data'
import { deriveEdges } from '../modules/data'
import { colors, font } from '../modules/theme'

const STORAGE_KEY_PREFIX = 'roadmap-transform'

const NODE_W = 220
const RANK_SEP = 90
const NODE_SEP = 64
const START_LABEL_H = 28
const DESC_LINE_H = 13
const DESC_MAX_CHARS = 30
const NODE_BASE_H = 62  // fits label + 1 desc line

function wrapText(text: string, maxChars: number): string[] {
  if (!text) return []
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (!current) { current = word }
    else if (current.length + 1 + word.length <= maxChars) { current += ' ' + word }
    else { lines.push(current); current = word }
  }
  if (current) lines.push(current)
  return lines
}

function nodeHeight(description: string): number {
  const lines = wrapText(description, DESC_MAX_CHARS)
  return NODE_BASE_H + Math.max(0, lines.length - 1) * DESC_LINE_H
}

interface LayoutNode extends RoadmapNode {
  x: number
  y: number
  h: number
}

function computeLayout(nodes: RoadmapNode[], edges: RoadmapEdge[]) {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', nodesep: NODE_SEP, ranksep: RANK_SEP, marginx: 40, marginy: 40 })
  g.setDefaultEdgeLabel(() => ({}))
  nodes.forEach(n => { const h = nodeHeight(n.description); g.setNode(n.id, { width: NODE_W, height: h }) })
  edges.forEach(e => g.setEdge(e.from, e.to))
  dagre.layout(g)
  const layoutNodes: LayoutNode[] = nodes.map(n => {
    const { x, y } = g.node(n.id)
    const h = nodeHeight(n.description)
    return { ...n, x: x - NODE_W / 2, y: y - h / 2, h }
  })
  const graph = g.graph()
  return { layoutNodes, graphW: graph.width ?? 0, graphH: graph.height ?? 0 }
}

function RoadmapEdges({ layoutNodes, edges }: { layoutNodes: LayoutNode[]; edges: RoadmapEdge[] }) {
  const posMap = Object.fromEntries(layoutNodes.map(n => [n.id, { x: n.x + NODE_W / 2, y: n.y + n.h / 2, h: n.h }]))
  return (
    <>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={colors.arrow} opacity={0.8} />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {edges.map(edge => {
        const f = posMap[edge.from]
        const t = posMap[edge.to]
        if (!f || !t) return null
        const dx = t.x - f.x, dy = t.y - f.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const ux = dx / len, uy = dy / len
        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={f.x + ux * (f.h / 2)} y1={f.y + uy * (f.h / 2)}
            x2={t.x - ux * (t.h / 2 + 6)} y2={t.y - uy * (t.h / 2 + 6)}
            stroke={colors.edge} strokeWidth={1.5} markerEnd="url(#arrow)"
            opacity={0.7}
          />
        )
      })}
    </>
  )
}

function RoadmapNodeCard({ node, onClick }: { node: LayoutNode; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const clipId = `clip-${node.id}`
  const filterId = `shadow-${node.id}`
  const borderColor = hovered ? colors.borderActive : colors.border
  const bgColor = hovered ? colors.surfaceHover : colors.surface
  const descLines = wrapText(node.description, DESC_MAX_CHARS)

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <defs>
        <clipPath id={clipId}><rect width={NODE_W} height={node.h} rx={10} /></clipPath>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation={hovered ? '6' : '2'}
            floodColor={hovered ? colors.accent : '#000'} floodOpacity={hovered ? '0.3' : '0.4'} />
        </filter>
      </defs>
      <rect
        width={NODE_W} height={node.h} rx={10}
        fill={bgColor}
        stroke={borderColor} strokeWidth={hovered ? 1.5 : 1}
        filter={`url(#${filterId})`}
        style={{ transition: 'all 0.15s ease' }}
      />
      <g clipPath={`url(#${clipId})`}>
        {hovered && (
          <rect width={NODE_W} height={2} rx={0} fill={colors.accent} opacity={0.8} />
        )}
        <text x={NODE_W / 2} y={28} textAnchor="middle"
          fill={hovered ? colors.accentHover : colors.textPrimary}
          fontSize={13} fontWeight={600} fontFamily={font}>
          {node.label}
        </text>
        <text x={NODE_W / 2} y={44} textAnchor="middle"
          fill={colors.textSecondary} fontSize={10} fontFamily={font}>
          {descLines.map((line, i) => (
            <tspan key={i} x={NODE_W / 2} dy={i === 0 ? 0 : DESC_LINE_H}>{line}</tspan>
          ))}
        </text>
      </g>
    </g>
  )
}

export interface RoadmapViewProps {
  nodes: RoadmapNode[]
  onNodeClick: (nodeId: string) => void
  header?: React.ReactNode
  storageKey?: string
}

export function RoadmapView({ nodes, onNodeClick, header, storageKey }: RoadmapViewProps) {
  const key = storageKey ?? STORAGE_KEY_PREFIX
  const edges = deriveEdges(nodes)
  const { layoutNodes, graphW, graphH } = computeLayout(nodes, edges)

  const svgRef = useRef<SVGSVGElement>(null)
  const [pan, setPan] = useState<{ x: number; y: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const transformRef = useRef({ pan: { x: 0, y: 0 }, zoom: 1 })
  const dragging = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const pinch = useRef<{ dist: number; midX: number; midY: number; originZoom: number; originPan: { x: number; y: number } } | null>(null)

  const applyTransform = useCallback((newPan: { x: number; y: number }, newZoom: number) => {
    transformRef.current = { pan: newPan, zoom: newZoom }
    setPan(newPan)
    setZoom(newZoom)
  }, [])

  useEffect(() => {
    if (!svgRef.current) return
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const { pan, zoom } = JSON.parse(saved)
        applyTransform(pan, zoom)
        return
      } catch {}
    }
    const { width, height } = svgRef.current.getBoundingClientRect()
    applyTransform({ x: (width - graphW) / 2, y: (height - graphH - START_LABEL_H) / 2 }, 1)
  }, [graphW, graphH, applyTransform, key])

  useEffect(() => {
    if (pan === null) return
    localStorage.setItem(key, JSON.stringify({ pan, zoom }))
  }, [pan, zoom, key])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const { pan: p } = transformRef.current
    dragging.current = { startX: e.clientX, startY: e.clientY, originX: p.x, originY: p.y }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    const newPan = { x: dragging.current.originX + e.clientX - dragging.current.startX, y: dragging.current.originY + e.clientY - dragging.current.startY }
    transformRef.current.pan = newPan
    setPan(newPan)
  }, [])

  const onMouseUp = useCallback(() => { dragging.current = null }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const { pan: p, zoom: z } = transformRef.current
    const factor = e.deltaY < 0 ? 1.04 : 0.96
    const newZoom = Math.min(3, Math.max(0.2, z * factor))
    const rect = svgRef.current!.getBoundingClientRect()
    applyTransform({ x: e.clientX - rect.left - (e.clientX - rect.left - p.x) * (newZoom / z), y: e.clientY - rect.top - (e.clientY - rect.top - p.y) * (newZoom / z) }, newZoom)
  }, [applyTransform])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0]
      const { pan: p } = transformRef.current
      dragging.current = { startX: t.clientX, startY: t.clientY, originX: p.x, originY: p.y }
      pinch.current = null
    } else if (e.touches.length === 2) {
      dragging.current = null
      const [a, b] = [e.touches[0], e.touches[1]]
      const { pan: p, zoom: z } = transformRef.current
      pinch.current = { dist: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY), midX: (a.clientX + b.clientX) / 2, midY: (a.clientY + b.clientY) / 2, originZoom: z, originPan: { ...p } }
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1 && dragging.current) {
      const t = e.touches[0]
      const newPan = { x: dragging.current.originX + t.clientX - dragging.current.startX, y: dragging.current.originY + t.clientY - dragging.current.startY }
      transformRef.current.pan = newPan
      setPan(newPan)
    } else if (e.touches.length === 2 && pinch.current) {
      const [a, b] = [e.touches[0], e.touches[1]]
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const { midX, midY, originZoom, originPan } = pinch.current
      const newZoom = Math.min(3, Math.max(0.2, originZoom * (dist / pinch.current.dist)))
      const ratio = newZoom / originZoom
      applyTransform({ x: midX - (midX - originPan.x) * ratio, y: midY - (midY - originPan.y) * ratio }, newZoom)
    }
  }, [applyTransform])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) { dragging.current = null; pinch.current = null }
    else if (e.touches.length === 1) {
      pinch.current = null
      const t = e.touches[0]
      const { pan: p } = transformRef.current
      dragging.current = { startX: t.clientX, startY: t.clientY, originX: p.x, originY: p.y }
    }
  }, [])

  const rootNodes = layoutNodes.filter(n => n.dependsOn.length === 0)
  const startLabelX = rootNodes.length ? rootNodes.reduce((sum, n) => sum + n.x + NODE_W / 2, 0) / rootNodes.length : graphW / 2
  const { x: panX, y: panY } = pan ?? { x: 0, y: 0 }

  return (
    <div style={{ height: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {header}
      <svg
        ref={svgRef}
        style={{ flex: 1, display: 'block', touchAction: 'none', cursor: 'grab' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >
        <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
          <text x={startLabelX} y={-10} textAnchor="middle"
            fill={colors.start} fontSize={9} fontWeight={700} fontFamily={font} letterSpacing={2.5}>
            START
          </text>
          <RoadmapEdges layoutNodes={layoutNodes} edges={edges} />
          {layoutNodes.map(node => (
            <RoadmapNodeCard key={node.id} node={node} onClick={() => onNodeClick(node.id)} />
          ))}
        </g>
      </svg>
    </div>
  )
}
