/**
 * planetRegistry — Phase 3-A.2b
 *
 * Single source of truth for every body in the solar scene.
 * Maps the narrative arc (Entry Gate → Blackhole reset loop) onto
 * Three.js scene properties: position, scale, model path.
 *
 * Narrative mapping
 * ─────────────────
 * Entry Gate  → EntryGate component (outside this registry)
 * Sun         → Intro / About
 * Mercury     → Skills
 * Venus       → How it was made
 * Earth       → Projects Hub
 * Moon        → Reservo.AI  (orbits Earth, same orbital shell)
 * Mars        → StartupConnect
 * Neptune     → Experience
 * Uranus      → Contact / final approach
 * Blackhole   → Grand Finale / reset loop to start
 *
 * Positions are in "scene units" along the Z-axis (camera travels +Z → −Z).
 * The camera rig will dolly from z=0 (Sun) toward z=-MAX_Z (Blackhole).
 * X / Y offsets add slight lateral variation so bodies don't stack on axis.
 *
 * Scale notes (from Fase 0 smoke test bounding-box data):
 *   - All GLBs validated with bounding boxes ~1–3 units; scale multipliers
 *     here are intentional artistic choices, not physical accuracy.
 *   - Moon is smaller than Earth; Sun is the largest.
 *
 * Loading groups (progressive / zone-based strategy)
 * ────────────────────────────────────────────────────
 * group 1 — "initial"   : loaded immediately on immersive-mode entry
 *   sun, mercury, venus, earth, moon, mars  (active discrete stations)
 *
 * group 2 — "mid"       : loaded after group-1 resolves (or after a
 *                          short idle delay, whichever comes first)
 *
 * group 3 — "deep"      : loaded only once scroll progress crosses
 *   neptune, uranus,       DEEP_LOAD_THRESHOLD (0.45); blackhole is
 *   blackhole              NEVER preloaded at scene mount.
 *
 * Phase subdivision per planet (scroll progress, normalised 0..1)
 * ───────────────────────────────────────────────────────────────
 * focusStart   — outer envelope start (camera still departing prev planet)
 * approachStart — camera begins angling toward this planet from the side
 * settleStart  — camera arrives at hold position (HOLD phase begins)
 * departStart  — camera starts angling toward next planet (DEPART phase)
 * focusEnd     — outer envelope end (hand-off to next planet)
 *
 * Invariant: focusStart ≤ approachStart ≤ settleStart ≤ departStart ≤ focusEnd
 *
 * Camera offsets (cameraOffsetX/Y/Z, lookAtOffsetX/Y/Z) define the HOLD pose.
 * The APPROACH pose is interpolated from the PREVIOUS planet's DEPART pose.
 * The DEPART pose blends toward the next planet's APPROACH pose.
 */

export type PlanetId =
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
 * Which progressive loading wave this body belongs to.
 * See file-level doc for the full strategy.
 */
export type LoadingGroup = 'initial' | 'mid' | 'deep'

export interface PlanetConfig {
  /** Unique identifier — matches GLB filename. */
  id: PlanetId
  /** Human-readable label used in overlays (Phase 3). */
  label: string
  /** Narrative section this body represents. */
  section: string
  /** Path to the GLB asset under /public. */
  modelPath: string
  /** [x, y, z] position in scene units. */
  position: [number, number, number]
  /**
   * Artistic scale: desired radius in scene units after normalisation.
   * PlanetMesh normalises every GLB to radius=1 then multiplies by this value,
   * so the result is always predictable regardless of the GLB's native size.
   */
  scale: number
  /**
   * Target radius in normalised space (before artisticScale is applied).
   * Default is 1. Use < 1 for bodies whose GLB geometry has a different
   * logical size (e.g. moon GLB may need 0.8 to map correctly).
   */
  normalizedRadiusTarget: number
  /**
   * Fallback sphere radius used when the GLB fails to load.
   */
  fallbackRadius: number
  /**
   * Colour used for the fallback sphere and the glow point-light.
   */
  accentColor: string
  /**
   * Progressive loading wave. Controls when useGLTF.preload() is called.
   */
  loadingGroup: LoadingGroup
  // ── Scroll focus window (outer envelope) ─────────────────────────────────────
  focusStart: number
  focusEnd: number
  // ── Phase subdivision within the focus window ────────────────────────────────
  /** Approach phase begins — camera starts moving laterally toward this planet. */
  approachStart: number
  /** Hold/settle phase begins — camera locks into the HOLD pose. */
  settleStart: number
  /** Depart phase begins — camera starts drifting toward next planet. */
  departStart: number
  // ── Camera hold pose (applied relative to planet position) ───────────────────
  cameraOffsetX: number
  cameraOffsetY: number
  cameraOffsetZ: number
  lookAtOffsetX: number
  lookAtOffsetY: number
  lookAtOffsetZ: number
  /** Self-rotation speed in radians per second (Y-axis only, no orbit). */
  rotationSpeed: number
}

