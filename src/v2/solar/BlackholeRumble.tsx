/**
 * BlackholeRumble — Interstellar-style gravitational camera shake.
 *
 * Architecture:
 *   - Fractal noise: 4 sine layers at prime frequencies with halving amplitudes.
 *     Looks chaotic but is deterministic (no random drift per frame).
 *   - Impulse spikes: random gravitational "hits" every ~0.2s with 35% probability.
 *     Each spike is a sharp amplitude burst that decays with easeOutCubic in 80ms.
 *   - Three axes: X (primary), Y (secondary, 55% amplitude), Z (depth, 30%).
 *   - Roll: subtle camera rotation on Z axis (max 0.008 rad) for a tumbling feel.
 *   - Fade out: full amplitude until t=2.0s, linear decay to zero at t=3.0s.
 *     Impulses also attenuate with the fade.
 *   - prefers-reduced-motion: amplitude = 0 if active.
 */
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

interface BlackholeRumbleProps {
  active: boolean
}

// ── Timing ────────────────────────────────────────────────────────────────────
const RUMBLE_DURATION  = 3.0   // total seconds
const FADE_START       = 2.0   // fade begins at this second
const IMPULSE_INTERVAL = 0.2   // seconds between impulse chances
const IMPULSE_CHANCE   = 0.35  // probability per interval
const IMPULSE_DURATION = 0.08  // seconds — sharp spike decay

// ── Amplitude ─────────────────────────────────────────────────────────────────
const AMP_X    = 0.08   // primary axis
const AMP_Y    = 0.044  // 55% of X
const AMP_Z    = 0.024  // 30% of X — depth axis
const AMP_ROLL = 0.008  // radians — subtle tumble

// ── Fractal noise layers [frequency Hz, relative amplitude] ──────────────────
// Prime frequencies avoid harmonic repetition — sounds organic, not mechanical.
const LAYERS: [number, number][] = [
  [1.7, 1.00],   // base — dominant slow shake
  [3.1, 0.50],   // 2nd octave
  [5.3, 0.25],   // 3rd octave
  [7.9, 0.125],  // 4th octave — adds micro-jitter
]

// Phase offsets so axes don't move in sync
const PHASE_X    = 0.0
const PHASE_Y    = 1.57   // π/2
const PHASE_Z    = 0.93
const PHASE_ROLL = 2.21

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/** Fractal noise value at time t with given phase offset */
function fractalNoise(t: number, phase: number): number {
  let value = 0
  for (const [freq, amp] of LAYERS) {
    value += Math.sin(t * freq * Math.PI * 2 + phase) * amp
  }
  // Normalize: max possible value is sum of amps = 1.875 → divide to keep in [-1, 1]
  return value / 1.875
}

export function BlackholeRumble({ active }: BlackholeRumbleProps) {
  const elapsedRef       = useRef(0)
  const runningRef       = useRef(false)
  const resetRollRef     = useRef(false)
  const nextImpulseRef   = useRef(0)       // time of next impulse check
  const impulseActiveRef = useRef(false)
  const impulseStartRef  = useRef(0)
  const impulseAmpRef    = useRef(0)       // randomised impulse strength

  const prefersReduced = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  useEffect(() => {
    if (active) {
      elapsedRef.current     = 0
      runningRef.current     = true
      nextImpulseRef.current = IMPULSE_INTERVAL * (0.5 + Math.random() * 0.5)
      impulseActiveRef.current = false
    } else {
      runningRef.current = false
      resetRollRef.current = true
    }
  }, [active])

  useFrame((state, delta) => {
    const { camera } = state
    if (resetRollRef.current) {
      camera.rotation.z = 0
      resetRollRef.current = false
    }
    if (!runningRef.current || prefersReduced.current) return

    elapsedRef.current += delta
    const t = elapsedRef.current

    if (t >= RUMBLE_DURATION) {
      runningRef.current = false
      resetRollRef.current = true
      return
    }

    // ── Fade envelope ────────────────────────────────────────────────────────
    const fade = t < FADE_START
      ? 1.0
      : 1.0 - (t - FADE_START) / (RUMBLE_DURATION - FADE_START)

    // ── Impulse logic ────────────────────────────────────────────────────────
    // Check if it's time to roll for a new impulse
    if (!impulseActiveRef.current && t >= nextImpulseRef.current) {
      if (Math.random() < IMPULSE_CHANCE) {
        impulseActiveRef.current = true
        impulseStartRef.current  = t
        // Random strength between 2x and 3.5x — unpredictable hit intensity
        impulseAmpRef.current = 2.0 + Math.random() * 1.5
      }
      // Schedule next check regardless of whether impulse fired
      nextImpulseRef.current = t + IMPULSE_INTERVAL * (0.7 + Math.random() * 0.6)
    }

    // Impulse multiplier: sharp spike that decays easeOutCubic over IMPULSE_DURATION
    let impulseMult = 1.0
    if (impulseActiveRef.current) {
      const impT = (t - impulseStartRef.current) / IMPULSE_DURATION
      if (impT >= 1) {
        impulseActiveRef.current = false
        impulseMult = 1.0
      } else {
        // Spike: starts at impulseAmp, decays back to 1.0
        impulseMult = 1.0 + (impulseAmpRef.current - 1.0) * (1.0 - easeOutCubic(impT))
      }
    }

    const strength = fade * impulseMult

    // ── Fractal noise offsets ────────────────────────────────────────────────
    const noiseX    = fractalNoise(t, PHASE_X)
    const noiseY    = fractalNoise(t, PHASE_Y)
    const noiseZ    = fractalNoise(t, PHASE_Z)
    const noiseRoll = fractalNoise(t, PHASE_ROLL)

    camera.position.x += noiseX    * AMP_X    * strength
    camera.position.y += noiseY    * AMP_Y    * strength
    camera.position.z += noiseZ    * AMP_Z    * strength
    camera.rotation.z  = noiseRoll * AMP_ROLL * fade   // roll fades independently — no impulse spike on rotation
  })

  return null
}
