/**
 * SolarScene — Phase 3 (debug HUD, safe mode, layout fix)
 *
 * R3F hook rules strictly enforced:
 *
 *   1. useFrame / useThree ONLY in components that are direct children of <Canvas>.
 *
 *   2. Runtime evidence showed `Html` from drei was the consistent crash source
 *      in this environment. Immersive mode now avoids `Html` entirely and keeps
 *      all visuals as pure meshes plus DOM overlays outside the Canvas tree.
 *
 *   3. The Suspense fallback prop must only contain pure Three.js mesh components
 *      (no drei Html, no useThree calls).
 *
 * [NV] Phase 4+: blackhole reset loop — core path shipped; polish / edge cases TBD.
 * [NV] Phase 4: audio controls HUD.
 * [NV] Phase 4: lateral camera drift per planet.
 */

import { Component, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode, RefObject } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useGLTFV2 } from './useGLTFV2'
import { getPlanetIndexById, getStableActivePlanet, PLANET_MAP, PLANET_REGISTRY, SUN_GLB_URL } from './planetRegistry'
import type { PlanetConfig, PlanetId } from './planetRegistry'
import { PlanetMesh } from './PlanetMesh'
import { PlanetOverlay } from './PlanetOverlay'
import { SunInfoPanel } from './SunInfoPanel'
import { CameraRig } from './CameraRig'
import { BlackholeRumble } from './BlackholeRumble'
import type { CameraPhaseId, ShotPhaseId } from './CameraRig'
import { useScrollProgress } from '../lib/useScrollProgress'
import { useShotNavigation } from './useShotNavigation'
import { useDiscreteShotNavigation } from './useDiscreteShotNavigation'
import { DebugHUD } from './DebugHUD'
import { BlackholeCinematicOverlay } from './BlackholeCinematicOverlay'
import { WarpStarfield } from './WarpStarfield'
import { BlackholeShaderMesh } from './BlackholeShaderMesh'
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react'
import type { AudioDiagnostics } from '../lib/useAudioShell'
import { ExpandOnHoverIconButton } from '../components/ui/ExpandOnHoverIconButton'
import styles from './SolarScene.module.css'
import { useLocale } from '../lib/localeContext'
import { useAppMode } from '../lib/appModeContext'
import { useJourneyLoader } from '../lib/useJourneyLoader'
import RotatePrompt from '../components/RotatePrompt'
import OnboardingTutorial from '../components/OnboardingTutorial'
import {
  NEBULA_STARS_TEXTURE_URL,
  releaseSolarImmersiveAssets,
  URANUS_DETAIL_TEXTURE_URLS,
} from './solarImmersiveRelease'

const FONT_BODY = "var(--v2-font-body, 'Proxima Nova', 'Inter', 'Arial', sans-serif)"

// ── Cinematic T reader — RAF-based ref→state bridge for DOM overlay ───────────
//
// Reads a mutable ref value each animation frame and exposes it as React state.
// Only runs (and re-renders) while `active` is true, so it has zero cost at rest.

function useCinematicT(ref: RefObject<number>, active: boolean): number {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!active) {
      // Reset via RAF to avoid synchronous setState in effect body
      const id = requestAnimationFrame(() => setT(0))
      return () => cancelAnimationFrame(id)
    }
    let rafId: number
    const tick = () => {
      setT(ref.current ?? 0)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [ref, active])
  return t
}

// ── Debug / safe mode detection ───────────────────────────────────────────────

function getQueryParam(name: string): boolean {
  try {
    return new URLSearchParams(window.location.search).get(name) === '1'
  } catch {
    return false
  }
}

// Temporal: desactiva el debug HUD (incluye overlay + telemetría asociada).
// Si quieres volver a activarlo, pon esto en `true`.
const SHOW_DEBUG_HUD = false
const IS_DEBUG = SHOW_DEBUG_HUD && (import.meta.env.DEV || getQueryParam('debug'))
const IS_SAFE  = getQueryParam('safe')

// ── Loading thresholds (legacy scroll-driven HUD / finale only) ───────────────

const FINALE_THRESHOLD     = 0.90

/**
 * After `cameraPhase` enters `*-hold`, info panels open following this delay (ms).
 * `0` = next macrotask (feels immediate; avoids synchronous setState in the effect body).
 */
const INFO_PANEL_HOLD_OPEN_MS = 0

/** Discrete journey indices for progressive GLB unlock (monotonic peak along `PLANET_REGISTRY` shot order). */
const PREFETCH_MOON_AFTER_MERcury_SHOT = getPlanetIndexById('mercury')
const PREFETCH_MARS_AFTER_VENUS_SHOT = getPlanetIndexById('venus')
const PREFETCH_INNER_ICE_GIANT_AFTER_EARTH_SHOT = getPlanetIndexById('earth')
const PREFETCH_OUTER_ICE_GIANT_AFTER_MARS_SHOT = getPlanetIndexById('mars')
// Matches INTRO_START in CameraRig — CameraRig snaps to this on frame 1.
// Matches INTRO_START in CameraRig.tsx — CameraRig snaps to this on frame 1.
const INITIAL_CAMERA_POSITION: [number, number, number] = [36.0, 28.0, 44.0]
/** Perspective far plane: must exceed NebulaBackground sphere radius (920) plus camera distance from origin, or the sky is frustum-clipped and reads as solid black. */
const CAMERA_FAR = 2500
const SCROLL_TRAVEL_VH = 700

// ── Stars background ───────────────────────────────────────────────────────────

const STAR_COUNT = 4000

function buildStarGeometry(): { positions: Float32Array; colors: Float32Array } {
  const pos = new Float32Array(STAR_COUNT * 3)
  const col = new Float32Array(STAR_COUNT * 3)
  for (let i = 0; i < STAR_COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 600
    pos[i * 3 + 1] = (Math.random() - 0.5) * 300
    pos[i * 3 + 2] = Math.random() * -500 + 20
    const t = Math.random()
    col[i * 3]     = 0.8 + t * 0.2
    col[i * 3 + 1] = 0.85 + t * 0.1
    col[i * 3 + 2] = 0.9 + (1 - t) * 0.1
  }
  return { positions: pos, colors: col }
}

const STAR_GEOMETRY_DATA = buildStarGeometry()

/** Canvas texture: soft circular point (radial gradient) so stars render as circles, not squares. */
function createCirclePointTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2
  const r = cx - 1
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

function StarField() {
  const pointsRef = useRef<THREE.Points>(null)
  const circleMap = useMemo(() => createCirclePointTexture(), [])
  useEffect(() => () => circleMap.dispose(), [circleMap])
  const { positions, colors } = STAR_GEOMETRY_DATA

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.00015
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={circleMap}
        size={0.15}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}


// ── Milky Way sky (immersive — all shots before blackhole) ─────────────────────
//
// Full-sky inverted sphere using an 8K Milky Way starfield texture.
// Shown from Sun through Uranus only; hidden during Uranus→Blackhole cinematic,
// blackhole shot (shader sky), and blackhole→Sun reset so skies do not stack/fight.
// renderOrder negative + depthWrite=false keeps it behind planets. In normal immersive
// there is no StarField overlay (only NebulaBackground + blackhole shader); in ?safe=1,
// StarField still renders above this sphere.

/** Align equirectangular Milky Way so the bright band sits toward travel (-Z), not only on screen edges. */
const NEBULA_SKY_ROTATION: [number, number, number] = [-0.18, Math.PI * 0.62, 0]

function NebulaBackground({ visible }: { visible: boolean }) {
  const rawTexture = useTexture(NEBULA_STARS_TEXTURE_URL)
  const texture = useMemo(() => {
    const t = rawTexture.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
    return t
  }, [rawTexture])
  useEffect(() => () => texture.dispose(), [texture])
  if (!visible) return null
  return (
    <group rotation={NEBULA_SKY_ROTATION}>
      <mesh renderOrder={-2} frustumCulled={false}>
        <sphereGeometry args={[920, 72, 64]} />
        <meshBasicMaterial
          map={texture}
          side={THREE.BackSide}
          depthWrite={false}
          toneMapped
          color="#c8d2e8"
        />
      </mesh>
    </group>
  )
}

// ── Uranus textured mesh ───────────────────────────────────────────────────────
//
// Uses textures extracted directly from uranus.glb:
//   tex0.jpg  → sphere baseColor  (material "material")
//   tex1.png  → clouds baseColor  (material "material_1", BLEND)
//   tex2.jpg  → clouds normalMap  (material "material_1")
//
// Procedural "Uranus look" at the `neptune` slot — world radius tuned to match ~Neptune GLB sphere
// (~1.5u) at NEPTUNE_SHOT distance so framing matches the original Neptune composition (left third).
const URANUS_SPHERE_R = 1.48

/** Draw Neptune's GLB at the `uranus` slot while keeping IDs and camera shots unchanged (visual-only swap). */
const AESTHETIC_NEPTUNE_GLB_AT_URANUS_SLOT = '/assets/solar/models/neptune.glb'