export const ACTIVE_PLANET_HYSTERESIS = 0.015

// ── Scale convention ───────────────────────────────────────────────────────────
// `scale`        = desired artistic radius in scene units.
//                  PlanetMesh normalises every GLB to radius=1 then multiplies
//                  by this value, so the result is always predictable.
// `fallbackRadius` = radius of the procedural fallback sphere (same units).
// Camera offsets are designed so the camera is always clearly outside the model.
// Rule of thumb: cameraOffsetZ ≥ scale * 4 + 6 for a safe working distance.

// ── Scroll travel is 700 vh (set in SolarScene). ──────────────────────────────
// The focus window proportions below were designed for that travel distance.
// Sun gets 14% of scroll, inner planets ~10-11% each, mid ~8-9%, deep ~11-12%.
// The Sun window is kept wide so the intro sweep doesn't feel rushed.

export const PLANET_REGISTRY: PlanetConfig[] = [
  // ── Group 1: initial — loaded immediately on immersive-mode entry ────────────
  {
    id: 'sun',
    label: 'Sun',
    section: 'Intro / About',
    modelPath: '/assets/solar/models/sun.glb',
    position: [0, 0, 0],
    scale: 3.5,
    normalizedRadiusTarget: 1,
    fallbackRadius: 3.5,
    accentColor: '#FFA726',
    loadingGroup: 'initial',
    // Sun occupies the first 16% of scroll. Camera settles quickly and holds long.
    focusStart:   0.00,
    approachStart: 0.00, // no approach needed — it's the first body
    settleStart:   0.02, // camera is already animating in from INTRO_START
    departStart:   0.12,
    focusEnd:     0.16,
    // Camera sits close-right of the Sun. Sun fills left ~50%.
    cameraOffsetX: 4.0,
    cameraOffsetY: 0.5,
    cameraOffsetZ: 4.5,
    lookAtOffsetX: 3.5,
    lookAtOffsetY: 0.0,
    lookAtOffsetZ: 0.0,
    rotationSpeed: 0.04,
  },
  {
    id: 'mercury',
    label: 'Mercury',
    section: 'Skills',
    modelPath: '/assets/solar/models/mercury.glb',
    // RIGHT lane (+X) — Mercury enters from the right side of the journey.
    // Camera hold pose is to the LEFT (-X relative to planet) so the camera
    // approaches from the left, making Mercury enter cinematically from the right.
    //
    // artisticScale: desired radius in scene units after GLB normalisation.
    // PlanetMesh normalises the GLB to radius=1 (via computeNormParams, no mutations)
    // then multiplies by this value. Outer group = world position + this scale.
    // Inner group = bounding-box centring offset + normScale (from computeNormParams).
    // <primitive object={scene} /> — never clone()d.
    // frustumCulled=false applied to every descendant via disableFrustumCulling(scene).
    position: [14, 1.2, -36],
    scale: 0.8,              // artisticScale — desired radius in scene units
    normalizedRadiusTarget: 1,
    fallbackRadius: 0.8,     // fallback sphere radius (same units as scale)
    accentColor: '#90A4AE',  // blue-grey for Mercury
    loadingGroup: 'initial',
    // Sun focusEnd=0.16 → Mercury focusStart=0.16 (seamless handoff).
    // approachStart=0.16: camera begins drifting toward Mercury immediately.
    // settleStart=0.21:   camera locks into hold pose (5% of scroll = "pause beat").
    // departStart=0.26:   camera starts moving toward Venus.
    // focusEnd=0.28:      outer envelope end.
    focusStart:    0.16,
    approachStart: 0.16,
    settleStart:   0.21,
    departStart:   0.26,
    focusEnd:      0.28,
    // Camera to the LEFT (-X) of Mercury, slightly elevated, moderate Z distance.
    // This makes the camera approach from the left while Mercury is on the right —
    // Mercury enters the frame from the lateral right, not through the centre.
    // cameraOffsetZ = 12 keeps Mercury clearly visible without cropping.
    cameraOffsetX: -9.0,
    cameraOffsetY: 1.5,
    cameraOffsetZ: 12.0,
    lookAtOffsetX: -3.0,
    lookAtOffsetY: 0.2,
    lookAtOffsetZ: 0.0,
    rotationSpeed: 0.18,
  },
  {
    id: 'venus',
    label: 'Venus',
    section: 'How It Was Made',
    modelPath: '/assets/solar/models/venus.glb',
    // RIGHT lane (+X). Camera hold pose is on the left (-X relative to planet).
    position: [16, -1.2, -100],
    scale: 1.0,
    normalizedRadiusTarget: 1,
    fallbackRadius: 1.0,
    accentColor: '#FFCC80',
    loadingGroup: 'initial',
    focusStart:   0.26,
    approachStart: 0.26,
    settleStart:   0.30,
    departStart:   0.35,
    focusEnd:     0.38,
    // Camera to the LEFT (-X) of Venus so it enters from right.
    cameraOffsetX: -10.0,
    cameraOffsetY: 1.8,
    cameraOffsetZ: 13.0,
    lookAtOffsetX: -4.0,
    lookAtOffsetY: 0.2,
    lookAtOffsetZ: 0.0,
    rotationSpeed: -0.06,
  },

  // ── Earth: initial group — active discrete station (microfase 4) ─────────────
  {
    id: 'earth',
    label: 'Earth',
    section: 'Projects Hub',
    modelPath: '/assets/solar/models/earth.glb',
    // LEFT lane (-X). Camera hold pose is on the right (+X relative to planet).
    position: [-16, 0.8, -155],
    scale: 1.1,
    normalizedRadiusTarget: 1,
    fallbackRadius: 1.1,
    accentColor: '#42A5F5',
    loadingGroup: 'initial',
    focusStart:   0.38,
    approachStart: 0.38,
    settleStart:   0.42,
    departStart:   0.46,
    focusEnd:     0.49,
    // Camera to the RIGHT (+X) of Earth.
    cameraOffsetX: 10.0,
    cameraOffsetY: 2.0,
    cameraOffsetZ: 14.0,
    lookAtOffsetX: 4.0,
    lookAtOffsetY: 0.3,
    lookAtOffsetZ: 0.0,
    rotationSpeed: 0.12,
  },
  {
    id: 'moon',
    label: 'Moon',
    section: 'Reservo.AI',
    modelPath: '/assets/solar/models/moon.glb',
    // Slightly LEFT, tighter to Earth — Moon feels part of Earth block.
    position: [-20, 2.0, -170],
    scale: 0.4,
    normalizedRadiusTarget: 1,
    fallbackRadius: 0.4,
    accentColor: '#B0BEC5',
    // Moved from 'mid' to 'initial' so Moon is guaranteed to load before the
    // discrete navigation reaches the Earth → Moon transition. Moon is a
    // small asset (similar to Mercury) so the extra weight is acceptable.
    loadingGroup: 'initial',
    // Moon gets a shorter window — it's a "beat" not a "station".
    focusStart:   0.49,
    approachStart: 0.49,
    settleStart:   0.51,
    departStart:   0.54,
    focusEnd:     0.56,
    // Camera on the right, slightly elevated to keep Moon small in frame.
    cameraOffsetX: 7.0,
    cameraOffsetY: 2.0,
    cameraOffsetZ: 9.0,
    lookAtOffsetX: 2.5,
    lookAtOffsetY: 0.2,
    lookAtOffsetZ: 0.0,
    rotationSpeed: 0.09,
  },
  {
    id: 'mars',
    label: 'Mars',
    section: 'StartupConnect',
    modelPath: '/assets/solar/models/mars.glb',
    // RIGHT lane (+X). Camera hold pose is on the left (-X relative to planet).
    position: [18, -1.8, -215],
    scale: 0.85,
    normalizedRadiusTarget: 1,
    fallbackRadius: 0.85,
    accentColor: '#EF5350',
    // Moved from 'mid' to 'initial' so Mars is guaranteed to load before the
    // discrete navigation reaches the Moon → Mars transition.
    loadingGroup: 'initial',
    focusStart:   0.56,
    approachStart: 0.56,
    settleStart:   0.60,
    departStart:   0.65,
    focusEnd:     0.68,
    // Camera to the LEFT (-X) of Mars.
    cameraOffsetX: -10.0,
    cameraOffsetY: 1.8,
    cameraOffsetZ: 13.0,
    lookAtOffsetX: -3.5,
    lookAtOffsetY: 0.2,
    lookAtOffsetZ: 0.0,
    rotationSpeed: 0.15,
  },

  // ── Group 3: deep — loaded only when scroll progress ≥ DEEP_LOAD_THRESHOLD ──
  {
    id: 'neptune',
    label: 'Neptune',
    section: 'Experience',
    modelPath: '/assets/solar/models/neptune.glb',
    // LEFT lane (-X). Camera hold pose is on the right.
    position: [-20, 1.0, -275],
    scale: 1.4,
    normalizedRadiusTarget: 1,
    fallbackRadius: 1.4,
    accentColor: '#5C6BC0',
    loadingGroup: 'deep',
    focusStart:   0.68,
    approachStart: 0.68,
    settleStart:   0.72,
    departStart:   0.77,
    focusEnd:     0.80,
    cameraOffsetX: 12.0,
    cameraOffsetY: 2.0,
    cameraOffsetZ: 16.0,
    lookAtOffsetX: 5.0,
    lookAtOffsetY: 0.3,
    lookAtOffsetZ: 0.0,
    rotationSpeed: 0.10,
  },
  {
    id: 'uranus',
    label: 'Uranus',
    section: 'Contact',
    modelPath: '/assets/solar/models/uranus.glb',
    // RIGHT lane (+X). Camera hold pose is on the left.
    position: [22, -1.0, -328],
    scale: 1.3,
    normalizedRadiusTarget: 1,
    fallbackRadius: 1.3,
    accentColor: '#80CBC4',
    loadingGroup: 'deep',
    focusStart:   0.80,
    approachStart: 0.80,
    settleStart:   0.84,
    departStart:   0.88,
    focusEnd:     0.91,
    cameraOffsetX: -12.0,
    cameraOffsetY: 2.0,
    cameraOffsetZ: 16.0,
    lookAtOffsetX: -5.0,
    lookAtOffsetY: 0.3,
    lookAtOffsetZ: 0.0,
    rotationSpeed: -0.07,
  },
  {
    id: 'blackhole',
    label: 'Blackhole',
    section: 'Grand Finale',
    modelPath: '/assets/solar/models/blackhole.glb',
    position: [0, 0, -400],
    scale: 4.0,
    normalizedRadiusTarget: 1,
    fallbackRadius: 4.0,
    accentColor: '#7E57C2',
    loadingGroup: 'deep',
    focusStart:   0.91,
    approachStart: 0.91,
    settleStart:   0.94,
    departStart:   0.97,
    focusEnd:     1.00,
    cameraOffsetX: 0.0,
    cameraOffsetY: 4.0,
    cameraOffsetZ: 28.0,
    lookAtOffsetX: 0.0,
    lookAtOffsetY: 0.0,
    lookAtOffsetZ: 0.0,
    rotationSpeed: 0.20,
  },
]

