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
 * [NV] Phase 4: full blackhole reset loop.
 * [NV] Phase 4: audio controls HUD.
 * [NV] Phase 4: lateral camera drift per planet.
 */

import { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { getStableActivePlanet, PLANET_REGISTRY } from './planetRegistry'
import type { LoadingGroup, PlanetConfig, PlanetId } from './planetRegistry'
import { PlanetMesh } from './PlanetMesh'
import { PlanetOverlay } from './PlanetOverlay'
import { CameraRig } from './CameraRig'
import type { CameraPhaseId, ShotPhaseId } from './CameraRig'
import { useScrollProgress } from '../lib/useScrollProgress'
import { useShotNavigation } from './useShotNavigation'
import { useDiscreteShotNavigation } from './useDiscreteShotNavigation'
import { DebugHUD } from './DebugHUD'
import type { AudioDiagnostics } from '../lib/useAudioShell'
import styles from './SolarScene.module.css'

// ── Debug / safe mode detection ───────────────────────────────────────────────

function getQueryParam(name: string): boolean {
  try {
    return new URLSearchParams(window.location.search).get(name) === '1'
  } catch {
    return false
  }
}

const IS_DEBUG = import.meta.env.DEV || getQueryParam('debug')
const IS_SAFE  = getQueryParam('safe')

// ── Loading thresholds ─────────────────────────────────────────────────────────

const DEEP_LOAD_THRESHOLD  = 0.45
const MID_SCROLL_THRESHOLD = 0.08
const FINALE_THRESHOLD     = 0.90
const MID_LOAD_DELAY_MS    = 2000
// Matches INTRO_START in CameraRig — CameraRig snaps to this on frame 1.
// Matches INTRO_START in CameraRig.tsx — CameraRig snaps to this on frame 1.
const INITIAL_CAMERA_POSITION: [number, number, number] = [18.0, 14.0, 22.0]
const SCROLL_TRAVEL_VH = 700

// ── Stars background ───────────────────────────────────────────────────────────

const STAR_COUNT = 2500

function buildStarGeometry(): { positions: Float32Array; colors: Float32Array } {
  const pos = new Float32Array(STAR_COUNT * 3)
  const col = new Float32Array(STAR_COUNT * 3)
  for (let i = 0; i < STAR_COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 400
    pos[i * 3 + 1] = (Math.random() - 0.5) * 200
    pos[i * 3 + 2] = Math.random() * -250 + 20
    const t = Math.random()
    col[i * 3]     = 0.8 + t * 0.2
    col[i * 3 + 1] = 0.85 + t * 0.1
    col[i * 3 + 2] = 0.9 + (1 - t) * 0.1
  }
  return { positions: pos, colors: col }
}

const STAR_GEOMETRY_DATA = buildStarGeometry()

function StarField() {
  const pointsRef = useRef<THREE.Points>(null)
  const { positions, colors } = STAR_GEOMETRY_DATA

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.002
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.15} vertexColors transparent opacity={0.85} sizeAttenuation />
    </points>
  )
}


// ── Uranus material patch ─────────────────────────────────────────────────────
//
// Forces doubleSided=true on every material in the Uranus GLB so rings are
// always visible regardless of camera angle.

function UranusDoubleSidedPatch() {
  const { scene } = useGLTF('/assets/solar/models/uranus.glb')
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((mat) => {
          if (mat && (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            ;(mat as THREE.MeshStandardMaterial).side = THREE.DoubleSide
            ;(mat as THREE.MeshStandardMaterial).needsUpdate = true
          }
        })
      }
    })
  }, [scene])
  return null
}

// ── Uranus textured mesh ───────────────────────────────────────────────────────
//
// Uses textures extracted directly from uranus.glb:
//   tex0.jpg  → sphere baseColor  (material "material")
//   tex1.png  → clouds baseColor  (material "material_1", BLEND)
//   tex2.jpg  → clouds normalMap  (material "material_1")
//
// Uranus position: [22, -1, -328]  (matches planetRegistry + shotConfig)
// Sphere world radius: 4.0u

const URANUS_POS: [number, number, number] = [22, -1.0, -328]
const URANUS_SPHERE_R = 4.0

