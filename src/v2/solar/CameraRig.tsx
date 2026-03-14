/**
 * CameraRig — solar journey camera.
 *
 * Architecture (microfase 6 — discrete Sun → Mercury → Venus → Earth → Moon → Mars)
 * ─────────────────────────────────────────────────────────────────────────────────
 * Sun → Mercury → Venus → Earth → Moon → Mars navigation is DISCRETE: the
 * transition runs automatically once triggered, driven by transitionT advancing
 * in useFrame at a fixed speed. It no longer depends on scroll scrub position.
 *
 * Shot routing:
 *   DISCRETE path (this file):
 *     'sun'     → intro sweep + Sun hold pose (VERBATIM, untouched)
 *     'mercury' → discrete transition from Sun pose to Mercury pose
 *     'venus'   → discrete transition from Mercury pose to Venus pose
 *     'earth'   → discrete transition from Venus pose to Earth pose
 *     'moon'    → discrete transition from Earth pose to Moon pose
 *     'mars'    → discrete transition from Moon pose to Mars pose
 *
 *   LEGACY path (scroll-driven, unchanged for future planets):
 *     Everything else → planet-registry approach/hold/depart logic
 *
 * Discrete transition behaviour:
 *   - transitionTRef is a mutable ref owned by useDiscreteShotNavigation.
 *   - Each frame: transitionTRef.current += delta * TRANSITION_SPEED.
 *   - When transitionTRef.current >= 1 → call onTransitionComplete().
 *   - Easing: easeInOutCubic applied to the raw t.
 *   - Camera position and lookAt are lerped between the FROM and TO hold poses.
 *
 * Sun intro: 100% preserved verbatim. DO NOT MODIFY.
 * Mercury/Venus/Earth/Moon poses: 100% preserved. DO NOT MODIFY.
 *
 * Exported types:
 *   CameraPhaseId        — debug HUD (extended with 'mars-approach', 'mars-hold')
 *   ShotPhaseId          — debug HUD (extended with 'mars-hold')
 *   CameraRigShotProps   — discrete props
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  getNextPlanetById,
  PLANET_MAP,
  PLANET_REGISTRY,
  type PlanetConfig,
  type PlanetId,
} from './planetRegistry'
import type { ShotId } from './shotConfig'
import { getShotById, SHOT_MAP } from './shotConfig'
import type { BlackholeCinematicPhase, BlackholeResetPhase, DiscreteShotId } from './useDiscreteShotNavigation'
import type { RefObject } from 'react'

// ── Damp coefficients ──────────────────────────────────────────────────────────
const DAMP_APPROACH  = 3.0
const DAMP_HOLD      = 1.6
const DAMP_DEPART    = 3.5
const DAMP_LOOK_AT   = 4.5
const DAMP_INTRO     = 2.5

const INTRO_DURATION = 3.5   // seconds

// Intro start position — DO NOT CHANGE (preserves the Sun intro sweep).
const INTRO_START = new THREE.Vector3(36, 28, 44)

/**
 * Speed at which transitionT advances per second.
 * 0.6 → transition completes in ~1.67 s.
 * Feels cinematic without being sluggish.
 */
const TRANSITION_SPEED = 0.6

/**
 * Venus ↔ Earth transition arcs around Venus; a slower speed makes the arc
 * feel smooth instead of abrupt. 0.35 → completes in ~2.86 s.
 */
const TRANSITION_SPEED_VENUS_EARTH = 0.35

/**
 * Waypoint for Venus ↔ Earth transition: camera arcs around Venus instead of
 * passing through it. Placed to the RIGHT of Venus (x > 16) and FORWARD
 * (z > -100, closer to camera) so the path goes forward first, then sweeps
 * left to Earth, never crossing the planet at [16, -1.2, -100].
 */
const VENUS_EARTH_ARC_WAYPOINT = new THREE.Vector3(28, 0.5, -88)

/**
 * Speed for the Uranus → Blackhole cinematic transition.
 * 0.135 → total duration ~7.4 s (departure ~0.9s + warp ~4.7s + reveal ~1.8s).
 * Warp phase prolonged so WarpStarfield is visible for ~4.7 s.
 */
const CINEMATIC_SPEED = 0.135

/**
 * Speed for the Blackhole reset cinematic (enter blackhole → Sun).
 * 0.5 → total duration ~2 s (dive ~0.9s, consume ~0.74s, reappear ~0.36s).
 */
const RESET_CINEMATIC_SPEED = 0.5

// Reset cinematic phase boundaries [0..1]
const RESET_DIVE_END    = 0.45   // dive: camera push toward blackhole
const RESET_CONSUME_END  = 0.82   // consume: dark hold; reappear: intro sweep to Sun + fade out
// Reappear: same duration as intro sweep (INTRO_DURATION)
const RESET_REAPPEAR_SPEED = (1 - RESET_CONSUME_END) / INTRO_DURATION

// Sub-phase boundaries for the cinematic transition [0..1]
const CINEMATIC_DEPARTURE_END = 0.12  // 0.00 → 0.12  (~0.9s) — short turn to void
const CINEMATIC_WARP_END      = 0.76  // 0.12 → 0.76  (~4.7s)
// reveal: 0.76 → 1.00                               (~1.8s) — long deceleration

// ── Easing ────────────────────────────────────────────────────────────────────

