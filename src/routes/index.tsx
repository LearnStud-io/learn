import { createFileRoute } from '@tanstack/react-router'
import { RoadmapPage } from '~/modules/roadmap/roadmap-page'

export const Route = createFileRoute('/')({
  component: RoadmapPage,
})