/** Convenience map for O(1) lookup by id. */
export const PLANET_MAP = new Map<PlanetId, PlanetConfig>(
  PLANET_REGISTRY.map((p) => [p.id, p]),
)

export function getPlanetFocusCenter(config: PlanetConfig): number {
  return (config.focusStart + config.focusEnd) * 0.5
}

export function getActivePlanetByProgress(progress: number): PlanetConfig {
  const clamped = Math.min(1, Math.max(0, progress))
  return (
    PLANET_REGISTRY.find(
      (config) => clamped >= config.focusStart && clamped <= config.focusEnd,
    ) ?? PLANET_REGISTRY[PLANET_REGISTRY.length - 1]
  )
}

export function getPlanetIndexById(id: PlanetId): number {
  return PLANET_REGISTRY.findIndex((config) => config.id === id)
}

export function getNextPlanetById(id: PlanetId): PlanetConfig | null {
  const index = getPlanetIndexById(id)
  if (index === -1 || index === PLANET_REGISTRY.length - 1) return null
  return PLANET_REGISTRY[index + 1]
}

export function getPreviousPlanetById(id: PlanetId): PlanetConfig | null {
  const index = getPlanetIndexById(id)
  if (index <= 0) return null
  return PLANET_REGISTRY[index - 1]
}

