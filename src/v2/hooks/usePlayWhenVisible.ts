import { useCallback, useRef } from 'react'

/** Ref callback for a muted `<video>`: plays it while it is on screen and pauses it otherwise. */
export function usePlayWhenVisible() {
  const observer = useRef<IntersectionObserver | null>(null)

  return useCallback((video: HTMLVideoElement | null) => {
    observer.current?.disconnect()
    if (!video) return
    observer.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => undefined)
      else video.pause()
    })
    observer.current.observe(video)
  }, [])
}
