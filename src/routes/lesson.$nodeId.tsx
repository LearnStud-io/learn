import { createFileRoute } from '@tanstack/react-router'
import { LessonPage } from '~/modules/lesson/lesson-page'

export const Route = createFileRoute('/lesson/$nodeId')({
  component: LessonPage,
})
