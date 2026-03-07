import { Link } from 'react-router-dom'
import { projectsV2 } from '../../data/projects.v2'
import styles from './ProjectsV2.module.css'

/**
 * /projects — V2 projects index page.
 * Lists all MVP projects with links to individual case studies.
 * Full content migration happens in T-004.
 */
export default function ProjectsV2() {
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
          {projectsV2.map((project, index) => (
            <li key={project.slug} className={styles.projectItem}>
              <article className={styles.projectRow} aria-label={project.title}>
                <span className={styles.projectNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className={styles.projectInfo}>
                  <p className={styles.projectYear}>{project.year}</p>
                  <h2 className={styles.projectTitle}>{project.title}</h2>
                  <p className={styles.projectTagline}>{project.tagline}</p>
                  <ul className={styles.techList} aria-label="Technologies">
                    {project.technologies.slice(0, 5).map((t) => (
                      <li key={t} className={styles.techPill}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.projectActions}>
                  <Link
                    to={`/projects/${project.slug}`}
                    className={styles.caseStudyLink}
                  >
                    Case study
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
          ))}
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
