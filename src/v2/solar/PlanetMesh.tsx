/**
 * PlanetMesh — planets with GLB auto-normalisation.
 *
 * ALL planets (sun, mercury, venus, earth, moon, mars, neptune, uranus,
 * blackhole) use the same render path:
 *
 *   outer group  → world position + artisticScale (lerped for hover)
 *   inner group  → bounding-box centring offset + normScale (from computeNormParams)
 *   <primitive>  → useGLTF scene, never clone()d
 *
 * Planets rotate on their own centred Y-axis (no orbit). Frustum culling is
 * disabled on every descendant to prevent off-pivot GLBs from disappearing.
 */

import { Component, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetConfig, LoadingGroup } from './planetRegistry'
import { computeNormParams, disableFrustumCulling } from './glbNormalization'

const HOVER_SCALE_FACTOR = 1.08
const LERP_SPEED = 0.10

// ── Fallback sphere ────────────────────────────────────────────────────────────

interface FallbackSphereProps {
  radius: number
  color: string
  position: [number, number, number]
  baseScale: number
  hitRadius: number
  onClick?: () => void
}

function FallbackSphere({ radius, color, position, baseScale, hitRadius, onClick }: FallbackSphereProps) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const currentScale = useRef(baseScale)

  useFrame(() => {
    if (!groupRef.current) return
    const target = hovered ? baseScale * HOVER_SCALE_FACTOR : baseScale
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, target, LERP_SPEED)
    groupRef.current.scale.setScalar(currentScale.current)
  })

  return (
    <group
      ref={groupRef}
      position={position}
      scale={baseScale}
      frustumCulled={false}
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh frustumCulled={false}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>
      {/* Invisible hit area */}
      <mesh frustumCulled={false}>
        <sphereGeometry args={[hitRadius, 20, 20]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── GLB model ─────────────────────────────────────────────────────────────────

interface GLBModelProps {
  planetId: string
  modelPath: string
  position: [number, number, number]
  artisticScale: number
  normalizedRadiusTarget?: number
  hitRadius: number
  rotationSpeed?: number
  enableHoverScale?: boolean
  onClick?: () => void
  onLoaded?: () => void
}

function GLBModel({
  planetId,
  modelPath,
  position,
  artisticScale,
  normalizedRadiusTarget = 1,
  hitRadius,
  rotationSpeed = 0,
  enableHoverScale = true,
  onClick,
  onLoaded,
}: GLBModelProps) {
  const { scene } = useGLTF(modelPath)
  const groupRef  = useRef<THREE.Group>(null)
  const spinRef   = useRef<THREE.Group>(null)
  const [hovered, setHovered]  = useState(false)
  const currentScale = useRef(artisticScale)

  const norm = useMemo(
    () => computeNormParams(scene, normalizedRadiusTarget),
    [scene, normalizedRadiusTarget],
  )

  useEffect(() => {
    disableFrustumCulling(scene)
    if (import.meta.env.DEV) {
      console.error(
        `[PlanetMesh:debug] ${planetId} loaded | `
        + `radiusApprox=${norm.radiusApprox.toFixed(3)} `
        + `normScale=${norm.normScale.toFixed(4)} `
        + `size=(${norm.sizeX.toFixed(2)}, ${norm.sizeY.toFixed(2)}, ${norm.sizeZ.toFixed(2)}) `
        + `artisticScale=${artisticScale}`,
      )
    }
    onLoaded?.()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])

  useFrame((_state, delta) => {
    if (!groupRef.current) return
    const target = (enableHoverScale && hovered) ? artisticScale * HOVER_SCALE_FACTOR : artisticScale
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, target, LERP_SPEED)
    groupRef.current.scale.setScalar(currentScale.current)

    // Self-rotation on centred Y axis only — no orbit.
    if (spinRef.current && rotationSpeed !== 0) {
      spinRef.current.rotation.y += rotationSpeed * delta
    }
  })

  return (
    // Outer group: world-space anchor. Scale = artistic radius. Never moves.
    <group
      ref={groupRef}
      position={position}
      scale={artisticScale}
      frustumCulled={false}
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      {/*
        Inner centring wrapper: centres the bounding-box to origin, scales so
        the dominant axis == 2*normalizedRadiusTarget units, then rotates on Y.
        Pivot is always the planet's geometric centre — no accidental orbit.
      */}
      <group
        ref={spinRef}
        position={[norm.offsetX, norm.offsetY, norm.offsetZ]}
        scale={norm.normScale}
        frustumCulled={false}
      >
        <primitive object={scene} />
      </group>
      {/* Invisible hit area (radius in normalised space = hitRadius/artisticScale) */}
      <mesh frustumCulled={false}>
        <sphereGeometry args={[hitRadius / artisticScale, 20, 20]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── Error boundary ────────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean }
interface GLBErrorBoundaryProps { children: ReactNode; fallback: ReactNode }

class GLBErrorBoundary extends Component<GLBErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: GLBErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(): ErrorBoundaryState { return { hasError: true } }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}

// ── PlanetMesh (public API) ────────────────────────────────────────────────────

export interface PlanetMeshProps {
  config: PlanetConfig
  activeGroups: Set<LoadingGroup>
  onPlanetClick?: (config: PlanetConfig) => void
  onGlbLoaded?: () => void
}

export function PlanetMesh({ config, activeGroups, onPlanetClick, onGlbLoaded }: PlanetMeshProps) {
  const handleClick = onPlanetClick ? () => onPlanetClick(config) : undefined
  const hitRadius   = config.scale * 1.35

  const fallback = (
    <FallbackSphere
      radius={config.fallbackRadius}
      color={config.accentColor}
      position={config.position}
      baseScale={config.scale}
      hitRadius={hitRadius}
      onClick={handleClick}
    />
  )

  if (!activeGroups.has(config.loadingGroup)) return fallback

  return (
    <GLBErrorBoundary fallback={fallback}>
      <GLBModel
        planetId={config.id}
        modelPath={config.modelPath}
        position={config.position}
        artisticScale={config.scale}
        normalizedRadiusTarget={config.normalizedRadiusTarget}
        hitRadius={hitRadius}
        rotationSpeed={config.rotationSpeed}
        enableHoverScale={config.id !== 'sun'}
        onClick={handleClick}
        onLoaded={onGlbLoaded}
      />
    </GLBErrorBoundary>
  )
}
