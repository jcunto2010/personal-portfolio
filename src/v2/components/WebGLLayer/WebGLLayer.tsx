import { Suspense, lazy, useState } from 'react'
import { Canvas, events } from '@react-three/fiber'
import { featureFlags } from '../../lib/featureFlags'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { v2Colors } from '../../tokens/tokens'
import styles from './WebGLLayer.module.css'

/**
 * Lazy-load the heavy scene so it doesn't block the initial paint.
 * The Suspense boundary renders nothing while loading.
 */
const AmbientScene = lazy(() =>
  import('./AmbientScene').then((m) => ({ default: m.AmbientScene }))
)

/**
 * Detect whether the browser / GPU supports WebGL.
 * Returns false in SSR contexts or if the context cannot be acquired.
 */
function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const ctx =
      canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    return !!ctx
  } catch {
    return false
  }
}

/**
 * Fallback2D — pure CSS static layer used when:
 *   - WebGL is unavailable
 *   - `prefers-reduced-motion: reduce` is active
 *   - The WebGL feature flag is off
 *
 * Renders subtle radial gradients that match the cosmic editorial palette
 * so the page doesn't feel blank on these code paths.
 */
function Fallback2D() {
  return (
    <div
      className={styles.fallback}
      aria-hidden="true"
      data-testid="webgl-fallback-2d"
    >
      <div className={styles.fallbackGradient} />
    </div>
  )
}

/**
 * WebGLLayer — ambient background layer for Home V2.
 *
 * Decision tree:
 *   1. feature flag off         → Fallback2D
 *   2. prefers-reduced-motion   → nothing (CSS hides canvas too)
 *   3. WebGL unavailable        → Fallback2D
 *   4. all clear                → R3F Canvas with lazy AmbientScene
 *
 * Accessibility:
 *   - The canvas wrapper has `pointer-events: none`; focus can never land on it.
 *   - aria-hidden="true" on the root so screen readers skip it entirely.
 *   - `tabIndex` is never set on the canvas.
 *
 * Stacking:
 *   - position: fixed; z-index: 0 — always behind the content layer (z-index: 1+).
 *   - The DOM scroll and TOC are unaffected.
 */
export function WebGLLayer() {
  const prefersReduced = useReducedMotion()
  // Lazy initializer runs once on mount without an extra effect cycle.
  const [webglSupported] = useState<boolean>(() => detectWebGLSupport())

  // Feature flag gate — easiest kill-switch
  if (!featureFlags.enableWebGL) {
    return <Fallback2D />
  }

  // Reduced motion: render nothing — CSS `display:none` also covers the canvas,
  // but we short-circuit here to avoid mounting R3F at all.
  if (prefersReduced) {
    return null
  }

  // WebGL unavailable — graceful degradation
  if (!webglSupported) {
    return <Fallback2D />
  }

  return (
    <div
      className={styles.root}
      aria-hidden="true"
      data-testid="webgl-layer"
    >
      <Canvas
        className={styles.canvas}
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{
          antialias: false,       // performance: not needed for particle fields
          alpha: true,            // transparent background — page bg shows through
          powerPreference: 'low-power',
          preserveDrawingBuffer: false,
        }}
        // Use the default R3F event system but the CSS pointer-events:none on
        // the wrapper ensures no DOM events ever reach the canvas.
        events={events}
        style={{ background: 'transparent' }}
        frameloop="always"
        dpr={[1, 1.5]}
      >
        {/* Scene background matches the design token base color */}
        <color attach="background" args={[v2Colors.baseBg]} />

        <Suspense fallback={null}>
          <AmbientScene />
        </Suspense>
      </Canvas>
    </div>
  )
}
