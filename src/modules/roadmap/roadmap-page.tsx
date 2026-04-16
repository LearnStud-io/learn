import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { RoadmapView } from '~/components/RoadmapView'
import { loadRoadmap, metadata } from '../data'
import { colors, font } from '../theme'
import { useCompletedNodes } from '../useCompletedNodes'
import { Info, X } from 'lucide-react'

export function RoadmapPage() {
  const navigate = useNavigate()
  const { nodes } = loadRoadmap()
  const { completed, toggle } = useCompletedNodes('local')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { document.title = metadata.title }, [])


  const hasOverview = metadata.overview || metadata.goal

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: colors.bg }}>
      {/* ── Left sidebar: goal + overview (desktop) ─────────────────────── */}
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
              {metadata.title}
            </h1>
            {metadata.subtitle && (
              <p style={{ fontFamily: font, fontSize: 11, color: colors.textSecondary, margin: '4px 0 0' }}>
                {metadata.subtitle}
              </p>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {metadata.goal && (
              <p style={{ fontFamily: font, fontSize: 12, fontWeight: 500, color: colors.textPrimary, lineHeight: 1.6, margin: '0 0 12px' }}>
                {metadata.goal}
              </p>
            )}
            {metadata.overview && (
              <p style={{ fontFamily: font, fontSize: 11, color: colors.textSecondary, lineHeight: 1.7, margin: 0 }}>
                {metadata.overview}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile sidebar overlay ───────────────────────────────────────── */}
      {hasOverview && sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-20 overflow-y-auto" style={{ background: colors.surface }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                {metadata.title}
              </h1>
              {metadata.subtitle && (
                <p style={{ fontFamily: font, fontSize: 11, color: colors.textSecondary, margin: '4px 0 0' }}>
                  {metadata.subtitle}
                </p>
              )}
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ color: colors.textSecondary, padding: 4, lineHeight: 0 }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div style={{ padding: '20px' }}>
            {metadata.goal && (
              <p style={{ fontFamily: font, fontSize: 13, fontWeight: 500, color: colors.textPrimary, lineHeight: 1.6, margin: '0 0 16px' }}>
                {metadata.goal}
              </p>
            )}
            {metadata.overview && (
              <p style={{ fontFamily: font, fontSize: 12, color: colors.textSecondary, lineHeight: 1.7, margin: 0 }}>
                {metadata.overview}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Roadmap canvas ──────────────────────────────────────────────── */}
      <RoadmapView
        nodes={nodes}
        onNodeClick={(nodeId) => navigate({ to: '/lesson/$nodeId', params: { nodeId } })}
        completedIds={completed}
        onToggleComplete={toggle}
        containerStyle={{ flex: 1, height: '100vh' }}
      />

      {/* ── Mobile info toggle ───────────────────────────────────────────── */}
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
}
