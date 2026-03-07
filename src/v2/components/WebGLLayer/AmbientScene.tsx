import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { v2Colors } from '../../tokens/tokens'

/** Number of star particles in the field. */
const STAR_COUNT = 1_200

/** Number of large nebula "dust" particles. */
const NEBULA_COUNT = 80

// ── Module-level data generation ────────────────────────────────────────────
// Generated once when the module is first imported. Using module scope avoids
// calling Math.random() inside the render function (which triggers the
// react-hooks/purity lint rule).

function buildStarData() {
  const positions = new Float32Array(STAR_COUNT * 3)
  const sizes     = new Float32Array(STAR_COUNT)

  for (let i = 0; i < STAR_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 30
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    sizes[i]             = Math.random() * 1.5 + 0.3
  }
  return { positions, sizes }
}

function buildNebulaData() {
  const positions = new Float32Array(NEBULA_COUNT * 3)
  const colors    = new Float32Array(NEBULA_COUNT * 3)

  const palette = [
    new THREE.Color(v2Colors.violet),
    new THREE.Color(v2Colors.cyan),
    new THREE.Color(v2Colors.deepBlue),
    new THREE.Color(v2Colors.magenta),
  ]

  for (let i = 0; i < NEBULA_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 28
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 5

    const c = palette[Math.floor(Math.random() * palette.length)]
    colors[i * 3]     = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  return { positions, colors }
}

const STAR_DATA   = buildStarData()
const NEBULA_DATA = buildNebulaData()

// ── StarField ────────────────────────────────────────────────────────────────

/**
 * StarField — a simple buffer of points that drifts very slowly.
 * Parallax is implied by depth variance (z spread); no user interaction.
 */
function StarField() {
  const meshRef = useRef<THREE.Points>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.rotation.y = t * 0.005
    meshRef.current.rotation.x = Math.sin(t * 0.003) * 0.04
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[STAR_DATA.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[STAR_DATA.sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        color={v2Colors.mutedText}
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  )
}

// ── NebulaDust ───────────────────────────────────────────────────────────────

/**
 * NebulaDust — sparse large soft circles with additive blending.
 * Additive blending means they never occlude text.
 */
function NebulaDust() {
  const meshRef = useRef<THREE.Points>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.rotation.z = t * 0.003
    meshRef.current.rotation.x = Math.cos(t * 0.002) * 0.03
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[NEBULA_DATA.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[NEBULA_DATA.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.55}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.18}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ── AmbientScene ─────────────────────────────────────────────────────────────

/**
 * AmbientScene — the full R3F scene graph.
 *
 * Design rules:
 * - No user interaction (pointer-events: none on the canvas wrapper)
 * - Very slow, dreamy motion only
 * - Additive blending on nebula so text is never blocked
 * - Depth-tested against nothing: purely cosmetic
 */
export function AmbientScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <StarField />
      <NebulaDust />
    </>
  )
}
