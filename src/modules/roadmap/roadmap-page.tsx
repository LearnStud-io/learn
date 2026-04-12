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
        <div className="flex items-center px-6 h-12 shrink-0 border-b border-border bg-card/50">
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-foreground truncate">{metadata.title}</h1>
            {metadata.subtitle && (
              <p className="text-xs text-muted-foreground truncate">{metadata.subtitle}</p>
            )}
          </div>
          <p className="ml-auto text-xs text-muted-foreground/60 hidden sm:block">
            Click a node · Drag to pan · Scroll to zoom
          </p>
        </div>
      }
    />
  )
}