function UranusTexturedInner({ visible, onClick }: { visible: boolean; onClick?: () => void }) {
  const [sphereMap, cloudsMap, cloudsNormal] = useTexture([
    '/assets/solar/textures/uranus/tex0.jpg',
    '/assets/solar/textures/uranus/tex1.png',
    '/assets/solar/textures/uranus/tex2.jpg',
  ])

  if (!visible) return null

  return (
    <group position={URANUS_POS}>
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

function UranusGuaranteedMesh({ visible, onClick }: { visible: boolean; onClick?: () => void }) {
  if (!visible) return null
  return (
    <Suspense fallback={
      <group position={URANUS_POS}>
        <mesh
          frustumCulled={false}
          onClick={(e) => { e.stopPropagation(); onClick?.() }}
        >
          <sphereGeometry args={[URANUS_SPHERE_R, 64, 64]} />
          <meshStandardMaterial color="#7ececa" emissive="#1a7a7a" emissiveIntensity={0.25} roughness={0.55} />
        </mesh>
      </group>
    }>
      <UranusTexturedInner visible={visible} onClick={onClick} />
    </Suspense>
  )
}

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
  PLANET_REGISTRY
    .filter((p) => p.loadingGroup === 'initial')
    .forEach((p) => useGLTF.preload(p.modelPath))
}

// ── Progressive loader hook ────────────────────────────────────────────────────

function useProgressiveLoader(scrollProgress: number, safe: boolean): Set<LoadingGroup> {
  const [activeGroups, setActiveGroups] = useState<Set<LoadingGroup>>(
    () => new Set<LoadingGroup>(['initial']),
  )
  const midFiredRef  = useRef(false)
  const deepFiredRef = useRef(false)

  useEffect(() => {
    if (safe || midFiredRef.current) return
    midFiredRef.current = true

    const fireMid = () => {
      PLANET_REGISTRY
        .filter((p) => p.loadingGroup === 'mid')
        .forEach((p) => useGLTF.preload(p.modelPath))
      setActiveGroups((prev) => new Set([...prev, 'mid']))
    }

    type IdleCb = (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number
    type CancelIdleCb = (handle: number) => void
    const ric = (window as unknown as Record<string, unknown>)['requestIdleCallback'] as IdleCb | undefined
    const cic = (window as unknown as Record<string, unknown>)['cancelIdleCallback'] as CancelIdleCb | undefined

    let handle: number
    if (ric && cic) {
      handle = ric(fireMid, { timeout: MID_LOAD_DELAY_MS })
      return () => cic(handle)
    } else {
      handle = window.setTimeout(fireMid, MID_LOAD_DELAY_MS)
      return () => window.clearTimeout(handle)
    }
  }, [safe])

  useEffect(() => {
    if (safe || midFiredRef.current) return
    if (scrollProgress < MID_SCROLL_THRESHOLD) return
    midFiredRef.current = true
    const handle = window.setTimeout(() => {
      PLANET_REGISTRY
        .filter((p) => p.loadingGroup === 'mid')
        .forEach((p) => useGLTF.preload(p.modelPath))
      setActiveGroups((prev) => new Set([...prev, 'mid']))
    }, 0)
    return () => window.clearTimeout(handle)
  }, [scrollProgress, safe])

  useEffect(() => {
    if (safe || deepFiredRef.current) return
    if (scrollProgress < DEEP_LOAD_THRESHOLD) return
    deepFiredRef.current = true
    const handle = window.setTimeout(() => {
      PLANET_REGISTRY
        .filter((p) => p.loadingGroup === 'deep')
        .forEach((p) => useGLTF.preload(p.modelPath))
      setActiveGroups((prev) => new Set([...prev, 'deep']))
    }, 0)
    return () => window.clearTimeout(handle)
  }, [scrollProgress, safe])

  return activeGroups
}

// ── SolarScene ────────────────────────────────────────────────────────────────

export interface SolarSceneProps {
  onSwitchMode: () => void
  mode?: string
  entered?: boolean
  audioEnabled?: boolean
  audioDiagnostics?: AudioDiagnostics
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

export function SolarScene({
  onSwitchMode,
  mode = 'immersive',
  entered = true,
  audioEnabled = false,
  audioDiagnostics = DEFAULT_AUDIO_DIAG,
}: SolarSceneProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollProgress = useScrollProgress(scrollContainerRef)
  const activeGroups = useProgressiveLoader(scrollProgress, IS_SAFE)
  const activeJourneyPlanetRef = useRef<PlanetId>('sun')

  // Legacy scroll-based shot navigation (kept for debug display only)
  const { currentShot, nextShot, shotProgress } = useShotNavigation(scrollProgress)

  // Discrete Sun ↔ Mercury navigation (replaces scroll scrub between these two shots)
  const {
    currentShotId:       discreteCurrentShotId,
    targetShotId:        discreteTargetShotId,
    isTransitioning:     discreteIsTransitioning,
    transitionDirection: discreteTransitionDir,
    wheelIntent:         discreteWheelIntent,
    transitionTRef:      discreteTransitionTRef,
    onTransitionComplete: onDiscreteTransitionComplete,
  } = useDiscreteShotNavigation(scrollContainerRef)

  // ── Discrete path: lock scroll container at scrollTop=0 ──────────────────────
  // The discrete system controls ALL shots (sun → uranus). While it is active,
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

  // Blackhole excluded always. Uranus excluded from GLB pipeline — the high-quality
  // procedural mesh (UranusGuaranteedMesh) replaces the low-poly GLB (2143 verts).
  const RENDERED_PLANETS = PLANET_REGISTRY.filter((p) => p.id !== 'blackhole' && p.id !== 'uranus')
  const BLACKHOLE_VISIBLE = false
  const URANUS_VISIBLE =
    discreteCurrentShotId === 'uranus' || discreteTargetShotId === 'uranus'

  const [activePlanet, setActivePlanet] = useState<PlanetConfig | null>(null)
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
  const [cameraPhase, setCameraPhase]     = useState<CameraPhaseId>('intro')
  const [shotPhase, setShotPhase]         = useState<ShotPhaseId>('sun')
  // Gate: how many GLBs in the 'initial' group need to load before we start the journey.
  // Must use RENDERED_PLANETS (excludes blackhole + uranus) — uranus uses a procedural
  // mesh and never fires onGlbLoaded, so counting it would stall the gate forever.
  const initialGroupSize = RENDERED_PLANETS.filter((p) => p.loadingGroup === 'initial').length
  const [journeyReady, setJourneyReady]   = useState(IS_SAFE) // safe mode skips GLB gate

  // Read canvas/camera state via onCreated — no useThree needed outside Canvas
  const handleCanvasCreated = useCallback((state: { camera: THREE.Camera; gl: THREE.WebGLRenderer }) => {
    setCanvasMounted(true)
    setCanvasSize({ width: state.gl.domElement.clientWidth, height: state.gl.domElement.clientHeight })
    setCameraPos({ x: state.camera.position.x, y: state.camera.position.y, z: state.camera.position.z })

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

  return (
    <div className={styles.solarSceneRoot}>

      {IS_SAFE && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
          background: '#92400e', color: '#fef3c7', fontFamily: 'monospace',
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
          fontFamily: 'monospace', fontSize: '12px', fontWeight: 700,
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
        aria-label="Solar system experience — scroll to explore"
        role="region"
      >
        <div className={styles.scrollTrack} style={{ height: `${SCROLL_TRAVEL_VH}vh` }}>
          <div className={styles.stickyCanvas}>
            <Canvas
              camera={{ position: INITIAL_CAMERA_POSITION, fov: 45, near: 0.1, far: 700 }}
              gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
              style={{ background: '#030712', width: '100%', height: '100%' }}
              onCreated={handleCanvasCreated}
            >
              {/* Camera — only moves once initial GLBs are loaded */}
              {!IS_SAFE && (
                <CameraRig
                  progress={journeyReady ? scrollProgress : 0}
                  activePlanetId={activeJourneyPlanetId}
                  onPhaseChange={IS_DEBUG ? setCameraPhase : undefined}
                  onShotPhaseChange={IS_DEBUG ? setShotPhase : undefined}
                  currentShotId={currentShot.id}
                  nextShotId={nextShot?.id}
                  shotProgress={shotProgress}
                  discreteCurrentShotId={discreteCurrentShotId}
                  discreteTargetShotId={discreteTargetShotId}
                  discreteIsTransitioning={discreteIsTransitioning}
                  discreteTransitionTRef={discreteTransitionTRef}
                  onDiscreteTransitionComplete={onDiscreteTransitionComplete}
                />
              )}

              {/* Uranus material patch — forces doubleSided on all ring materials */}
              {!IS_SAFE && (
                <Suspense fallback={null}>
                  <UranusDoubleSidedPatch />
                </Suspense>
              )}

              {/* Uranus guaranteed mesh — always visible, no GLB dependency */}
              <UranusGuaranteedMesh
                visible={
                  discreteCurrentShotId === 'uranus' ||
                  discreteTargetShotId   === 'uranus' ||
                  (discreteCurrentShotId === 'neptune' && discreteIsTransitioning)
                }
                onClick={() => {
                  const cfg = PLANET_REGISTRY.find((p) => p.id === 'uranus')
                  if (cfg) setActivePlanet(cfg)
                }}
              />

              {/* Lighting */}
              <LightingRig safe={IS_SAFE} />

              {/* Stars */}
              <StarField />

              {/* Safe mode: procedural spheres only, no Suspense, no GLBs. */}
              {IS_SAFE && RENDERED_PLANETS.map((config) => (
                <SafeSphere key={config.id} config={config} />
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
              {!IS_SAFE && RENDERED_PLANETS.map((config) => (
                <Suspense
                  key={config.id}
                  fallback={<SuspenseFallbackSphere config={config} />}
                >
                  <GLBErrorBoundary
                    fallback={<SuspenseFallbackSphere config={config} />}
                    onError={() => setGlbFailed((n) => n + 1)}
                  >
                    <PlanetMesh
                      config={config}
                      activeGroups={activeGroups}
                      onPlanetClick={(c) => setActivePlanet(c)}
                      onGlbLoaded={() => {
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
              ))}
            </Canvas>
          </div>
        </div>
      </div>

      {/* Loading gate — shown until initial GLBs are ready.
          Suppressed when the discrete system is already past 'sun': the user
          navigated here before (hot-reload scenario), GLBs loaded previously. */}
      {!journeyReady && !IS_SAFE && discreteCurrentShotId === 'sun' && (
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
            color: '#FFA726', fontFamily: 'monospace', fontSize: '13px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            margin: 0, opacity: 0.9,
          }}>
            Loading solar system…
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', fontSize: '11px',
            margin: 0,
          }}>
            {glbLoaded} / {initialGroupSize} models ready
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* DOM overlays */}
      <button
        type="button"
        className={styles.switchModeBtn}
        onClick={onSwitchMode}
        aria-label="Switch to Classic mode"
      >
        ← Classic mode
      </button>

      <div
        className={styles.progressBar}
        aria-hidden="true"
        style={{ '--progress': scrollProgress } as React.CSSProperties}
      />

      {isFinaleActive && (
        <div className={styles.finaleBadge} aria-live="polite" aria-atomic="true">
          Grand Finale
        </div>
      )}

      {activePlanet && (
        <PlanetOverlay config={activePlanet} onClose={() => setActivePlanet(null)} />
      )}

      {IS_DEBUG && (
        <div style={{
          position: 'absolute',
          top: '4.75rem',
          left: '1.25rem',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          color: '#93c5fd',
          fontFamily: 'monospace',
          fontSize: '11px',
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
          <div>shotPhase={shotPhase} | cameraPhase={cameraPhase}</div>
          <div>intent={discreteWheelIntent.toFixed(0)}</div>
          <div>uranusVisible={URANUS_VISIBLE ? 'yes' : 'no'} | blackholeVisible={BLACKHOLE_VISIBLE ? 'yes' : 'no'}</div>
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
          activeGroups={activeGroups}
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
        />
      )}
    </div>
  )
}
