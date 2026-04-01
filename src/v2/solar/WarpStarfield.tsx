/**
 * WarpStarfield — Star Wars hyperspace effect using InstancedMesh.
 *
 * Technique from https://github.com/o2bomb/space-warp (MIT):
 *   - 600 instanced spheres scattered in a cylinder around the camera
 *   - Each frame: stars advance in Z toward the camera, wrap when they pass
 *   - Scale Z is stretched proportionally to speed → star trails / light streaks
 *   - Color fades from white (near) to black (far back)
 *   - Speed is driven by cinematicT so it accelerates with the camera
 *
 * Lives INSIDE the Canvas — no DOM, no CSS, no postprocessing.
 * Only active while isBlackholeCinematic === true.
 *
 * Phase behaviour:
 *   departure (t 0.00→0.12): stars invisible until camera is oriented, then fade in
 *     + from t >= DEPARTURE_STARFIELD_START (0.07): starfield appears and stars
 *       move at MIN_SPEED so when warp starts the effect is already running.
 *   warp      (t 0.12→0.76): full opacity, speed ramps up (ease-in)
 *   reveal    (t 0.76→1.00): stars fade out, speed ramps down
 *
 * Starfield is attached to a group that follows the camera (position + quaternion)
 * so it stays centered and aligned with the view; star positions are in camera-local
 * space to avoid tilt/offset.
 */

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { RefObject } from 'react'
import type { BlackholeCinematicPhase, BlackholeResetPhase } from './useDiscreteShotNavigation'

// ── Constants ─────────────────────────────────────────────────────────────────

const COUNT        = 600     // number of star instances
const SPREAD_XY    = 18      // half-width of the star field (XY plane)
const DEPTH_NEAR   = 2       // closest Z (in front of camera, world space)
const DEPTH_FAR    = 80      // furthest Z (behind camera, world space)
const MIN_SPEED    = 0.5     // minimum Z advance per second (crawl)
const MAX_SPEED    = 120     // maximum Z advance per second (full warp)
const MAX_STRETCH  = 80      // maximum Z scale (light-streak length)

// Phase boundaries — must match CameraRig.tsx and BlackholeCinematicOverlay.tsx
const WARP_START = 0.12
const WARP_END   = 0.76
// Once camera is oriented in departure, show starfield and start star motion (so warp sees it from start)
const DEPARTURE_STARFIELD_START = 0.05

// Reset reappear: same reveal-style animation (streaks fade out, speed ramps down). Match CameraRig RESET_CONSUME_END.
const RESET_REAPPEAR_START = 0.82

// ── Easing ────────────────────────────────────────────────────────────────────

function easeInCubic(t: number): number { return t * t * t }
function easeOutCubic(t: number): number { return 1 - Math.pow(1 - t, 3) }

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function remap(v: number, a: number, b: number, c: number, d: number): number {
  return c + (d - c) * clamp((v - a) / (b - a), 0, 1)
}

// ── Seeded random positions ───────────────────────────────────────────────────
// Pre-computed so positions are stable across re-renders.

// Camera-local space: +X right, +Y up, -Z ahead (Three.js convention).
function buildInitialPositions(): Float32Array {
  const pos = new Float32Array(COUNT * 3)
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * SPREAD_XY * 2
    pos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_XY * 2
    pos[i * 3 + 2] = -(Math.random() * (DEPTH_FAR - DEPTH_NEAR) + DEPTH_NEAR)
  }
  return pos
}

const INITIAL_POSITIONS = buildInitialPositions()

// ── Component ─────────────────────────────────────────────────────────────────

export interface WarpStarfieldProps {
  isBlackholeCinematic: boolean
  blackholeCinematicTRef: RefObject<number>
  phase: BlackholeCinematicPhase
  /** Reset cinematic (Blackhole → Sun): same reveal-style animation during reappear */
  isBlackholeResetting?: boolean
  blackholeResetTRef?: RefObject<number>
  blackholeResetPhase?: BlackholeResetPhase
}

