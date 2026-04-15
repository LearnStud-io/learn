import { useNavigate } from '@tanstack/react-router'
import { RoadmapView } from '~/components/RoadmapView'
import { loadRoadmap, metadata } from '../data'

export function RoadmapPage() {
  const navigate = useNavigate()
  const { nodes } = loadRoadmap()

  return (
    <RoadmapView
      nodes={nodes}
      onNodeClick={(nodeId) => navigate({ to: '/lesson/$nodeId', params: { nodeId } })}
      header={
        <div className="flex items-center px-6 py-3 shrink-0 border-b border-border bg-card/50">
          <div className="min-w-0 flex-1">
            <h1 className="text-[13px] font-semibold text-foreground truncate">{metadata.title}</h1>
            {metadata.subtitle && (
              <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">{metadata.subtitle}</p>
            )}
          </div>
          <p className="ml-auto text-[11px] text-muted-foreground/40 hidden sm:block">
            Click · Drag · Scroll
          </p>
        </div>
      }
    />
  )
}
