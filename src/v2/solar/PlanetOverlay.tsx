/**
 * PlanetOverlay — Phase 3
 *
 * Accessible modal panel shown when the user clicks a planet.
 * Renders outside the R3F Canvas (plain DOM) via a React portal so it sits
 * above the WebGL surface.
 *
 * Accessibility:
 *   - role="dialog" + aria-modal="true"
 *   - aria-labelledby pointing to the planet name heading
 *   - Focus trap: first interactive element (close button) receives focus on open
 *   - Escape key closes the overlay
 *   - Backdrop click closes the overlay
 *
 * Content is keyed to the PlanetConfig `id` via PLANET_CONTENT map below.
 * Each entry has a summary paragraph; richer content (links, lists) is left
 * as [NV] for Phase 4.
 */

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { PlanetConfig } from './planetRegistry'
import { PLANET_CONTENT } from './planetContent'
import styles from './PlanetOverlay.module.css'

// ── Component ─────────────────────────────────────────────────────────────────

export interface PlanetOverlayProps {
  config: PlanetConfig
  onClose: () => void
}

export function PlanetOverlay({ config, onClose }: PlanetOverlayProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const labelId = `planet-overlay-title-${config.id}`

  // Focus close button on mount
  useEffect(() => {
    closeBtnRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const content = PLANET_CONTENT[config.id] ?? {
    body: [`${config.label} — ${config.section}`],
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    // Only close if the backdrop itself was clicked, not the panel
    if (e.target === e.currentTarget) onClose()
  }

  const panel = (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className={styles.panel}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span
              className={styles.accentDot}
              style={{ background: config.accentColor }}
              aria-hidden="true"
            />
            <h2 id={labelId} className={styles.planetName}>
              {config.label}
            </h2>
            <p className={styles.sectionLabel}>{config.section}</p>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={`Close ${config.label} panel`}
          >
            ✕
          </button>
        </div>

        <hr className={styles.divider} />

        <div className={styles.body}>
          {content.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  )

  return createPortal(panel, document.body)
}
