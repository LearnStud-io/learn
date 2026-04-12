import { createFileRoute, Outlet, notFound } from '@tanstack/react-router'
import type { RoadmapNode } from '~/modules/data'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://create.learnstud.io'

export interface CourseData {
  course: { title: string; subtitle: string; version: string }
  nodes: RoadmapNode[]
}

export const Route = createFileRoute('/course/$courseId')({
  loader: async ({ params }): Promise<CourseData> => {
    const res = await fetch(`${API_URL}/api/course/${params.courseId}`)
    if (!res.ok) throw notFound()
    return res.json()
  },
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div className="h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Course not found.</p>
    </div>
  ),
})
