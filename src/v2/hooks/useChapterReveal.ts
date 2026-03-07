import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useReducedMotion'

// Safe to register multiple times — GSAP deduplicates.
gsap.registerPlugin(ScrollTrigger)

/**
 * The chapter IDs that receive scroll-reveal animations.
 * Must stay in sync with the stable anchor IDs in HomeV2.
 */
const CHAPTER_IDS = [
  'chapter-intro',
  'chapter-about',
  'chapter-notes',
  'chapter-work',
  'chapter-contact',
] as const

/**
 * Applies a subtle reveal animation to each chapter section using
 * GSAP ScrollTrigger.
 *
 * Animation: fade-in + slight upward drift (translateY 24px → 0).
 *
 * Behaviour:
 * - Skipped entirely when `prefers-reduced-motion: reduce` is active.
 * - All ScrollTrigger instances are killed on unmount.
 * - Does NOT animate `chapter-intro` because it is already visible
 *   above the fold on load.
 *
 * @param enabled  Pass `false` to skip — useful during SSR / tests.
 */
export function useChapterReveal(enabled = true) {
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!enabled || prefersReduced) return

    const triggers: ScrollTrigger[] = []

    // Skip intro — it is already in the viewport on load.
    const chaptersToAnimate = CHAPTER_IDS.filter((id) => id !== 'chapter-intro')

    chaptersToAnimate.forEach((id) => {
      const section = document.getElementById(id)
      if (!section) return

      // Target: the inner content wrapper to avoid animating the full
      // section background (which would create a layout gap).
      const inner = section.querySelector<HTMLElement>(':scope > div')
      const target = inner ?? section

      // Set initial state.
      gsap.set(target, { opacity: 0, y: 24 })

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(target, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power2.out',
          })
        },
      })

      triggers.push(st)
    })

    return () => {
      triggers.forEach((t) => t.kill())
      // Reset any inline styles left by GSAP so reduced-motion toggling is clean.
      chaptersToAnimate.forEach((id) => {
        const section = document.getElementById(id)
        if (!section) return
        const inner = section.querySelector<HTMLElement>(':scope > div')
        const target = inner ?? section
        gsap.set(target, { clearProps: 'all' })
      })
    }
  }, [enabled, prefersReduced])
}
