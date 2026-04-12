import { useState, useRef, useEffect } from 'react'
import type { RoadmapNode, LessonNode, Block } from '../modules/data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react'

function VisBlock({ html, caption }: { html: string; caption?: string }) {
  return (
    <div className="flex flex-col gap-2 my-2">
      <iframe
        srcDoc={html}
        className="w-full rounded-lg border border-border bg-background"
        style={{ height: 280 }}
        sandbox="allow-scripts"
      />
      {caption && (
        <p className="text-xs text-muted-foreground text-center">{caption}</p>
      )}
    </div>
  )
}

function ContentBlock({ block, getVis, nodeId }: {
  block: Block
  getVis: (nodeId: string, file: string) => string | null
  nodeId: string
}) {
  if (block.type === 'text') {
    return (
      <p className="text-[15px] leading-[1.85] text-slate-300 whitespace-pre-line">
        {block.content}
      </p>
    )
  }
  if (block.type === 'vis') {
    const html = getVis(nodeId, block.file)
    if (!html) return null
    return <VisBlock html={html} caption={block.caption} />
  }
  return null
}

function Section({ node, depth, id, getVis, nodeId }: {
  node: LessonNode; depth: number; id: string
  getVis: (nodeId: string, file: string) => string | null; nodeId: string
}) {
  return (
    <div id={id} className={cn(depth === 0 ? 'pt-2' : 'pt-10')}>
      {depth === 0 && (
        <h2 className="text-2xl font-bold tracking-tight mb-6 border-b border-border pb-3 text-primary">
          {node.title}
        </h2>
      )}
      {depth === 1 && (
        <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          {node.title}
        </h3>
      )}
      {depth >= 2 && (
        <h4 className="text-sm font-semibold text-primary mb-2">
          {node.title}
        </h4>
      )}
      {node.blocks.length > 0 && (
        <div className="flex flex-col gap-4">
          {node.blocks.map((block, i) => (
            <ContentBlock key={i} block={block} getVis={getVis} nodeId={nodeId} />
          ))}
        </div>
      )}
      {(node.children ?? []).map((child, i) => (
        <Section key={i} node={child} depth={depth + 1} id={`${id}-${i}`} getVis={getVis} nodeId={nodeId} />
      ))}
    </div>
  )
}

function SidebarItem({ node, depth, id, activeId, onSelect }: {
  node: LessonNode; depth: number; id: string; activeId: string; onSelect: (id: string) => void
}) {
  const isActive = activeId === id
  const hasChildren = (node.children ?? []).length > 0
  const [open, setOpen] = useState(true)

  return (
    <div>
      <div
        onClick={() => onSelect(id)}
        className={cn(
          'flex items-center gap-1.5 py-1.5 pr-3 cursor-pointer rounded-r-md border-r-2 transition-colors',
          isActive
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground',
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren ? (
          <span
            onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            {open
              ? <ChevronDown className="w-3 h-3" />
              : <ChevronRight className="w-3 h-3" />
            }
          </span>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className={cn(
          'text-xs leading-snug',
          depth === 0 && 'font-medium',
          depth !== 0 && 'font-normal opacity-90',
          isActive && 'text-primary',
        )}>
          {node.title}
        </span>
      </div>
      {hasChildren && open && (node.children ?? []).map((child, i) => (
        <SidebarItem key={i} node={child} depth={depth + 1} id={`${id}-${i}`} activeId={activeId} onSelect={onSelect} />
      ))}
    </div>
  )
}

export interface LessonViewProps {
  roadmapNode: RoadmapNode
  lessonNodes: LessonNode[]
  getVis: (nodeId: string, file: string) => string | null
  onBack: () => void
}

function flattenIds(nodes: LessonNode[], prefix = 's'): string[] {
  return nodes.flatMap((node, i) => {
    const id = `${prefix}${i}`
    return [id, ...flattenIds(node.children ?? [], `${id}-`)]
  })
}

export function LessonView({ roadmapNode, lessonNodes, getVis, onBack }: LessonViewProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState('s0')
  const isScrollingToRef = useRef(false)

  useEffect(() => { setActiveId('s0') }, [roadmapNode.id])

  useEffect(() => {
    const container = contentRef.current
    if (!container) return
    const ids = flattenIds(lessonNodes)

    function onScroll() {
      if (isScrollingToRef.current) return
      const c = container!
      if (c.scrollHeight - c.scrollTop - c.clientHeight < 5) {
        setActiveId(ids[ids.length - 1])
        return
      }
      const containerTop = c.getBoundingClientRect().top
      const threshold = containerTop + 80
      let best = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= threshold) best = id
      }
      setActiveId(best)
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [lessonNodes])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    const container = contentRef.current
    if (!el || !container) return
    isScrollingToRef.current = true
    container.scrollTop = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 24
    setTimeout(() => { isScrollingToRef.current = false }, 100)
  }

  function handleSelect(id: string) { setActiveId(id); scrollTo(id) }

  if (lessonNodes.length === 0) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No content yet for {roadmapNode.label}.</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 h-12 border-b border-border shrink-0 bg-card/50">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground -ml-1">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back
        </Button>
        <div className="w-px h-4 bg-border" />
        <h1 className="text-sm font-semibold text-foreground">{roadmapNode.label}</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 border-r border-border overflow-y-auto py-3 shrink-0 bg-card">
          {lessonNodes.map((node, i) => (
            <SidebarItem key={i} node={node} depth={0} id={`s${i}`} activeId={activeId} onSelect={handleSelect} />
          ))}
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="px-14 py-10">
            <div className="flex flex-col gap-10">
              {lessonNodes.map((node, i) => (
                <Section key={i} node={node} depth={0} id={`s${i}`} getVis={getVis} nodeId={roadmapNode.id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
