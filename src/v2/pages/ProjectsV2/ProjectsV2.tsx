import { Link } from 'react-router-dom'
import { projectsV2 } from '../../data/projects.v2'
import { useLocale } from '../../lib/localeContext'
import styles from './ProjectsV2.module.css'

/**
 * /projects — V2 projects index page.
 * Lists all MVP projects with links to individual case studies.
 * Full content migration happens in T-004.
 */
export default function ProjectsV2() {
  const { locale } = useLocale()
  const isEs = locale === 'es'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <span aria-hidden="true">←</span> Home
        </Link>
        <div className={styles.headerContent}>
          <p className={styles.eyebrow}>Projects</p>
          <h1 className={styles.heading}>Selected work</h1>
          <p className={styles.lead}>
            End-to-end projects built with real constraints and real users.
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <ul className={styles.projectList} role="list">
          {projectsV2.map((project, index) => {
            const description = isEs ? (project.descriptionEs ?? project.description) : project.description
            const highlights = isEs ? (project.highlightsEs ?? project.highlights ?? []) : (project.highlights ?? [])
            const thumbs = project.thumbnails ?? []

            return (
              <li key={project.slug} className={styles.projectItem}>
                <article className={styles.projectRow} aria-label={project.title}>
                  <span className={styles.projectNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className={styles.projectInfo}>
                    <p className={styles.projectYear}>{project.year}</p>
                    <h2 className={styles.projectTitle}>{project.title}</h2>
                    <p className={styles.projectTagline}>{project.tagline}</p>

                    <div
                      className={styles.projectInfoScrollArea}
                      role="region"
                      tabIndex={0}
                      aria-label={isEs ? `Detalles de ${project.title}` : `Details for ${project.title}`}
                    >
                      <p className={styles.projectDescription}>{description}</p>

                      {highlights.length > 0 && (
                        <ul className={styles.projectHighlights} aria-label="Highlights">
                          {highlights.slice(0, 5).map((h) => (
                            <li key={h} className={styles.projectHighlightItem}>
                              <span className={styles.projectHighlightDot} aria-hidden="true" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}

                      <ul className={styles.techList} aria-label="Technologies">
                        {project.technologies.slice(0, 6).map((t) => (
                          <li key={t} className={styles.techPill}>{t}</li>
                        ))}
                      </ul>

                      {thumbs.length > 0 && (
                        <div className={styles.projectThumbs} aria-hidden="true">
                          {thumbs.slice(0, 3).map((th) => (
                            <div key={th.src} className={styles.projectThumb}>
                              <img src={th.src} alt="" className={styles.projectThumbImg} loading="lazy" decoding="async" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.projectActions}>
                    <Link
                      to={`/projects/${project.slug}`}
                      className={styles.caseStudyLink}
                    >
                      {isEs ? 'Caso de estudio' : 'Case study'}
                      <span aria-hidden="true"> →</span>
                    </Link>
                    {project.demoUrl && project.demoUrl !== '#' && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.externalLink}
                      >
                        Live demo ↗
                      </a>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Jonathan Cunto Díaz
        </p>
      </footer>
    </div>
  )
}
