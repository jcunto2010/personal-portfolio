import { createContext, useContext, type MutableRefObject } from 'react'
import type Lenis from 'lenis'

/**
 * Provides the Lenis instance ref to any V2 component that needs to
 * perform programmatic smooth-scroll (e.g. TableOfContents).
 *
 * Usage:
 *   const lenisRef = useScrollContext()
 *   lenisRef.current?.scrollTo(el, { offset: 0 })
 *
 * The ref is null when Lenis is inactive (e.g. prefers-reduced-motion).
 */
export const ScrollContext = createContext<MutableRefObject<Lenis | null> | null>(null)

export function useScrollContext() {
  return useContext(ScrollContext)
}