function meshConfigForPlanet(config: PlanetConfig): PlanetConfig {
  if (config.id !== 'uranus') return config
  return {
    ...config,
    modelPath: AESTHETIC_NEPTUNE_GLB_AT_URANUS_SLOT,
    // 3× prior 6.0 — Neptune GLB dominates the frame at uranus shot (experience).
    scale: 18.0,
    fallbackRadius: 0.25,
    rotationSpeed: 0.10,
  }
}

/** Warms TextureLoader cache when `deep` is active (same window as Neptune GLB). */
function UranusTexturePreload({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return
    useLoader.preload(THREE.TextureLoader, [...URANUS_DETAIL_TEXTURE_URLS])
  }, [active])
  return null
}

function UranusTexturedInner({
  position,
  visible,
  onClick,
}: {
  position: [number, number, number]
  visible: boolean
  onClick?: () => void
}) {
  const [sphereMap, cloudsMap, cloudsNormal] = useTexture([...URANUS_DETAIL_TEXTURE_URLS])

  if (!visible) return null

  return (
    <group position={position}>
      {/* ── Planet body — textured sphere from GLB material "material" ── */}
      <mesh
        frustumCulled={false}
        onClick={(e) => { e.stopPropagation(); onClick?.() }}
      >
        <sphereGeometry args={[URANUS_SPHERE_R, 128, 128]} />
        <meshStandardMaterial
          map={sphereMap}
          roughness={0.70}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Cloud layer — GLB material "material_1" (BLEND, normalMap) ── */}
      <mesh frustumCulled={false}>
        <sphereGeometry args={[URANUS_SPHERE_R * 1.012, 128, 128]} />
        <meshStandardMaterial
          map={cloudsMap}
          normalMap={cloudsNormal}
          roughness={0.94}
          metalness={0.0}
          transparent
          opacity={0.55}
          alphaTest={0.01}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/**
 * Mounts `useTexture` once `warm` is true (journey ready + deep group), so GPU upload
 * does not coincide with the Mars→Uranus camera move. `visible` only toggles meshes.
 */
function UranusGuaranteedMesh({
  warm,
  visible,
  worldPosition,
  onClick,
}: {
  warm: boolean
  visible: boolean
  worldPosition: [number, number, number]
  onClick?: () => void
}) {
  if (!warm) return null
  return (
    <Suspense fallback={null}>
      <UranusTexturedInner position={worldPosition} visible={visible} onClick={onClick} />
    </Suspense>
  )
}

// Blackhole — procedural shader only (see BlackholeShaderMesh). Anchor matches planetRegistry + shotConfig.
const BLACKHOLE_POS: [number, number, number] = [0, 0, -400]

// ── Lighting rig ──────────────────────────────────────────────────────────────

function LightingRig({ safe = false }: { safe?: boolean }) {
  if (safe) {
    return (
      <>
        <ambientLight intensity={1.2} color="#ffffff" />
        <directionalLight position={[5, 10, 15]} intensity={3.0} color="#fff5e0" />
        <pointLight position={[0, 0, 0]} intensity={8} distance={60} decay={1.5} color="#FFA726" />
      </>
    )
  }
  return (
    <>
      <ambientLight intensity={0.18} color="#a8c8ff" />
      <directionalLight position={[0, 8, 12]}    intensity={1.6} color="#fff5e0" castShadow={false} />
      <directionalLight position={[-10, 3, -100]} intensity={0.3} color="#4466cc" castShadow={false} />
      <pointLight position={[0, 0, 0]} intensity={3} distance={30} decay={2} color="#FFA726" />
      {/* Deep-field fill — illuminates Earth and beyond without affecting Sun zone */}
      <directionalLight position={[-5, 10, -100]} intensity={1.8} color="#fff8f0" castShadow={false} />
      {/* Neptune fill — localized point light to ensure legibility at z=-275 */}
      <pointLight position={[-20, 8, -260]} intensity={4.5} distance={80} decay={1.8} color="#7986cb" />
      {/* Uranus fill — ultra-local to guarantee legibility without affecting earlier planets */}
      <pointLight position={[22, 2, -328]} intensity={12.0} distance={55} decay={2.0} color="#80cbc4" />
      {/* Blackhole: procedural shader is self-lit; external lights would wash it out. */}
    </>
  )
}

// ── Safe-mode sphere (procedural, no GLB, no Suspense) ────────────────────────

interface SafeSphereProps { config: PlanetConfig }

function SafeSphere({ config }: SafeSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isSun = config.id === 'sun'

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isSun ? 0.1 : 0.3)
    }
  })

  const radius = isSun ? config.fallbackRadius * 1.5 : config.fallbackRadius

  return (
    <mesh ref={meshRef} position={config.position} scale={config.scale}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={config.accentColor}
        roughness={isSun ? 0.2 : 0.6}
        metalness={0.1}
        emissive={config.accentColor}
        emissiveIntensity={isSun ? 1.2 : 0.4}
      />
    </mesh>
  )
}

// ── Suspense fallback sphere ───────────────────────────────────────────────────
//
// RULE: Must NOT use any R3F hooks (no useFrame, no useThree).
//       Must NOT contain <Html> or any drei component that uses useThree.
//       It is a pure Three.js mesh — static, no animation.

interface FallbackSphereProps { config: PlanetConfig }

function SuspenseFallbackSphere({ config }: FallbackSphereProps) {
  const isSun = config.id === 'sun'
  return (
    <mesh position={config.position} scale={config.scale}>
      <sphereGeometry args={[config.fallbackRadius, 24, 24]} />
      <meshStandardMaterial
        color={config.accentColor}
        roughness={isSun ? 0.2 : 0.7}
        metalness={0.1}
        emissive={config.accentColor}
        emissiveIntensity={isSun ? 1.0 : 0.2}
        transparent={!isSun}
        opacity={isSun ? 1.0 : 0.75}
      />
    </mesh>
  )
}

// ── GLB error boundary ────────────────────────────────────────────────────────

interface GLBErrorBoundaryState { hasError: boolean }
interface GLBErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
  onError?: () => void
}

