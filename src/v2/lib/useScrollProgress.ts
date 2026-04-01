/**
 * useScrollProgress — Phase 3
 *
 * Returns a 0–1 value representing how far the user has scrolled through the
 * immersive solar experience.
 *
 * Strategy: the scroll container is a full-viewport div whose height is
 * 500vh. The hook listens to scroll events on that element and maps the
 * scrollTop to a normalised 0–1 range.
 *
 * If the container ref is null (not yet mounted) the hook returns 0.
 *
 * Implementation notes:
 *   - Uses `useCallback` + `addEventListener` rather than `onScroll` JSX
 *     prop so the listener can be passive (better scroll performance).
 *   - `requestAnimationFrame` gate batches rapid scroll events into one
 *     React state update per frame.
 *   - A `resize` listener on `window` re-syncs progress after fullscreen
 *     enter/exit, because those events change the viewport height and
 *     therefore the scrollable range. Without this, the camera position
 *     after fullscreen exit would be stale until the next scroll event.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export function useScrollProgress(
  containerRef: React.RefObject<HTMLElement | null>,
): number {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  const recalculate = useCallback(() => {
    if (rafRef.current !== null) return

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const el = containerRef.current
      if (!el) return

      const scrollable = el.scrollHeight - el.clientHeight
      if (scrollable <= 0) {
        setProgress(0)
        return
      }

      const raw = el.scrollTop / scrollable
      setProgress(Math.min(1, Math.max(0, raw)))
    })
  }, [containerRef])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.addEventListener('scroll', recalculate, { passive: true })
    // Re-sync after viewport resize (fullscreen enter/exit, window resize).
    window.addEventListener('resize', recalculate, { passive: true })

    return () => {
      el.removeEventListener('scroll', recalculate)
      window.removeEventListener('resize', recalculate)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [containerRef, recalculate])

  return progress
}
