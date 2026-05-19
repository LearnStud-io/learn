// Magic-link token helpers. Buyers arrive at /course/<id>?t=<TOKEN>; we stash the
// token in localStorage keyed by courseId, strip it from the URL, and attach it
// to every API call for that course.

const KEY_PREFIX = 'course-token:'

function storageKey(courseId: string): string {
  return `${KEY_PREFIX}${courseId}`
}

// Read ?t= from the current URL, persist it for this course, then strip the
// query so the token isn't sitting in the address bar. Called from the course
// loader on first load; safe to call repeatedly (no-op when no token in URL).
export function claimTokenFromUrl(courseId: string): string | null {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  const token = url.searchParams.get('t')
  if (token) {
    try { localStorage.setItem(storageKey(courseId), token) } catch {}
    url.searchParams.delete('t')
    window.history.replaceState({}, '', url.toString())
    return token
  }
  return getStoredToken(courseId)
}

export function getStoredToken(courseId: string): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(storageKey(courseId)) } catch { return null }
}

export function clearStoredToken(courseId: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(storageKey(courseId)) } catch {}
}

// Build a course API URL with the access token appended if one is on hand.
export function withToken(url: string, courseId: string): string {
  const token = getStoredToken(courseId)
  if (!token) return url
  const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  u.searchParams.set('t', token)
  return u.toString()
}
