import { useEffect, useRef, useState } from 'react'
import type { PlanetConfig } from './planetRegistry'
import { useLocale } from '../lib/localeContext'
import { getPlanetSectionLabel } from './planetSectionLabel'
import { getProjectBySlug } from '../data/projects.v2'
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
  const { locale } = useLocale()

  const projectSlug = config.id === 'moon' ? 'reservo-ai' : config.id === 'mars' ? 'startupconnect' : undefined
  const project = projectSlug ? getProjectBySlug(projectSlug) : undefined
  const description =
    locale === 'es'
      ? (project?.descriptionEs ?? project?.description)
      : project?.description
  const highlights =
    locale === 'es'
      ? (project?.highlightsEs ?? project?.highlights ?? [])
      : (project?.highlights ?? [])
  const thumbs = project?.thumbnails ?? []

  const [lightboxThumbSrc, setLightboxThumbSrc] = useState<string | null>(null)
  const [lightboxThumbAlt, setLightboxThumbAlt] = useState<string>('')

  // Prevent background scroll while lightbox is open.
  useEffect(() => {
    if (!lightboxThumbSrc) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [lightboxThumbSrc])

  useEffect(() => {
    if (!lightboxThumbSrc) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxThumbSrc(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [lightboxThumbSrc])

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
      <section
        className={`${styles.card} ${project ? styles.cardRich : ''}`}
        aria-label="Sun phase information"
      >
        <div className={styles.cardHeader}>
          <div className={styles.titleBlock}>
            <h2 className={styles.planetName}>{config.label}</h2>
            <p className={styles.portfolioPhase}>
              <span className={styles.dot} aria-hidden="true" style={{ background: config.accentColor }} />
              {getPlanetSectionLabel(config.id, locale)}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={locale === 'es' ? 'Cerrar panel de información' : 'Close Sun info panel'}
          >
            ✕
          </button>
        </div>

        {!project && <p className={styles.phaseText}>{phaseInfo}</p>}

        {project && (
          <div className={styles.richBlock} aria-label={locale === 'es' ? 'Resumen del proyecto' : 'Project summary'}>
            {description && <p className={styles.richDescription}>{description}</p>}

            {highlights.length > 0 && (
              <ul className={styles.richHighlights} aria-label={locale === 'es' ? 'Puntos clave' : 'Key points'}>
                {highlights.slice(0, 4).map((h) => (
                  <li
                    key={h}
                    className={styles.richHighlightItem}
                  >
                    <span
                      className={styles.richHighlightDot}
                      aria-hidden="true"
                      style={{
                        background: config.accentColor,
                        boxShadow: `0 0 16px ${config.accentColor}`,
                      }}
                    />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {thumbs.length > 0 && (
              <div className={styles.richThumbs} aria-hidden="true">
                {thumbs.slice(0, 4).map((t) => (
                  <button
                    key={t.src}
                    type="button"
                    className={styles.richThumbButton}
                    aria-label={t.alt || (locale === 'es' ? 'Ampliar captura' : 'Enlarge screenshot')}
                    onClick={() => {
                      setLightboxThumbSrc(t.src)
                      setLightboxThumbAlt(t.alt || '')
                    }}
                  >
                    <img
                      src={t.src}
                      alt=""
                      className={styles.richThumbImg}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        // Hide broken thumbnails (missing assets) and keep the card layout stable.
                        const img = e.currentTarget
                        img.style.display = 'none'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {(project?.codeSnippetEs || project?.codeSnippetEn) && (
              <div className={styles.richCodeBlock} aria-label={locale === 'es' ? 'Snippet de código' : 'Code snippet'}>
                <pre className={styles.richCodePre}>
                  <code>
                    {locale === 'es'
                      ? (project.codeSnippetEs ?? project.codeSnippetEn)
                      : project.codeSnippetEn ?? project.codeSnippetEs}
                  </code>
                </pre>
              </div>
            )}
          </div>
        )}
      </section>

      {lightboxThumbSrc && (
        <div
          className={styles.lightboxBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={locale === 'es' ? 'Captura ampliada' : 'Enlarged screenshot'}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxThumbSrc(null)
          }}
        >
          <div className={styles.lightboxPanel}>
            <button
              type="button"
              className={styles.lightboxClose}
              aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
              onClick={() => setLightboxThumbSrc(null)}
            >
              ✕
            </button>
            <img
              src={lightboxThumbSrc}
              alt={lightboxThumbAlt}
              className={styles.lightboxImg}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      )}
    </aside>
  )
}

