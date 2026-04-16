import { useEffect } from 'react'
import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { LessonView } from '~/components/LessonView'
import type { LessonNode } from '~/modules/data'
import { Route as CourseRoute } from './course.$courseId'
import { useCompletedNodes } from '~/modules/useCompletedNodes'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://create.learnstud.io'

interface LessonData {
  lessonNodes: LessonNode[]
  visFiles: { filename: string; content: string }[]
}

export const Route = createFileRoute('/course/$courseId/lesson/$nodeId')({
  loader: async ({ params }): Promise<LessonData> => {
    const res = await fetch(`${API_URL}/api/course/${params.courseId}/lesson/${params.nodeId}`)
    if (!res.ok) throw notFound()
    return res.json()
  },
  component: function CourseLessonPage() {
    const { lessonNodes, visFiles } = Route.useLoaderData()
    const courseData = CourseRoute.useLoaderData()
    const { courseId, nodeId } = Route.useParams()
    const navigate = useNavigate()

    const { completed, toggle } = useCompletedNodes(courseId)

    useEffect(() => {
      const node = courseData.nodes.find(n => n.id === nodeId)
      if (node) document.title = `${node.label} — ${courseData.course.title}`
    }, [nodeId, courseData])

    const roadmapNode = courseData.nodes.find(n => n.id === nodeId)
    if (!roadmapNode) return (
      <div className="h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Node not found.</p>
      </div>
    )

    const visMap = Object.fromEntries(visFiles.map(v => [v.filename, v.content]))

    return (
      <LessonView
        roadmapNode={roadmapNode}
        lessonNodes={lessonNodes}
        getVis={(_nId, file) => visMap[file] ?? null}
        onBack={() => navigate({ to: '/course/$courseId', params: { courseId } })}
        completed={completed.has(nodeId)}
        onToggleComplete={() => toggle(nodeId)}
      />
    )
  },
  notFoundComponent: () => (
    <div className="h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Lesson not found.</p>
    </div>
  ),
})
