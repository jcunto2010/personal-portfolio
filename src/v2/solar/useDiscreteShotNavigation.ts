/**
 * useDiscreteShotNavigation — discrete Sun → Mercury → Venus → Earth → Moon → Mars shot state machine.
 *
 * REPLACES the continuous scroll-scrub behaviour between Sun, Mercury, Venus, Earth, Moon, and Mars.
 *
 * State:
 *   currentShotId       — where the camera is RIGHT NOW ('sun' | 'mercury' | 'venus' | 'earth' | 'moon' | 'mars')
 *   targetShotId        — where it is heading (null when idle)
 *   isTransitioning     — true while the automatic transition is running
 *   transitionDirection — 'forward' (sun→…→mars) | 'backward' (mars→…→sun) | null
 *   transitionT         — [0,1] progress of the ongoing transition (advanced in CameraRig useFrame)
 *   wheelIntent         — current accumulated wheel delta (for debug HUD)
 *
 * Navigation graph:
 *   sun      → wheel down → mercury
 *   mercury  → wheel down → venus
 *   mercury  → wheel up   → sun
 *   venus    → wheel down → earth
 *   venus    → wheel up   → mercury
 *   earth    → wheel down → moon
 *   earth    → wheel up   → venus
 *   moon     → wheel down → mars
 *   moon     → wheel up   → earth
 *   mars     → wheel up   → moon
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
 * Sun, Mercury, Venus, Earth and Moon behaviour: 100% preserved. Mars added as sixth station.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import type { RefObject } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type DiscreteShotId = 'sun' | 'mercury' | 'venus' | 'earth' | 'moon' | 'mars'
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

// ── Navigation graph helpers ──────────────────────────────────────────────────

function getNextShot(id: DiscreteShotId): DiscreteShotId | null {
  if (id === 'sun')     return 'mercury'
  if (id === 'mercury') return 'venus'
  if (id === 'venus')   return 'earth'
  if (id === 'earth')   return 'moon'
  if (id === 'moon')    return 'mars'
  return null  // mars has no next shot
}

function getPrevShot(id: DiscreteShotId): DiscreteShotId | null {
  if (id === 'mars')    return 'moon'
  if (id === 'moon')    return 'earth'
  if (id === 'earth')   return 'venus'
  if (id === 'venus')   return 'mercury'
  if (id === 'mercury') return 'sun'
  return null  // sun has no prev shot
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDiscreteShotNavigation(
  scrollContainerRef: RefObject<HTMLDivElement | null>,
): DiscreteShotState {
  const [currentShotId,   setCurrentShotId]   = useState<DiscreteShotId>('sun')
  const [targetShotId,    setTargetShotId]     = useState<DiscreteShotId | null>(null)
  const [isTransitioning, setIsTransitioning]  = useState(false)
  const [transitionDir,   setTransitionDir]    = useState<TransitionDirection | null>(null)
  const [wheelIntent,     setWheelIntent]      = useState(0)

  // Mutable refs — CameraRig reads transitionT every frame without re-renders
  const transitionTRef       = useRef<number>(0)
  const isTransitioningRef   = useRef(false)
  const currentShotIdRef     = useRef<DiscreteShotId>('sun')
  // Separate ref tracks the target so onTransitionComplete never reads stale state
  const targetShotIdRef = useRef<DiscreteShotId | null>(null)
  const intentAccRef         = useRef(0)
  const decayTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Transition control ───────────────────────────────────────────────────

  const startTransition = useCallback((from: DiscreteShotId, to: DiscreteShotId) => {
    const dir: TransitionDirection = getNextShot(from) === to ? 'forward' : 'backward'
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

      const curr = currentShotIdRef.current

      // Scroll down: advance to next shot
      if (intentAccRef.current >= INTENT_THRESHOLD) {
        const next = getNextShot(curr)
        if (next !== null) {
          e.preventDefault()
          intentAccRef.current = 0
          setWheelIntent(0)
          if (decayTimerRef.current !== null) clearTimeout(decayTimerRef.current)
          startTransition(curr, next)
          return
        }
      }

      // Scroll up: go back to previous shot
      if (intentAccRef.current <= -INTENT_THRESHOLD) {
        const prev = getPrevShot(curr)
        if (prev !== null) {
          e.preventDefault()
          intentAccRef.current = 0
          setWheelIntent(0)
          if (decayTimerRef.current !== null) clearTimeout(decayTimerRef.current)
          startTransition(curr, prev)
          return
        }
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
