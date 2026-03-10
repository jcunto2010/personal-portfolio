/**
 * useDiscreteShotNavigation — discrete Sun ↔ Mercury shot state machine.
 *
 * REPLACES the continuous scroll-scrub behaviour between Sun and Mercury.
 *
 * State:
 *   currentShotId       — where the camera is RIGHT NOW ('sun' | 'mercury')
 *   targetShotId        — where it is heading (null when idle)
 *   isTransitioning     — true while the automatic transition is running
 *   transitionDirection — 'forward' (sun→mercury) | 'backward' (mercury→sun) | null
 *   transitionT         — [0,1] progress of the ongoing transition (advanced in CameraRig useFrame)
 *   wheelIntent         — current accumulated wheel delta (for debug HUD)
 *
 * Input:
 *   - wheel deltaY events captured on the scroll container ref
 *   - Threshold: ±150px accumulated deltaY to trigger a shot change
 *     (chosen to require ~2-3 notches on a standard mouse wheel, or a
 *      deliberate flick on a trackpad, while still feeling responsive)
 *   - Accumulator decays to 0 after 400 ms of silence
 *   - During a transition all wheel input is ignored (inputLock)
 *
 * CameraRig responsibility:
 *   - Read transitionT ref (via getTransitionT / setTransitionT exposed on the
 *     returned object) and advance it each frame with delta * speed.
 *   - Call onTransitionComplete() when transitionT reaches 1.
 *
 * This hook handles ONLY Sun ↔ Mercury.
 * All other scroll/progress logic continues unchanged.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import type { RefObject } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type DiscreteShotId = 'sun' | 'mercury'
export type TransitionDirection = 'forward' | 'backward'

export interface DiscreteShotState {
  currentShotId:       DiscreteShotId
  targetShotId:        DiscreteShotId | null
  isTransitioning:     boolean
  transitionDirection: TransitionDirection | null
  wheelIntent:         number   // live accumulator value, for debug HUD
  /** Mutable ref — CameraRig reads this every frame and advances it */
  transitionTRef:      RefObject<number>
  /** Called by CameraRig when transitionT reaches 1 */
  onTransitionComplete: () => void
}

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Accumulated deltaY required to fire a shot change.
 * 150 = ~2-3 mouse wheel notches (each ≈ 53 px on Windows/macOS).
 * On trackpads this is a deliberate short swipe.
 */
const INTENT_THRESHOLD = 150

/**
 * Milliseconds of wheel silence before the accumulator resets.
 * Prevents "half-saved" intent from a previous incomplete gesture.
 */
const DECAY_TIMEOUT_MS = 400

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDiscreteShotNavigation(
  scrollContainerRef: RefObject<HTMLDivElement | null>,
): DiscreteShotState {
  const [currentShotId,   setCurrentShotId]   = useState<DiscreteShotId>('sun')
  const [targetShotId,    setTargetShotId]     = useState<DiscreteShotId | null>(null)
  const [isTransitioning, setIsTransitioning]  = useState(false)
  const [transitionDir,   setTransitionDir]    = useState<TransitionDirection | null>(null)
  const [wheelIntent,     setWheelIntent]      = useState(0)

  // Mutable refs so CameraRig can read/write transitionT without triggering re-renders
  const transitionTRef       = useRef<number>(0)
  const isTransitioningRef   = useRef(false)
  const currentShotIdRef     = useRef<DiscreteShotId>('sun')
  // Separate ref tracks the target so onTransitionComplete never reads stale state
  const targetShotIdRef      = useRef<DiscreteShotId | null>(null)
  const intentAccRef         = useRef(0)
  const decayTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Transition control ───────────────────────────────────────────────────

  const startTransition = useCallback((from: DiscreteShotId, to: DiscreteShotId) => {
    const dir: TransitionDirection = to === 'mercury' ? 'forward' : 'backward'
    transitionTRef.current = 0
    isTransitioningRef.current = true
    currentShotIdRef.current = from
    targetShotIdRef.current = to

    setTargetShotId(to)
    setTransitionDir(dir)
    setIsTransitioning(true)
  }, [])

  const onTransitionComplete = useCallback(() => {
    // Read from ref — guaranteed non-stale even when called from useFrame
    const arrived = targetShotIdRef.current ?? currentShotIdRef.current

    isTransitioningRef.current = false
    transitionTRef.current = 1
    currentShotIdRef.current = arrived
    targetShotIdRef.current = null

    setCurrentShotId(arrived)
    setTargetShotId(null)
    setIsTransitioning(false)
    setTransitionDir(null)
  }, [])

  // ── Wheel intent accumulation ─────────────────────────────────────────────

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      // During a transition: fully ignore all wheel input
      if (isTransitioningRef.current) return

      // Accumulate intent
      intentAccRef.current += e.deltaY
      setWheelIntent(intentAccRef.current)

      // Schedule accumulator decay
      if (decayTimerRef.current !== null) clearTimeout(decayTimerRef.current)
      decayTimerRef.current = setTimeout(() => {
        intentAccRef.current = 0
        setWheelIntent(0)
      }, DECAY_TIMEOUT_MS)

      // Check threshold
      if (intentAccRef.current >= INTENT_THRESHOLD && currentShotIdRef.current === 'sun') {
        // Prevent default to stop the page scrolling during the discrete transition
        e.preventDefault()
        intentAccRef.current = 0
        setWheelIntent(0)
        if (decayTimerRef.current !== null) clearTimeout(decayTimerRef.current)
        startTransition('sun', 'mercury')
        return
      }

      if (intentAccRef.current <= -INTENT_THRESHOLD && currentShotIdRef.current === 'mercury') {
        e.preventDefault()
        intentAccRef.current = 0
        setWheelIntent(0)
        if (decayTimerRef.current !== null) clearTimeout(decayTimerRef.current)
        startTransition('mercury', 'sun')
        return
      }

      // Clamp accumulator so it doesn't drift into huge values
      intentAccRef.current = Math.sign(intentAccRef.current) * Math.min(Math.abs(intentAccRef.current), INTENT_THRESHOLD * 1.5)
    }

    // passive:false so we can call preventDefault during discrete transitions
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [scrollContainerRef, startTransition])

  return {
    currentShotId,
    targetShotId,
    isTransitioning,
    transitionDirection: transitionDir,
    wheelIntent,
    transitionTRef,
    onTransitionComplete,
  }
}
