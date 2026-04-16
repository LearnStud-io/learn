import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { RoadmapView } from '~/components/RoadmapView'
import { Route as CourseRoute } from './course.$courseId'
import { colors, font } from '~/modules/theme'
import { useCompletedNodes } from '~/modules/useCompletedNodes'

export const Route = createFileRoute('/course/$courseId/')({
  component: function CourseRoadmap() {
    const data = CourseRoute.useLoaderData()
    const { courseId } = Route.useParams()
    const navigate = useNavigate()
    const { completed, toggle } = useCompletedNodes(courseId)

    const hasOverview = data.course.overview || data.course.goal

    return (
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: colors.bg }}>
        {/* ── Left sidebar: goal + overview ─────────────────────────────── */}
        {hasOverview && (
          <div className="hidden md:flex" style={{
            width: 380,
            flexShrink: 0,
            borderRight: `1px solid ${colors.border}`,
            background: colors.surface,
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '20px', borderBottom: `1px solid ${colors.border}` }}>
              <h1 style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                {data.course.title}
              </h1>
              {data.course.subtitle && (
                <p style={{ fontFamily: font, fontSize: 11, color: colors.textSecondary, margin: '4px 0 0' }}>
                  {data.course.subtitle}
                </p>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {data.course.goal && (
                <p style={{
                  fontFamily: font,
                  fontSize: 12,
                  fontWeight: 500,
                  color: colors.textPrimary,
                  lineHeight: 1.6,
                  margin: '0 0 12px',
                }}>
                  {data.course.goal}
                </p>
              )}

              {data.course.overview && (
                <p style={{
                  fontFamily: font,
                  fontSize: 11,
                  color: colors.textSecondary,
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {data.course.overview}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Right: roadmap canvas ─────────────────────────────────────── */}
        <RoadmapView
          nodes={data.nodes}
          onNodeClick={(nodeId) => navigate({ to: '/course/$courseId/lesson/$nodeId', params: { courseId, nodeId } })}
          completedIds={completed}
          onToggleComplete={toggle}
          storageKey={`roadmap-transform:${courseId}`}
          containerStyle={{ flex: 1, height: '100vh' }}
          {...(!hasOverview && {
            header: (
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
            ),
          })}
        />
      </div>
    )
  },
})
