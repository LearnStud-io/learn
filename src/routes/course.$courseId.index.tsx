import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { RoadmapView } from '~/components/RoadmapView'
import { Route as CourseRoute } from './course.$courseId'

export const Route = createFileRoute('/course/$courseId/')({
  component: function CourseRoadmap() {
    const data = CourseRoute.useLoaderData()
    const { courseId } = Route.useParams()
    const navigate = useNavigate()

    return (
      <RoadmapView
        nodes={data.nodes}
        onNodeClick={(nodeId) => navigate({ to: '/course/$courseId/lesson/$nodeId', params: { courseId, nodeId } })}
        storageKey={`roadmap-transform:${courseId}`}
        header={
          <div className="flex items-center px-6 py-3 shrink-0 border-b border-border bg-card/50">
            <div>
              <h1 className="text-sm font-bold text-foreground">{data.course.title}</h1>
              {data.course.subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{data.course.subtitle}</p>
              )}
            </div>
            <p className="ml-auto text-xs text-muted-foreground/60 hidden sm:block">
              Click a node · Drag to pan · Scroll to zoom
            </p>
          </div>
        }
      />
    )
  },
})
