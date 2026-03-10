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
import styles from './PlanetOverlay.module.css'

// ── Content map ───────────────────────────────────────────────────────────────

interface PlanetContent {
  body: string[]
}

const PLANET_CONTENT: Record<string, PlanetContent> = {
  sun: {
    body: [
      "Welcome. I'm Jonathan — a full-stack developer and builder who loves creating things that matter.",
      "This solar system is my portfolio. Each planet is a chapter of my story. Scroll forward to begin the journey.",
    ],
  },
  mercury: {
    body: [
      "Core stack: TypeScript, React, Node.js, Python, PostgreSQL, Redis, and Docker.",
      "I move fast and build lean. Mercury is small but it's always the first to orbit the sun — speed and precision are the idea.",
    ],
  },
  venus: {
    body: [
      "This portfolio is built with React + Three.js (React Three Fiber), lazy-loaded GLB models, and CSS Modules.",
      "The immersive mode loads only what you need, when you need it. Progressive loading groups keep the initial payload small.",
    ],
  },
  earth: {
    body: [
      "A hub of everything I've shipped. Projects range from AI-powered SaaS tools to developer infrastructure.",
      "Click through the planets orbiting Earth to explore individual projects in depth.",
    ],
  },
  moon: {
    body: [
      "Reservo.AI — an AI scheduling assistant that integrates with Google Calendar and learns your preferences over time.",
      "Built with Next.js, OpenAI function calling, and a PostgreSQL backend. Reduced scheduling overhead by ~40% in beta testing.",
    ],
  },
  mars: {
    body: [
      "StartupConnect — a matchmaking platform for early-stage founders and co-founders.",
      "Full-stack: React frontend, Express + TypeScript API, PostgreSQL with full-text search, deployed on Railway.",
    ],
  },
  neptune: {
    body: [
      "5+ years building production systems across fintech, health-tech, and developer tooling.",
      "Comfortable leading small teams, owning end-to-end delivery, and mentoring junior engineers.",
    ],
  },
  uranus: {
    body: [
      "Interested in working together? I'm open to full-time roles, contracts, and meaningful side projects.",
      "Reach me at: jonathan@example.com — or find me on GitHub and LinkedIn.",
    ],
  },
  blackhole: {
    body: [
      "You've reached the event horizon.",
      "Beyond this point, the journey loops — every ending is a new beginning. Press Escape or close this panel to reset.",
    ],
  },
}

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
