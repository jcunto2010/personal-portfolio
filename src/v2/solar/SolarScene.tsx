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
import { createPortal } from 'react-dom'
import type { ReactNode, RefObject } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useGLTF, useTexture } from '@react-three/drei'
import { getStableActivePlanet, PLANET_REGISTRY } from './planetRegistry'
import type { LoadingGroup, PlanetConfig, PlanetId } from './planetRegistry'
import { PlanetMesh } from './PlanetMesh'
import { PlanetOverlay } from './PlanetOverlay'
import { SunInfoPanel } from './SunInfoPanel'
import { CameraRig } from './CameraRig'
import type { CameraPhaseId, ShotPhaseId } from './CameraRig'
import { useScrollProgress } from '../lib/useScrollProgress'
import { useShotNavigation } from './useShotNavigation'
import { useDiscreteShotNavigation } from './useDiscreteShotNavigation'
import { DebugHUD } from './DebugHUD'
import { BlackholeCinematicOverlay } from './BlackholeCinematicOverlay'
import { WarpStarfield } from './WarpStarfield'
import { BlackholeShaderMesh } from './BlackholeShaderMesh'
import type { AudioDiagnostics } from '../lib/useAudioShell'
import { disableFrustumCulling } from './glbNormalization'
import styles from './SolarScene.module.css'
import { useLocale } from '../lib/localeContext'
import { getPlanetPhaseInfo } from './planetPhaseInfo'

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

type BlackholeRenderMode = 'glb' | 'shader'

function getBlackholeRenderMode(): BlackholeRenderMode {
  try {
    const raw = new URLSearchParams(window.location.search).get('blackholeRender')
    return raw === 'shader' ? 'shader' : 'glb'
  } catch {
    return 'glb'
  }
}

// Temporal: desactiva el debug HUD (incluye overlay + telemetría asociada).
// Si quieres volver a activarlo, pon esto en `true`.
const SHOW_DEBUG_HUD = false
const IS_DEBUG = SHOW_DEBUG_HUD && (import.meta.env.DEV || getQueryParam('debug'))
const IS_SAFE  = getQueryParam('safe')
const BLACKHOLE_RENDER_MODE = getBlackholeRenderMode()

// ── Loading thresholds ─────────────────────────────────────────────────────────

const DEEP_LOAD_THRESHOLD  = 0.45
const MID_SCROLL_THRESHOLD = 0.08
const FINALE_THRESHOLD     = 0.90
const MID_LOAD_DELAY_MS    = 2000
// Matches INTRO_START in CameraRig — CameraRig snaps to this on frame 1.
// Matches INTRO_START in CameraRig.tsx — CameraRig snaps to this on frame 1.
const INITIAL_CAMERA_POSITION: [number, number, number] = [36.0, 28.0, 44.0]
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

const CIRCLE_POINT_TEXTURE = createCirclePointTexture()

