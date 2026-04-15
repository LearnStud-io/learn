import { useState, useRef, useEffect } from 'react'
import type { RoadmapNode, LessonNode, Block } from '../modules/data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// ── Text rendering: math + inline code ───────────────────────────────────────

function renderTextContent(text: string): string {
  const segments = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|`[^`\n]+`)/g)
  return segments.map(seg => {
    if (seg.startsWith('$$') && seg.endsWith('$$'))
      return katex.renderToString(seg.slice(2, -2), { displayMode: true, throwOnError: false })
    if (seg.startsWith('$') && seg.endsWith('$'))
      return katex.renderToString(seg.slice(1, -1), { displayMode: false, throwOnError: false })
    if (seg.startsWith('`') && seg.endsWith('`')) {
      const code = seg.slice(1, -1).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `<code class="inline-code">${code}</code>`
    }
    return seg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }).join('')
}

// ── Fenced code block parser ──────────────────────────────────────────────────

interface Segment { type: 'text' | 'code'; content: string; lang?: string }

function parseSegments(text: string): Segment[] {
  const out: Segment[] = []
  const re = /```(\w*)\n?([\s\S]*?)```/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const before = text.slice(last, m.index).trim()
    if (before) out.push({ type: 'text', content: before })
    out.push({ type: 'code', content: m[2].trimEnd(), lang: m[1] || undefined })
    last = m.index + m[0].length
  }
  const rest = text.slice(last).trim()
  if (rest) out.push({ type: 'text', content: rest })
  return out
}

// ── Components ────────────────────────────────────────────────────────────────

function CodeBlock({ content, lang }: { content: string; lang?: string }) {
  return (
    <div className="relative my-1 rounded-lg overflow-hidden border border-border/50">
      {lang && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-border/50">
          <span className="text-[11px] text-muted-foreground/60 font-mono">{lang}</span>
        </div>
      )}
      <pre className="bg-[#0d1117] px-5 py-4 overflow-x-auto m-0">
        <code className="text-[13px] leading-[1.75] text-[#e6edf3] font-mono whitespace-pre">
          {content}
        </code>
      </pre>
    </div>
  )
}

function VisBlock({ html, caption, height = 280 }: { html: string; caption?: string; height?: number }) {
  return (
    <div className="flex flex-col gap-2 my-1">
      <iframe
        srcDoc={html}
        className="w-full rounded-lg border border-border/70 bg-background overflow-hidden"
        style={{ height }}
        sandbox="allow-scripts"
      />
      {caption && (
        <p className="text-xs text-muted-foreground/70 text-center italic px-4">{caption}</p>
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
    const segments = parseSegments(block.content)
    return (
      <div className="flex flex-col gap-3">
        {segments.map((seg, i) =>
          seg.type === 'code'
            ? <CodeBlock key={i} content={seg.content} lang={seg.lang} />
            : (
              <div
                key={i}
                className="text-[15px] leading-[1.85] text-foreground/72 whitespace-pre-line [&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.inline-code]:bg-[#161b22] [&_.inline-code]:text-[#e6edf3] [&_.inline-code]:px-1.5 [&_.inline-code]:py-0.5 [&_.inline-code]:rounded [&_.inline-code]:text-[13px] [&_.inline-code]:font-mono [&_.inline-code]:border [&_.inline-code]:border-border/40"
                dangerouslySetInnerHTML={{ __html: renderTextContent(seg.content) }}
              />
            )
        )}
      </div>
    )
  }
  if (block.type === 'vis') {
    const html = getVis(nodeId, block.file)
    if (!html) return null
    return <VisBlock html={html} caption={block.caption} height={block.height} />
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
        <div className="mb-7 pb-5 border-b border-border/50">
          <h2 className="text-[19px] font-semibold tracking-tight text-foreground leading-snug">
            {node.title}
          </h2>
        </div>
      )}
      {depth === 1 && (
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4">
          {node.title}
        </h3>
      )}
      {depth >= 2 && (
        <h4 className="text-[13px] font-medium text-foreground/80 mb-2">
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
          'flex items-center gap-1.5 py-[7px] pr-3 cursor-pointer border-r-2 transition-colors duration-100',
          isActive
            ? 'border-primary bg-primary/[0.07] text-foreground/90'
            : 'border-transparent hover:bg-white/[0.035] text-muted-foreground hover:text-foreground/70',
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren ? (
          <span
            onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
            className="shrink-0 opacity-40 hover:opacity-70"
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
          'text-[12px] leading-snug',
          depth === 0 ? 'font-medium' : 'font-normal opacity-85',
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
      <div className="flex items-center gap-3 px-5 h-11 border-b border-border shrink-0 bg-card/50">
        <Button
          variant="ghost" size="sm" onClick={onBack}
          className="text-muted-foreground hover:text-foreground -ml-1 gap-1.5 h-7 px-2 text-xs"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </Button>
        <div className="w-px h-3.5 bg-border" />
        <h1 className="text-[13px] font-medium text-foreground/80 truncate">{roadmapNode.label}</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 border-r border-border overflow-y-auto py-5 shrink-0">
          <p className="px-4 mb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
            Contents
          </p>
          {lessonNodes.map((node, i) => (
            <SidebarItem key={i} node={node} depth={0} id={`s${i}`} activeId={activeId} onSelect={handleSelect} />
          ))}
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="px-10 py-10">
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
