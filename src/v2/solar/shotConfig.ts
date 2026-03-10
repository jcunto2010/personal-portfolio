/**
 * shotConfig — Shot-based navigation architecture (microfase 2)
 *
 * Each "shot" is a narrative station in the solar journey.
 * A shot owns its scroll window, camera pose, and transition timing.
 *
 * Scroll ranges match the existing PLANET_REGISTRY focus windows EXACTLY so
 * the CameraRig can continue using planetRegistry data while we incrementally
 * migrate to full shot-based control.
 *
 * Sun shot: ALL values copied verbatim from PLANET_REGISTRY + CameraRig.tsx.
 *   - INTRO_START = [18, 14, 22]  (from CameraRig.tsx)
 *   - cameraOffset / lookAtOffset (from planetRegistry sun entry)
 *   - scroll window  [0.00 – 0.16]  (focusStart / focusEnd)
 *   - sub-phases     approachStart=0.00, settleStart=0.02, departStart=0.12
 *
 * Mercury shot: LIVE — driving visible camera behaviour as of microfase 2.
 *   CameraRig takes the shot-based path when currentShotId === 'mercury'.
 *
 * [NV] Microfase 3+: wire Venus → Blackhole shots.
 */

export type ShotId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'neptune'
  | 'uranus'
  | 'blackhole'

/**
 * A "shot" describes one narrative station of the solar journey.
 *
 * scrollStart / scrollEnd   — outer envelope (matches planetRegistry focusStart/End).
 * enterTransitionStart      — first frame where the incoming animation begins
 *                             (matches approachStart).
 * holdStart                 — camera locks into resting pose (matches settleStart).
 * holdEnd                   — resting pose ends (matches departStart).
 * exitStart                 — camera begins departing toward the next shot
 *                             (same as holdEnd / departStart).
 *
 * cameraPosition            — world-space HOLD camera position derived from:
 *                             planet.position + cameraOffset{X,Y,Z}.
 * lookAt                    — world-space HOLD look-at target derived from:
 *                             planet.position + lookAtOffset{X,Y,Z}.
 *
 * introStart                — [Sun only] starting position for the mount-time
 *                             intro sweep (INTRO_START from CameraRig.tsx).
 */
export interface ShotConfig {
  id: ShotId
  planetId: ShotId

  // Scroll progress window [0, 1]
  scrollStart: number
  scrollEnd: number

  // Scroll sub-phase markers (all within scrollStart–scrollEnd)
  enterTransitionStart: number
  holdStart: number
  holdEnd: number
  exitStart: number

  // Camera HOLD pose (absolute world-space positions)
  cameraPosition: [number, number, number]
  lookAt: [number, number, number]

  // [Sun only] intro sweep starting position (undefined for all other shots)
  introStart?: [number, number, number]
}

// ── Sun shot ──────────────────────────────────────────────────────────────────
// Values lifted VERBATIM from:
//   planetRegistry.ts  →  PLANET_REGISTRY[0]  (id: 'sun')
//   CameraRig.tsx      →  INTRO_START
//
// Sun planet position:  [0, 0, 0]
// cameraOffsetX: 4.0, cameraOffsetY: 0.5, cameraOffsetZ: 4.5
// lookAtOffsetX: 3.5, lookAtOffsetY: 0.0, lookAtOffsetZ: 0.0
// → cameraPosition = [0+4.0, 0+0.5, 0+4.5] = [4.0, 0.5, 4.5]
// → lookAt         = [0+3.5, 0+0.0, 0+0.0] = [3.5, 0.0, 0.0]
//
// INTRO_START from CameraRig.tsx = [18, 14, 22]
//
// Scroll timing from PLANET_REGISTRY sun entry:
//   focusStart=0.00, approachStart=0.00, settleStart=0.02,
//   departStart=0.12, focusEnd=0.16
const SUN_SHOT: ShotConfig = {
  id:      'sun',
  planetId: 'sun',
  scrollStart:          0.00,
  scrollEnd:            0.16,
  enterTransitionStart: 0.00,  // approachStart (no approach, camera already there)
  holdStart:            0.02,  // settleStart
  holdEnd:              0.12,  // departStart
  exitStart:            0.12,  // same as departStart
  cameraPosition: [4.0, 0.5,  4.5],  // sun.position + cameraOffset{X,Y,Z}
  lookAt:         [3.5, 0.0,  0.0],  // sun.position + lookAtOffset{X,Y,Z}
  introStart:     [18,  14,  22],    // INTRO_START from CameraRig.tsx — DO NOT CHANGE
}

// ── Mercury shot ──────────────────────────────────────────────────────────────
// LIVE as of microfase 2 — CameraRig drives camera from these values.
// Values lifted VERBATIM from PLANET_REGISTRY mercury entry.
//
// Mercury planet position: [14, 1.2, -36]
// cameraOffsetX: -9.0, cameraOffsetY: 1.5, cameraOffsetZ: 12.0
// lookAtOffsetX: -3.0, lookAtOffsetY: 0.2, lookAtOffsetZ: 0.0
// → cameraPosition = [14-9.0, 1.2+1.5, -36+12.0] = [5.0, 2.7, -24.0]
// → lookAt         = [14-3.0, 1.2+0.2, -36+0.0]  = [11.0, 1.4, -36.0]
const MERCURY_SHOT: ShotConfig = {
  id:      'mercury',
  planetId: 'mercury',
  scrollStart:          0.16,
  scrollEnd:            0.28,
  enterTransitionStart: 0.16,  // approachStart
  holdStart:            0.21,  // settleStart
  holdEnd:              0.26,  // departStart
  exitStart:            0.26,  // same as departStart
  cameraPosition: [5.0,  2.7, -24.0],  // mercury.position + cameraOffset{X,Y,Z}
  lookAt:         [11.0, 1.4, -36.0],  // mercury.position + lookAtOffset{X,Y,Z}
}

// ── Shot registry ─────────────────────────────────────────────────────────────
// Sun (legacy path) and Mercury (shot-based path) are active.
// The rest will be added in subsequent microfases as shots are visually wired.
//
// [NV] Microfase 3+: add venus, earth, moon, mars, neptune, uranus, blackhole.
export const SHOT_REGISTRY: ShotConfig[] = [SUN_SHOT, MERCURY_SHOT]

export const SHOT_MAP = new Map<ShotId, ShotConfig>(
  SHOT_REGISTRY.map((s) => [s.id, s]),
)

export function getShotById(id: ShotId): ShotConfig | undefined {
  return SHOT_MAP.get(id)
}

export function getNextShot(id: ShotId): ShotConfig | undefined {
  const idx = SHOT_REGISTRY.findIndex((s) => s.id === id)
  if (idx === -1 || idx === SHOT_REGISTRY.length - 1) return undefined
  return SHOT_REGISTRY[idx + 1]
}