class GLBErrorBoundary extends Component<GLBErrorBoundaryProps, GLBErrorBoundaryState> {
  constructor(props: GLBErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(): GLBErrorBoundaryState {
    return { hasError: true }
  }
  componentDidCatch() {
    this.props.onError?.()
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

// ── Group 1: preload at module import time (non-safe mode only) ───────────────

if (!IS_SAFE) {
  const w = globalThis as unknown as { __SOLAR_INITIAL_PRELOADED__?: boolean }
  if (!w.__SOLAR_INITIAL_PRELOADED__) {
    w.__SOLAR_INITIAL_PRELOADED__ = true
    // Preload: string canónica para deduplicación de caché.
    useGLTFV2.preload(SUN_GLB_URL)
    for (const id of ['earth', 'mercury', 'venus'] as const) {
      const cfg = PLANET_MAP.get(id)
      if (cfg?.modelPath) useGLTFV2.preload(cfg.modelPath)
    }
  }
}

// ── Progressive loader (discrete shots — scroll container stays at top) ───────
// On immersive entry: only Sun–Earth GLBs. Each outward leg prefetches the next asset so
// Mars/Moon/Ice giants are not all fetched when leaving Earth (prior `mid`+`deep` bundle).
// Peak index only increases; reset-to-Sun does not unload GLBs already resolved.

function useAllowedPlanetLoads(
  currentShotId: PlanetId,
  targetShotId: PlanetId | null,
  safe: boolean,
): Set<PlanetId> {
  const snapshotMax = useMemo(() => {
    if (safe) return 0
    const cur = getPlanetIndexById(currentShotId)
    const tgt = targetShotId != null ? getPlanetIndexById(targetShotId) : cur
    return Math.max(cur, tgt)
  }, [currentShotId, targetShotId, safe])

  const [peakIdx, setPeakIdx] = useState(0)
  if (snapshotMax > peakIdx) {
    setPeakIdx(snapshotMax)
  }
  const maxIdx = Math.max(peakIdx, snapshotMax)

  return useMemo(() => {
    const base: PlanetId[] = ['sun', 'mercury', 'venus', 'earth']
    if (safe) return new Set<PlanetId>(base)
    const allowed = new Set<PlanetId>(base)
    if (maxIdx >= PREFETCH_MOON_AFTER_MERcury_SHOT) allowed.add('moon')
    if (maxIdx >= PREFETCH_MARS_AFTER_VENUS_SHOT) allowed.add('mars')
    if (maxIdx >= PREFETCH_INNER_ICE_GIANT_AFTER_EARTH_SHOT) allowed.add('neptune')
    if (maxIdx >= PREFETCH_OUTER_ICE_GIANT_AFTER_MARS_SHOT) allowed.add('uranus')
    return allowed
  }, [maxIdx, safe])
}

// ── SolarScene ────────────────────────────────────────────────────────────────

export interface SolarSceneProps {
  onSwitchMode: () => void
  mode?: string
  entered?: boolean
  audioEnabled?: boolean
  audioDiagnostics?: AudioDiagnostics
  /** Called when initial GLBs are loaded and the journey is ready. Used by shell to hide loading overlay. */
  onReady?: () => void
  /** Wired to AppMode `audioEnabled` from the shell (immersive HUD mute toggle). */
  onSetAudioEnabled?: (enabled: boolean) => void
}

const DEFAULT_AUDIO_DIAG: AudioDiagnostics = {
  elementCreated: false,
  srcAssigned: false,
  playAttempted: false,
  playResult: null,
  lastError: null,
  duration: -1,
  audioState: 'idle',
}

/** Panel + rumble share one reducer so effects can commit a single update per logical event. */
interface BlackholeUiState {
  panelVisible: boolean
  rumbleActive: boolean
}

const BLACKHOLE_UI_INITIAL: BlackholeUiState = {
  panelVisible: false,
  rumbleActive: false,
}

type BlackholeUiAction = {
  type: 'set'
  patch: Partial<Pick<BlackholeUiState, 'panelVisible' | 'rumbleActive'>>
}

function blackholeUiReducer(state: BlackholeUiState, action: BlackholeUiAction): BlackholeUiState {
  if (action.type !== 'set') return state
  const next = { ...state, ...action.patch }
  if (next.panelVisible === state.panelVisible && next.rumbleActive === state.rumbleActive) {
    return state
  }
  return next
}

export function SolarScene({
  onSwitchMode,
  mode = 'immersive',
  entered = true,
  audioEnabled = false,
  audioDiagnostics = DEFAULT_AUDIO_DIAG,
  onReady,
  onSetAudioEnabled,
}: SolarSceneProps) {
  const { locale } = useLocale()

  const [webglAvailable] = useState<boolean>(() => {
    try {
      const canvas = document.createElement('canvas')
      return Boolean(
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'),
      )
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!webglAvailable) onReady?.()
  }, [webglAvailable, onReady])

  if (!webglAvailable) {
    const menuLabel =
      locale === 'es' ? 'Regresar a menú principal' : 'Return to main menu'
    return (
      <div className={styles.solarSceneRoot} style={{ display: 'grid', placeItems: 'center', background: '#030712' }}>
        <div style={{ textAlign: 'center', color: '#e2e8f0', fontFamily: FONT_BODY, padding: '2rem' }}>
          <p style={{ margin: 0, fontSize: '1rem' }}>WebGL no disponible en este navegador/GPU.</p>
          <p style={{ margin: '0.75rem 0 1.5rem', opacity: 0.75, fontSize: '0.85rem' }}>
            Cambia a modo clásico o revisa la aceleración por hardware.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ExpandOnHoverIconButton
              variant="immersive"
              label={menuLabel}
              ariaLabel={menuLabel}
              icon={<ArrowLeft strokeWidth={2} />}
              onClick={onSwitchMode}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <SolarSceneWebGL
      onSwitchMode={onSwitchMode}
      mode={mode}
      entered={entered}
      audioEnabled={audioEnabled}
      audioDiagnostics={audioDiagnostics}
      onReady={onReady}
      onSetAudioEnabled={onSetAudioEnabled}
    />
  )
}

function SolarSceneWebGL({
  onSwitchMode,
  mode = 'immersive',
  entered = true,
  audioEnabled = false,
  audioDiagnostics = DEFAULT_AUDIO_DIAG,
  onReady,
  onSetAudioEnabled,
}: SolarSceneProps) {
  const { locale } = useLocale()

  const menuLabel =
    locale === 'es' ? 'Regresar a menú principal' : 'Return to main menu'
  const muteLabel =
    audioEnabled
      ? locale === 'es'
        ? 'Silenciar'
        : 'Mute'
      : locale === 'es'
        ? 'Activar sonido'
        : 'Unmute'
  const muteAria =
    audioEnabled
      ? locale === 'es'
        ? 'Silenciar sonido'
        : 'Mute sound'
      : locale === 'es'
        ? 'Activar sonido'
        : 'Unmute sound'

  const immersiveScrollRegionLabel =
    locale === 'es'
      ? 'Experiencia solar — desplázate con la rueda o desliza para explorar'
      : 'Solar system experience — scroll or swipe to explore'

  // React 18 StrictMode (dev) mounts/unmounts components immediately to
  // surface side-effects. Our cleanup calls `useGLTF.clear()` which
  // can force a second real network GET for the same GLB (e.g. `sun.glb`).
  // We suppress cache-clearing during these short-lived unmounts.
  useEffect(() => {
    const mountedAt = import.meta.env.DEV ? performance.now() : 0
    return () => {
      if (import.meta.env.DEV) {
        const elapsed = performance.now() - mountedAt
        if (elapsed < 750) return
      }
      releaseSolarImmersiveAssets()
    }
  }, [])

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollProgress = useScrollProgress(scrollContainerRef)
  const activeJourneyPlanetRef = useRef<PlanetId>('sun')

  // Legacy scroll-based shot navigation (kept for debug display only)
  const { currentShot, nextShot, shotProgress } = useShotNavigation(scrollProgress)

  // Discrete shot navigation (Sun → … → Uranus → Blackhole + reset loop)
  const {
    currentShotId:       discreteCurrentShotId,
    targetShotId:        discreteTargetShotId,
    isTransitioning:     discreteIsTransitioning,
    isResetting:         discreteIsResetting,
    transitionDirection: discreteTransitionDir,
    wheelIntent:         discreteWheelIntent,
    transitionTRef:      discreteTransitionTRef,
    isTransitioningRef:  discreteIsTransitioningRef,
    targetShotIdRef:     discreteTargetShotIdRef,
    currentShotIdRef:   discreteCurrentShotIdRef,
    onTransitionComplete: onDiscreteTransitionComplete,
    // Blackhole cinematic (Uranus → Blackhole)
    isBlackholeCinematic,
    isBlackholeCinematicRef,
    blackholeCinematicPhase,
    blackholeCinematicTRef,
    onBlackholeCinematicComplete,
    onBlackholeCinematicPhaseChange,
    // Blackhole reset cinematic (Blackhole → enter → Sun)
    isBlackholeResetting,
    blackholeResetPhase,
    blackholeResetTRef,
    onBlackholeResetComplete,
    onBlackholeResetPhaseChange,
  } = useDiscreteShotNavigation(scrollContainerRef)

  const allowedPlanetLoads = useAllowedPlanetLoads(discreteCurrentShotId, discreteTargetShotId, IS_SAFE)

  // Read cinematic T each frame for the DOM overlay (only active during cinematic)
  const cinematicT = useCinematicT(blackholeCinematicTRef, isBlackholeCinematic)
  const resetCinematicT = useCinematicT(blackholeResetTRef, isBlackholeResetting)

  // ── Discrete path: lock scroll container at scrollTop=0 ──────────────────────
  // The discrete system controls ALL shots (sun → blackhole). While it is active,
  // the legacy scroll-progress must stay at 0 so useShotNavigation never reports
  // a contradictory currentShot. We do this by clamping scrollTop to 0 on every
  // scroll event that leaks through (e.g. small wheel movements below the intent
  // threshold, or programmatic scrolls).
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const lockScroll = () => {
      if (el.scrollTop !== 0) el.scrollTop = 0
    }
    el.addEventListener('scroll', lockScroll, { passive: true })
    return () => el.removeEventListener('scroll', lockScroll)
  }, [scrollContainerRef])

  // `neptune` id: procedural Uranus-style mesh (no PlanetMesh). `uranus` id: Neptune GLB via meshConfigForPlanet swap.
  const RENDERED_PLANETS = PLANET_REGISTRY.filter(
    (p) =>
      p.id !== 'blackhole' &&
      p.id !== 'neptune' &&
      (p.modelPath.length > 0 || p.id === 'uranus'),
  )

  // Blackhole shader visibility rules (same as former GLB gating):
  //   - Normal navigation: show when it is the current or target shot.
  //   - During the Blackhole cinematic: suppress targetShotId until reveal is well underway
  //     so the shader never bleeds through the fade-to-black overlay.
  const BLACKHOLE_VISIBLE =
    (discreteCurrentShotId === 'blackhole' ||
      (!isBlackholeCinematic && discreteTargetShotId === 'blackhole') ||
      (isBlackholeCinematic && blackholeCinematicPhase === 'reveal' && cinematicT > 0.78)) &&
    !(isBlackholeResetting && blackholeResetPhase === 'reappear')

  const blackholeRegistryIndex = PLANET_REGISTRY.findIndex((p) => p.id === 'blackhole')
  const currentShotRegistryIndex = PLANET_REGISTRY.findIndex((p) => p.id === discreteCurrentShotId)
  const NEBULA_VISIBLE =
    !IS_SAFE &&
    currentShotRegistryIndex >= 0 &&
    currentShotRegistryIndex < blackholeRegistryIndex &&
    !isBlackholeCinematic &&
    !isBlackholeResetting

  /**
   * Procedural inner ice giant (`neptune` slot) — only at its hold / when transitioning to-from it.
   * Not shown from Mars (Neptune GLB provides the distant cue there).
   */
  const innerIceGiantProceduralVisible =
    !isBlackholeCinematic &&
    !isBlackholeResetting &&
    discreteTargetShotId !== 'blackhole' &&
    discreteCurrentShotId !== 'blackhole' &&
    (discreteCurrentShotId === 'neptune' ||
      discreteTargetShotId === 'neptune' ||
      discreteCurrentShotId === 'uranus' ||
      discreteTargetShotId === 'uranus')

  /**
   * Neptune GLB (`uranus` slot): distant backdrop from **Mars** onward, then full shot on outer ice giant.
   * Loads with `allowedPlanetLoads` at Mars so the mesh is already mounted before the inner-ice transition (no “pop”).
   */
  const outerNeptuneGlbVisible =
    !isBlackholeCinematic &&
    !isBlackholeResetting &&
    discreteTargetShotId !== 'blackhole' &&
    discreteCurrentShotId !== 'blackhole' &&
    (discreteCurrentShotId === 'mars' ||
      discreteTargetShotId === 'mars' ||
      discreteCurrentShotId === 'neptune' ||
      discreteTargetShotId === 'neptune' ||
      discreteCurrentShotId === 'uranus' ||
      discreteTargetShotId === 'uranus')

  const [activePlanet, setActivePlanet] = useState<PlanetConfig | null>(null)
  const [sunPanelVisible, setSunPanelVisible] = useState(false)
  const sunPanelManuallyClosedRef = useRef(false)
  const sunHoldTimerRef = useRef<number | null>(null)
  const [mercuryPanelVisible, setMercuryPanelVisible] = useState(false)
  const mercuryPanelManuallyClosedRef = useRef(false)
  const mercuryHoldTimerRef = useRef<number | null>(null)
  const [venusPanelVisible, setVenusPanelVisible] = useState(false)
  const venusPanelManuallyClosedRef = useRef(false)
  const venusHoldTimerRef = useRef<number | null>(null)
  const [earthPanelVisible, setEarthPanelVisible] = useState(false)
  const earthPanelManuallyClosedRef = useRef(false)
  const earthHoldTimerRef = useRef<number | null>(null)
  const [moonPanelVisible, setMoonPanelVisible] = useState(false)
  const moonPanelManuallyClosedRef = useRef(false)
  const moonHoldTimerRef = useRef<number | null>(null)
  const [marsPanelVisible, setMarsPanelVisible] = useState(false)
  const marsPanelManuallyClosedRef = useRef(false)
  const marsHoldTimerRef = useRef<number | null>(null)
  const [neptunePanelVisible, setNeptunePanelVisible] = useState(false)
  const neptunePanelManuallyClosedRef = useRef(false)
  const neptuneHoldTimerRef = useRef<number | null>(null)
  const [uranusPanelVisible, setUranusPanelVisible] = useState(false)
  const uranusPanelManuallyClosedRef = useRef(false)
  const uranusHoldTimerRef = useRef<number | null>(null)
  const [blackholeUi, dispatchBlackholeUi] = useReducer(blackholeUiReducer, BLACKHOLE_UI_INITIAL)
  const { panelVisible: blackholePanelVisible, rumbleActive: blackholeRumbleActive } = blackholeUi
  const blackholePanelManuallyClosedRef = useRef(false)
  const blackholeHoldTimerRef = useRef<number | null>(null)
  const [activeJourneyPlanetId, setActiveJourneyPlanetId] = useState<PlanetId>('sun')
  const [isFinaleActive, setIsFinaleActive] = useState(false)

  const [canvasMounted, setCanvasMounted] = useState(false)
  const [canvasSize, setCanvasSize]       = useState({ width: 0, height: 0 })
  const [cameraPos, setCameraPos]         = useState({
    x: INITIAL_CAMERA_POSITION[0],
    y: INITIAL_CAMERA_POSITION[1],
    z: INITIAL_CAMERA_POSITION[2],
  })
  const [glbFailed, setGlbFailed]         = useState(0)
  const [glbLoaded, setGlbLoaded]         = useState(0)
  // Deduplication set — prevents double-counting when GLBModel's useEffect re-fires
  const glbLoadedIdsRef = useRef(new Set<string>())
  const [cameraPhase, setCameraPhase]     = useState<CameraPhaseId>('intro')
  const [shotPhase, setShotPhase]         = useState<ShotPhaseId>('sun')
  // Gate: how many GLBs in the 'initial' group need to load before we start the journey.
  // Must use RENDERED_PLANETS (excludes `neptune` — procedural ice giant — and blackhole).
  // mesh and never fires onGlbLoaded, so counting it would stall the gate forever.
  const initialGroupSize = RENDERED_PLANETS.filter((p) => p.loadingGroup === 'initial').length
  const [journeyReady, setJourneyReady]   = useState(IS_SAFE) // safe mode skips GLB gate

  const { mode: appMode } = useAppMode()
  const {
    status: journeyLoaderStatus,
    ready: journeyLoaderReadyFlag,
    start: journeyLoaderStart,
  } = useJourneyLoader(appMode)

  useEffect(() => {
    journeyLoaderStart()
  }, [journeyLoaderStart])

  const isReady =
    (journeyLoaderStatus === 'ready' || journeyLoaderReadyFlag === true) && journeyReady

  const [tutorialDone, setTutorialDone] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  /** Gate tutorial when rotate-overlay would show — not read by JSX (RotatePrompt mirrors logic). */
  const rotatePromptVisibleRef = useRef(false)
  const tutorialHasShownRef = useRef(false)

  const handleTutorialDone = useCallback(() => {
    setTutorialDone(true)
    setShowTutorial(false)
  }, [])

  useEffect(() => {
    const computeRotatePrompt = (): void => {
      const isMobile = window.matchMedia('(pointer: coarse)').matches
      const isPortrait = window.innerWidth < window.innerHeight
      const isLandscape = !isPortrait
      rotatePromptVisibleRef.current = isMobile && !(isLandscape && isReady)
    }
    computeRotatePrompt()
    window.addEventListener('resize', computeRotatePrompt)
    return () => window.removeEventListener('resize', computeRotatePrompt)
  }, [isReady])

  useEffect(() => {
    let timeoutId: number | null = null

    const clearPendingTutorial = (): void => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const tryScheduleTutorial = (): void => {
      if (tutorialDone || tutorialHasShownRef.current) {
        clearPendingTutorial()
        return
      }
      if (cameraPhase !== 'sun-hold') {
        clearPendingTutorial()
        return
      }
      if (rotatePromptVisibleRef.current) {
        clearPendingTutorial()
        return
      }
      if (timeoutId !== null) return
      timeoutId = window.setTimeout(() => {
        tutorialHasShownRef.current = true
        setShowTutorial(true)
        timeoutId = null
      }, 400)
    }

    tryScheduleTutorial()
    window.addEventListener('resize', tryScheduleTutorial)
    return () => {
      window.removeEventListener('resize', tryScheduleTutorial)
      clearPendingTutorial()
    }
  }, [cameraPhase, tutorialDone, isReady])

  // Read canvas/camera state via onCreated — no useThree needed outside Canvas
  const handleCanvasCreated = useCallback((state: { camera: THREE.Camera; gl: THREE.WebGLRenderer }) => {
    setCanvasMounted(true)
    setCanvasSize({ width: state.gl.domElement.clientWidth, height: state.gl.domElement.clientHeight })
    setCameraPos({ x: state.camera.position.x, y: state.camera.position.y, z: state.camera.position.z })
    // ACESFilmicToneMapping matches Sketchfab's renderer — compresses highlights naturally
    // so emissive rings glow without saturating to white. Exposure 1.2 gives the warm bloom effect.
    state.gl.toneMapping = THREE.ACESFilmicToneMapping
    state.gl.toneMappingExposure = 1.2

    if (!IS_DEBUG) return
    const id = window.setInterval(() => {
      setCameraPos({
        x: state.camera.position.x,
        y: state.camera.position.y,
        z: state.camera.position.z,
      })
      setCanvasSize({
        width: state.gl.domElement.clientWidth,
        height: state.gl.domElement.clientHeight,
      })
    }, 100)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const nextPlanet = getStableActivePlanet(scrollProgress, activeJourneyPlanetRef.current)
    if (nextPlanet.id === activeJourneyPlanetRef.current) return
    activeJourneyPlanetRef.current = nextPlanet.id
    setActiveJourneyPlanetId(nextPlanet.id)
  }, [scrollProgress])

  const activeJourneyPlanet = getStableActivePlanet(scrollProgress, activeJourneyPlanetId)

  useEffect(() => {
    const shouldActivate   = !isFinaleActive && scrollProgress >= FINALE_THRESHOLD
    const shouldDeactivate =  isFinaleActive && scrollProgress  < FINALE_THRESHOLD
    if (!shouldActivate && !shouldDeactivate) return
    const handle = window.setTimeout(() => setIsFinaleActive(shouldActivate), 0)
    return () => window.clearTimeout(handle)
  }, [scrollProgress, isFinaleActive])

  // Notify shell when initial assets are loaded so it can hide the Space loading overlay.
  useEffect(() => {
    if (journeyReady && onReady) onReady()
  }, [journeyReady, onReady])

  // Sun panel visibility contract:
  // - Only appears in `sun-hold`
  // - Shows immediately after entering hold
  // - Hides immediately when leaving hold
  useEffect(() => {
    if (sunHoldTimerRef.current) {
      window.clearTimeout(sunHoldTimerRef.current)
      sunHoldTimerRef.current = null
    }

    if (cameraPhase !== 'sun-hold') {
      // Evita disparar `setState` directamente dentro del efecto (react-hooks/set-state-in-effect)
      // Mantiene el contrato de ocultar inmediatamente al salir del "hold".
      window.requestAnimationFrame(() => setSunPanelVisible(false))
      return
    }

    // On entering hold, reset manual close so it can appear again.
    sunPanelManuallyClosedRef.current = false
    sunHoldTimerRef.current = window.setTimeout(() => {
      if (!sunPanelManuallyClosedRef.current) {
        setSunPanelVisible(true)
      }
      sunHoldTimerRef.current = null
    }, INFO_PANEL_HOLD_OPEN_MS)

    return () => {
      if (sunHoldTimerRef.current) {
        window.clearTimeout(sunHoldTimerRef.current)
        sunHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Mercury panel visibility contract:
  // - Only appears in `mercury-hold`
  // - Shows immediately after entering hold
  // - Hides immediately when leaving hold
  useEffect(() => {
    if (mercuryHoldTimerRef.current) {
      window.clearTimeout(mercuryHoldTimerRef.current)
      mercuryHoldTimerRef.current = null
    }

    if (cameraPhase !== 'mercury-hold') {
      window.requestAnimationFrame(() => setMercuryPanelVisible(false))
      return
    }

    mercuryPanelManuallyClosedRef.current = false
    mercuryHoldTimerRef.current = window.setTimeout(() => {
      if (!mercuryPanelManuallyClosedRef.current) {
        setMercuryPanelVisible(true)
      }
      mercuryHoldTimerRef.current = null
    }, INFO_PANEL_HOLD_OPEN_MS)

    return () => {
      if (mercuryHoldTimerRef.current) {
        window.clearTimeout(mercuryHoldTimerRef.current)
        mercuryHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Venus panel visibility contract:
  // - Only appears in `venus-hold`
  // - Shows 1s after entering hold
  // - Hides immediately when leaving hold
  useEffect(() => {
    if (venusHoldTimerRef.current) {
      window.clearTimeout(venusHoldTimerRef.current)
      venusHoldTimerRef.current = null
    }

    if (cameraPhase !== 'venus-hold') {
      window.requestAnimationFrame(() => setVenusPanelVisible(false))
      return
    }

    venusPanelManuallyClosedRef.current = false
    venusHoldTimerRef.current = window.setTimeout(() => {
      if (!venusPanelManuallyClosedRef.current) {
        setVenusPanelVisible(true)
      }
      venusHoldTimerRef.current = null
    }, INFO_PANEL_HOLD_OPEN_MS)

    return () => {
      if (venusHoldTimerRef.current) {
        window.clearTimeout(venusHoldTimerRef.current)
        venusHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Earth panel visibility contract:
  // - Only appears in `earth-hold`
  // - Shows immediately after entering hold
  // - Hides immediately when leaving hold
  useEffect(() => {
    if (earthHoldTimerRef.current) {
      window.clearTimeout(earthHoldTimerRef.current)
      earthHoldTimerRef.current = null
    }

    if (cameraPhase !== 'earth-hold') {
      window.requestAnimationFrame(() => setEarthPanelVisible(false))
      return
    }

    earthPanelManuallyClosedRef.current = false
    earthHoldTimerRef.current = window.setTimeout(() => {
      if (!earthPanelManuallyClosedRef.current) {
        setEarthPanelVisible(true)
      }
      earthHoldTimerRef.current = null
    }, INFO_PANEL_HOLD_OPEN_MS)

    return () => {
      if (earthHoldTimerRef.current) {
        window.clearTimeout(earthHoldTimerRef.current)
        earthHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Moon panel visibility contract:
  // - Only appears in `moon-hold`
  // - Shows immediately after entering hold
  // - Hides immediately when leaving hold
  useEffect(() => {
    if (moonHoldTimerRef.current) {
      window.clearTimeout(moonHoldTimerRef.current)
      moonHoldTimerRef.current = null
    }

    if (cameraPhase !== 'moon-hold') {
      window.requestAnimationFrame(() => setMoonPanelVisible(false))
      return
    }

    moonPanelManuallyClosedRef.current = false
    moonHoldTimerRef.current = window.setTimeout(() => {
      if (!moonPanelManuallyClosedRef.current) {
        setMoonPanelVisible(true)
      }
      moonHoldTimerRef.current = null
    }, INFO_PANEL_HOLD_OPEN_MS)

    return () => {
      if (moonHoldTimerRef.current) {
        window.clearTimeout(moonHoldTimerRef.current)
        moonHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Mars panel visibility contract:
  // - Only appears in `mars-hold`
  // - Shows immediately after entering hold
  // - Hides immediately when leaving hold
  useEffect(() => {
    if (marsHoldTimerRef.current) {
      window.clearTimeout(marsHoldTimerRef.current)
      marsHoldTimerRef.current = null
    }

    if (cameraPhase !== 'mars-hold') {
      window.requestAnimationFrame(() => setMarsPanelVisible(false))
      return
    }

    marsPanelManuallyClosedRef.current = false
    marsHoldTimerRef.current = window.setTimeout(() => {
      if (!marsPanelManuallyClosedRef.current) {
        setMarsPanelVisible(true)
      }
      marsHoldTimerRef.current = null
    }, INFO_PANEL_HOLD_OPEN_MS)

    return () => {
      if (marsHoldTimerRef.current) {
        window.clearTimeout(marsHoldTimerRef.current)
        marsHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Neptune panel visibility contract:
  // - Only appears in `neptune-hold`
  // - Shows immediately after entering hold
  // - Hides immediately when leaving hold
  useEffect(() => {
    if (neptuneHoldTimerRef.current) {
      window.clearTimeout(neptuneHoldTimerRef.current)
      neptuneHoldTimerRef.current = null
    }

    if (cameraPhase !== 'neptune-hold') {
      window.requestAnimationFrame(() => setNeptunePanelVisible(false))
      return
    }

    neptunePanelManuallyClosedRef.current = false
    neptuneHoldTimerRef.current = window.setTimeout(() => {
      if (!neptunePanelManuallyClosedRef.current) {
        setNeptunePanelVisible(true)
      }
      neptuneHoldTimerRef.current = null
    }, INFO_PANEL_HOLD_OPEN_MS)

    return () => {
      if (neptuneHoldTimerRef.current) {
        window.clearTimeout(neptuneHoldTimerRef.current)
        neptuneHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Uranus panel visibility contract:
  // - Only appears in `uranus-hold`
  // - Shows immediately after entering hold
  // - Hides immediately when leaving hold
  useEffect(() => {
    if (uranusHoldTimerRef.current) {
      window.clearTimeout(uranusHoldTimerRef.current)
      uranusHoldTimerRef.current = null
    }

    if (cameraPhase !== 'uranus-hold') {
      window.requestAnimationFrame(() => setUranusPanelVisible(false))
      return
    }

    uranusPanelManuallyClosedRef.current = false
    uranusHoldTimerRef.current = window.setTimeout(() => {
      if (!uranusPanelManuallyClosedRef.current) {
        setUranusPanelVisible(true)
      }
      uranusHoldTimerRef.current = null
    }, INFO_PANEL_HOLD_OPEN_MS)

    return () => {
      if (uranusHoldTimerRef.current) {
        window.clearTimeout(uranusHoldTimerRef.current)
        uranusHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Blackhole panel visibility contract:
  // - Only appears in `blackhole-hold`
  // - Shows immediately after entering hold
  // - Hides immediately when leaving hold
  useEffect(() => {
    if (blackholeHoldTimerRef.current) {
      window.clearTimeout(blackholeHoldTimerRef.current)
      blackholeHoldTimerRef.current = null
    }

    if (cameraPhase !== 'blackhole-hold') {
      window.requestAnimationFrame(() => {
        dispatchBlackholeUi({ type: 'set', patch: { panelVisible: false, rumbleActive: false } })
      })
      return
    }

    blackholePanelManuallyClosedRef.current = false
    blackholeHoldTimerRef.current = window.setTimeout(() => {
      if (!blackholePanelManuallyClosedRef.current) {
        dispatchBlackholeUi({ type: 'set', patch: { panelVisible: true } })
      }
      blackholeHoldTimerRef.current = null
    }, INFO_PANEL_HOLD_OPEN_MS)

    return () => {
      if (blackholeHoldTimerRef.current) {
        window.clearTimeout(blackholeHoldTimerRef.current)
        blackholeHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Blackhole arrival effects: camera rumble + gravity sound (3s, fade out)
  // Fires when the cinematic reveal phase begins — the moment the blackhole
  // starts appearing on screen after the warp. Rumble lasts 3s with fade out,
  // overlapping both the reveal (~1.8s) and the start of blackhole-hold.
  useEffect(() => {
    if (blackholeCinematicPhase !== 'reveal') {
      return
    }

    // Trigger camera rumble (defer to next frame — avoids setState in effect body)
    let rumbleOff = 0
    const rumbleRafId = window.requestAnimationFrame(() => {
      dispatchBlackholeUi({ type: 'set', patch: { rumbleActive: true } })
      rumbleOff = window.setTimeout(
        () => dispatchBlackholeUi({ type: 'set', patch: { rumbleActive: false } }),
        3000,
      )
    })

    // Synthesize gravity sound — two sine oscillators at 55Hz + 40Hz
    if (audioEnabled && typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const ctx = new AudioContext()

        const masterGain = ctx.createGain()
        masterGain.connect(ctx.destination)

        // Primary oscillator — 55Hz (A1, deep bass)
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.type = 'sine'
        osc1.frequency.value = 55
        gain1.gain.value = 1.0
        osc1.connect(gain1)
        gain1.connect(masterGain)

        // Secondary oscillator — 40Hz (sub-bass layer)
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sine'
        osc2.frequency.value = 40
        gain2.gain.value = 0.5
        osc2.connect(gain2)
        gain2.connect(masterGain)

        // Envelope: attack 0.1s → sustain → fade out from 2.0s to 3.0s
        masterGain.gain.setValueAtTime(0.0001, ctx.currentTime)
        masterGain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.1)
        masterGain.gain.setValueAtTime(0.18, ctx.currentTime + 2.0)
        masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0)

        osc1.start(ctx.currentTime)
        osc2.start(ctx.currentTime)
        osc1.stop(ctx.currentTime + 3.1)
        osc2.stop(ctx.currentTime + 3.1)

        window.setTimeout(() => ctx.close(), 3200)
      } catch {
        // AudioContext not available or blocked — fail silently
      }
    }

    return () => {
      window.cancelAnimationFrame(rumbleRafId)
      window.clearTimeout(rumbleOff)
      window.requestAnimationFrame(() =>
        dispatchBlackholeUi({ type: 'set', patch: { rumbleActive: false } }),
      )
    }
  }, [blackholeCinematicPhase, audioEnabled])

  function handlePlanetClick(config: PlanetConfig) {
    if (config.id === 'sun') {
      if (!tutorialDone) return
      // Toggle is only meaningful in sun-hold.
      if (cameraPhase !== 'sun-hold') return
      const nextClosed = !sunPanelManuallyClosedRef.current
      sunPanelManuallyClosedRef.current = nextClosed
      if (nextClosed) {
        if (sunHoldTimerRef.current) {
          window.clearTimeout(sunHoldTimerRef.current)
          sunHoldTimerRef.current = null
        }
        setSunPanelVisible(false)
      } else {
        setSunPanelVisible(true)
      }
      return
    }
    if (config.id === 'mercury') {
      // Toggle is only meaningful in mercury-hold.
      if (cameraPhase !== 'mercury-hold') return
      const nextClosed = !mercuryPanelManuallyClosedRef.current
      mercuryPanelManuallyClosedRef.current = nextClosed
      if (nextClosed) {
        if (mercuryHoldTimerRef.current) {
          window.clearTimeout(mercuryHoldTimerRef.current)
          mercuryHoldTimerRef.current = null
        }
        setMercuryPanelVisible(false)
      } else {
        setMercuryPanelVisible(true)
      }
      return
    }
    if (config.id === 'venus') {
      // Toggle is only meaningful in venus-hold.
      if (cameraPhase !== 'venus-hold') return
      const nextClosed = !venusPanelManuallyClosedRef.current
      venusPanelManuallyClosedRef.current = nextClosed
      if (nextClosed) {
        if (venusHoldTimerRef.current) {
          window.clearTimeout(venusHoldTimerRef.current)
          venusHoldTimerRef.current = null
        }
        setVenusPanelVisible(false)
      } else {
        setVenusPanelVisible(true)
      }
      return
    }
    if (config.id === 'earth') {
      // Toggle is only meaningful in earth-hold.
      if (cameraPhase !== 'earth-hold') return
      const nextClosed = !earthPanelManuallyClosedRef.current
      earthPanelManuallyClosedRef.current = nextClosed
      if (nextClosed) {
        if (earthHoldTimerRef.current) {
          window.clearTimeout(earthHoldTimerRef.current)
          earthHoldTimerRef.current = null
        }
        setEarthPanelVisible(false)
      } else {
        setEarthPanelVisible(true)
      }
      return
    }
    if (config.id === 'moon') {
      // Toggle is only meaningful in moon-hold.
      if (cameraPhase !== 'moon-hold') return
      const nextClosed = !moonPanelManuallyClosedRef.current
      moonPanelManuallyClosedRef.current = nextClosed
      if (nextClosed) {
        if (moonHoldTimerRef.current) {
          window.clearTimeout(moonHoldTimerRef.current)
          moonHoldTimerRef.current = null
        }
        setMoonPanelVisible(false)
      } else {
        setMoonPanelVisible(true)
      }
      return
    }
    if (config.id === 'mars') {
      // Toggle is only meaningful in mars-hold.
      if (cameraPhase !== 'mars-hold') return
      const nextClosed = !marsPanelManuallyClosedRef.current
      marsPanelManuallyClosedRef.current = nextClosed
      if (nextClosed) {
        if (marsHoldTimerRef.current) {
          window.clearTimeout(marsHoldTimerRef.current)
          marsHoldTimerRef.current = null
        }
        setMarsPanelVisible(false)
      } else {
        setMarsPanelVisible(true)
      }
      return
    }
    if (config.id === 'neptune') {
      // Toggle is only meaningful in neptune-hold.
      if (cameraPhase !== 'neptune-hold') return
      const nextClosed = !neptunePanelManuallyClosedRef.current
      neptunePanelManuallyClosedRef.current = nextClosed
      if (nextClosed) {
        if (neptuneHoldTimerRef.current) {
          window.clearTimeout(neptuneHoldTimerRef.current)
          neptuneHoldTimerRef.current = null
        }
        setNeptunePanelVisible(false)
      } else {
        setNeptunePanelVisible(true)
      }
      return
    }
    setActivePlanet(config)
  }

  const sunConfig = PLANET_REGISTRY.find((p) => p.id === 'sun')!
  const mercuryConfig = PLANET_REGISTRY.find((p) => p.id === 'mercury')!
  const venusConfig = PLANET_REGISTRY.find((p) => p.id === 'venus')!
  const earthConfig = PLANET_REGISTRY.find((p) => p.id === 'earth')!
  const moonConfig = PLANET_REGISTRY.find((p) => p.id === 'moon')!
  const marsConfig = PLANET_REGISTRY.find((p) => p.id === 'mars')!
  const neptuneConfig = PLANET_REGISTRY.find((p) => p.id === 'neptune')!
  const uranusConfig = PLANET_REGISTRY.find((p) => p.id === 'uranus')!
  const blackholeConfig = PLANET_REGISTRY.find((p) => p.id === 'blackhole')!

  return (
    <div className={styles.solarSceneRoot}>
      <RotatePrompt isReady={isReady} />

      {showTutorial && (
        <OnboardingTutorial onDone={handleTutorialDone} />
      )}

      {IS_SAFE && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
          background: '#92400e', color: '#fef3c7', fontFamily: FONT_BODY,
          fontSize: '13px', fontWeight: 700, padding: '0.35rem 1rem',
          textAlign: 'center', letterSpacing: '0.06em', pointerEvents: 'none',
        }}>
          ⚠ SAFE MODE — NO GLBs — PROCEDURAL SPHERES ONLY
        </div>
      )}

      {IS_DEBUG && (
        <div style={{
          position: 'absolute', bottom: '1.5rem', left: '50%',
          transform: 'translateX(-50%)', zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', color: '#4ade80',
          fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 700,
          padding: '0.3rem 0.9rem', borderRadius: '999px',
          border: '1px solid rgba(74,222,128,0.4)', pointerEvents: 'none',
          letterSpacing: '0.05em', whiteSpace: 'nowrap',
        }}>
          IMMERSIVE DEBUG ACTIVE {IS_SAFE ? '| SAFE MODE' : ''}
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className={styles.scrollContainer}
        aria-label={immersiveScrollRegionLabel}
        role="region"
      >
        <div className={styles.scrollTrack} style={{ height: `${SCROLL_TRAVEL_VH}vh` }}>
          <div className={styles.stickyCanvas}>
            <Canvas
              camera={{ position: INITIAL_CAMERA_POSITION, fov: 45, near: 0.1, far: CAMERA_FAR }}
              gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
              style={{ background: '#030712', width: '100%', height: '100%' }}
              onCreated={handleCanvasCreated}
            >
              {/* Camera — only moves once initial GLBs are loaded */}
              {!IS_SAFE && (
                <group>
                  <CameraRig
                    progress={journeyReady ? scrollProgress : 0}
                    activePlanetId={activeJourneyPlanetId}
                    onPhaseChange={setCameraPhase}
                    onShotPhaseChange={IS_DEBUG ? setShotPhase : undefined}
                    currentShotId={currentShot.id}
                    nextShotId={nextShot?.id}
                    shotProgress={shotProgress}
                    discreteCurrentShotId={discreteCurrentShotId}
                    discreteTargetShotId={discreteTargetShotId}
                    discreteIsTransitioning={discreteIsTransitioning}
                    discreteIsResetting={discreteIsResetting}
                    discreteTransitionTRef={discreteTransitionTRef}
                    discreteIsTransitioningRef={discreteIsTransitioningRef}
                    discreteTargetShotIdRef={discreteTargetShotIdRef}
                    discreteCurrentShotIdRef={discreteCurrentShotIdRef}
                    onDiscreteTransitionComplete={onDiscreteTransitionComplete}
                    isBlackholeCinematic={isBlackholeCinematic}
                    isBlackholeCinematicRef={isBlackholeCinematicRef}
                    blackholeCinematicTRef={blackholeCinematicTRef}
                    onBlackholeCinematicComplete={onBlackholeCinematicComplete}
                    onBlackholeCinematicPhaseChange={onBlackholeCinematicPhaseChange}
                    isBlackholeResetting={isBlackholeResetting}
                    blackholeResetTRef={blackholeResetTRef}
                    onBlackholeResetComplete={onBlackholeResetComplete}
                    onBlackholeResetPhaseChange={onBlackholeResetPhaseChange}
                  />
                  <BlackholeRumble active={blackholeRumbleActive} />
                </group>
              )}

              {/* Warp starfield — InstancedMesh hyperspace effect (Uranus→Blackhole only) */}
              <WarpStarfield
                isBlackholeCinematic={isBlackholeCinematic}
                blackholeCinematicTRef={blackholeCinematicTRef}
                phase={blackholeCinematicPhase}
                isBlackholeResetting={isBlackholeResetting}
                blackholeResetTRef={blackholeResetTRef}
                blackholeResetPhase={blackholeResetPhase}
              />

              {/* Uranus detail textures — preload + warm when deep group is active (aligned with Neptune GLB). */}
              <UranusTexturePreload
                active={!IS_SAFE && journeyReady && allowedPlanetLoads.has('neptune')}
              />

              {/* Procedural Uranus-style mesh at inner ice-giant slot (`neptune` id) — hidden during blackhole cinematic */}
              <UranusGuaranteedMesh
                warm={!IS_SAFE && journeyReady && allowedPlanetLoads.has('neptune')}
                worldPosition={neptuneConfig.position}
                visible={innerIceGiantProceduralVisible}
                onClick={() => {
                  if (cameraPhase !== 'neptune-hold') return
                  const nextClosed = !neptunePanelManuallyClosedRef.current
                  neptunePanelManuallyClosedRef.current = nextClosed
                  if (nextClosed) {
                    if (neptuneHoldTimerRef.current) {
                      window.clearTimeout(neptuneHoldTimerRef.current)
                      neptuneHoldTimerRef.current = null
                    }
                    setNeptunePanelVisible(false)
                  } else {
                    setNeptunePanelVisible(true)
                  }
                }}
              />

              {/* Milky Way backdrop — Sun through Uranus (see NEBULA_VISIBLE) */}
              <NebulaBackground visible={NEBULA_VISIBLE} />

              {/* Blackhole — procedural fullscreen shader (own starfield) */}
              <BlackholeShaderMesh
                visible={BLACKHOLE_VISIBLE}
                position={BLACKHOLE_POS}
                isBlackholeResetting={isBlackholeResetting}
                blackholeResetPhase={blackholeResetPhase}
                blackholeResetT={resetCinematicT}
                onClick={() => {
                  if (cameraPhase !== 'blackhole-hold') return
                  const nextClosed = !blackholePanelManuallyClosedRef.current
                  blackholePanelManuallyClosedRef.current = nextClosed
                  if (nextClosed) {
                    if (blackholeHoldTimerRef.current) {
                      window.clearTimeout(blackholeHoldTimerRef.current)
                      blackholeHoldTimerRef.current = null
                    }
                    dispatchBlackholeUi({ type: 'set', patch: { panelVisible: false } })
                  } else {
                    dispatchBlackholeUi({ type: 'set', patch: { panelVisible: true } })
                  }
                }}
              />

              {/* Lighting */}
              <LightingRig safe={IS_SAFE} />

              {/* Procedural point stars — safe mode only (normal immersive uses NebulaBackground). */}
              {IS_SAFE && <StarField />}

              {/* Safe mode: procedural spheres only, no Suspense, no GLBs. */}
              {IS_SAFE && RENDERED_PLANETS.map((config) => (
                <SafeSphere key={config.id} config={meshConfigForPlanet(config)} />
              ))}

              {/*
               * Normal mode: each planet in its own Suspense boundary.
               *
               * CRITICAL: The fallback prop contains ONLY SuspenseFallbackSphere
               * (pure mesh, no hooks). PlanetMesh uses useFrame internally but
               * is a valid Canvas child.
               * Runtime evidence showed `Html` from drei was still the crash
               * source, so immersive mode now avoids any Canvas-attached DOM.
               */}
              {!IS_SAFE && RENDERED_PLANETS.map((config) => {
                const meshConfig = meshConfigForPlanet(config)
                const showPlanet =
                  config.id !== 'uranus' || outerNeptuneGlbVisible
                return (
                <group key={config.id} visible={showPlanet}>
                <Suspense
                  fallback={<SuspenseFallbackSphere config={meshConfig} />}
                >
                  <GLBErrorBoundary
                    fallback={<SuspenseFallbackSphere config={meshConfig} />}
                    onError={() => setGlbFailed((n) => n + 1)}
                  >
                    <PlanetMesh
                      config={meshConfig}
                      allowedPlanetLoads={allowedPlanetLoads}
                      onPlanetClick={handlePlanetClick}
                      onGlbLoaded={() => {
                        if (glbLoadedIdsRef.current.has(config.id)) return
                        glbLoadedIdsRef.current.add(config.id)
                        setGlbLoaded((n) => {
                          const next = n + 1
                          if (!journeyReady && next >= initialGroupSize) {
                            setJourneyReady(true)
                          }
                          return next
                        })
                      }}
                    />
                  </GLBErrorBoundary>
                </Suspense>
                </group>
              )})}
            </Canvas>

            {/* Cinematic fade-to-black — covers the 3D scene during departure only.
                WarpStarfield is INSIDE the Canvas, so we must keep this overlay
                transparent during warp (blackOpacity = 0) or the starfield is hidden.
                departure: fades from 0→1 (scene darkens as camera turns away)
                warp:      stays at 0 so Canvas (and WarpStarfield) is visible
                reveal:    fades from 0→1→0 so Blackhole emerges from darkness */}
            {isBlackholeCinematic && (() => {
              let blackOpacity = 0
              const t = cinematicT
              if (blackholeCinematicPhase === 'departure') {
                blackOpacity = t / 0.12
              } else if (blackholeCinematicPhase === 'warp') {
                blackOpacity = 0
              } else {
                // reveal: 0.76→1.00 in global t, local [0..1]
                const revLocal = (t - 0.76) / 0.24
                blackOpacity = Math.max(0, 1 - revLocal)
              }
              return (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#09090b',
                    opacity: blackOpacity,
                    pointerEvents: 'none',
                    zIndex: 100,
                  }}
                />
              )
            })()}

            {/* BlackholeCinematicOverlay is rendered via portal — see below */}
          </div>
        </div>
      </div>

      {/* Sun info panel — uses the empty half of the Sun frame */}
      <SunInfoPanel
        config={sunConfig}
        open={sunPanelVisible && cameraPhase === 'sun-hold' && tutorialDone}
        align="right"
        onClose={() => {
          sunPanelManuallyClosedRef.current = true
          if (sunHoldTimerRef.current) {
            window.clearTimeout(sunHoldTimerRef.current)
            sunHoldTimerRef.current = null
          }
          setSunPanelVisible(false)
        }}
      />

      <SunInfoPanel
        config={mercuryConfig}
        open={mercuryPanelVisible && cameraPhase === 'mercury-hold'}
        align="left"
        onClose={() => {
          mercuryPanelManuallyClosedRef.current = true
          if (mercuryHoldTimerRef.current) {
            window.clearTimeout(mercuryHoldTimerRef.current)
            mercuryHoldTimerRef.current = null
          }
          setMercuryPanelVisible(false)
        }}
      />

      <SunInfoPanel
        config={venusConfig}
        open={venusPanelVisible && cameraPhase === 'venus-hold'}
        align="right"
        onClose={() => {
          venusPanelManuallyClosedRef.current = true
          if (venusHoldTimerRef.current) {
            window.clearTimeout(venusHoldTimerRef.current)
            venusHoldTimerRef.current = null
          }
          setVenusPanelVisible(false)
        }}
      />

      <SunInfoPanel
        config={earthConfig}
        open={earthPanelVisible && cameraPhase === 'earth-hold'}
        align="left"
        onClose={() => {
          earthPanelManuallyClosedRef.current = true
          if (earthHoldTimerRef.current) {
            window.clearTimeout(earthHoldTimerRef.current)
            earthHoldTimerRef.current = null
          }
          setEarthPanelVisible(false)
        }}
      />

      <SunInfoPanel
        config={moonConfig}
        open={moonPanelVisible && cameraPhase === 'moon-hold'}
        align="right"
        onClose={() => {
          moonPanelManuallyClosedRef.current = true
          if (moonHoldTimerRef.current) {
            window.clearTimeout(moonHoldTimerRef.current)
            moonHoldTimerRef.current = null
          }
          setMoonPanelVisible(false)
        }}
      />

      <SunInfoPanel
        config={marsConfig}
        open={marsPanelVisible && cameraPhase === 'mars-hold'}
        align="left"
        onClose={() => {
          marsPanelManuallyClosedRef.current = true
          if (marsHoldTimerRef.current) {
            window.clearTimeout(marsHoldTimerRef.current)
            marsHoldTimerRef.current = null
          }
          setMarsPanelVisible(false)
        }}
      />

      <SunInfoPanel
        config={neptuneConfig}
        open={neptunePanelVisible && cameraPhase === 'neptune-hold'}
        align="right"
        onClose={() => {
          neptunePanelManuallyClosedRef.current = true
          if (neptuneHoldTimerRef.current) {
            window.clearTimeout(neptuneHoldTimerRef.current)
            neptuneHoldTimerRef.current = null
          }
          setNeptunePanelVisible(false)
        }}
      />

      <SunInfoPanel
        config={uranusConfig}
        open={uranusPanelVisible && cameraPhase === 'uranus-hold'}
        align="left"
        onClose={() => {
          uranusPanelManuallyClosedRef.current = true
          if (uranusHoldTimerRef.current) {
            window.clearTimeout(uranusHoldTimerRef.current)
            uranusHoldTimerRef.current = null
          }
          setUranusPanelVisible(false)
        }}
      />

      <SunInfoPanel
        config={blackholeConfig}
        open={blackholePanelVisible && cameraPhase === 'blackhole-hold'}
        align="left"
        onClose={() => {
          blackholePanelManuallyClosedRef.current = true
          if (blackholeHoldTimerRef.current) {
            window.clearTimeout(blackholeHoldTimerRef.current)
            blackholeHoldTimerRef.current = null
          }
          dispatchBlackholeUi({ type: 'set', patch: { panelVisible: false } })
        }}
      />

      {/* Loading gate — shown until initial GLBs are ready. Hidden when shell
          provides onReady (shell shows Space loading overlay instead). */}
      {!journeyReady && !IS_SAFE && !onReady && discreteCurrentShotId === 'sun' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 500,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(3,7,18,0.92)',
          backdropFilter: 'blur(6px)',
          gap: '1.25rem',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            border: '3px solid rgba(255,167,38,0.2)',
            borderTopColor: '#FFA726',
            animation: 'spin 1.1s linear infinite',
          }} />
          <p style={{
            color: '#FFA726', fontFamily: FONT_BODY, fontSize: '13px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            margin: 0, opacity: 0.9,
          }}>
            Loading solar system…
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.35)', fontFamily: FONT_BODY, fontSize: '12px',
            margin: 0,
          }}>
            {glbLoaded} / {initialGroupSize} models ready
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* DOM overlays — top-left HUD (menu + audio) */}
      {/* En móvil (pointer: coarse) se oculta mientras una card de planeta esté abierta */}
      <div
        className={styles.hudStack}
        data-planet-open={activePlanet ? 'true' : 'false'}
      >
        <ExpandOnHoverIconButton
          variant="immersive"
          label={menuLabel}
          ariaLabel={menuLabel}
          icon={<ArrowLeft strokeWidth={2} />}
          onClick={onSwitchMode}
        />
        {onSetAudioEnabled && (
          <ExpandOnHoverIconButton
            variant="immersive"
            label={muteLabel}
            ariaLabel={muteAria}
            icon={
              audioEnabled ? (
                <Volume2 strokeWidth={2} />
              ) : (
                <VolumeX strokeWidth={2} />
              )
            }
            onClick={() => onSetAudioEnabled(!audioEnabled)}
          />
        )}
      </div>

      <div
        className={styles.progressBar}
        aria-hidden="true"
        style={{ '--progress': scrollProgress } as React.CSSProperties}
      />

      {isFinaleActive && (
        <div className={styles.finaleBadge} aria-live="polite" aria-atomic="true">
          {locale === 'es' ? 'Gran final' : 'Grand Finale'}
        </div>
      )}

      {activePlanet &&
        activePlanet.id !== 'sun' &&
        activePlanet.id !== 'mercury' &&
        activePlanet.id !== 'uranus' &&
        activePlanet.id !== 'neptune' &&
        activePlanet.id !== 'mars' &&
        activePlanet.id !== 'moon' &&
        activePlanet.id !== 'earth' &&
        activePlanet.id !== 'venus' &&
        activePlanet.id !== 'blackhole' && (
        <PlanetOverlay config={activePlanet} onClose={() => setActivePlanet(null)} />
      )}

      {IS_DEBUG && (
        <div style={{
          position: 'absolute',
          top: '8.5rem',
          left: '1.25rem',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          color: '#93c5fd',
          fontFamily: FONT_BODY,
          fontSize: '12px',
          fontWeight: 700,
          padding: '0.35rem 0.7rem',
          borderRadius: '0.55rem',
          border: '1px solid rgba(147,197,253,0.28)',
          pointerEvents: 'none',
          letterSpacing: '0.04em',
          lineHeight: '1.7',
        }}>
          {/* ── DISCRETE (fuente de verdad activa) ── */}
          <div style={{ color: '#4ade80' }}>◈ DISCRETE (active)</div>
          <div>currentShot={discreteCurrentShotId}</div>
          <div>targetShot={discreteTargetShotId ?? 'idle'}</div>
          <div>transitioning={String(discreteIsTransitioning)} | dir={discreteTransitionDir ?? 'none'}</div>
          {isBlackholeCinematic && (
            <div style={{ color: '#c084fc' }}>
              bhCinematic=true | phase={blackholeCinematicPhase} | t={cinematicT.toFixed(3)}
            </div>
          )}
          {isBlackholeResetting && (
            <div style={{ color: '#fb923c' }}>
              bhReset=true | phase={blackholeResetPhase} | t={resetCinematicT.toFixed(3)}
            </div>
          )}
          <div style={{ color: discreteIsResetting ? '#f87171' : undefined }}>
            resetting={String(discreteIsResetting)}
          </div>
          <div>shotPhase={shotPhase} | cameraPhase={cameraPhase}</div>
          <div>intent={discreteWheelIntent.toFixed(0)}</div>
          <div>outerNeptuneGlb={outerNeptuneGlbVisible ? 'yes' : 'no'} | innerIceProc={innerIceGiantProceduralVisible ? 'yes' : 'no'} | blackholeVisible={BLACKHOLE_VISIBLE ? 'yes' : 'no'}</div>
          {/* ── LEGACY (solo referencia, no controla cámara) ── */}
          <div style={{ borderTop: '1px solid rgba(147,197,253,0.2)', marginTop: '0.3rem', paddingTop: '0.3rem', color: '#64748b' }}>
            [LEGACY — no controla cámara]
          </div>
          <div style={{ color: '#64748b' }}>scroll={scrollProgress.toFixed(3)} | activePlanet={activeJourneyPlanet.id}</div>
          <div style={{ color: '#64748b' }}>legacyShot={currentShot.id} | legacyNext={nextShot?.id ?? 'none'}</div>
        </div>
      )}

      {IS_DEBUG && (
        <DebugHUD
          mode={mode}
          entered={entered}
          canvasMounted={canvasMounted}
          canvasSize={canvasSize}
          cameraPos={cameraPos}
          scrollProgress={scrollProgress}
          activePlanetLoads={allowedPlanetLoads}
          glbLoaded={glbLoaded}
          glbFailed={glbFailed}
          audioEnabled={audioEnabled}
          audioDiagnostics={audioDiagnostics}
          isSafeMode={IS_SAFE}
          currentShotId={currentShot.id}
          nextShotId={nextShot?.id}
          shotProgress={shotProgress}
          shotPhase={shotPhase}
          discreteCurrentShotId={discreteCurrentShotId}
          discreteTargetShotId={discreteTargetShotId}
          discreteIsTransitioning={discreteIsTransitioning}
          discreteTransitionDirection={discreteTransitionDir}
          discreteWheelIntent={discreteWheelIntent}
          isBlackholeCinematic={isBlackholeCinematic}
          blackholeCinematicPhase={blackholeCinematicPhase}
          blackholeCinematicT={cinematicT}
          isBlackholeResetting={isBlackholeResetting}
          blackholeResetPhase={blackholeResetPhase}
          blackholeResetT={resetCinematicT}
        />
      )}

      {/* Warp overlay rendered via portal directly into document.body so it
          is guaranteed to be outside every stacking context (solarSceneRoot,
          stickyCanvas, R3F wrapper divs). position:fixed + z-index:9000 then
          works unconditionally against the true viewport. */}
      {createPortal(
        <BlackholeCinematicOverlay
          activeArrival={isBlackholeCinematic}
          cinematicT={cinematicT}
          phase={blackholeCinematicPhase}
          activeReset={isBlackholeResetting}
          resetT={resetCinematicT}
          resetPhase={blackholeResetPhase}
        />,
        document.body,
      )}
    </div>
  )
}
