import { useParams, useNavigate } from '@tanstack/react-router'
import { LessonView } from '~/components/LessonView'
import { loadRoadmap, loadLesson, loadVis } from '../data'

export function LessonPage() {
  const { nodeId } = useParams({ from: '/lesson/$nodeId' })
  const navigate = useNavigate()

  const { nodes: roadmapNodes } = loadRoadmap()
  const roadmapNode = roadmapNodes.find(n => n.id === nodeId)
  const lessonNodes = loadLesson(nodeId)

  if (!roadmapNode) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Node not found.</p>
      </div>
    )
  }

  return (
    <LessonView
      roadmapNode={roadmapNode}
      lessonNodes={lessonNodes}
      getVis={(nId, file) => loadVis(nId, file)}
      onBack={() => navigate({ to: '/' })}
    />
  )
}
