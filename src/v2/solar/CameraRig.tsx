/**
 * CameraRig — solar journey camera.
 *
 * Architecture (microfase 3 — discrete Sun ↔ Mercury)
 * ────────────────────────────────────────────────────
 * Sun ↔ Mercury navigation is now DISCRETE: the transition runs automatically
 * once triggered, driven by transitionT advancing in useFrame at a fixed speed.
 * It no longer depends on scroll scrub position.
 *
 * Shot routing:
 *   DISCRETE path (this file):
 *     'sun'     → intro sweep + Sun hold pose (VERBATIM, untouched)
 *     'mercury' → discrete transition from Sun pose to Mercury pose
 *
 *   LEGACY path (scroll-driven, unchanged for future planets):
 *     Everything else → planet-registry approach/hold/depart logic
 *
 * Discrete transition behaviour:
 *   - transitionTRef is a mutable ref owned by useDiscreteShotNavigation.
 *   - Each frame: transitionTRef.current += delta * TRANSITION_SPEED.
 *   - When transitionTRef.current >= 1 → call onTransitionComplete().
 *   - Easing: easeInOutCubic applied to the raw t.
 *   - Camera position and lookAt are lerped between Sun hold pose and Mercury hold pose.
 *
 * Sun intro: 100% preserved verbatim. DO NOT MODIFY.
 *
 * Exported types:
 *   CameraPhaseId        — debug HUD (unchanged)
 *   ShotPhaseId          — debug HUD (unchanged)
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
import type { RefObject } from 'react'

// ── Damp coefficients ──────────────────────────────────────────────────────────
const DAMP_APPROACH  = 3.0
const DAMP_HOLD      = 1.6
const DAMP_DEPART    = 3.5
const DAMP_LOOK_AT   = 4.5
const DAMP_INTRO     = 2.5

const INTRO_DURATION = 2.0   // seconds

// Intro start position — DO NOT CHANGE (preserves the Sun intro sweep).
const INTRO_START = new THREE.Vector3(18, 14, 22)

/**
 * Speed at which transitionT advances per second.
 * 0.6 → transition completes in ~1.67 s.
 * Feels cinematic without being sluggish.
 */
const TRANSITION_SPEED = 0.6

// ── Easing ────────────────────────────────────────────────────────────────────

function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ── Phase identifier (exported for debug HUD) ─────────────────────────────────
export type CameraPhaseId =
  | 'intro'
  | 'sun-hold'
  | 'sun-depart'
  | 'mercury-approach'
  | 'mercury-hold'
  | 'mercury-depart'
  | 'transit'

export type ShotPhaseId = 'sun' | 'transition' | 'mercury-hold'

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
  discreteCurrentShotId?:   'sun' | 'mercury'
  discreteTargetShotId?:    'sun' | 'mercury' | null
  discreteIsTransitioning?:  boolean
  discreteTransitionTRef?:   RefObject<number>
  onDiscreteTransitionComplete?: () => void
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
  discreteTransitionTRef,
  onDiscreteTransitionComplete,
}: CameraRigProps) {
  const sunNode        = createFocusNodeById('sun')
  const desiredPos     = useRef(sunNode.camera.clone())
  const desiredLat     = useRef(sunNode.lookAt.clone())
  const lookAtSmoothed = useRef(sunNode.lookAt.clone())
  const mountTimeRef   = useRef<number | null>(null)
  const lastPhaseRef   = useRef<CameraPhaseId>('intro')
  const lastShotPhaseRef = useRef<ShotPhaseId>('sun')

  // Cached shot poses (computed once, stable across frames)
  const sunShot  = SHOT_MAP.get('sun')!
  const mercShot = SHOT_MAP.get('mercury')!
  const sunCamPos  = new THREE.Vector3(...sunShot.cameraPosition)
  const sunLookAt  = new THREE.Vector3(...sunShot.lookAt)
  const mercCamPos = new THREE.Vector3(...mercShot.cameraPosition)
  const mercLookAt = new THREE.Vector3(...mercShot.lookAt)

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

    // ── Discrete Sun ↔ Mercury path ───────────────────────────────────────────
    //
    // This path handles 'sun' and 'mercury' shots with discrete transitions.
    // The camera pose is determined SOLELY by discreteCurrentShotId,
    // discreteTargetShotId, and the transitionT value — NOT by scroll position.
    //
    // Exceptions: the Sun intro sweep still uses introT (preserved verbatim).

    if (discreteCurrentShotId === 'sun' || discreteCurrentShotId === 'mercury' ||
        discreteIsTransitioning) {

      let posDamp = DAMP_HOLD

      if (discreteIsTransitioning && discreteTransitionTRef) {
        // Advance transitionT
        const raw = discreteTransitionTRef.current
        const next = Math.min(1, raw + delta * TRANSITION_SPEED)
        discreteTransitionTRef.current = next

        // Eased t — drives the lerp directly, no additional damp lag
        const t = easeInOutCubic(next)

        // Determine direction: going to mercury or back to sun?
        const fromCam  = discreteTargetShotId === 'mercury' ? sunCamPos  : mercCamPos
        const toCam    = discreteTargetShotId === 'mercury' ? mercCamPos : sunCamPos
        const fromLook = discreteTargetShotId === 'mercury' ? sunLookAt  : mercLookAt
        const toLook   = discreteTargetShotId === 'mercury' ? mercLookAt : sunLookAt

        // Direct assignment — easeInOutCubic already provides smooth motion.
        // No damp here: damp would lag behind and leave the camera off-pose
        // after the transition ends.
        cam.position.lerpVectors(fromCam, toCam, t)
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
            const id: CameraPhaseId = 'mercury-approach'
            if (id !== lastPhaseRef.current) { lastPhaseRef.current = id; onPhaseChange(id) }
          }
          if (onShotPhaseChange) {
            const sp: ShotPhaseId = 'transition'
            if (sp !== lastShotPhaseRef.current) { lastShotPhaseRef.current = sp; onShotPhaseChange(sp) }
          }
        }

        return  // camera already applied above — skip the damp block at the end

      } else if (discreteCurrentShotId === 'mercury') {
        // Idle at Mercury hold pose — snappy damp so camera settles quickly
        desiredPos.current.copy(mercCamPos)
        desiredLat.current.copy(mercLookAt)
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
        desiredPos.current.copy(sunCamPos)
        desiredLat.current.copy(sunLookAt)
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
    // 'sun' or 'mercury' — which currently never happens since discrete system
    // starts at 'sun'. Preserved for future planet migration.

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