export function getStableActivePlanet(
  progress: number,
  currentPlanetId?: PlanetId | null,
): PlanetConfig {
  const clamped = Math.min(1, Math.max(0, progress))
  if (!currentPlanetId) return getActivePlanetByProgress(clamped)

  const currentIndex = PLANET_REGISTRY.findIndex((config) => config.id === currentPlanetId)
  if (currentIndex === -1) return getActivePlanetByProgress(clamped)

  const current = PLANET_REGISTRY[currentIndex]
  let resolved = current
  let resolvedIndex = currentIndex

  while (resolvedIndex < PLANET_REGISTRY.length - 1) {
    const next = PLANET_REGISTRY[resolvedIndex + 1]
    if (clamped < next.focusStart + ACTIVE_PLANET_HYSTERESIS) break
    resolved = next
    resolvedIndex += 1
  }

  while (resolvedIndex > 0) {
    const previous = PLANET_REGISTRY[resolvedIndex - 1]
    if (clamped > previous.focusEnd - ACTIVE_PLANET_HYSTERESIS) break
    resolved = previous
    resolvedIndex -= 1
  }

  return resolved
}

// ── Phase resolution ───────────────────────────────────────────────────────────

export type CameraPhase = 'approach' | 'hold' | 'depart'

/**
 * Given global scroll progress, determine which planet is the "active camera
 * target" and which sub-phase the camera is in.
 *
 * Returns the active planet config, the phase, and a normalised phase-local
 * t in [0, 1] representing how far through that phase we are.
 */
