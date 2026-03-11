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
// LIVE as of microfase 3 — discrete CameraRig drives camera from these values.
//
// Mercury planet position: [14, 1.2, -36]
// artisticRadius (scale): 0.8 units
// FOV: 45° vertical  →  ~75° horizontal at 16:9 (1280×720)
//
// COMPOSITION: Mercury large, in the RIGHT THIRD of frame
// ────────────────────────────────────────────────────────
// Key rule: lookAt defines the frustum CENTRE. Mercury must be INSIDE the
// frustum — i.e. the camera→Mercury vector must be within the FOV cone of
// the camera→lookAt direction.
//
// To place Mercury in the right third:
//   1. Camera is LEFT of Mercury → view direction points rightward toward Mercury.
//   2. lookAt is set 1u to the LEFT of Mercury's X → Mercury appears 1u right of
//      the frustum centre, placing it in the right third of the 75° hFOV.
//
// Camera offset from Mercury [14, 1.2, -36]:
//   Same view direction as before, moved closer along the same axis.
//   → cameraPosition = [11.6, 2.4, -32.9]
//
// lookAt = 1u left of Mercury centre = [13.0, 1.2, -36.0]
//   lateral offset of Mercury from frustum centre = 14 - 13 = 1u right
//   depth cam→lookAt ≈ 4.7u → angular offset = atan(1/4.7) ≈ 12°
//   screen position: 50% + (12°/37.5°)×50% ≈ 66% from left  ✓ right third
//
// cam→Mercury distance: √((14-11.6)²+(1.2-2.4)²+(-36+32.9)²)
//                     = √(5.76+1.44+9.61) ≈ 4.06u
// vertical fill: 2·atan(0.8/4.06) ≈ 22.4° → ~50% of FOV45  ✓
const MERCURY_SHOT: ShotConfig = {
  id:      'mercury',
  planetId: 'mercury',
  scrollStart:          0.16,
  scrollEnd:            0.28,
  enterTransitionStart: 0.16,
  holdStart:            0.21,
  holdEnd:              0.26,
  exitStart:            0.26,
  cameraPosition: [12.5, 1.9, -34.1],
  lookAt:         [13.0, 1.2, -36.0],
}

// ── Venus shot ────────────────────────────────────────────────────────────────
// LIVE as of microfase 3 (Venus) — discrete CameraRig drives camera from these values.
//
// Venus planet position: [16, -1.2, -100]
// artisticRadius (scale): 1.0 units
// FOV: 45° vertical  →  ~75° horizontal at 16:9 (1280×720)
//
// COMPOSITION: Venus fills 100% of frame height, occupies LEFT 50% of width
// ──────────────────────────────────────────────────────────────────────────
// Laterality contrast with Mercury:
//   Mercury = RIGHT side  (camera to the LEFT of Mercury)
//   Venus   = LEFT side   (camera to the RIGHT of Venus)
//
// Target:
//   - 100% vertical fill  → dist ≈ scale / tan(22.5°) = 1.0 / 0.4142 ≈ 2.41u
//   - Venus in LEFT 50%   → Venus centre at ~25% from left = -25% from screen centre
//     angular offset = -25% × hFOV/2 = -0.25 × 37.5° ≈ -9.4°
//     lookAt must be 9.4° to the RIGHT of Venus in the frustum
//     delta_x = tan(9.4°) × dist_to_lookAt ≈ 0.166 × 2.5 ≈ 0.41u → round to 0.5u
//     so lookAt.x = venus.x + 0.5 = 16.5   (camera looks slightly right of Venus)
//     with larger offset for more push: lookAt.x = venus.x + 1.2 = 17.2
//     angular = atan(1.2 / 2.5) ≈ 25.6° → Venus at 50% - 34% = 16% from left — too far left
//     use lookAt.x = venus.x + 0.7 = 16.7  → atan(0.7/2.4) ≈ 16° → 50%-21% = 29% from left ✓
//
// Camera offset from Venus [16, -1.2, -100]:
//   Camera to the RIGHT (+X) and slightly in front (+Z) for a close, dramatic frame.
//   cameraPosition = [16+2.2, -1.2+0.3, -100+1.2] = [18.2, -0.9, -98.8]
//
// cam→Venus distance: √((16-18.2)²+(-1.2+0.9)²+(-100+98.8)²)
//                   = √(4.84+0.09+1.44) ≈ √6.37 ≈ 2.52u
// vertical fill: 2·atan(1.0/2.52) ≈ 43.4° → ~96% of FOV45  ✓ ~100%
//
// lookAt = 0.7u right of Venus X, at Venus Y/Z:
//   lookAt = [16.7, -1.2, -100.0]
//   depth cam→lookAt ≈ √((16.7-18.2)²+(-1.2+0.9)²+(-100+98.8)²) ≈ √(2.25+0.09+1.44) ≈ 1.95u
//   angular offset = atan(0.7/1.95) ≈ 19.7°
//   Venus screen x: 50% - (19.7/37.5)×50% ≈ 50% - 26% = 24% from right = 76% from left
//   → Venus centre at ~24% from right edge = well into the left half  ✓
const VENUS_SHOT: ShotConfig = {
  id:      'venus',
  planetId: 'venus',
  scrollStart:          0.28,
  scrollEnd:            0.40,
  enterTransitionStart: 0.28,
  holdStart:            0.32,
  holdEnd:              0.37,
  exitStart:            0.37,
  cameraPosition: [18.0, -0.9, -98.3],
  lookAt:         [17.2, -1.2, -100.0],
}