function StarField() {
  const pointsRef = useRef<THREE.Points>(null)
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
        map={CIRCLE_POINT_TEXTURE}
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


// ── Space background (Blackhole shot only) ─────────────────────────────────────
//
// Full-sky inverted sphere using an 8K Milky Way starfield texture.
// Centered at origin so it covers the entire scene regardless of camera position.
// renderOrder=-1 and depthWrite=false ensures it renders behind everything.

function NebulaBackground({ visible }: { visible: boolean }) {
  const texture = useTexture('/assets/solar/textures/8k_stars_milky_way.jpg')
  if (!visible) return null
  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[900, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
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

const URANUS_TEXTURE_URLS = [
  '/assets/solar/textures/uranus/tex0.jpg',
  '/assets/solar/textures/uranus/tex1.png',
  '/assets/solar/textures/uranus/tex2.jpg',
] as const

/** Preloads Uranus textures (and GLB) when at Neptune so the first Neptune→Uranus transition is smooth. */
function UranusTexturePreload({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return
    useLoader.preload(THREE.TextureLoader, [...URANUS_TEXTURE_URLS])
    useGLTF.preload('/assets/solar/models/uranus.glb')
  }, [active])
  return null
}

function UranusTexturedInner({ visible, onClick }: { visible: boolean; onClick?: () => void }) {
  const [sphereMap, cloudsMap, cloudsNormal] = useTexture([...URANUS_TEXTURE_URLS])

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

// ── Blackhole GLB mesh ────────────────────────────────────────────────────────
//
// Uses the real blackhole.glb (31 MB) — same normalisation pipeline as PlanetMesh.
// Position: [0, 0, -400]  (matches planetRegistry + shotConfig)
// scale=4.0 → after GLB normalisation, dominant axis maps to 2*1 = 2u, then ×4 = 8u world radius.
// The accretion disk in the GLB extends well beyond the sphere, so the visual
// fills 45-60% of the frame at the shotConfig camera distance.
//
// Preload strategy:
//   - useGLTF.preload is called from SolarScene when discreteCurrentShotId === 'uranus'
//     so the GLB is ready (or nearly) before the user scrolls to Blackhole.
//   - While loading, the Suspense fallback shows a dark procedural sphere.

const BLACKHOLE_GLB_PATH = '/assets/solar/models/blackhole_pbr.glb'
const BLACKHOLE_POS: [number, number, number] = [0, 0, -400]
// Raw GLB scale — no normalization. The blackhole GLB is placed directly at
// BLACKHOLE_POS with this scale. Adjust until the disk fills the frame.
// Start at 0.012 based on typical Sketchfab blackhole GLB native sizes (~2000 units).
const BLACKHOLE_SCALE = 0.012
const BLACKHOLE_SPHERE_R = 8.0  // fallback sphere radius (visible while GLB loads)

// Refs to animated materials — populated once in useEffect, driven each frame in useFrame
interface BlackholeLightMats {
  light1: THREE.MeshStandardMaterial[]
  light2: THREE.MeshStandardMaterial[]
  light3: THREE.MeshStandardMaterial[]
  diskGroup: THREE.Group | null   // the sub-group containing the accretion disk meshes
}

function BlackholeGLBInner({ onClick }: { onClick?: () => void }) {
  const { scene } = useGLTF(BLACKHOLE_GLB_PATH)
  const { gl } = useThree()
  const lightMatsRef = useRef<BlackholeLightMats>({ light1: [], light2: [], light3: [], diskGroup: null })
  const diskGroupRef = useRef<THREE.Group | null>(null)

  useEffect(() => {
    disableFrustumCulling(scene)

    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()

    const collected: BlackholeLightMats = { light1: [], light2: [], light3: [], diskGroup: null }

    scene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((mat) => {
        if (!mat) return
        const m = mat as THREE.MeshStandardMaterial
        if (!m.isMeshStandardMaterial) return

        if (mat.name === 'black_hole_light3') {
          // emissiveFactor=[0.2,0.2,0.2] — outer dim ring, keep low so ACES compresses naturally
          m.emissive.set(0xffffff)
          m.emissiveIntensity = 1.6
          m.color.set(0x000000)
          m.metalness = 0
          m.roughness = 0.83
          collected.light3.push(m)
        } else if (mat.name === 'black_hole_light2') {
          // emissiveFactor=[0.6,0.6,0.6] — mid ring
          m.emissive.set(0xffffff)
          m.emissiveIntensity = 2.5
          m.color.set(0x000000)
          m.metalness = 0
          m.roughness = 0.67
          collected.light2.push(m)
        } else if (mat.name === 'black_hole_light1') {
          // emissiveFactor=[1,1,1], emissiveStrength=2 — inner bright ring
          m.emissive.set(0xffffff)
          m.emissiveIntensity = 4.0
          m.color.set(0x000000)
          m.metalness = 0
          m.roughness = 1
          collected.light1.push(m)
        } else if (
          mat.name === 'black_hole_blackoutside' ||
          mat.name === 'black_hole_center' ||
          mat.name === 'black_hole_distortion'
        ) {
          m.color.set(0x000000)
          m.metalness = 0
          m.roughness = 1
          m.emissive.set(0x000000)
          m.emissiveIntensity = 0
        } else {
          // ring / ring2 / Planet — keep original PBR, minimal envMap for specularity
          m.envMap = envMap
          m.envMapIntensity = 0.05
        }
        m.needsUpdate = true
      })
    })

    lightMatsRef.current = collected
  }, [scene, gl])

  // Procedural animation: slow disk rotation + emissive pulse on the inner ring
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Rotate the entire disk/scene slowly around Y (disk spin).
    // Mutating `scene` directly is flagged by `react-hooks/immutability`
    // because `scene` comes from `useGLTF`.
    if (diskGroupRef.current) {
      diskGroupRef.current.rotation.y = t * 0.04
    }

    // Pulse around the correct base intensities (light1=4.0, light2=2.5)
    const pulse = 4.0 + Math.sin(t * 1.3) * 0.6 + Math.sin(t * 3.1) * 0.2
    lightMatsRef.current.light1.forEach(m => { m.emissiveIntensity = pulse })

    const pulse2 = 2.5 + Math.sin(t * 0.7 + 1.2) * 0.3
    lightMatsRef.current.light2.forEach(m => { m.emissiveIntensity = pulse2 })
  })

  return (
    <group
      ref={diskGroupRef}
      position={BLACKHOLE_POS}
      scale={BLACKHOLE_SCALE}
      frustumCulled={false}
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
    >
      <primitive object={scene} frustumCulled={false} />
    </group>
  )
}

