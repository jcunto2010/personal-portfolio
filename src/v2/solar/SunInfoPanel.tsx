import { useEffect, useRef } from 'react'
import type { PlanetConfig } from './planetRegistry'
import styles from './SunInfoPanel.module.css'

export interface SunInfoPanelProps {
  config: PlanetConfig
  open: boolean
  align?: 'left' | 'right'
  phaseInfo: string
  onClose: () => void
}

export function SunInfoPanel({ config, open, align = 'right', phaseInfo, onClose }: SunInfoPanelProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeBtnRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <aside
      className={`${styles.panel} ${align === 'left' ? styles.panelLeft : styles.panelRight}`}
      aria-label={`${config.label} information`}
    >
      <section className={styles.card} aria-label="Sun phase information">
        <div className={styles.cardHeader}>
          <div className={styles.titleBlock}>
            <h2 className={styles.planetName}>{config.label}</h2>
            <p className={styles.portfolioPhase}>
              <span className={styles.dot} aria-hidden="true" style={{ background: config.accentColor }} />
              {config.section}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Sun info panel"
          >
            ✕
          </button>
        </div>

        <p className={styles.phaseText}>{phaseInfo}</p>
      </section>
    </aside>
  )
}

