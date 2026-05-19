import { createFileRoute, Outlet, notFound } from '@tanstack/react-router'
import type { RoadmapNode } from '~/modules/data'
import { claimTokenFromUrl, withToken } from '~/lib/access'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://create.learnstud.io'

export interface CourseData {
  course: {
    title: string
    subtitle: string
    version: string
    overview: string
    goal: string
    priceCents: number | null
    currency: string
    isPaid: boolean
    unlocked: boolean
  }
  nodes: RoadmapNode[]
}

export const Route = createFileRoute('/course/$courseId')({
  loader: async ({ params }): Promise<CourseData> => {
    // Capture ?t= from the URL on first arrival, then strip it from the address
    // bar. Subsequent navigations read the token from localStorage.
    claimTokenFromUrl(params.courseId)
    const url = withToken(`${API_URL}/api/course/${params.courseId}`, params.courseId)
    const res = await fetch(url)
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