// ── Earth shot ────────────────────────────────────────────────────────────────
// LIVE as of microfase 4 — discrete CameraRig drives camera from these values.
//
// Earth planet position: [-16, 0.8, -155]
// effective radius in scene units = artisticScale × normalizedRadiusTarget = 1.1 × 1 = 1.1u
// FOV: 45° vertical  →  ~75° horizontal at 16:9
//
// COMPOSITION: Earth fills 100% of frame height, occupies RIGHT 50% of screen.
//              LEFT 50% of frame is empty space.
// ─────────────────────────────────────────────────────────────────────────────
//
// TARGET vertical fill = 100% (Earth diameter == frame height)
//   required dist = radius / tan(FOVv/2) = 1.1 / tan(22.5°) = 1.1 / 0.4142 ≈ 2.655u
//
// Camera sits along the –Z axis from Earth (pulling back) and slightly –X
// (left of Earth) so the view direction points slightly right, placing Earth
// in the right half of the frame.
//
//   Pull back mostly in Z so the approach from Venus (z=-100) makes sense:
//   cameraPosition = [-16 - 1.0,  0.8 + 0.5,  -155 + 2.6] = [-17.0, 1.3, -152.4]
//
//   cam→Earth distance: √(1²+0.5²+2.6²) = √(1+0.25+6.76) = √8.01 ≈ 2.83u
//   vertical fill: 2·atan(1.1/2.83) ≈ 2·21.3° ≈ 42.6° → ~95% of FOV45  ✓ ≈100%
//
// LATERAL placement — Earth centre at x≈75% of screen (right 50% centre):
//   Need Earth to appear at 25° to the right of frustum centre (half of hFOV/2=37.5°).
//   lookAt must be offset LEFT of Earth so Earth sits right of frustum centre.
//   depth cam→lookAt ≈ 2.83u (roughly same depth as cam→Earth)
//   required angular offset = 25° → lateral delta = tan(25°) × 2.83 ≈ 1.32u
//   lookAt.x = earth.x - 1.32 = -16 - 1.32 = -17.32  → round to -17.3
//   lookAt = [-17.3, 0.8, -155.0]
//   screen x of Earth: 50% + (25°/37.5°)×50% ≈ 50% + 33% = 83% from left
//   → Earth centre at ~83% → Earth spans roughly 50%–100% of the frame  ✓
const EARTH_SHOT: ShotConfig = {
  id:      'earth',
  planetId: 'earth',
  scrollStart:          0.40,
  scrollEnd:            0.52,
  enterTransitionStart: 0.40,
  holdStart:            0.44,
  holdEnd:              0.49,
  exitStart:            0.49,
  cameraPosition: [-17.0, 1.3, -152.4],
  lookAt:         [-17.3, 0.8, -155.0],
}

// ── Shot registry ─────────────────────────────────────────────────────────────
// Sun, Mercury, Venus, and Earth are active on the discrete path.
//
// [NV] Microfase 5+: add moon, mars, neptune, uranus, blackhole.
export const SHOT_REGISTRY: ShotConfig[] = [SUN_SHOT, MERCURY_SHOT, VENUS_SHOT, EARTH_SHOT]

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
