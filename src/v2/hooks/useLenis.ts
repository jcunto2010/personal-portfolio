import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Initialises Lenis smooth scroll on the V2 root.
 *
 * - Disabled automatically when `prefers-reduced-motion: reduce` is active.
 * - Destroyed and re-created if the reduced-motion preference changes at runtime.
 * - Feeds scroll events to GSAP ScrollTrigger so both systems stay in sync.
 * - Does NOT hijack keyboard Tab navigation or browser focus logic.
 *
 * Returns a ref to the Lenis instance so callers can call `lenis.scrollTo`
 * for smooth programmatic chapter jumps (used by TOC and CTA buttons).
 */
export function useLenis() {
  const prefersReduced = useReducedMotion()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Hard requirement: no smooth scroll when reduced motion is requested.
    if (prefersReduced) {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      return
    }

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    })

    lenisRef.current = lenis

    // Keep GSAP ScrollTrigger in sync with Lenis scroll position.
    lenis.on('scroll', ScrollTrigger.update)

    // Drive Lenis with GSAP ticker for a unified animation loop.
    function onTick(time: number) {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', ScrollTrigger.update)
      gsap.ticker.remove(onTick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [prefersReduced])

  return lenisRef
}
