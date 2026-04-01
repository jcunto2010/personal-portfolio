/**
 * useShotNavigation — scroll-progress → shot mapping (microfase 2)
 *
 * Derives currentShot, nextShot, and shotProgress from a raw [0,1] scroll value.
 *
 * As of microfase 2, CameraRig drives the camera directly from the Mercury shot
 * when currentShot.id === 'mercury'. The Sun shot still uses the legacy planet
 * path in the rig (functionally identical — the shot config values match).
 *
 * shotProgress is normalised [0,1] within currentShot's [scrollStart, scrollEnd].
 *
 * No React state — this is a pure derive function exported as a hook so it can
 * be called inside a React component and the result threaded down as props.
 *
 * [NV] Microfase 3+: wire Venus and remaining shots end-to-end.
 */

import { useMemo } from 'react'
import {
  SHOT_REGISTRY,
  getNextShot,
  type ShotConfig,
  type ShotId,
} from './shotConfig'

export interface ShotNavigationResult {
  /** The shot whose scroll window contains the current progress. */
  currentShot: ShotConfig
  /** The shot immediately after currentShot in the registry, or undefined at the end. */
  nextShot: ShotConfig | undefined
  /**
   * Normalised progress within currentShot's scroll window.
   * 0 = at scrollStart, 1 = at scrollEnd.
   */
  shotProgress: number
}

/**
 * Resolves which shot is active for a given [0,1] scroll progress value.
 * Falls back to the last registered shot if progress exceeds all windows.
 */
function resolveShotForProgress(progress: number): ShotConfig {
  const p = Math.min(1, Math.max(0, progress))
  for (const shot of SHOT_REGISTRY) {
    if (p >= shot.scrollStart && p <= shot.scrollEnd) return shot
  }
  // Progress is beyond the last registered shot — return the last one.
  return SHOT_REGISTRY[SHOT_REGISTRY.length - 1]
}

/**
 * Pure derive — NOT stateful.
 * Accepts raw scrollProgress and returns the shot navigation result.
 * Memoised with useMemo to avoid re-allocating the result object every render.
 */
export function useShotNavigation(scrollProgress: number): ShotNavigationResult {
  return useMemo<ShotNavigationResult>(() => {
    const currentShot  = resolveShotForProgress(scrollProgress)
    const nextShot     = getNextShot(currentShot.id as ShotId)
    const window       = currentShot.scrollEnd - currentShot.scrollStart
    const shotProgress = window > 0
      ? Math.min(1, Math.max(0, (scrollProgress - currentShot.scrollStart) / window))
      : 0

    return { currentShot, nextShot, shotProgress }
  }, [scrollProgress])
}
