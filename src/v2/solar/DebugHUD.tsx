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
}: DebugHUDProps) {
  const totalPlanets = PLANET_REGISTRY.length
  const placeholderCount = totalPlanets - glbLoaded - glbFailed

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

          {/* Planet loading */}
          <Row label="activeGroups" value={[...activeGroups].join(', ')} />
          <Row label="planets (placeholder)" value={String(placeholderCount)} />
          <Row label="GLB loaded" value={String(glbLoaded)} />
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
