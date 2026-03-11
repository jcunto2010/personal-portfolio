/**
 * DebugHUD — Phase 3 diagnostics overlay
 *
 * Visible ONLY when:
 *   - import.meta.env.DEV is true  (Vite dev server), OR
 *   - URL contains ?debug=1
 *
 * Displays runtime state for immersive mode, audio, canvas, and loading groups.
 * Rendered as a fixed overlay OUTSIDE the Canvas.
 */

import type { AudioDiagnostics } from '../lib/useAudioShell'
import type { LoadingGroup } from './planetRegistry'
import { PLANET_REGISTRY } from './planetRegistry'
import type { ShotId } from './shotConfig'
import type { ShotPhaseId } from './CameraRig'
import type { DiscreteShotId, TransitionDirection } from './useDiscreteShotNavigation'

export interface DebugHUDProps {
  mode: string
  entered: boolean
  canvasMounted: boolean
  canvasSize: { width: number; height: number }
  cameraPos: { x: number; y: number; z: number }
  scrollProgress: number
  activeGroups: Set<LoadingGroup>
  glbLoaded: number
  glbFailed: number
  audioEnabled: boolean
  audioDiagnostics: AudioDiagnostics
  isSafeMode: boolean
  // Legacy shot navigation
  currentShotId?: ShotId
  nextShotId?: ShotId
  shotProgress?: number
  shotPhase?: ShotPhaseId
  // Discrete Sun ↔ Mercury navigation
  discreteCurrentShotId?:       DiscreteShotId
  discreteTargetShotId?:        DiscreteShotId | null
  discreteIsTransitioning?:      boolean
  discreteTransitionDirection?:  TransitionDirection | null
  discreteWheelIntent?:          number
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <tr>
      <td style={{ color: '#94a3b8', paddingRight: '0.75rem', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
        {label}
      </td>
      <td style={{ color: warn ? '#f87171' : '#e2e8f0', fontWeight: warn ? 700 : 400 }}>
        {value}
      </td>
    </tr>
  )
}

export function DebugHUD({
  mode,
  entered,
  canvasMounted,
  canvasSize,
  cameraPos,
  scrollProgress,
  activeGroups,
  glbLoaded,
  glbFailed,
  audioEnabled,
  audioDiagnostics: ad,
  isSafeMode,
  currentShotId,
  nextShotId,
  shotProgress,
  shotPhase,
  discreteCurrentShotId,
  discreteTargetShotId,
  discreteIsTransitioning,
  discreteTransitionDirection,
  discreteWheelIntent,
}: DebugHUDProps) {
  // Rendered planets excludes blackhole and uranus (uranus uses procedural mesh, not GLB pipeline).
  const renderedPlanetCount = PLANET_REGISTRY.filter((p) => p.id !== 'blackhole' && p.id !== 'uranus').length
  // Clamp to 0 — glbLoaded can temporarily exceed renderedPlanetCount during async batches.
  const placeholderCount = Math.max(0, renderedPlanetCount - glbLoaded - glbFailed)

  // Detect contradiction between legacy and discrete systems (for warning display).
  const discreteActive = discreteCurrentShotId != null
  const legacyContradicts =
    discreteActive &&
    currentShotId != null &&
    currentShotId !== discreteCurrentShotId

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        background: 'rgba(0,0,0,0.82)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        fontFamily: 'monospace',
        fontSize: '11px',
        lineHeight: '1.6',
        maxWidth: '340px',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      <div style={{
        color: isSafeMode ? '#fbbf24' : '#4ade80',
        fontWeight: 700,
        marginBottom: '0.5rem',
        letterSpacing: '0.05em',
        fontSize: '12px',
      }}>
        {isSafeMode ? '⚠ SAFE MODE DEBUG HUD' : '◈ IMMERSIVE DEBUG HUD'}
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          {/* Scene state */}
          <Row label="mode" value={mode} warn={mode !== 'immersive'} />
          <Row label="entered" value={String(entered)} warn={!entered} />
          <Row label="safeMode" value={String(isSafeMode)} />
          <Row label="canvasMounted" value={String(canvasMounted)} warn={!canvasMounted} />
          <Row
            label="canvas w×h"
            value={`${canvasSize.width}×${canvasSize.height}`}
            warn={canvasSize.width === 0 || canvasSize.height === 0}
          />
          <Row
            label="cameraPos"
            value={`x=${cameraPos.x.toFixed(1)} y=${cameraPos.y.toFixed(1)} z=${cameraPos.z.toFixed(1)}`}
          />
          <Row label="scrollProgress" value={scrollProgress.toFixed(3)} />

          {/* Divider */}
          <tr><td colSpan={2} style={{ paddingTop: '0.4rem', paddingBottom: '0.2rem' }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          </td></tr>

          {/* ── DISCRETE — fuente de verdad activa ── */}
          <tr><td colSpan={2} style={{ color: '#4ade80', fontWeight: 700, paddingBottom: '0.15rem', fontSize: '10px', letterSpacing: '0.08em' }}>
            DISCRETE (active — controls camera)
          </td></tr>
          <Row
            label="currentShot"
            value={discreteCurrentShotId ?? '—'}
          />
          <Row
            label="targetShot"
            value={discreteTargetShotId != null ? discreteTargetShotId : 'idle'}
          />
          <Row
            label="transitioning"
            value={discreteIsTransitioning != null ? String(discreteIsTransitioning) : '—'}
            warn={discreteIsTransitioning}
          />
          <Row
            label="direction"
            value={discreteTransitionDirection ?? 'none'}
          />
          <Row
            label="shotPhase"
            value={shotPhase ?? '—'}
          />
          <Row
            label="wheelIntent"
            value={discreteWheelIntent != null ? discreteWheelIntent.toFixed(0) : '—'}
          />

          {/* Divider */}
          <tr><td colSpan={2} style={{ paddingTop: '0.4rem', paddingBottom: '0.2rem' }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          </td></tr>

          {/* ── LEGACY — solo referencia, no controla cámara ── */}
          <tr><td colSpan={2} style={{ color: '#64748b', fontWeight: 700, paddingBottom: '0.15rem', fontSize: '10px', letterSpacing: '0.08em' }}>
            LEGACY (scroll-driven — bypassed)
          </td></tr>
          {legacyContradicts && (
            <tr><td colSpan={2} style={{ color: '#f87171', fontWeight: 700, fontSize: '10px' }}>
              ⚠ legacy contradicts discrete
            </td></tr>
          )}
          <Row label="l.currentShot"  value={currentShotId ?? '—'} />
          <Row label="l.nextShot"     value={nextShotId    ?? '—'} />
          <Row label="l.shotProgress" value={shotProgress != null ? shotProgress.toFixed(3) : '—'} />

          {/* Divider */}
          <tr><td colSpan={2} style={{ paddingTop: '0.4rem', paddingBottom: '0.2rem' }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          </td></tr>

          {/* Planet loading */}
          <Row label="activeGroups" value={[...activeGroups].join(', ')} />
          <Row label="planets (placeholder)" value={String(placeholderCount)} warn={placeholderCount < 0} />
          <Row label="GLB loaded" value={`${glbLoaded} / ${renderedPlanetCount}`} />
          <Row label="GLB failed" value={String(glbFailed)} warn={glbFailed > 0} />

          {/* Divider */}
          <tr><td colSpan={2} style={{ paddingTop: '0.4rem', paddingBottom: '0.2rem' }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          </td></tr>

          {/* Audio */}
          <Row label="audioEnabled" value={String(audioEnabled)} />
          <Row label="elementCreated" value={String(ad.elementCreated)} />
          <Row label="srcAssigned" value={String(ad.srcAssigned)} />
          <Row
            label="audioState"
            value={ad.audioState}
            warn={ad.audioState === 'error'}
          />
          <Row label="playAttempted" value={String(ad.playAttempted)} />
          <Row
            label="playResult"
            value={ad.playResult ?? 'n/a'}
            warn={ad.playResult === 'rejected'}
          />
          <Row
            label="duration"
            value={ad.duration > 0 ? `${ad.duration.toFixed(1)}s` : 'not loaded'}
          />
          {ad.lastError && (
            <Row label="lastError" value={ad.lastError} warn />
          )}
        </tbody>
      </table>
    </div>
  )
}
