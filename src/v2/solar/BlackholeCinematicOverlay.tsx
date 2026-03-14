/**
 * BlackholeCinematicOverlay — DOM overlay for:
 *   A) Uranus→Blackhole cinematic: tunnel vignette + central glow during warp.
 *   B) Blackhole reset cinematic: darken during consume, fade out during reappear.
 *
 * The hyperspace star effect is handled by WarpStarfield (InstancedMesh).
 * Mounted via ReactDOM.createPortal into document.body in SolarScene.tsx.
 */

import type { CSSProperties } from 'react'
import type { BlackholeCinematicPhase, BlackholeResetPhase } from './useDiscreteShotNavigation'
import styles from './BlackholeCinematicOverlay.module.css'

const WARP_START = 0.12
const WARP_END   = 0.76

// Reset phase boundaries [0..1] — must match CameraRig RESET_DIVE_END / RESET_CONSUME_END
const RESET_DIVE_END   = 0.45
const RESET_CONSUME_END = 0.82
// Flash as last thing before zoom: ramp up at end of consume, peak at consume→reappear, then fade
const RESET_FLASH_RAMP_START = 0.74   // start flash during consume (still black)
const RESET_FLASH_PEAK_AT    = RESET_CONSUME_END // 0.82 — peak = last frame before zoom
const RESET_FLASH_FADE_END   = 0.88   // flash gone shortly after reappear starts
const RESET_FLASH_PEAK_OPACITY = 0.8

export interface BlackholeCinematicOverlayProps {
  /** Uranus → Blackhole arrival cinematic */
  activeArrival?: boolean
  cinematicT?: number
  phase?: BlackholeCinematicPhase
  /** Blackhole → enter → Sun reset cinematic */
  activeReset?: boolean
  resetT?: number
  resetPhase?: BlackholeResetPhase
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function remap(v: number, a: number, b: number, c: number, d: number): number {
  return c + (d - c) * clamp((v - a) / (b - a), 0, 1)
}

export function BlackholeCinematicOverlay({
  activeArrival = false,
  cinematicT = 0,
  phase = 'departure',
  activeReset = false,
  resetT = 0,
  resetPhase = 'dive',
}: BlackholeCinematicOverlayProps) {
  const t = clamp(cinematicT, 0, 1)
  const rt = clamp(resetT, 0, 1)

  // ── Arrival: tunnel vignette opacity ──────────────────────────────────────
  let tunnelOpacity = 0
  if (activeArrival) {
    if (phase === 'departure') {
      tunnelOpacity = 0
    } else if (phase === 'warp') {
      tunnelOpacity = remap(t, WARP_START, WARP_START + 0.06, 0, 1)
    } else {
      tunnelOpacity = remap(t, WARP_END, WARP_END + 0.08, 1, 0)
    }
  }

  // ── Reset: full-screen dark overlay — ramp up during consume, fade out during reappear ─
  let resetDarkOpacity = 0
  if (activeReset) {
    if (resetPhase === 'dive') {
      resetDarkOpacity = 0
    } else if (resetPhase === 'consume') {
      resetDarkOpacity = remap(rt, RESET_DIVE_END, RESET_DIVE_END + 0.15, 0, 1)
    } else {
      resetDarkOpacity = remap(rt, RESET_CONSUME_END, 1, 1, 0)
    }
  }

  // ── Reset: white flash as last thing before zoom (end of consume → into reappear) ─
  let resetFlashOpacity = 0
  if (activeReset) {
    if (resetPhase === 'consume') {
      resetFlashOpacity = remap(rt, RESET_FLASH_RAMP_START, RESET_FLASH_PEAK_AT, 0, RESET_FLASH_PEAK_OPACITY)
    } else if (resetPhase === 'reappear') {
      resetFlashOpacity = remap(rt, RESET_FLASH_PEAK_AT, RESET_FLASH_FADE_END, RESET_FLASH_PEAK_OPACITY, 0)
    }
  }

  if (!activeArrival && !activeReset) return null

  return (
    <div className={styles.overlay} aria-hidden="true">
      {activeArrival && (
        <div
          className={styles.tunnel}
          style={{ '--tunnel-opacity': tunnelOpacity } as CSSProperties}
        />
      )}
      {activeReset && (
        <>
          <div
            className={styles.resetDark}
            style={{ '--reset-dark-opacity': resetDarkOpacity } as CSSProperties}
          />
          <div
            className={styles.resetFlash}
            style={{ '--reset-flash-opacity': resetFlashOpacity } as CSSProperties}
          />
        </>
      )}
    </div>
  )
}
