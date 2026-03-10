/**
 * CameraRig — scroll-driven camera for the solar journey.
 *
 * Architecture
 * ────────────
 * Every planet in PLANET_REGISTRY has a focus window [focusStart, focusEnd]
 * and three sub-phases:
 *   APPROACH  (approachStart → settleStart)  : camera drifts laterally toward planet
 *   HOLD      (settleStart  → departStart)   : camera settles, slow damp ("pause beat")
 *   DEPART    (departStart  → focusEnd)      : camera starts blending toward next planet
 *
 * For the HOLD phase a lower damp coefficient is used so the camera decelerates
 * noticeably — this is the "focus hold" that tells the user they've arrived.
 *
 * No setState per frame. All interpolation done via THREE.MathUtils.damp().
 * desiredPos / desiredLat are mutated refs; lookAtSmoothed is the smoothed target.
 *
 * Exported type: CameraPhaseId  (used by SolarScene debug badge)
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

// ── Damp coefficients ──────────────────────────────────────────────────────────
// APPROACH: normal travel speed — feels like flying through space.
const DAMP_APPROACH  = 3.0
// HOLD: slow settle — camera decelerates, giving the "pause beat" feel.
const DAMP_HOLD      = 1.6
// DEPART: slightly faster than approach so the hand-off feels decisive.
const DAMP_DEPART    = 3.5
// lookAt always tracks a bit faster than position for a natural feel.
const DAMP_LOOK_AT   = 4.5
// During the opening intro animation, override with a crisp damp.
const DAMP_INTRO     = 2.5

const INTRO_DURATION = 2.0   // seconds

// Intro start position: high up, further right, further back.
// The Sun focus node (final position) is [4, 0.5, 4.5], lookAt [3.5, 0, 0].
// Starting higher (+Y) and more to the right (+X) creates a "descend and
// settle" feel — the camera sweeps down-left into the close-up framing.
const INTRO_START = new THREE.Vector3(18, 14, 22)

// ── Phase identifier (exported for debug HUD) ─────────────────────────────────
export type CameraPhaseId =
  | 'intro'
  | 'sun-hold'
  | 'sun-depart'
  | 'mercury-approach'
  | 'mercury-hold'
  | 'mercury-depart'
  | 'transit'   // generic label for any other planet phase

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

// ── CameraRig ─────────────────────────────────────────────────────────────────

export interface CameraRigProps {
  progress?: number
  activePlanetId?: PlanetId
  /** Callback so SolarScene can display phase in the debug badge */
  onPhaseChange?: (phase: CameraPhaseId) => void
}

export function CameraRig({ progress = 0, activePlanetId, onPhaseChange }: CameraRigProps) {
  const sunNode        = createFocusNodeById('sun')
  const desiredPos     = useRef(sunNode.camera.clone())
  const desiredLat     = useRef(sunNode.lookAt.clone())
  const lookAtSmoothed = useRef(sunNode.lookAt.clone())
  const mountTimeRef   = useRef<number | null>(null)
  const lastPhaseRef   = useRef<CameraPhaseId>('intro')

  useFrame((state, delta) => {
    const cam = state.camera
    const p   = THREE.MathUtils.clamp(progress, 0, 1)

    // ── Intro ─────────────────────────────────────────────────────────────────
    if (mountTimeRef.current === null) {
      mountTimeRef.current = state.clock.elapsedTime
      cam.position.copy(INTRO_START)
    }
    const elapsed = state.clock.elapsedTime - mountTimeRef.current
    const introT  = THREE.MathUtils.clamp(
      THREE.MathUtils.smootherstep(elapsed, 0, INTRO_DURATION),
      0, 1,
    )

    // ── Active planet + phase ─────────────────────────────────────────────────
    const activePlanet = PLANET_MAP.get(activePlanetId ?? 'sun') ?? PLANET_REGISTRY[0]
    const nextPlanet   = getNextPlanetById(activePlanet.id)
    const phase        = resolvePhase(p, activePlanet)
    const phaseT       = phaseProgress(p, activePlanet, phase)

    // ── Desired camera position ───────────────────────────────────────────────
    // APPROACH: lerp from previous planet's depart node → active planet's hold node.
    // HOLD:     lock to active planet's hold node (slow damp does the rest).
    // DEPART:   lerp from active hold node → next planet's approach node.

    const activeNode = createFocusNode(activePlanet)

    if (phase === 'approach') {
      // Interpolate from the previous planet's focus node toward the active planet.
      // If there's no previous planet (e.g. sun), start from INTRO_START / sunNode.
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
      // DEPART: blend from active toward next.
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

    // ── Pick damp coefficient based on phase ──────────────────────────────────
    let posDamp: number
    if (introT < 1) {
      posDamp = DAMP_INTRO
    } else if (phase === 'hold') {
      posDamp = DAMP_HOLD
    } else if (phase === 'depart') {
      posDamp = DAMP_DEPART
    } else {
      posDamp = DAMP_APPROACH
    }

    // ── Blend intro start → scroll-driven position ────────────────────────────
    const targetPos = new THREE.Vector3().lerpVectors(INTRO_START, desiredPos.current, introT)

    cam.position.x = THREE.MathUtils.damp(cam.position.x, targetPos.x, posDamp, delta)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, targetPos.y, posDamp, delta)
    cam.position.z = THREE.MathUtils.damp(cam.position.z, targetPos.z, posDamp, delta)

    lookAtSmoothed.current.x = THREE.MathUtils.damp(lookAtSmoothed.current.x, desiredLat.current.x, DAMP_LOOK_AT, delta)
    lookAtSmoothed.current.y = THREE.MathUtils.damp(lookAtSmoothed.current.y, desiredLat.current.y, DAMP_LOOK_AT, delta)
    lookAtSmoothed.current.z = THREE.MathUtils.damp(lookAtSmoothed.current.z, desiredLat.current.z, DAMP_LOOK_AT, delta)

    cam.lookAt(lookAtSmoothed.current)

    // ── Debug phase reporting (DEV only, no setState) ─────────────────────────
    if (import.meta.env.DEV && onPhaseChange) {
      let phaseId: CameraPhaseId
      if (introT < 0.99) {
        phaseId = 'intro'
      } else if (activePlanet.id === 'sun') {
        phaseId = phase === 'hold' ? 'sun-hold' : 'sun-depart'
      } else if (activePlanet.id === 'mercury') {
        phaseId = phase === 'approach' ? 'mercury-approach'
                : phase === 'hold'     ? 'mercury-hold'
                : 'mercury-depart'
      } else {
        phaseId = 'transit'
      }
      if (phaseId !== lastPhaseRef.current) {
        lastPhaseRef.current = phaseId
        onPhaseChange(phaseId)
      }
    }
  })

  return null
}