function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeInCubic(t: number): number {
  return t * t * t
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// ── Phase identifier (exported for debug HUD) ─────────────────────────────────
export type CameraPhaseId =
  | 'intro'
  | 'sun-hold'
  | 'sun-depart'
  | 'mercury-approach'
  | 'mercury-hold'
  | 'mercury-depart'
  | 'venus-approach'
  | 'venus-hold'
  | 'earth-approach'
  | 'earth-hold'
  | 'moon-approach'
  | 'moon-hold'
  | 'mars-approach'
  | 'mars-hold'
  | 'neptune-approach'
  | 'neptune-hold'
  | 'uranus-approach'
  | 'uranus-hold'
  | 'blackhole-approach'
  | 'blackhole-hold'
  | 'blackhole-cinematic-departure'
  | 'blackhole-cinematic-warp'
  | 'blackhole-cinematic-reveal'
  | 'blackhole-reset-dive'
  | 'blackhole-reset-consume'
  | 'blackhole-reset-reappear'
  | 'reset-loop'
  | 'transit'

export type ShotPhaseId = 'sun' | 'transition' | 'mercury-hold' | 'venus-hold' | 'earth-hold' | 'moon-hold' | 'mars-hold' | 'neptune-hold' | 'uranus-hold' | 'blackhole-hold'

// ── Focus node ─────────────────────────────────────────────────────────────────

interface FocusNode {
  camera: THREE.Vector3
  lookAt: THREE.Vector3
}

function createFocusNode(cfg: PlanetConfig): FocusNode {
  return {
    camera: new THREE.Vector3(
      cfg.position[0] + cfg.cameraOffsetX,
      cfg.position[1] + cfg.cameraOffsetY,
      cfg.position[2] + cfg.cameraOffsetZ,
    ),
    lookAt: new THREE.Vector3(
      cfg.position[0] + cfg.lookAtOffsetX,
      cfg.position[1] + cfg.lookAtOffsetY,
      cfg.position[2] + cfg.lookAtOffsetZ,
    ),
  }
}

function createFocusNodeById(id: PlanetId): FocusNode {
  const cfg = PLANET_MAP.get(id) ?? PLANET_REGISTRY[0]
  return createFocusNode(cfg)
}

// ── Phase resolution ──────────────────────────────────────────────────────────

function resolvePhase(p: number, planet: PlanetConfig): 'approach' | 'hold' | 'depart' {
  if (p < planet.settleStart) return 'approach'
  if (p < planet.departStart) return 'hold'
  return 'depart'
}

function phaseProgress(p: number, planet: PlanetConfig, phase: 'approach' | 'hold' | 'depart'): number {
  if (phase === 'approach') {
    const len = planet.settleStart - planet.approachStart
    return len > 0 ? THREE.MathUtils.clamp((p - planet.approachStart) / len, 0, 1) : 1
  }
  if (phase === 'hold') {
    const len = planet.departStart - planet.settleStart
    return len > 0 ? THREE.MathUtils.clamp((p - planet.settleStart) / len, 0, 1) : 1
  }
  const len = planet.focusEnd - planet.departStart
  return len > 0 ? THREE.MathUtils.clamp((p - planet.departStart) / len, 0, 1) : 1
}

// ── CameraRig props ───────────────────────────────────────────────────────────

export interface CameraRigShotProps {
  currentShotId?: ShotId
  nextShotId?: ShotId
  shotProgress?: number
}

export interface CameraRigProps extends CameraRigShotProps {
  progress?: number
  activePlanetId?: PlanetId
  onPhaseChange?: (phase: CameraPhaseId) => void
  onShotPhaseChange?: (shotPhase: ShotPhaseId) => void
  // Discrete navigation — provided by useDiscreteShotNavigation
  discreteCurrentShotId?:   DiscreteShotId
  discreteTargetShotId?:    DiscreteShotId | null
  discreteIsTransitioning?:  boolean
  /** True while the reset loop (blackhole → sun) is executing */
  discreteIsResetting?:      boolean
  discreteTransitionTRef?:   RefObject<number>
  /** Ref — read to consider transition active same-frame (avoids 1–2 frame delay until state updates) */
  discreteIsTransitioningRef?: RefObject<boolean>
  /** Ref — target shot during transition when state has not updated yet */
  discreteTargetShotIdRef?:   RefObject<DiscreteShotId | null>
  /** Ref — current shot during transition when state has not updated yet */
  discreteCurrentShotIdRef?:  RefObject<DiscreteShotId>
  onDiscreteTransitionComplete?: () => void
  // Blackhole cinematic transition
  isBlackholeCinematic?:            boolean
  /** Ref — read same-frame so the cinematic branch runs on the first frame (avoids 1-frame lag) */
  isBlackholeCinematicRef?:         RefObject<boolean>
  blackholeCinematicTRef?:          RefObject<number>
  onBlackholeCinematicComplete?:    () => void
  onBlackholeCinematicPhaseChange?: (phase: BlackholeCinematicPhase) => void
  // Blackhole reset cinematic (enter blackhole → then Sun)
  isBlackholeResetting?:            boolean
  blackholeResetTRef?:              RefObject<number>
  onBlackholeResetComplete?:        () => void
  onBlackholeResetPhaseChange?:     (phase: BlackholeResetPhase) => void
}

// ── Helper: get shot pose vectors from SHOT_MAP ───────────────────────────────

function getShotPose(id: DiscreteShotId): { cam: THREE.Vector3; look: THREE.Vector3 } {
  const shot = SHOT_MAP.get(id as ShotId)
  if (!shot) {
    if (import.meta.env.DEV) {
      console.error(`[CameraRig] getShotPose: no shot found for id="${id}". SHOT_MAP keys:`, [...SHOT_MAP.keys()])
    }
    // Safe fallback — return Sun pose so camera doesn't fly to NaN
    const sun = SHOT_MAP.get('sun')!
    return {
      cam:  new THREE.Vector3(...sun.cameraPosition),
      look: new THREE.Vector3(...sun.lookAt),
    }
  }
  return {
    cam:  new THREE.Vector3(...shot.cameraPosition),
    look: new THREE.Vector3(...shot.lookAt),
  }
}

// ── CameraRig ─────────────────────────────────────────────────────────────────

export function CameraRig({
  progress = 0,
  activePlanetId,
  onPhaseChange,
  onShotPhaseChange,
  currentShotId: _legacyShotId,
  nextShotId: _nextShotId,
  shotProgress: _shotProgress = 0,
  // Discrete
  discreteCurrentShotId   = 'sun',
  discreteTargetShotId    = null,
  discreteIsTransitioning  = false,
  discreteIsResetting      = false,
  discreteTransitionTRef,
  discreteIsTransitioningRef,
  discreteTargetShotIdRef,
  discreteCurrentShotIdRef,
  onDiscreteTransitionComplete,
  // Blackhole cinematic
  isBlackholeCinematic             = false,
  isBlackholeCinematicRef,
  blackholeCinematicTRef,
  onBlackholeCinematicComplete,
  onBlackholeCinematicPhaseChange,
  // Blackhole reset cinematic
  isBlackholeResetting             = false,
  blackholeResetTRef,
  onBlackholeResetComplete,
  onBlackholeResetPhaseChange,
}: CameraRigProps) {
  const sunNode        = createFocusNodeById('sun')
  const desiredPos     = useRef(sunNode.camera.clone())
  const desiredLat     = useRef(sunNode.lookAt.clone())
  const lookAtSmoothed = useRef(sunNode.lookAt.clone())
  const mountTimeRef   = useRef<number | null>(null)
  const lastPhaseRef   = useRef<CameraPhaseId>('intro')
  const lastShotPhaseRef = useRef<ShotPhaseId>('sun')

  // Cinematic: track last reported phase to avoid redundant setState calls
  const lastCinematicPhaseRef = useRef<BlackholeCinematicPhase>('departure')

  // Cinematic refs — computed once at the start of each cinematic run (raw === 0).
  // voidLook: where the camera looks during departure (left + deep void).
  // warpDir:  unit vector from Uranus cam toward Blackhole cam (straight-line travel).
  // warpEndPos / warpEndLook: camera state at the moment warp ends (start of reveal).
  const voidLookRef    = useRef(new THREE.Vector3())
  const warpDirRef     = useRef(new THREE.Vector3())
  const warpEndPosRef  = useRef(new THREE.Vector3())
  const warpEndLookRef = useRef(new THREE.Vector3())

  // Reset cinematic: track last reported phase to avoid redundant setState
  const lastResetPhaseRef = useRef<BlackholeResetPhase>('dive')

  // Cached shot poses (computed once, stable across frames)
  const sunPose       = getShotPose('sun')
  const mercPose      = getShotPose('mercury')
  const venusPose     = getShotPose('venus')
  const earthPose     = getShotPose('earth')
  const moonPose      = getShotPose('moon')
  const marsPose      = getShotPose('mars')
  const neptunePose   = getShotPose('neptune')
  const uranusPose    = getShotPose('uranus')
  const blackholePose = getShotPose('blackhole')

  useFrame((state, delta) => {
    const cam = state.camera
    const p   = THREE.MathUtils.clamp(progress, 0, 1)

    // ── Intro ─────────────────────────────────────────────────────────────────
    // PRESERVED VERBATIM. DO NOT MODIFY.
    if (mountTimeRef.current === null) {
      mountTimeRef.current = state.clock.elapsedTime
      cam.position.copy(INTRO_START)
    }
    const elapsed = state.clock.elapsedTime - mountTimeRef.current
    const introT  = THREE.MathUtils.clamp(
      THREE.MathUtils.smootherstep(elapsed, 0, INTRO_DURATION),
      0, 1,
    )

    // ── Discrete path (Sun → Mercury → Venus) ─────────────────────────────────
    //
    // This path handles 'sun', 'mercury', and 'venus' shots with discrete
    // transitions. The camera pose is determined SOLELY by discreteCurrentShotId,
    // discreteTargetShotId, and the transitionT value — NOT by scroll position.
    //
    // Exceptions: the Sun intro sweep still uses introT (preserved verbatim).

    const inBlackholeCinematic = isBlackholeCinematic || isBlackholeCinematicRef?.current === true
    const isOnDiscretePath =
      discreteCurrentShotId === 'sun'       ||
      discreteCurrentShotId === 'mercury'   ||
      discreteCurrentShotId === 'venus'     ||
      discreteCurrentShotId === 'earth'     ||
      discreteCurrentShotId === 'moon'      ||
      discreteCurrentShotId === 'mars'      ||
      discreteCurrentShotId === 'neptune'   ||
      discreteCurrentShotId === 'uranus'    ||
      discreteCurrentShotId === 'blackhole' ||
      discreteIsTransitioning               ||
      discreteIsResetting                   ||
      inBlackholeCinematic                 ||
      isBlackholeResetting

    if (isOnDiscretePath) {

      let posDamp = DAMP_HOLD

      // ── Blackhole cinematic transition (Uranus → Blackhole) ───────────────
      //
      // Three narrative phases:
      //   A) departure (0.00→0.20): camera stays near Uranus, lookAt rotates LEFT
      //      toward the void — the "turn away" moment.
      //   B) warp     (0.20→0.85): camera accelerates in a straight line toward
      //      Blackhole, lookAt tracks the travel direction (not BH yet).
      //      Overlay shows speed-of-light streaks.
      //   C) reveal   (0.85→1.00): camera decelerates into the exact blackholePose.
      //      Streaks fade, Blackhole appears.
      if (inBlackholeCinematic && blackholeCinematicTRef) {
        // Advance cinematic T
        const raw  = blackholeCinematicTRef.current
        const next = Math.min(1, raw + delta * CINEMATIC_SPEED)
        blackholeCinematicTRef.current = next

        // ── One-time setup at the very first frame (raw === 0) ────────────
        if (raw === 0) {
          // voidLook: far LEFT and DEEP so Uranus is fully off-frame by end of departure.
          // Uranus at [22, -1, -328]; cam at [16, -1, -319.5]. Aggressive offset so
          // the camera looks at empty void with no planet in view.
          voidLookRef.current
            .copy(uranusPose.cam)
            .add(new THREE.Vector3(-50, 0, -70))

          // warpDir: normalised direction from Uranus cam to Blackhole cam.
          // The camera travels along this axis during warp.
          warpDirRef.current
            .subVectors(blackholePose.cam, uranusPose.cam)
            .normalize()
        }

        let cinPhase: BlackholeCinematicPhase
        let camPos: THREE.Vector3
        let lookPos: THREE.Vector3

        if (next < CINEMATIC_DEPARTURE_END) {
          // ── Phase A — Departure ──────────────────────────────────────────
          // Position: nearly static at Uranus cam (very slight forward drift).
          // LookAt: rotates from uranusPose.look → voidLook (easeInOutCubic).
          cinPhase = 'departure'
          const localT = easeInOutCubic(next / CINEMATIC_DEPARTURE_END)

          // Tiny forward nudge so the camera doesn't feel completely frozen
          const nudge = localT * 1.5
          camPos = new THREE.Vector3()
            .copy(uranusPose.cam)
            .addScaledVector(warpDirRef.current, nudge)

          lookPos = new THREE.Vector3().lerpVectors(
            uranusPose.look,
            voidLookRef.current,
            localT,
          )

        } else if (next < CINEMATIC_WARP_END) {
          // ── Phase B — Warp ───────────────────────────────────────────────
          // Position: straight-line travel from Uranus cam toward Blackhole cam.
          //   Uses easeInCubic so the camera accelerates hard at the start.
          // LookAt: always points ahead along the travel direction (not at BH).
          //   This keeps the "tunnel" feel — the destination is not yet revealed.
          cinPhase = 'warp'
          const warpLocalT = (next - CINEMATIC_DEPARTURE_END) /
                             (CINEMATIC_WARP_END - CINEMATIC_DEPARTURE_END)
          const easedT = easeInCubic(warpLocalT)

          // Travel only 30% of the distance during warp; the remaining 70% is for reveal.
          // This keeps the Blackhole far away during warp (not yet visible) and
          // gives the reveal phase a long deceleration arc — the camera rushes in
          // from far away and brakes dramatically into the final shot.
          const totalDist = uranusPose.cam.distanceTo(blackholePose.cam)
          const travelDist = totalDist * 0.30 * easedT

          camPos = new THREE.Vector3()
            .copy(uranusPose.cam)
            .addScaledVector(warpDirRef.current, travelDist)

          // LookAt: current position + warpDir × 50u (far ahead in the tunnel)
          lookPos = new THREE.Vector3()
            .copy(camPos)
            .addScaledVector(warpDirRef.current, 50)

          // Store warp-end state so reveal can start from here seamlessly
          warpEndPosRef.current.copy(camPos)
          warpEndLookRef.current.copy(lookPos)

        } else {
          // ── Phase C — Reveal ─────────────────────────────────────────────
          // Position: lerp from warpEndPos → exact blackholePose.cam (easeOutCubic).
          // LookAt: lerp from warpEndLook → blackholePose.look (easeOutCubic).
          // The camera decelerates dramatically as Blackhole fills the frame.
          cinPhase = 'reveal'
          const revLocalT = (next - CINEMATIC_WARP_END) / (1.0 - CINEMATIC_WARP_END)
          const easedT = easeOutCubic(revLocalT)

          camPos = new THREE.Vector3().lerpVectors(
            warpEndPosRef.current,
            blackholePose.cam,
            easedT,
          )
          lookPos = new THREE.Vector3().lerpVectors(
            warpEndLookRef.current,
            blackholePose.look,
            easedT,
          )
        }

        // Apply camera directly — no damp lag during cinematic
        cam.position.copy(camPos)
        lookAtSmoothed.current.copy(lookPos)
        cam.lookAt(lookAtSmoothed.current)

        // Keep desiredPos/desiredLat in sync for the hold phase that follows
        desiredPos.current.copy(cam.position)
        desiredLat.current.copy(lookAtSmoothed.current)

        // Report phase change to React (for HUD) — only when phase changes
        if (cinPhase !== lastCinematicPhaseRef.current) {
          lastCinematicPhaseRef.current = cinPhase
          onBlackholeCinematicPhaseChange?.(cinPhase)
        }

        // Debug phase label
        if (import.meta.env.DEV && onPhaseChange) {
          const phaseId: CameraPhaseId =
            cinPhase === 'departure' ? 'blackhole-cinematic-departure' :
            cinPhase === 'warp'      ? 'blackhole-cinematic-warp'      :
                                       'blackhole-cinematic-reveal'
          if (phaseId !== lastPhaseRef.current) { lastPhaseRef.current = phaseId; onPhaseChange(phaseId) }
        }
        if (import.meta.env.DEV && onShotPhaseChange) {
          const sp: ShotPhaseId = 'transition'
          if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
        }

        // Complete
        if (next >= 1) {
          onBlackholeCinematicComplete?.()
        }

        return  // camera already applied — skip rest
      }

      // ── Blackhole reset cinematic (Blackhole hold → enter simulation → Sun) ─
      // dive: camera pushes toward blackhole center; consume: dark hold; reappear: cut to Sun, overlay fades.
      if (isBlackholeResetting && blackholeResetTRef) {
        const raw  = blackholeResetTRef.current
        const speed = raw < RESET_CONSUME_END ? RESET_CINEMATIC_SPEED : RESET_REAPPEAR_SPEED
        const next = Math.min(1, raw + delta * speed)
        blackholeResetTRef.current = next

        let resetPhase: BlackholeResetPhase
        let camPos: THREE.Vector3
        let lookPos: THREE.Vector3

        if (next < RESET_DIVE_END) {
          // ── Dive: camera moves from blackhole hold pose toward blackhole center ─
          resetPhase = 'dive'
          const localT = easeInCubic(next / RESET_DIVE_END)
          // Move position 95% of the way toward lookAt so the sphere dominates the frame
          camPos = new THREE.Vector3().lerpVectors(
            blackholePose.cam,
            blackholePose.look,
            0.95 * localT,
          )
          lookPos = blackholePose.look.clone()

        } else if (next < RESET_CONSUME_END) {
          // ── Consume: hold at extreme close, black sphere fills frame ─
          resetPhase = 'consume'
          camPos = new THREE.Vector3().lerpVectors(
            blackholePose.cam,
            blackholePose.look,
            0.95,
          )
          lookPos = blackholePose.look.clone()

        } else {
          // ── Reappear: same intro sweep (INTRO_START → sun hold); overlay fades out ─
          resetPhase = 'reappear'
          const localT = (next - RESET_CONSUME_END) / (1 - RESET_CONSUME_END)
          const reintroT = THREE.MathUtils.clamp(
            THREE.MathUtils.smootherstep(localT, 0, 1),
            0,
            1,
          )
          camPos = new THREE.Vector3().lerpVectors(INTRO_START, sunPose.cam, reintroT)
          lookPos = sunPose.look.clone()
        }

        cam.position.copy(camPos)
        lookAtSmoothed.current.copy(lookPos)
        cam.lookAt(lookAtSmoothed.current)
        desiredPos.current.copy(cam.position)
        desiredLat.current.copy(lookAtSmoothed.current)

        if (resetPhase !== lastResetPhaseRef.current) {
          lastResetPhaseRef.current = resetPhase
          onBlackholeResetPhaseChange?.(resetPhase)
        }
        if (import.meta.env.DEV && onPhaseChange) {
          const phaseId: CameraPhaseId =
            resetPhase === 'dive'     ? 'blackhole-reset-dive'     :
            resetPhase === 'consume'  ? 'blackhole-reset-consume'  :
                                        'blackhole-reset-reappear'
          if (phaseId !== lastPhaseRef.current) { lastPhaseRef.current = phaseId; onPhaseChange(phaseId) }
        }
        if (import.meta.env.DEV && onShotPhaseChange) {
          const sp: ShotPhaseId = 'transition'
          if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
        }

        if (next >= 1) {
          onBlackholeResetComplete?.()
        }

        return
      }

      const effectiveTransitioning = discreteIsTransitioning || discreteIsTransitioningRef?.current
      const effectiveTarget = discreteTargetShotId ?? discreteTargetShotIdRef?.current ?? null
      const effectiveCurrent = discreteCurrentShotId ?? discreteCurrentShotIdRef?.current ?? discreteCurrentShotId
      // Do not run normal transition when blackhole cinematic is active (ref set); avoids completing Uranus→Blackhole in one frame.
      if (effectiveTransitioning && !inBlackholeCinematic && discreteTransitionTRef && effectiveTarget !== null) {
        // Advance transitionT — same speed for all except Venus↔Earth (arc).
        const isVenusEarth =
          (effectiveCurrent === 'venus' && effectiveTarget === 'earth') ||
          (effectiveCurrent === 'earth' && effectiveTarget === 'venus')
        const speed = isVenusEarth ? TRANSITION_SPEED_VENUS_EARTH : TRANSITION_SPEED
        const raw = discreteTransitionTRef.current
        const next = Math.min(1, raw + delta * speed)
        discreteTransitionTRef.current = next
        
        // Eased t — same curve for all transitions (including Neptune↔Uranus).
        const t = easeInOutCubic(next)

        // Resolve FROM and TO poses based on the transition direction.
        // targetShotId tells us where we're going; currentShotId is where we were.
        let fromCam:  THREE.Vector3
        let toCam:    THREE.Vector3
        let fromLook: THREE.Vector3
        let toLook:   THREE.Vector3

        if (effectiveTarget === 'blackhole') {
          // uranus → blackhole
          fromCam  = uranusPose.cam;    toCam  = blackholePose.cam
          fromLook = uranusPose.look;   toLook = blackholePose.look
        } else if (effectiveTarget === 'uranus') {
          // neptune → uranus  OR  blackhole → uranus
          if (effectiveCurrent === 'blackhole') {
            fromCam  = blackholePose.cam;  toCam  = uranusPose.cam
            fromLook = blackholePose.look; toLook = uranusPose.look
          } else {
            // neptune → uranus
            fromCam  = neptunePose.cam;  toCam  = uranusPose.cam
            fromLook = neptunePose.look; toLook = uranusPose.look
          }
        } else if (effectiveTarget === 'neptune') {
          // mars → neptune  OR  uranus → neptune
          if (effectiveCurrent === 'uranus') {
            fromCam  = uranusPose.cam;  toCam  = neptunePose.cam
            fromLook = uranusPose.look; toLook = neptunePose.look
          } else {
            // mars → neptune
            fromCam  = marsPose.cam;  toCam  = neptunePose.cam
            fromLook = marsPose.look; toLook = neptunePose.look
          }
        } else if (effectiveTarget === 'mars') {
          // moon → mars  OR  neptune → mars
          if (effectiveCurrent === 'neptune') {
            fromCam  = neptunePose.cam;  toCam  = marsPose.cam
            fromLook = neptunePose.look; toLook = marsPose.look
          } else {
            // moon → mars
            fromCam  = moonPose.cam;  toCam  = marsPose.cam
            fromLook = moonPose.look; toLook = marsPose.look
          }
        } else if (effectiveTarget === 'moon') {
          // earth → moon  OR  mars → moon
          if (effectiveCurrent === 'mars') {
            fromCam  = marsPose.cam;  toCam  = moonPose.cam
            fromLook = marsPose.look; toLook = moonPose.look
          } else {
            // earth → moon
            fromCam  = earthPose.cam;  toCam  = moonPose.cam
            fromLook = earthPose.look; toLook = moonPose.look
          }
        } else if (effectiveTarget === 'earth') {
          // venus → earth  OR  moon → earth
          if (effectiveCurrent === 'moon') {
            fromCam  = moonPose.cam;  toCam  = earthPose.cam
            fromLook = moonPose.look; toLook = earthPose.look
          } else {
            // venus → earth
            fromCam  = venusPose.cam;  toCam  = earthPose.cam
            fromLook = venusPose.look; toLook = earthPose.look
          }
        } else if (effectiveTarget === 'venus') {
          // mercury → venus  OR  earth → venus
          if (effectiveCurrent === 'earth') {
            fromCam  = earthPose.cam;  toCam  = venusPose.cam
            fromLook = earthPose.look; toLook = venusPose.look
          } else {
            // mercury → venus
            fromCam  = mercPose.cam;  toCam  = venusPose.cam
            fromLook = mercPose.look; toLook = venusPose.look
          }
        } else if (effectiveTarget === 'mercury') {
          // sun → mercury  OR  venus → mercury
          if (discreteCurrentShotId === 'venus') {
            fromCam  = venusPose.cam;  toCam  = mercPose.cam
            fromLook = venusPose.look; toLook = mercPose.look
          } else {
            // sun → mercury
            fromCam  = sunPose.cam;  toCam  = mercPose.cam
            fromLook = sunPose.look; toLook = mercPose.look
          }
        } else if (effectiveTarget === 'sun' && effectiveCurrent === 'mercury' && !discreteIsResetting) {
          // mercury → sun (inverse of sun → mercury)
          fromCam  = mercPose.cam;  toCam  = sunPose.cam
          fromLook = mercPose.look; toLook = sunPose.look
        } else if (effectiveTarget === 'sun' || discreteIsResetting) {
          // reset loop: blackhole → sun
          fromCam  = blackholePose.cam;  toCam  = sunPose.cam
          fromLook = blackholePose.look; toLook = sunPose.look
        } else {
          // fallback (e.g. mercury → sun if logic ever diverges)
          fromCam  = mercPose.cam;  toCam  = sunPose.cam
          fromLook = mercPose.look; toLook = sunPose.look
        }

        // Venus ↔ Earth: arc around Venus instead of passing through it.
        if (isVenusEarth) {
          const curve =
            effectiveTarget === 'earth'
              ? new THREE.QuadraticBezierCurve3(venusPose.cam, VENUS_EARTH_ARC_WAYPOINT, earthPose.cam)
              : new THREE.QuadraticBezierCurve3(earthPose.cam, VENUS_EARTH_ARC_WAYPOINT, venusPose.cam)
          cam.position.copy(curve.getPoint(t))
        } else {
          cam.position.lerpVectors(fromCam, toCam, t)
        }

        // Direct assignment — easeInOutCubic already provides smooth motion.
        // No damp here: damp would lag behind and leave the camera off-pose
        // after the transition ends.
        lookAtSmoothed.current.lerpVectors(fromLook, toLook, t)
        cam.lookAt(lookAtSmoothed.current)

        // Also keep desiredPos/desiredLat in sync so the hold phase below
        // starts from the correct target when transitioning finishes.
        desiredPos.current.copy(cam.position)
        desiredLat.current.copy(lookAtSmoothed.current)

        // Transition complete
        if (next >= 1) {
          onDiscreteTransitionComplete?.()
        }

        // Debug
        if (import.meta.env.DEV) {
          if (onPhaseChange) {
            const id: CameraPhaseId =
              discreteIsResetting                    ? 'reset-loop'         :
              effectiveTarget === 'blackhole'   ? 'blackhole-approach' :
              effectiveTarget === 'uranus'      ? 'uranus-approach'    :
              effectiveTarget === 'neptune'     ? 'neptune-approach'   :
              effectiveTarget === 'mars'        ? 'mars-approach'      :
              effectiveTarget === 'moon'        ? 'moon-approach'      :
              effectiveTarget === 'earth'       ? 'earth-approach'     :
              effectiveTarget === 'venus'       ? 'venus-approach'     :
              'mercury-approach'
            if (id !== lastPhaseRef.current) { lastPhaseRef.current = id; onPhaseChange(id) }
          }
          if (onShotPhaseChange) {
            const sp: ShotPhaseId = 'transition'
            if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
          }
        }

        return  // camera already applied above — skip the damp block at the end

      } else if (discreteCurrentShotId === 'blackhole') {
        // Idle at Blackhole hold pose — grand finale, snappy settle
        desiredPos.current.copy(blackholePose.cam)
        desiredLat.current.copy(blackholePose.look)
        posDamp = DAMP_HOLD * 2.5  // 4.0 — settles in ~1.1s

        if (import.meta.env.DEV) {
          if (onPhaseChange) {
            const id: CameraPhaseId = 'blackhole-hold'
            if (id !== lastPhaseRef.current) { lastPhaseRef.current = id; onPhaseChange(id) }
          }
          if (onShotPhaseChange) {
            const sp: ShotPhaseId = 'blackhole-hold'
            if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
          }
        }

      } else if (discreteCurrentShotId === 'uranus') {
        // Idle at Uranus hold pose — snappy damp, same as other planets
        desiredPos.current.copy(uranusPose.cam)
        desiredLat.current.copy(uranusPose.look)
        posDamp = DAMP_HOLD * 2.5  // 4.0 — settles in ~1.1s

        if (import.meta.env.DEV) {
          if (onPhaseChange) {
            const id: CameraPhaseId = 'uranus-hold'
            if (id !== lastPhaseRef.current) { lastPhaseRef.current = id; onPhaseChange(id) }
          }
          if (onShotPhaseChange) {
            const sp: ShotPhaseId = 'uranus-hold'
            if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
          }
        }

      } else if (discreteCurrentShotId === 'neptune') {
        // Idle at Neptune hold pose — snappy damp, same as other planets
        desiredPos.current.copy(neptunePose.cam)
        desiredLat.current.copy(neptunePose.look)
        posDamp = DAMP_HOLD * 2.5  // 4.0 — settles in ~1.1s

        if (import.meta.env.DEV) {
          if (onPhaseChange) {
            const id: CameraPhaseId = 'neptune-hold'
            if (id !== lastPhaseRef.current) { lastPhaseRef.current = id; onPhaseChange(id) }
          }
          if (onShotPhaseChange) {
            const sp: ShotPhaseId = 'neptune-hold'
            if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
          }
        }

      } else if (discreteCurrentShotId === 'mars') {
        // Idle at Mars hold pose — snappy damp, same as other planets
        desiredPos.current.copy(marsPose.cam)
        desiredLat.current.copy(marsPose.look)
        posDamp = DAMP_HOLD * 2.5  // 4.0 — settles in ~1.1s

        if (import.meta.env.DEV) {
          if (onPhaseChange) {
            const id: CameraPhaseId = 'mars-hold'
            if (id !== lastPhaseRef.current) { lastPhaseRef.current = id; onPhaseChange(id) }
          }
          if (onShotPhaseChange) {
            const sp: ShotPhaseId = 'mars-hold'
            if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
          }
        }

      } else if (discreteCurrentShotId === 'moon') {
        // Idle at Moon hold pose — snappy damp, same as other planets
        desiredPos.current.copy(moonPose.cam)
        desiredLat.current.copy(moonPose.look)
        posDamp = DAMP_HOLD * 2.5  // 4.0 — settles in ~1.1s

        if (import.meta.env.DEV) {
          if (onPhaseChange) {
            const id: CameraPhaseId = 'moon-hold'
            if (id !== lastPhaseRef.current) { lastPhaseRef.current = id; onPhaseChange(id) }
          }
          if (onShotPhaseChange) {
            const sp: ShotPhaseId = 'moon-hold'
            if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
          }
        }

      } else if (discreteCurrentShotId === 'earth') {
        // Idle at Earth hold pose — snappy damp, same as other planets
        desiredPos.current.copy(earthPose.cam)
        desiredLat.current.copy(earthPose.look)
        posDamp = DAMP_HOLD * 2.5  // 4.0 — settles in ~1.1s

        if (import.meta.env.DEV) {
          if (onPhaseChange) {
            const id: CameraPhaseId = 'earth-hold'
            if (id !== lastPhaseRef.current) { lastPhaseRef.current = id; onPhaseChange(id) }
          }
          if (onShotPhaseChange) {
            const sp: ShotPhaseId = 'earth-hold'
            if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
          }
        }

      } else if (discreteCurrentShotId === 'venus') {
        // Idle at Venus hold pose — snappy damp so camera settles quickly
        desiredPos.current.copy(venusPose.cam)
        desiredLat.current.copy(venusPose.look)
        posDamp = DAMP_HOLD * 2.5  // 4.0 — settles in ~1.1s

        if (import.meta.env.DEV) {
          if (onPhaseChange) {
            const id: CameraPhaseId = 'venus-hold'
            if (id !== lastPhaseRef.current) { lastPhaseRef.current = id; onPhaseChange(id) }
          }
          if (onShotPhaseChange) {
            const sp: ShotPhaseId = 'venus-hold'
            if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
          }
        }

      } else if (discreteCurrentShotId === 'mercury') {
        // Idle at Mercury hold pose — snappy damp so camera settles quickly
        desiredPos.current.copy(mercPose.cam)
        desiredLat.current.copy(mercPose.look)
        posDamp = DAMP_HOLD * 2.5  // 4.0 — settles in ~1.1s instead of ~2.9s

        if (import.meta.env.DEV) {
          if (onPhaseChange) {
            const id: CameraPhaseId = 'mercury-hold'
            if (id !== lastPhaseRef.current) { lastPhaseRef.current = id; onPhaseChange(id) }
          }
          if (onShotPhaseChange) {
            const sp: ShotPhaseId = 'mercury-hold'
            if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
          }
        }

      } else {
        // Idle at Sun hold pose — intro sweep still applies
        desiredPos.current.copy(sunPose.cam)
        desiredLat.current.copy(sunPose.look)
        posDamp = introT < 1 ? DAMP_INTRO : DAMP_HOLD

        if (import.meta.env.DEV) {
          if (onPhaseChange) {
            const id: CameraPhaseId = introT < 0.99 ? 'intro' : 'sun-hold'
            if (id !== lastPhaseRef.current) { lastPhaseRef.current = id; onPhaseChange(id) }
          }
          if (onShotPhaseChange) {
            const sp: ShotPhaseId = 'sun'
            if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
          }
        }
      }

      // Apply camera position.
      // For the Sun idle state, blend from INTRO_START using introT (preserves the intro sweep).
      const applyIntro = discreteCurrentShotId === 'sun' && !discreteIsTransitioning

      const targetPos = applyIntro
        ? new THREE.Vector3().lerpVectors(INTRO_START, desiredPos.current, introT)
        : desiredPos.current

      cam.position.x = THREE.MathUtils.damp(cam.position.x, targetPos.x, posDamp, delta)
      cam.position.y = THREE.MathUtils.damp(cam.position.y, targetPos.y, posDamp, delta)
      cam.position.z = THREE.MathUtils.damp(cam.position.z, targetPos.z, posDamp, delta)

      lookAtSmoothed.current.x = THREE.MathUtils.damp(lookAtSmoothed.current.x, desiredLat.current.x, DAMP_LOOK_AT, delta)
      lookAtSmoothed.current.y = THREE.MathUtils.damp(lookAtSmoothed.current.y, desiredLat.current.y, DAMP_LOOK_AT, delta)
      lookAtSmoothed.current.z = THREE.MathUtils.damp(lookAtSmoothed.current.z, desiredLat.current.z, DAMP_LOOK_AT, delta)

      cam.lookAt(lookAtSmoothed.current)
      return  // Discrete path handled — skip legacy code
    }

    // ── LEGACY PATH (future planets not yet wired to discrete system) ──────────
    // Unchanged. Only reached when discreteCurrentShotId is something other than
    // 'sun', 'mercury', or 'venus' — which currently never happens since the
    // discrete system starts at 'sun'. Preserved for future planet migration.

    void getShotById(_legacyShotId ?? 'sun')  // keep import alive

    const activePlanet = PLANET_MAP.get(activePlanetId ?? 'sun') ?? PLANET_REGISTRY[0]
    const nextPlanet   = getNextPlanetById(activePlanet.id)
    const phase        = resolvePhase(p, activePlanet)
    const phaseT       = phaseProgress(p, activePlanet, phase)
    const activeNode   = createFocusNode(activePlanet)

    if (phase === 'approach') {
      const prevPlanetIdx = PLANET_REGISTRY.findIndex((c) => c.id === activePlanet.id) - 1
      const prevNode = prevPlanetIdx >= 0
        ? createFocusNode(PLANET_REGISTRY[prevPlanetIdx])
        : activeNode
      const t = THREE.MathUtils.smootherstep(phaseT, 0, 1)
      desiredPos.current.lerpVectors(prevNode.camera, activeNode.camera, t)
      desiredLat.current.lerpVectors(prevNode.lookAt,  activeNode.lookAt,  t)
    } else if (phase === 'hold') {
      desiredPos.current.copy(activeNode.camera)
      desiredLat.current.copy(activeNode.lookAt)
    } else {
      if (nextPlanet) {
        const nextNode = createFocusNode(nextPlanet)
        const t = THREE.MathUtils.smootherstep(phaseT, 0, 1)
        desiredPos.current.lerpVectors(activeNode.camera, nextNode.camera, t)
        desiredLat.current.lerpVectors(activeNode.lookAt,  nextNode.lookAt,  t)
      } else {
        desiredPos.current.copy(activeNode.camera)
        desiredLat.current.copy(activeNode.lookAt)
      }
    }

    let legacyPosDamp: number
    if (introT < 1) {
      legacyPosDamp = DAMP_INTRO
    } else if (phase === 'hold') {
      legacyPosDamp = DAMP_HOLD
    } else if (phase === 'depart') {
      legacyPosDamp = DAMP_DEPART
    } else {
      legacyPosDamp = DAMP_APPROACH
    }

    const legacyTargetPos = new THREE.Vector3().lerpVectors(INTRO_START, desiredPos.current, introT)
    cam.position.x = THREE.MathUtils.damp(cam.position.x, legacyTargetPos.x, legacyPosDamp, delta)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, legacyTargetPos.y, legacyPosDamp, delta)
    cam.position.z = THREE.MathUtils.damp(cam.position.z, legacyTargetPos.z, legacyPosDamp, delta)

    lookAtSmoothed.current.x = THREE.MathUtils.damp(lookAtSmoothed.current.x, desiredLat.current.x, DAMP_LOOK_AT, delta)
    lookAtSmoothed.current.y = THREE.MathUtils.damp(lookAtSmoothed.current.y, desiredLat.current.y, DAMP_LOOK_AT, delta)
    lookAtSmoothed.current.z = THREE.MathUtils.damp(lookAtSmoothed.current.z, desiredLat.current.z, DAMP_LOOK_AT, delta)

    cam.lookAt(lookAtSmoothed.current)

    if (import.meta.env.DEV) {
      if (onPhaseChange) {
        let phaseId: CameraPhaseId
        if (introT < 0.99) {
          phaseId = 'intro'
        } else if (activePlanet.id === 'sun') {
          phaseId = phase === 'hold' ? 'sun-hold' : 'sun-depart'
        } else {
          phaseId = 'transit'
        }
        if (phaseId !== lastPhaseRef.current) {
          lastPhaseRef.current = phaseId
          onPhaseChange(phaseId)
        }
      }
      if (onShotPhaseChange) {
        const shotPhase: ShotPhaseId = 'sun'
        if (shotPhase !== lastShotPhaseRef.current) {
          lastShotPhaseRef.current = shotPhase
          onShotPhaseChange(shotPhase)
        }
      }
    }
  })

  return null
}