export function WarpStarfield({
  isBlackholeCinematic,
  blackholeCinematicTRef,
  phase,
  isBlackholeResetting = false,
  blackholeResetTRef,
  blackholeResetPhase = 'dive',
}: WarpStarfieldProps) {
  const groupRef   = useRef<THREE.Group>(null)
  const meshRef    = useRef<THREE.InstancedMesh>(null)
  const posRef     = useRef<Float32Array>(INITIAL_POSITIONS.slice()) // mutable copy (camera-local)

  // Reusable scratch objects — allocated once, never inside useFrame
  const tempObj   = useRef(new THREE.Object3D())
  const tempColor = useRef(new THREE.Color())

  // Reset positions when arrival cinematic starts
  useEffect(() => {
    if (isBlackholeCinematic) {
      posRef.current = INITIAL_POSITIONS.slice()
    }
  }, [isBlackholeCinematic])

  // Reset positions when we enter reset reappear (same reveal animation from fresh stars)
  useEffect(() => {
    if (isBlackholeResetting && blackholeResetPhase === 'reappear') {
      posRef.current = INITIAL_POSITIONS.slice()
    }
  }, [isBlackholeResetting, blackholeResetPhase])

  useFrame((state, delta) => {
    const group = groupRef.current
    const mesh = meshRef.current

    // ── Mode A: Arrival cinematic (Uranus → Blackhole) ─────────────────────
    if (isBlackholeCinematic && blackholeCinematicTRef) {
      if (!group || !mesh) return

      group.position.copy(state.camera.position)
      group.quaternion.copy(state.camera.quaternion)

      const t = clamp(blackholeCinematicTRef.current, 0, 1)

      let fieldOpacity: number
      if (phase === 'departure') {
        fieldOpacity = t >= DEPARTURE_STARFIELD_START
          ? remap(t, DEPARTURE_STARFIELD_START, WARP_START, 0, 1)
          : 0
      } else if (phase === 'warp') {
        fieldOpacity = 1
      } else {
        fieldOpacity = remap(t, WARP_END, WARP_END + 0.12, 1, 0)
      }

      if (fieldOpacity <= 0.001) {
        mesh.visible = false
        return
      }
      mesh.visible = true

      let speed: number
      if (phase === 'departure') {
        speed = t >= DEPARTURE_STARFIELD_START ? MIN_SPEED : 0
      } else if (phase === 'warp') {
        const warpLocal = remap(t, WARP_START, WARP_END, 0, 1)
        speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * easeInCubic(warpLocal)
      } else {
        const revLocal = remap(t, WARP_END, 1.0, 0, 1)
        speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * (1 - easeOutCubic(revLocal))
      }

      const speedFraction = clamp((speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED), 0, 1)
      const stretchZ = 1 + (MAX_STRETCH - 1) * speedFraction

      const pos = posRef.current
      const obj = tempObj.current
      const col = tempColor.current

      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3
        pos[ix + 2] += speed * delta
        if (pos[ix + 2] > DEPTH_NEAR) {
          pos[ix]     = (Math.random() - 0.5) * SPREAD_XY * 2
          pos[ix + 1] = (Math.random() - 0.5) * SPREAD_XY * 2
          pos[ix + 2] = -DEPTH_FAR
        }
        obj.position.set(pos[ix], pos[ix + 1], pos[ix + 2])
        obj.scale.set(0.06, 0.06, stretchZ * 0.06)
        obj.rotation.set(0, 0, 0)
        obj.updateMatrix()
        mesh.setMatrixAt(i, obj.matrix)
        const localZ = pos[ix + 2]
        const brightness = clamp(1 + localZ / DEPTH_FAR, 0, 1) * fieldOpacity
        col.setRGB(brightness, brightness * 0.92, brightness * 0.85)
        mesh.setColorAt(i, col)
      }

      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      return
    }

    // ── Mode B: Reset cinematic reappear (Blackhole → Sun) — same reveal animation ─
    if (isBlackholeResetting && blackholeResetPhase === 'reappear' && blackholeResetTRef && group && mesh) {
      group.position.copy(state.camera.position)
      group.quaternion.copy(state.camera.quaternion)

      const resetT = clamp(blackholeResetTRef.current, 0, 1)
      const revLocal = remap(resetT, RESET_REAPPEAR_START, 1.0, 0, 1) // 0..1 over reappear

      // Same as arrival reveal: opacity 1 → 0 over first ~50% of phase, speed ease-out MAX → MIN
      const fieldOpacity = remap(revLocal, 0, 0.5, 1, 0)
      const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * (1 - easeOutCubic(revLocal))

      if (fieldOpacity <= 0.001) {
        mesh.visible = false
        return
      }
      mesh.visible = true

      const speedFraction = clamp((speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED), 0, 1)
      const stretchZ = 1 + (MAX_STRETCH - 1) * speedFraction

      const pos = posRef.current
      const obj = tempObj.current
      const col = tempColor.current

      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3
        pos[ix + 2] += speed * delta
        if (pos[ix + 2] > DEPTH_NEAR) {
          pos[ix]     = (Math.random() - 0.5) * SPREAD_XY * 2
          pos[ix + 1] = (Math.random() - 0.5) * SPREAD_XY * 2
          pos[ix + 2] = -DEPTH_FAR
        }
        obj.position.set(pos[ix], pos[ix + 1], pos[ix + 2])
        obj.scale.set(0.06, 0.06, stretchZ * 0.06)
        obj.rotation.set(0, 0, 0)
        obj.updateMatrix()
        mesh.setMatrixAt(i, obj.matrix)
        const localZ = pos[ix + 2]
        const brightness = clamp(1 + localZ / DEPTH_FAR, 0, 1) * fieldOpacity
        col.setRGB(brightness, brightness * 0.92, brightness * 0.85)
        mesh.setColorAt(i, col)
      }

      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      return
    }

    if (group && mesh) mesh.visible = false
  })

  // Only show during arrival (Uranus → Blackhole). Hidden during reset (Blackhole → Sun).
  const showArrival = isBlackholeCinematic
  if (!showArrival) return null

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
        renderOrder={1}
      >
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial
          color="white"
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </instancedMesh>
    </group>
  )
}
