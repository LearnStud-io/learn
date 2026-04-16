import { useState, useCallback } from 'react'

export function useCompletedNodes(storageKey: string) {
  const key = `completed:${storageKey}`

  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set()
    } catch {
      return new Set()
    }
  })

  const toggle = useCallback((nodeId: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      localStorage.setItem(key, JSON.stringify([...next]))
      return next
    })
  }, [key])

  return { completed, toggle }
}
