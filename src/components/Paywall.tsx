import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, Loader2, ArrowLeft } from 'lucide-react'

const CREATE_URL = import.meta.env.VITE_CREATE_URL ?? import.meta.env.VITE_API_URL ?? 'https://create.learnstud.io'

interface Props {
  courseId: string
  courseTitle: string
  priceCents: number | null
  currency: string
}

function formatPrice(priceCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(priceCents / 100)
  } catch {
    return `${(priceCents / 100).toFixed(2)} ${currency}`
  }
}

export function Paywall({ courseId, courseTitle, priceCents, currency }: Props) {
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    setError(null)
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
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setBuying(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-10 px-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">This lesson is locked</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Purchase <span className="text-foreground font-medium">"{courseTitle}"</span> to unlock every lesson. After checkout we email a magic link that unlocks all lessons in this course.
          </p>

          {priceCents != null && priceCents > 0 && (
            <Button onClick={handleBuy} disabled={buying} size="lg" className="mt-6 w-full">
              {buying
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting…</>
                : <>Buy for {formatPrice(priceCents, currency)}</>
              }
            </Button>
          )}

          {error && <p className="text-xs text-destructive mt-3">{error}</p>}

          <Link
            to="/course/$courseId"
            params={{ courseId }}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-6"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to roadmap
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
