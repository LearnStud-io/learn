import { useNavigate } from '@tanstack/react-router'
import { RoadmapView } from '~/components/RoadmapView'
import { loadRoadmap, metadata } from '../data'
import { colors, font } from '../theme'

export function RoadmapPage() {
  const navigate = useNavigate()
  const { nodes } = loadRoadmap()

  const hasOverview = metadata.overview || metadata.goal

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: colors.bg }}>
      {/* ── Left sidebar: goal + overview ───────────────────────────────── */}
      {hasOverview && (
        <div style={{
          width: 380,
          flexShrink: 0,
          borderRight: `1px solid ${colors.border}`,
          background: colors.surface,
          display: 'flex',
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
              <p style={{
                fontFamily: font,
                fontSize: 12,
                fontWeight: 500,
                color: colors.textPrimary,
                lineHeight: 1.6,
                margin: '0 0 12px',
              }}>
                {metadata.goal}
              </p>
            )}

            {metadata.overview && (
              <p style={{
                fontFamily: font,
                fontSize: 11,
                color: colors.textSecondary,
                lineHeight: 1.7,
                margin: 0,
              }}>
                {metadata.overview}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Right: roadmap canvas ───────────────────────────────────────── */}
      <RoadmapView
        nodes={nodes}
        onNodeClick={(nodeId) => navigate({ to: '/lesson/$nodeId', params: { nodeId } })}
        containerStyle={{ flex: 1, height: '100vh' }}
      />
    </div>
  )
}
