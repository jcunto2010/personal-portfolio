import { useEffect, useRef, useState } from 'react'
import type { PlanetConfig } from './planetRegistry'
import { useLocale } from '../lib/localeContext'
import { getPlanetSectionLabel } from './planetSectionLabel'
import { getPlanetContent } from './planetContent'
import { getProjectBySlug } from '../data/projects.v2'
import { getImmersivePlanetCaseStudy } from '../data/immersivePlanetCaseStudy'
import { PhoneMockVideo } from '../../components/ui/phone-mock-video'
import { CodeSnippet } from '../../components/ui/code-snippet'
import styles from './SunInfoPanel.module.css'

export interface SunInfoPanelProps {
  config: PlanetConfig
  open: boolean
  align?: 'left' | 'right'
  onClose: () => void
}

export function SunInfoPanel({ config, open, align = 'right', onClose }: SunInfoPanelProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const { locale } = useLocale()

  const narrative = getPlanetContent(config.id, locale)?.body ?? []

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

  const [compactCaseStudy, setCompactCaseStudy] = useState(false)

  const caseStudy = getImmersivePlanetCaseStudy(config.id, compactCaseStudy)

  useEffect(() => {
    if (!open) return
    closeBtnRef.current?.focus()
  }, [open])

  useEffect(() => {
    const update = () => setCompactCaseStudy(window.innerWidth < 1024)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (!open) return null

  return (
    <aside
      className={`${styles.panel} ${align === 'left' ? styles.panelLeft : styles.panelRight}`}
      aria-label={`${config.label} information`}
    >
      <section
        className={`${styles.card} ${project ? styles.cardRich : ''} ${caseStudy ? styles.cardCaseStudy : ''}`}
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

        {!project &&
          (narrative.length > 0 ? (
            config.id === 'uranus' && narrative.length > 1 ? (
              <>
                <p className={styles.phaseText}>{narrative[0]}</p>
                <ul
                  className={styles.contactBullets}
                  aria-label={locale === 'es' ? 'Contacto' : 'Contact'}
                >
                  {/* static list — index key is safe */}
                  {narrative.slice(1).map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                {/* static list — index key is safe */}
                {narrative.map((paragraph, i) => (
                  <p key={i} className={styles.phaseText}>
                    {paragraph}
                  </p>
                ))}
              </>
            )
          ) : (
            <p className={styles.phaseText}>
              {config.label} — {getPlanetSectionLabel(config.id, locale)}
            </p>
          ))}

        {project && (
          <div className={styles.richBlock} aria-label={locale === 'es' ? 'Resumen del proyecto' : 'Project summary'}>
            {narrative.length > 0 ? (
              <>
                {/* static list — index key is safe */}
                {narrative.map((paragraph, i) => (
                  <p key={i} className={styles.richDescription}>
                    {paragraph}
                  </p>
                ))}
              </>
            ) : (
              description && <p className={styles.richDescription}>{description}</p>
            )}

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

            {caseStudy && (
              <>
                <div className={styles.caseStudyMock}>
                  <PhoneMockVideo
                    videoSrc={caseStudy.video.src}
                    videoTranslateXPx={caseStudy.video.videoTranslateXPx}
                    videoScale={caseStudy.video.videoScale}
                    videoScaleXRatio={caseStudy.video.videoScaleXRatio}
                    videoScaleYRatio={caseStudy.video.videoScaleYRatio}
                    ariaLabel={locale === 'es' ? 'Video demo del proyecto' : 'Project demo video'}
                    className="origin-top scale-[0.48] min-[380px]:scale-[0.54] min-[480px]:scale-[0.60] lg:scale-[0.68]"
                  />
                </div>
                <div className={styles.caseStudySnippet}>
                  <CodeSnippet
                    files={caseStudy.codeFiles}
                    autoHeight={false}
                    className="w-full max-w-none shadow-none"
                  />
                </div>
              </>
            )}

            {(project?.codeSnippetEs || project?.codeSnippetEn) && !caseStudy && (
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
    </aside>
  )
}

