/**
 * useDiscreteShotNavigation — discrete Sun → … → Uranus → Blackhole shot state machine.
 *
 * REPLACES the continuous scroll-scrub behaviour for all shots.
 *
 * State:
 *   currentShotId       — where the camera is RIGHT NOW
 *   targetShotId        — where it is heading (null when idle)
 *   isTransitioning     — true while the automatic transition is running
 *   isResetting         — true while the reset loop back to Sun is executing
 *   transitionDirection — 'forward' | 'backward' | null
 *   transitionT         — [0,1] progress of the ongoing transition (advanced in CameraRig useFrame)
 *   wheelIntent         — current accumulated wheel delta (for debug HUD)
 *
 * Navigation graph:
 *   sun      → wheel down → mercury
 *   mercury  → wheel down → venus    | wheel up → sun
 *   venus    → wheel down → earth    | wheel up → mercury
 *   earth    → wheel down → moon     | wheel up → venus
 *   moon     → wheel down → mars     | wheel up → earth
 *   mars     → wheel down → neptune  | wheel up → moon
 *   neptune  → wheel down → uranus   | wheel up → mars
 *   uranus   → wheel down → blackhole| wheel up → neptune
 *   blackhole→ wheel up   → uranus   | wheel down → RESET LOOP → sun
 *
 * Reset loop:
 *   - Triggered only from currentShotId === 'blackhole' with wheel down intent.
 *   - isResetting = true while executing.
 *   - All wheel input ignored during reset.
 *   - On complete: currentShotId = 'sun', isResetting = false.
 *   - Does NOT reactivate EntryGate, does NOT reset audio, does NOT reset immersive mode.
 *
 * Input:
 *   - wheel deltaY events captured on the scroll container ref
 *   - Threshold: ±150px accumulated deltaY to trigger a shot change
 *   - Accumulator decays to 0 after 400 ms of silence
 *   - During a transition all wheel input is ignored (inputLock)
 *
 * CameraRig responsibility:
 *   - Read transitionT ref and advance it each frame with delta * speed.
 *   - Call onTransitionComplete() when transitionT reaches 1.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import type { RefObject } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type DiscreteShotId = 'sun' | 'mercury' | 'venus' | 'earth' | 'moon' | 'mars' | 'neptune' | 'uranus' | 'blackhole'
export type TransitionDirection = 'forward' | 'backward'

export interface DiscreteShotState {
  currentShotId:       DiscreteShotId
  targetShotId:        DiscreteShotId | null
  isTransitioning:     boolean
  /** True while the reset loop (blackhole → sun) is executing */
  isResetting:         boolean
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
 */
const INTENT_THRESHOLD = 150

/**
 * Milliseconds of wheel silence before the accumulator resets.
 */
const DECAY_TIMEOUT_MS = 400

// ── Navigation graph helpers ──────────────────────────────────────────────────

function getNextShot(id: DiscreteShotId): DiscreteShotId | null {
  if (id === 'sun')       return 'mercury'
  if (id === 'mercury')   return 'venus'
  if (id === 'venus')     return 'earth'
  if (id === 'earth')     return 'moon'
  if (id === 'moon')      return 'mars'
  if (id === 'mars')      return 'neptune'
  if (id === 'neptune')   return 'uranus'
  if (id === 'uranus')    return 'blackhole'
  return null  // blackhole: no next — triggers reset loop instead
}

function getPrevShot(id: DiscreteShotId): DiscreteShotId | null {
  if (id === 'blackhole') return 'uranus'
  if (id === 'uranus')    return 'neptune'
  if (id === 'neptune')   return 'mars'
  if (id === 'mars')      return 'moon'
  if (id === 'moon')      return 'earth'
  if (id === 'earth')     return 'venus'
  if (id === 'venus')     return 'mercury'
  if (id === 'mercury')   return 'sun'
  return null  // sun has no prev shot
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDiscreteShotNavigation(
  scrollContainerRef: RefObject<HTMLDivElement | null>,
): DiscreteShotState {
  const [currentShotId,   setCurrentShotId]   = useState<DiscreteShotId>('sun')
  const [targetShotId,    setTargetShotId]     = useState<DiscreteShotId | null>(null)
  const [isTransitioning, setIsTransitioning]  = useState(false)
  const [isResetting,     setIsResetting]      = useState(false)
  const [transitionDir,   setTransitionDir]    = useState<TransitionDirection | null>(null)
  const [wheelIntent,     setWheelIntent]      = useState(0)

  // Mutable refs — CameraRig reads transitionT every frame without re-renders
  const transitionTRef       = useRef<number>(0)
  const isTransitioningRef   = useRef(false)
  const isResettingRef       = useRef(false)
  const currentShotIdRef     = useRef<DiscreteShotId>('sun')
  const targetShotIdRef      = useRef<DiscreteShotId | null>(null)
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

  /**
   * Reset loop: transition from blackhole back to sun.
   * Uses the same transitionT mechanism but sets isResetting=true so
   * CameraRig can distinguish a reset from a normal backward transition.
   */
  const startResetLoop = useCallback(() => {
    transitionTRef.current = 0
    isTransitioningRef.current = true
    isResettingRef.current = true
    currentShotIdRef.current = 'blackhole'
    targetShotIdRef.current = 'sun'

    setTargetShotId('sun')
    setTransitionDir('backward')
    setIsTransitioning(true)
    setIsResetting(true)
  }, [])

  const onTransitionComplete = useCallback(() => {
    const arrived = targetShotIdRef.current ?? currentShotIdRef.current

    isTransitioningRef.current = false
    isResettingRef.current = false
    transitionTRef.current = 1
    currentShotIdRef.current = arrived
    targetShotIdRef.current = null

    setCurrentShotId(arrived)
    setTargetShotId(null)
    setIsTransitioning(false)
    setIsResetting(false)
    setTransitionDir(null)
  }, [])

  // ── Wheel intent accumulation ─────────────────────────────────────────────

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      // During any transition or reset: fully ignore all wheel input
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

      // Scroll down: advance to next shot, or trigger reset loop from blackhole
      if (intentAccRef.current >= INTENT_THRESHOLD) {
        const next = getNextShot(curr)
        if (next !== null) {
          e.preventDefault()
          intentAccRef.current = 0
          setWheelIntent(0)
          if (decayTimerRef.current !== null) clearTimeout(decayTimerRef.current)
          startTransition(curr, next)
          return
        } else if (curr === 'blackhole') {
          // No next shot from blackhole → trigger reset loop to Sun
          e.preventDefault()
          intentAccRef.current = 0
          setWheelIntent(0)
          if (decayTimerRef.current !== null) clearTimeout(decayTimerRef.current)
          startResetLoop()
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
  }, [scrollContainerRef, startTransition, startResetLoop])

  return {
    currentShotId,
    targetShotId,
    isTransitioning,
    isResetting,
    transitionDirection: transitionDir,
    wheelIntent,
    transitionTRef,
    onTransitionComplete,
  }
}