export function resolveCameraPhase(progress: number): {
  planet: PlanetConfig
  next: PlanetConfig | null
  phase: CameraPhase
  phaseT: number
} {
  const p = Math.min(1, Math.max(0, progress))

  // Find the planet whose outer envelope [focusStart, focusEnd] contains p.
  // Fall back to last planet if we're past everything.
  let planet: PlanetConfig = PLANET_REGISTRY[PLANET_REGISTRY.length - 1]
  for (const cfg of PLANET_REGISTRY) {
    if (p >= cfg.focusStart && p <= cfg.focusEnd) {
      planet = cfg
      break
    }
  }

  const next = getNextPlanetById(planet.id)

  let phase: CameraPhase
  let phaseT: number

  if (p < planet.settleStart) {
    // APPROACH phase: approachStart → settleStart
    const len = planet.settleStart - planet.approachStart
    phaseT = len > 0 ? Math.min(1, Math.max(0, (p - planet.approachStart) / len)) : 1
    phase = 'approach'
  } else if (p < planet.departStart) {
    // HOLD phase: settleStart → departStart
    const len = planet.departStart - planet.settleStart
    phaseT = len > 0 ? Math.min(1, Math.max(0, (p - planet.settleStart) / len)) : 1
    phase = 'hold'
  } else {
    // DEPART phase: departStart → focusEnd
    const len = planet.focusEnd - planet.departStart
    phaseT = len > 0 ? Math.min(1, Math.max(0, (p - planet.departStart) / len)) : 1
    phase = 'depart'
  }

  return { planet, next, phase, phaseT }
}
