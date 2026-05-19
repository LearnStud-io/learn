import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { RoadmapView } from '~/components/RoadmapView'
import { Route as CourseRoute } from './course.$courseId'
import { colors, font } from '~/modules/theme'
import { useCompletedNodes } from '~/modules/useCompletedNodes'
import { Info, X, Lock, Loader2 } from 'lucide-react'

const CREATE_URL = import.meta.env.VITE_CREATE_URL ?? import.meta.env.VITE_API_URL ?? 'https://create.learnstud.io'

function formatPrice(priceCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(priceCents / 100)
  } catch {
    return `${(priceCents / 100).toFixed(2)} ${currency}`
  }
}

export const Route = createFileRoute('/course/$courseId/')({
  component: function CourseRoadmap() {
    const data = CourseRoute.useLoaderData()
    const { courseId } = Route.useParams()
    const navigate = useNavigate()
    const { completed, toggle } = useCompletedNodes(courseId)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [buying, setBuying] = useState(false)
    const [buyError, setBuyError] = useState<string | null>(null)

    const hasOverview = data.course.overview || data.course.goal
    const showBuyBanner = data.course.isPaid && !data.course.unlocked

    useEffect(() => { document.title = data.course.title }, [data.course.title])

    async function handleBuy() {
      setBuyError(null)
      setBuying(true)
      try {
        const res = await fetch(`${CREATE_URL}/api/courses/${courseId}/checkout`, { method: 'POST' })
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string }
          throw new Error(body.error ?? `Checkout failed (${res.status})`)
        }
        const { url } = await res.json() as { url: string }
        window.location.href = url
      } catch (err) {
        setBuyError(err instanceof Error ? err.message : 'Checkout failed')
        setBuying(false)
      }
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: colors.bg }}>
        {showBuyBanner && data.course.priceCents != null && (
          <div className="flex items-center justify-between gap-3 px-4 py-2 shrink-0 border-b border-amber-500/30 bg-amber-500/10">
            <div className="flex items-center gap-2 min-w-0">
              <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-100/90 truncate">
                Lessons are locked. Purchase this course to unlock all of them.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {buyError && <span className="text-xs text-destructive hidden sm:inline">{buyError}</span>}
              <button
                onClick={handleBuy}
                disabled={buying}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 transition-colors disabled:opacity-60 inline-flex items-center gap-1.5"
              >
                {buying
                  ? <><Loader2 className="w-3 h-3 animate-spin" />Redirecting…</>
                  : <>Buy {formatPrice(data.course.priceCents, data.course.currency)}</>
                }
              </button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* ── Left sidebar: goal + overview (desktop) ───────────────────── */}
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
                <p style={{ fontFamily: font, fontSize: 12, fontWeight: 500, color: colors.textPrimary, lineHeight: 1.6, margin: '0 0 12px' }}>
                  {data.course.goal}
                </p>
              )}
              {data.course.overview && (
                <p style={{ fontFamily: font, fontSize: 11, color: colors.textSecondary, lineHeight: 1.7, margin: 0 }}>
                  {data.course.overview}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Mobile sidebar overlay ─────────────────────────────────────── */}
        {hasOverview && sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-20 overflow-y-auto" style={{ background: colors.surface }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                  {data.course.title}
                </h1>
                {data.course.subtitle && (
                  <p style={{ fontFamily: font, fontSize: 11, color: colors.textSecondary, margin: '4px 0 0' }}>
                    {data.course.subtitle}
                  </p>
                )}
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ color: colors.textSecondary, padding: 4, lineHeight: 0 }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              {data.course.goal && (
                <p style={{ fontFamily: font, fontSize: 13, fontWeight: 500, color: colors.textPrimary, lineHeight: 1.6, margin: '0 0 16px' }}>
                  {data.course.goal}
                </p>
              )}
              {data.course.overview && (
                <p style={{ fontFamily: font, fontSize: 12, color: colors.textSecondary, lineHeight: 1.7, margin: 0 }}>
                  {data.course.overview}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Roadmap canvas ────────────────────────────────────────────── */}
        <RoadmapView
          nodes={data.nodes}
          onNodeClick={(nodeId) => navigate({ to: '/course/$courseId/lesson/$nodeId', params: { courseId, nodeId } })}
          completedIds={completed}
          onToggleComplete={toggle}
          storageKey={`roadmap-transform:${courseId}`}
          containerStyle={{ flex: 1, height: '100%' }}
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

        {/* ── Mobile info toggle ──────────────────────────────────────────── */}
        {hasOverview && (
          <button
            className="md:hidden fixed bottom-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            onClick={() => setSidebarOpen(o => !o)}
          >
            {sidebarOpen
              ? <X className="w-4 h-4" style={{ color: colors.textSecondary }} />
              : <Info className="w-4 h-4" style={{ color: colors.textSecondary }} />
            }
          </button>
        )}
      </div>
    )
  },
})
