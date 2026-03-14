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

/** Sub-phases of the Uranus → Blackhole cinematic transition */
export type BlackholeCinematicPhase = 'departure' | 'warp' | 'reveal'

/** Sub-phases of the Blackhole reset cinematic (enter blackhole → then reset to Sun). */
export type BlackholeResetPhase = 'dive' | 'consume' | 'reappear'

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
  /** Ref — CameraRig can read this to consider transition active same-frame (avoids 1–2 frame delay) */
  isTransitioningRef?: RefObject<boolean>
  /** Ref — target shot during transition; use when state has not updated yet */
  targetShotIdRef?:   RefObject<DiscreteShotId | null>
  /** Ref — current shot during transition; use when state has not updated yet */
  currentShotIdRef?:  RefObject<DiscreteShotId>
  /** Called by CameraRig when transitionT reaches 1 */
  onTransitionComplete: () => void

  // ── Blackhole cinematic transition (Uranus → Blackhole only) ──────────────
  /** True while the special cinematic Uranus → Blackhole transition is active */
  isBlackholeCinematic:     boolean
  /** Ref — CameraRig can read this same-frame so the cinematic branch runs on the first frame */
  isBlackholeCinematicRef?: RefObject<boolean>
  /** Current sub-phase of the cinematic transition */
  blackholeCinematicPhase:  BlackholeCinematicPhase
  /** Mutable ref [0..1] — CameraRig advances this each frame during cinematic */
  blackholeCinematicTRef:   RefObject<number>
  /** Called by CameraRig when the cinematic transition completes */
  onBlackholeCinematicComplete: () => void
  /** Called by CameraRig each frame to update the phase label (React state, for HUD) */
  onBlackholeCinematicPhaseChange: (phase: BlackholeCinematicPhase) => void

  // ── Blackhole reset cinematic (Blackhole hold → enter simulation → Sun) ─────
  /** True while the "enter blackhole" reset cinematic is running */
  isBlackholeResetting:     boolean
  /** Current sub-phase: dive (camera push in), consume (dark hold), reappear (cut to Sun). */
  blackholeResetPhase:      BlackholeResetPhase
  /** Mutable ref [0..1] — CameraRig advances this each frame during reset cinematic */
  blackholeResetTRef:       RefObject<number>
  /** Called by CameraRig when the reset cinematic completes; then currentShotId = 'sun'. */
  onBlackholeResetComplete: () => void
  /** Called by CameraRig each frame to update the phase label (React state, for HUD). */
  onBlackholeResetPhaseChange: (phase: BlackholeResetPhase) => void
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

  // ── Blackhole cinematic state ─────────────────────────────────────────────
  const [isBlackholeCinematic,    setIsBlackholeCinematic]    = useState(false)
  const [blackholeCinematicPhase, setBlackholeCinematicPhase] = useState<BlackholeCinematicPhase>('departure')
  const blackholeCinematicTRef    = useRef<number>(0)
  const isBlackholeCinematicRef   = useRef(false)

  // ── Blackhole reset cinematic state ──────────────────────────────────────
  const [isBlackholeResetting,    setIsBlackholeResetting]    = useState(false)
  const [blackholeResetPhase,     setBlackholeResetPhase]     = useState<BlackholeResetPhase>('dive')
  const blackholeResetTRef        = useRef<number>(0)

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
   * Cinematic Uranus → Blackhole transition.
   * Sets isBlackholeCinematic=true and locks input via isTransitioningRef.
   * CameraRig drives blackholeCinematicTRef [0..1] and calls onBlackholeCinematicComplete.
   */
  const startBlackholeCinematic = useCallback(() => {
    blackholeCinematicTRef.current = 0
    transitionTRef.current = 0       // prevent normal-transition block from completing in one frame
    isBlackholeCinematicRef.current = true
    isTransitioningRef.current = true   // blocks wheel input
    currentShotIdRef.current = 'uranus'
    targetShotIdRef.current = 'blackhole'

    setIsBlackholeCinematic(true)
    setBlackholeCinematicPhase('departure')
    setTargetShotId('blackhole')
    setTransitionDir('forward')
    setIsTransitioning(true)
  }, [])

  const onBlackholeCinematicComplete = useCallback(() => {
    isBlackholeCinematicRef.current = false
    isTransitioningRef.current = false
    blackholeCinematicTRef.current = 1
    currentShotIdRef.current = 'blackhole'
    targetShotIdRef.current = null

    setIsBlackholeCinematic(false)
    setBlackholeCinematicPhase('departure')
    setCurrentShotId('blackhole')
    setTargetShotId(null)
    setIsTransitioning(false)
    setTransitionDir(null)
  }, [])

  // Expose a setter so CameraRig can update the phase label reactively
  const updateBlackholeCinematicPhase = useCallback((phase: BlackholeCinematicPhase) => {
    setBlackholeCinematicPhase(phase)
  }, [])

  /**
   * Blackhole reset cinematic: enter-blackhole simulation, then reset to Sun.
   * Triggered from blackhole shot on wheel down. Blocks input until complete.
   * On complete, onBlackholeResetComplete sets currentShotId = 'sun' (no EntryGate, no audio/mode reset).
   */
  const startBlackholeResetCinematic = useCallback(() => {
    blackholeResetTRef.current = 0
    isTransitioningRef.current = true
    currentShotIdRef.current = 'blackhole'
    targetShotIdRef.current = null

    setIsBlackholeResetting(true)
    setBlackholeResetPhase('dive')
    setTargetShotId(null)
    setTransitionDir(null)
    setIsTransitioning(true)
  }, [])

  const onBlackholeResetComplete = useCallback(() => {
    isTransitioningRef.current = false
    blackholeResetTRef.current = 1
    currentShotIdRef.current = 'sun'
    targetShotIdRef.current = null

    setCurrentShotId('sun')
    setTargetShotId(null)
    setIsBlackholeResetting(false)
    setBlackholeResetPhase('dive')
    setIsTransitioning(false)
    setTransitionDir(null)
  }, [])

  const updateBlackholeResetPhase = useCallback((phase: BlackholeResetPhase) => {
    setBlackholeResetPhase(phase)
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
          // Special cinematic transition for Uranus → Blackhole
          if (curr === 'uranus' && next === 'blackhole') {
            startBlackholeCinematic()
          } else {
            startTransition(curr, next)
          }
          return
        } else if (curr === 'blackhole') {
          // No next shot from blackhole → trigger enter-blackhole cinematic, then reset to Sun
          e.preventDefault()
          intentAccRef.current = 0
          setWheelIntent(0)
          if (decayTimerRef.current !== null) clearTimeout(decayTimerRef.current)
          startBlackholeResetCinematic()
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
  }, [scrollContainerRef, startTransition, startBlackholeResetCinematic, startBlackholeCinematic])

  return {
    currentShotId,
    targetShotId,
    isTransitioning,
    isResetting,
    transitionDirection: transitionDir,
    wheelIntent,
    transitionTRef,
    isTransitioningRef,
    targetShotIdRef,
    currentShotIdRef,
    onTransitionComplete,
    // Blackhole cinematic
    isBlackholeCinematic,
    isBlackholeCinematicRef,
    blackholeCinematicPhase,
    blackholeCinematicTRef,
    onBlackholeCinematicComplete,
    onBlackholeCinematicPhaseChange: updateBlackholeCinematicPhase,
    // Blackhole reset cinematic
    isBlackholeResetting,
    blackholeResetPhase,
    blackholeResetTRef,
    onBlackholeResetComplete,
    onBlackholeResetPhaseChange: updateBlackholeResetPhase,
  }
}
