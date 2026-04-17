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
const LABEL_LINE_H = 16
const LABEL_MAX_CHARS = 26
const DESC_LINE_H = 13
const DESC_MAX_CHARS = 30
const NODE_BASE_H = 62

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

function nodeHeight(label: string, description: string): number {
  const labelLines = wrapText(label, LABEL_MAX_CHARS)
  const descLines = wrapText(description, DESC_MAX_CHARS)
  return NODE_BASE_H +
    Math.max(0, labelLines.length - 1) * LABEL_LINE_H +
    Math.max(0, descLines.length - 1) * DESC_LINE_H
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
  nodes.forEach(n => { const h = nodeHeight(n.label, n.description); g.setNode(n.id, { width: NODE_W, height: h }) })
  edges.forEach(e => g.setEdge(e.from, e.to))
  dagre.layout(g)
  const layoutNodes: LayoutNode[] = nodes.map(n => {
    const { x, y } = g.node(n.id)
    const h = nodeHeight(n.label, n.description)
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
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0.5 L0,5.5 L5.5,3 z" fill={colors.arrow} />
        </marker>
      </defs>
      {edges.map(edge => {
        const f = posMap[edge.from]
        const t = posMap[edge.to]
        if (!f || !t) return null
        const x1 = f.x, y1 = f.y + f.h / 2
        const x2 = t.x, y2 = t.y - t.h / 2 - 6
        const midY = (y1 + y2) / 2
        return (
          <path
            key={`${edge.from}-${edge.to}`}
            d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
            fill="none"
            stroke={colors.edge} strokeWidth={1.5} markerEnd="url(#arrow)"
          />
        )
      })}
    </>
  )
}

const GREEN = '#22c55e'
const GREEN_DIM = '#166534'

function RoadmapNodeCard({
  node, onClick, completed, onToggleComplete,
}: {
  node: LayoutNode
  onClick: () => void
  completed: boolean
  onToggleComplete: (nodeId: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const clipId = `clip-${node.id}`
  const filterId = `shadow-${node.id}`
  const borderColor = completed ? GREEN_DIM : hovered ? colors.borderActive : colors.border
  const bgColor = hovered ? colors.surfaceHover : colors.surface
  const labelLines = wrapText(node.label, LABEL_MAX_CHARS)
  const descLines = wrapText(node.description, DESC_MAX_CHARS)
  const labelExtraH = Math.max(0, labelLines.length - 1) * LABEL_LINE_H
  const descY = 44 + labelExtraH

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <defs>
        <clipPath id={clipId}><rect width={NODE_W} height={node.h} rx={8} /></clipPath>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation={hovered ? '8' : '3'}
            floodColor={completed ? GREEN : hovered ? colors.accent : '#000'}
            floodOpacity={hovered ? '0.25' : '0.5'} />
        </filter>
      </defs>

      <rect
        width={NODE_W} height={node.h} rx={8}
        fill={bgColor}
        stroke={borderColor} strokeWidth={1}
        filter={`url(#${filterId})`}
      />

      <g clipPath={`url(#${clipId})`}>
        {/* Top accent bar — green when completed, blue on hover */}
        {(completed || hovered) && (
          <rect width={NODE_W} height={2} fill={completed ? GREEN : colors.accent} opacity={0.9} />
        )}

        {/* Label */}
        <text x={NODE_W / 2} y={28} textAnchor="middle"
          fill={hovered ? colors.accentHover : colors.textPrimary}
          fontSize={13} fontWeight={500} fontFamily={font}>
          {labelLines.map((line, i) => (
            <tspan key={i} x={NODE_W / 2} dy={i === 0 ? 0 : LABEL_LINE_H}>{line}</tspan>
          ))}
        </text>

        {/* Description */}
        <text x={NODE_W / 2} y={descY} textAnchor="middle"
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
  completedIds?: Set<string>
  onToggleComplete?: (nodeId: string) => void
  header?: React.ReactNode
  storageKey?: string
  containerStyle?: React.CSSProperties
}

export function RoadmapView({ nodes, onNodeClick, completedIds, onToggleComplete, header, storageKey, containerStyle }: RoadmapViewProps) {
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

  // START label in screen space — stays visible above root node even when panning
  const startScreenX = panX + startLabelX * zoom
  const startScreenY = Math.max(20, panY + (-10) * zoom)

  return (
    <div style={{ height: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden', ...containerStyle }}>
      {header}
      <svg
        ref={svgRef}
        style={{ flex: 1, display: 'block', touchAction: 'none', cursor: 'grab' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >
        <defs>
          <pattern id="dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="0.85" fill="#1e1e22" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />

        {/* START label — fixed in screen space above root node */}
        <text x={startScreenX} y={startScreenY} textAnchor="middle"
          fill={colors.start} fontSize={8} fontWeight={600} fontFamily={font} letterSpacing={2.5}
          pointerEvents="none">
          START
        </text>

        <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
          <RoadmapEdges layoutNodes={layoutNodes} edges={edges} />

          {layoutNodes.map(node => (
            <RoadmapNodeCard
              key={node.id}
              node={node}
              onClick={() => onNodeClick(node.id)}
              completed={completedIds?.has(node.id) ?? false}
              onToggleComplete={onToggleComplete ?? (() => {})}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