function BlackholeGuaranteedMesh({ visible, onClick }: { visible: boolean; onClick?: () => void }) {
  if (!visible) return null
  return (
    <Suspense fallback={
      <group position={BLACKHOLE_POS}>
        {/* Visible fallback while GLB loads — bright enough to confirm camera is aimed correctly */}
        <mesh frustumCulled={false}>
          <sphereGeometry args={[BLACKHOLE_SPHERE_R, 32, 32]} />
          <meshStandardMaterial
            color="#1a0030"
            emissive="#9c27b0"
            emissiveIntensity={1.2}
            roughness={0.5}
          />
        </mesh>
        {/* Accretion disk placeholder ring */}
        <mesh frustumCulled={false} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BLACKHOLE_SPHERE_R * 2.2, BLACKHOLE_SPHERE_R * 0.35, 16, 80]} />
          <meshStandardMaterial
            color="#ff8c00"
            emissive="#ff6600"
            emissiveIntensity={1.5}
            roughness={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>
    }>
      <BlackholeGLBInner onClick={onClick} />
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
      {/* Blackhole: NO external lights — the GLB has fully emissive materials that self-illuminate.
          External lights would wash out the accretion disk colors. */}
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
  /** Called when initial GLBs are loaded and the journey is ready. Used by shell to hide loading overlay. */
  onReady?: () => void
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
  onReady,
}: SolarSceneProps) {
  const { locale } = useLocale()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollProgress = useScrollProgress(scrollContainerRef)
  const activeGroups = useProgressiveLoader(scrollProgress, IS_SAFE)
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

  // Read cinematic T each frame for the DOM overlay (only active during cinematic)
  const cinematicT = useCinematicT(blackholeCinematicTRef, isBlackholeCinematic)
  const resetCinematicT = useCinematicT(blackholeResetTRef, isBlackholeResetting)

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

  // Preload Blackhole GLB as early as possible:
  //   - when arriving at Uranus (gives ~time to download before user scrolls down)
  //   - when Blackhole becomes the target or current shot (safety net)
  // useGLTF.preload is idempotent — safe to call multiple times.
  useEffect(() => {
    if (IS_SAFE) return
    const shouldPreload =
      discreteCurrentShotId === 'uranus'    ||
      discreteCurrentShotId === 'blackhole' ||
      discreteTargetShotId   === 'uranus'   ||
      discreteTargetShotId   === 'blackhole'
    if (shouldPreload) {
      useGLTF.preload(BLACKHOLE_GLB_PATH)
    }
  }, [discreteCurrentShotId, discreteTargetShotId])

  // Blackhole and Uranus excluded from the GLB pipeline.
  // Uranus: replaced by UranusGuaranteedMesh (procedural textured mesh).
  // Blackhole: rendered via BlackholeGuaranteedMesh below, only when its shot is active.
  const RENDERED_PLANETS = PLANET_REGISTRY.filter((p) => p.id !== 'blackhole' && p.id !== 'uranus')

  // Blackhole GLB visibility rules:
  //   - Normal navigation: show when it is the current or target shot.
  //   - During the Blackhole cinematic: the targetShotId is 'blackhole' from
  //     the very first frame, so we MUST suppress the targetShotId condition
  //     while the cinematic is running. The GLB is only activated once the
  //     reveal phase is well underway (t > 0.90) so it never bleeds through
  //     the fade-to-black overlay.
  const BLACKHOLE_VISIBLE =
    (discreteCurrentShotId === 'blackhole' ||
      (!isBlackholeCinematic && discreteTargetShotId === 'blackhole') ||
      (isBlackholeCinematic && blackholeCinematicPhase === 'reveal' && cinematicT > 0.78)) &&
    !(isBlackholeResetting && blackholeResetPhase === 'reappear')

  const URANUS_VISIBLE =
    !isBlackholeCinematic &&
    (discreteCurrentShotId === 'uranus' ||
      discreteTargetShotId   === 'uranus' ||
      (discreteCurrentShotId === 'neptune' && discreteIsTransitioning))

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
  const [blackholePanelVisible, setBlackholePanelVisible] = useState(false)
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
  // Must use RENDERED_PLANETS (excludes blackhole + uranus) — uranus uses a procedural
  // mesh and never fires onGlbLoaded, so counting it would stall the gate forever.
  const initialGroupSize = RENDERED_PLANETS.filter((p) => p.loadingGroup === 'initial').length
  const [journeyReady, setJourneyReady]   = useState(IS_SAFE) // safe mode skips GLB gate

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
  // - Shows 1s after entering hold
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
    }, 1000)

    return () => {
      if (sunHoldTimerRef.current) {
        window.clearTimeout(sunHoldTimerRef.current)
        sunHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Mercury panel visibility contract:
  // - Only appears in `mercury-hold`
  // - Shows 1s after entering hold
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
    }, 1000)

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
    }, 1000)

    return () => {
      if (venusHoldTimerRef.current) {
        window.clearTimeout(venusHoldTimerRef.current)
        venusHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Earth panel visibility contract:
  // - Only appears in `earth-hold`
  // - Shows 1s after entering hold
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
    }, 1000)

    return () => {
      if (earthHoldTimerRef.current) {
        window.clearTimeout(earthHoldTimerRef.current)
        earthHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Moon panel visibility contract:
  // - Only appears in `moon-hold`
  // - Shows 1s after entering hold
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
    }, 1000)

    return () => {
      if (moonHoldTimerRef.current) {
        window.clearTimeout(moonHoldTimerRef.current)
        moonHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Mars panel visibility contract:
  // - Only appears in `mars-hold`
  // - Shows 1s after entering hold
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
    }, 1000)

    return () => {
      if (marsHoldTimerRef.current) {
        window.clearTimeout(marsHoldTimerRef.current)
        marsHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Neptune panel visibility contract:
  // - Only appears in `neptune-hold`
  // - Shows 1s after entering hold
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
    }, 1000)

    return () => {
      if (neptuneHoldTimerRef.current) {
        window.clearTimeout(neptuneHoldTimerRef.current)
        neptuneHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Uranus panel visibility contract:
  // - Only appears in `uranus-hold`
  // - Shows 1s after entering hold
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
    }, 1000)

    return () => {
      if (uranusHoldTimerRef.current) {
        window.clearTimeout(uranusHoldTimerRef.current)
        uranusHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  // Blackhole panel visibility contract:
  // - Only appears in `blackhole-hold`
  // - Shows 1s after entering hold
  // - Hides immediately when leaving hold
  useEffect(() => {
    if (blackholeHoldTimerRef.current) {
      window.clearTimeout(blackholeHoldTimerRef.current)
      blackholeHoldTimerRef.current = null
    }

    if (cameraPhase !== 'blackhole-hold') {
      window.requestAnimationFrame(() => setBlackholePanelVisible(false))
      return
    }

    blackholePanelManuallyClosedRef.current = false
    blackholeHoldTimerRef.current = window.setTimeout(() => {
      if (!blackholePanelManuallyClosedRef.current) {
        setBlackholePanelVisible(true)
      }
      blackholeHoldTimerRef.current = null
    }, 1000)

    return () => {
      if (blackholeHoldTimerRef.current) {
        window.clearTimeout(blackholeHoldTimerRef.current)
        blackholeHoldTimerRef.current = null
      }
    }
  }, [cameraPhase])

  function handlePlanetClick(config: PlanetConfig) {
    if (config.id === 'sun') {
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

              {/* Uranus material patch — forces doubleSided on all ring materials */}
              {!IS_SAFE && (
                <Suspense fallback={null}>
                  <UranusDoubleSidedPatch />
                </Suspense>
              )}

              {/* Preload Uranus textures + GLB when at Neptune so first Neptune→Uranus transition is smooth */}
              <UranusTexturePreload
                active={discreteCurrentShotId === 'neptune' || discreteTargetShotId === 'uranus'}
              />

              {/* Uranus guaranteed mesh — hidden during blackhole cinematic so it never appears in frame */}
              <UranusGuaranteedMesh
                visible={
                  !isBlackholeCinematic &&
                  (discreteCurrentShotId === 'uranus' ||
                    discreteTargetShotId   === 'uranus' ||
                    (discreteCurrentShotId === 'neptune' && discreteIsTransitioning))
                }
                onClick={() => {
                  if (cameraPhase !== 'uranus-hold') return
                  const nextClosed = !uranusPanelManuallyClosedRef.current
                  uranusPanelManuallyClosedRef.current = nextClosed
                  if (nextClosed) {
                    if (uranusHoldTimerRef.current) {
                      window.clearTimeout(uranusHoldTimerRef.current)
                      uranusHoldTimerRef.current = null
                    }
                    setUranusPanelVisible(false)
                  } else {
                    setUranusPanelVisible(true)
                  }
                }}
              />

              {/* Blackhole renderer A/B:
                  - default: GLB (current implementation)
                  - ?blackholeRender=shader => procedural shader mesh */}
              {BLACKHOLE_RENDER_MODE === 'shader' ? (
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
                      setBlackholePanelVisible(false)
                    } else {
                      setBlackholePanelVisible(true)
                    }
                  }}
                />
              ) : (
                <BlackholeGuaranteedMesh
                  visible={BLACKHOLE_VISIBLE}
                  onClick={() => {
                    if (cameraPhase !== 'blackhole-hold') return
                    const nextClosed = !blackholePanelManuallyClosedRef.current
                    blackholePanelManuallyClosedRef.current = nextClosed
                    if (nextClosed) {
                      if (blackholeHoldTimerRef.current) {
                        window.clearTimeout(blackholeHoldTimerRef.current)
                        blackholeHoldTimerRef.current = null
                      }
                      setBlackholePanelVisible(false)
                    } else {
                      setBlackholePanelVisible(true)
                    }
                  }}
                />
              )}

              {/* Nebula background — epic space backdrop, only during Blackhole shot */}
              <NebulaBackground visible={BLACKHOLE_VISIBLE && BLACKHOLE_RENDER_MODE !== 'shader'} />

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
              ))}
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
                    background: '#000',
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
        open={sunPanelVisible && cameraPhase === 'sun-hold'}
        align="right"
        phaseInfo={getPlanetPhaseInfo('sun', locale)}
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
        phaseInfo={getPlanetPhaseInfo('mercury', locale)}
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
        phaseInfo={getPlanetPhaseInfo('venus', locale)}
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
        phaseInfo={getPlanetPhaseInfo('earth', locale)}
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
        phaseInfo={getPlanetPhaseInfo('moon', locale)}
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
        phaseInfo={getPlanetPhaseInfo('mars', locale)}
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
        phaseInfo={getPlanetPhaseInfo('neptune', locale)}
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
        phaseInfo={getPlanetPhaseInfo('uranus', locale)}
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
        phaseInfo={getPlanetPhaseInfo('blackhole', locale)}
        onClose={() => {
          blackholePanelManuallyClosedRef.current = true
          if (blackholeHoldTimerRef.current) {
            window.clearTimeout(blackholeHoldTimerRef.current)
            blackholeHoldTimerRef.current = null
          }
          setBlackholePanelVisible(false)
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
