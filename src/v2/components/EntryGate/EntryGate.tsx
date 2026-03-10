/**
 * EntryGate — Phase 1
 *
 * Full-viewport overlay rendered before the main experience.
 * Lets the user choose:
 *   - Immersive mode  (3D solar scene — future phases)
 *   - Non-immersive mode (editorial layout — available now)
 *   - Background audio on / off
 *   - Fullscreen (recommended for immersive mode)
 *
 * The component reads initial state from AppModeContext (which hydrates
 * from localStorage), so returning visitors see their last preference.
 *
 * On "Enter", the gate calls onEnter() — the parent decides whether to
 * unmount the overlay and which sub-experience to render.
 *
 * Audio is NOT loaded here. The audioEnabled flag is set in context so
 * useAudioShell (mounted in HomeV2) can start playback after the gate
 * closes and the user is inside the experience.
 */

import { useState } from 'react'
import { useAppMode, type AppMode } from '../../lib/appModeContext'
import styles from './EntryGate.module.css'

interface EntryGateProps {
  onEnter: () => void
}

export function EntryGate({ onEnter }: EntryGateProps) {
  const { mode, audioEnabled, setMode, setAudioEnabled, requestFullscreen, isFullscreen } =
    useAppMode()

  // Local state mirrors context so changes are applied only on "Enter".
  const [localMode, setLocalMode] = useState<AppMode>(mode)
  const [localAudio, setLocalAudio] = useState<boolean>(audioEnabled)

  async function handleEnter() {
    // Persist final selections.
    setMode(localMode)
    setAudioEnabled(localAudio)

    // If user hasn't already gone fullscreen and chose immersive, request it.
    // Fullscreen must be called from a direct user gesture — this click qualifies.
    if (localMode === 'immersive' && !isFullscreen) {
      await requestFullscreen()
    }

    onEnter()
  }

  async function handleFullscreenToggle() {
    await requestFullscreen()
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Portfolio entry">
      <div className={styles.card}>
        <p className={styles.eyebrow}>Portfolio V2</p>
        <h1 className={styles.title}>Jonathan Cunto Díaz</h1>
        <p className={styles.subtitle}>
          Choose your experience before entering.
        </p>

        {/* ── Mode selection ────────────────────────────── */}
        <div className={styles.modeSection} role="group" aria-labelledby="mode-label">
          <span id="mode-label" className={styles.sectionLabel}>Experience mode</span>
          <div className={styles.modeGrid}>
            <button
              type="button"
              className={`${styles.modeBtn} ${localMode === 'immersive' ? styles.selected : ''}`}
              onClick={() => setLocalMode('immersive')}
              aria-pressed={localMode === 'immersive'}
            >
              <span className={styles.modeIcon} aria-hidden="true">🪐</span>
              <span className={styles.modeName}>Immersive</span>
              <span className={styles.modeDesc}>3D solar system + ambient audio</span>
            </button>

            <button
              type="button"
              className={`${styles.modeBtn} ${localMode === 'non-immersive' ? styles.selected : ''}`}
              onClick={() => setLocalMode('non-immersive')}
              aria-pressed={localMode === 'non-immersive'}
            >
              <span className={styles.modeIcon} aria-hidden="true">📄</span>
              <span className={styles.modeName}>Classic</span>
              <span className={styles.modeDesc}>Editorial layout, no heavy 3D</span>
            </button>
          </div>
        </div>

        {/* ── Audio toggle ──────────────────────────────── */}
        <div className={styles.audioSection}>
          <button
            type="button"
            className={`${styles.audioToggle} ${localAudio ? styles.audioOn : ''}`}
            onClick={() => setLocalAudio((v) => !v)}
            aria-pressed={localAudio}
            aria-label={localAudio ? 'Background audio enabled — click to disable' : 'Background audio disabled — click to enable'}
          >
            <span className={styles.audioLeft}>
              <span className={styles.audioLabel}>
                {localAudio ? '♪ Audio enabled' : '♪ Audio off'}
              </span>
              <span className={styles.audioHint}>
                {localAudio
                  ? 'Ambient music will play when you enter'
                  : 'No audio will be loaded or played'}
              </span>
            </span>
            <span className={styles.audioIndicator} aria-hidden="true" />
          </button>
        </div>

        {/* ── Fullscreen hint ───────────────────────────── */}
        <button
          type="button"
          className={`${styles.fullscreenHint} ${isFullscreen ? styles.fullscreenActive : ''}`}
          onClick={handleFullscreenToggle}
          aria-label={isFullscreen ? 'Fullscreen active' : 'Click to request fullscreen (recommended for immersive mode)'}
        >
          <span aria-hidden="true">{isFullscreen ? '⛶' : '⛶'}</span>
          {isFullscreen ? 'Fullscreen active' : 'Fullscreen recommended for immersive mode'}
        </button>

        {/* ── Enter ─────────────────────────────────────── */}
        <button
          type="button"
          className={styles.enterBtn}
          onClick={handleEnter}
        >
          Enter →
        </button>
      </div>
    </div>
  )
}
