import { useCallback, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TableOfContents } from '../../components/TableOfContents/TableOfContents'
import { WebGLLayer } from '../../components/WebGLLayer/WebGLLayer'
import { projectsV2 } from '../../data/projects.v2'
import { skillsV2 } from '../../data/skills.v2'
import { experienceV2 } from '../../data/experience.v2'
import { contactV2 } from '../../data/contact.v2'
import { useLenis } from '../../hooks/useLenis'
import { useChapterReveal } from '../../hooks/useChapterReveal'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ScrollContext } from '../../lib/scrollContext'
import { useLocale } from '../../lib/localeContext'
import styles from './HomeV2.module.css'

/**
 * Home V2 — Cosmic Editorial
 *
 * Real content migrated from V1 sources:
 *   - Hero: src/components/Hero.tsx
 *   - Skills: src/data/skills.ts
 *   - Experience: src/data/experience.ts
 *   - Contact: src/components/Contact.tsx + Footer.tsx
 *
 * Scroll layer (T-002):
 *   - Lenis provides smooth scroll via `useLenis`.
 *   - GSAP + ScrollTrigger reveal animations via `useChapterReveal`.
 *   - Both are disabled when `prefers-reduced-motion: reduce` is active.
 *
 * WebGL ambient layer wired in T-003.
 *
 * Internal chapter navigation uses programmatic scroll (scrollToChapter)
 * instead of native hash anchors. This avoids conflicts with HashRouter,
 * which interprets every `#` fragment as a route path.
 *
 * To deep-link to a chapter, append ?chapter=<id> to the Home route:
 *   #/?chapter=chapter-notes
 */
export default function HomeV2() {
  const { search } = useLocation()
  const prefersReduced = useReducedMotion()
  const { locale } = useLocale()

  // Initialise Lenis smooth scroll (no-op when reduced-motion is active).
  const lenisRef = useLenis()

  // Activate GSAP ScrollTrigger chapter reveal animations.
  useChapterReveal()

  /**
   * Scroll to a chapter section by id.
   *
   * When Lenis is active, delegate to `lenis.scrollTo` so the smooth-scroll
   * engine controls the animation. Otherwise fall back to native
   * `scrollIntoView` with `behavior: 'smooth'` (or 'auto' for reduced motion).
   */
  const scrollToChapter = useCallback(
    (id: string) => {
      const el = document.getElementById(id)
      if (!el) return

      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: 0 })
      } else {
        el.scrollIntoView({
          behavior: prefersReduced ? 'auto' : 'smooth',
          block: 'start',
        })
      }
    },
    [lenisRef, prefersReduced],
  )

  // On mount (or whenever the search string changes), scroll to the requested
  // chapter. This handles deep-links like /#/?chapter=chapter-notes.
  useEffect(() => {
    const params = new URLSearchParams(search)
    const chapter = params.get('chapter')
    if (!chapter) return

    // Delay one tick so the DOM is fully painted before scrolling.
    const id = requestAnimationFrame(() => {
      scrollToChapter(chapter)
    })
    return () => cancelAnimationFrame(id)
  }, [search, scrollToChapter])

  const featuredProjects = projectsV2.filter((p) => p.featured)
  const isEs = locale === 'es'

  const projectTaglineEsBySlug: Record<string, string> = {
    'reservo-ai': 'Plataforma de reservas con IA, con interfaz conversacional.',
    startupconnect: 'LinkedIn meets Tinder: red social para el ecosistema startup.',
  }

  const skillCategoryLabelsByLocale = {
    language: isEs ? 'Lenguajes' : 'Languages',
    framework: isEs ? 'Frameworks y librerías' : 'Frameworks & Libraries',
    tool: isEs ? 'Herramientas y plataformas' : 'Tools & Platforms',
  } as const

  const skillsByCategory = (['language', 'framework', 'tool'] as const).map((cat) => ({
    category: cat,
    label: skillCategoryLabelsByLocale[cat],
    skills: skillsV2.filter((s) => s.category === cat),
  }))

  const ui = {
    skipLink: isEs ? 'Saltar al contenido principal' : 'Skip to main content',
    heroEyebrow: isEs ? 'Hola, mi nombre es' : 'Hi, my name is',
    heroSubtitle: isEs ? 'Desarrollador/a Frontend' : 'Frontend Developer',
    heroLead:
      isEs
        ? 'Creo aplicaciones web hermosas, responsivas y fáciles de usar con tecnologías modernas como React, TypeScript y Flutter. Me apasiona el código limpio y las experiencias de usuario excepcionales.'
        : 'I create beautiful, responsive, and user-friendly web applications using modern technologies like React, TypeScript, and Flutter. Passionate about clean code and exceptional user experiences.',
    ctaWork: isEs ? 'Ver mi trabajo' : 'View my work',
    ctaContact: isEs ? 'Ponte en contacto' : 'Get in touch',
    aboutHeading: isEs ? 'Acerca de' : 'About',
    aboutPara1:
      isEs
        ? 'Soy un desarrollador autodidacta con pasión por el diseño de producto y la ingeniería centrada en el usuario. Construyo aplicaciones mobile-first con Flutter y React, con un fuerte enfoque en accesibilidad, rendimiento y refinamiento iterativo.'
        : 'I\'m a self-taught developer with a passion for product design and user-centric engineering. I build mobile-first applications using Flutter and React, with a strong emphasis on accessibility, performance, and iterative refinement.',
    aboutPara2:
      isEs
        ? 'Actualmente trabajo en Reservo.AI, una plataforma de reservas de citas con IA, y exploro nuevas formas de cerrar la brecha entre sistemas complejos y experiencias de usuario simples.'
        : 'Currently working on Reservo.AI — an AI-powered appointment booking platform — and exploring new ways to bridge the gap between complex systems and simple user experiences.',
    experienceHeading: isEs ? 'Experiencia' : 'Experience',
    workHeading: isEs ? 'Trabajo' : 'Work',
    workLead: isEs ? 'Proyectos seleccionados: construidos de extremo a extremo con restricciones reales y usuarios reales.' : 'Selected projects — each built end-to-end with real constraints and real users.',
    contactHeading: isEs ? 'Contacto' : 'Contact',
    contactLead: isEs ? '¿Tienes un proyecto en mente? Hablemos.' : "Have a project in mind? Let's talk.",
    expAria: isEs ? 'Experiencia laboral' : 'Work experience',
    expTechAria: isEs ? 'Tecnologías utilizadas' : 'Technologies used',
    viewProject: isEs ? 'Ver proyecto' : 'View project',
    technologies: isEs ? 'Tecnologías' : 'Technologies',
    viewCaseStudy: isEs ? 'Ver caso de estudio' : 'View case study',
    allProjects: isEs ? 'Todos los proyectos' : 'All projects',
    skillsAria: isEs ? 'Conocimientos' : 'Skills',
    contactEmail: isEs ? 'Correo' : 'Email',
    contactWhatsApp: isEs ? 'WhatsApp' : 'WhatsApp',
    contactLocation: isEs ? 'Ubicación' : 'Location',
    contactGitHub: isEs ? 'GitHub' : 'GitHub',
    contactLinkedIn: isEs ? 'LinkedIn' : 'LinkedIn',
    footerRights: isEs ? 'Todos los derechos reservados.' : 'All rights reserved.',
    ariaGitHubProfile: isEs ? 'Perfil de GitHub de Jonathan' : "Jonathan's GitHub profile",
    ariaLinkedInProfile: isEs ? 'Perfil de LinkedIn de Jonathan' : "Jonathan's LinkedIn profile",
    footerAriaGitHub: isEs ? 'Perfil de GitHub' : 'GitHub profile',
    footerAriaLinkedIn: isEs ? 'Perfil de LinkedIn' : 'LinkedIn profile',
    footerAriaSendEmail: isEs ? 'Enviar correo' : 'Send email',
    contactAriaGitHubProfile: isEs ? 'Perfil de GitHub de Jonathan' : "Jonathan's GitHub profile",
    contactAriaLinkedInProfile: isEs ? 'Perfil de LinkedIn de Jonathan' : "Jonathan's LinkedIn profile",
  }

  return (
    <ScrollContext.Provider value={lenisRef}>
    {/* Ambient WebGL background — fixed, pointer-events:none, aria-hidden */}
    <WebGLLayer />
    <div className={styles.page}>
      {/* Skip navigation link — A11y.
          Uses a button + programmatic scroll to avoid HashRouter conflicts. */}
      <button
        type="button"
        className={styles.skipLink}
        onClick={() => scrollToChapter('chapter-intro')}
      >
        {ui.skipLink}
      </button>

      <TableOfContents />

      {/* landmark-one-main: <main> wraps all chapter sections so the page
          has exactly one main landmark, satisfying WCAG 2.1 SC 1.3.6. */}
      <main id="main-content" className={styles.mainContent}>

      {/* ─── Chapter: Intro ─────────────────────────────────── */}
      <section
        id="chapter-intro"
        className={`${styles.chapter} ${styles.chapterIntro}`}
        aria-labelledby="chapter-intro-heading"
      >
        <div className={styles.chapterInner}>
          <p className={styles.eyebrow}>{ui.heroEyebrow}</p>
          <h1 id="chapter-intro-heading" className={styles.displayHeading}>
            Jonathan<br />
            Cunto Díaz
          </h1>
          <p className={styles.heroSubtitle}>{ui.heroSubtitle}</p>
          <p className={styles.lead}>
            {ui.heroLead}
          </p>
          <div className={styles.ctaRow}>
            <button
              type="button"
              className={styles.ctaPrimary}
              onClick={() => scrollToChapter('chapter-work')}
            >
              {ui.ctaWork}
            </button>
            <button
              type="button"
              className={styles.ctaSecondary}
              onClick={() => scrollToChapter('chapter-contact')}
            >
              {ui.ctaContact}
            </button>
          </div>

          <div className={styles.socialRow}>
            <a
              href={contactV2.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={ui.ariaGitHubProfile}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
            <a
              href={contactV2.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={ui.ariaLinkedInProfile}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>

      </section>

      {/* ─── Chapter: About ─────────────────────────────────── */}
      <section
        id="chapter-about"
        className={`${styles.chapter} ${styles.chapterAbout}`}
        aria-labelledby="chapter-about-heading"
      >
        <div className={styles.chapterInner}>
          <p className={styles.chapterIndex} aria-hidden="true">01</p>
          <h2 id="chapter-about-heading" className={styles.chapterHeading}>
            {ui.aboutHeading}
          </h2>
          <div className={styles.aboutBody}>
            <p>
              {ui.aboutPara1}
            </p>
            <p>
              {ui.aboutPara2}
            </p>
          </div>

          {/* Skills grid */}
          <div className={styles.skillsBlock}>
            {skillsByCategory.map(({ category, label, skills }) => (
              <div key={category} className={styles.skillsGroup}>
                <p className={styles.skillsGroupLabel}>{label}</p>
                <ul className={styles.skillsList} aria-label={label}>
                  {skills.map((skill) => (
                    <li key={skill.name} className={styles.skillPill}>
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Chapter: Notes (Experience content) ───────────── */}
      <section
        id="chapter-notes"
        className={`${styles.chapter} ${styles.chapterNotes}`}
        aria-labelledby="chapter-notes-heading"
      >
        <div className={styles.chapterInner}>
          <p className={styles.chapterIndex} aria-hidden="true">02</p>
          <h2 id="chapter-notes-heading" className={styles.chapterHeading}>
            {ui.experienceHeading}
          </h2>

          <ol className={styles.experienceList} aria-label={ui.expAria}>
            {experienceV2.map((exp) => (
              <li key={exp.id} className={styles.experienceItem}>
                <div className={styles.expPeriod}>{exp.period}</div>
                <div className={styles.expBody}>
                  <h3 className={styles.expRole}>{exp.role}</h3>
                  <p className={styles.expCompany}>{exp.company}</p>
                  <p className={styles.expDescription}>
                    {isEs && exp.id === '1'
                      ? 'Fundé y lideré el desarrollo mobile para una app de reservas de citas con IA. Integré Google Gemini para la interfaz conversacional e implementé autenticación biométrica con animaciones de Rive.'
                      : exp.description}
                  </p>
                  <ul className={styles.expTechList} aria-label={ui.expTechAria}>
                    {exp.technologies.map((t) => (
                      <li key={t} className={styles.expTechPill}>{t}</li>
                    ))}
                  </ul>
                  {exp.projectSlug && (
                    <Link
                      to={`/projects/${exp.projectSlug}`}
                      className={styles.expProjectLink}
                    >
                      {ui.viewProject} <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Chapter: Work ──────────────────────────────────── */}
      <section
        id="chapter-work"
        className={`${styles.chapter} ${styles.chapterWork}`}
        aria-labelledby="chapter-work-heading"
      >
        <div className={styles.chapterInner}>
          <p className={styles.chapterIndex} aria-hidden="true">03</p>
          <h2 id="chapter-work-heading" className={styles.chapterHeading}>
            {ui.workHeading}
          </h2>
          <p className={styles.chapterLead}>
            {ui.workLead}
          </p>

          <ul className={styles.projectGrid} role="list">
            {featuredProjects.map((project) => {
              const description = isEs ? (project.descriptionEs ?? project.description) : project.description
              const highlights =
                isEs
                  ? (project.highlightsEs ?? project.highlights ?? [])
                  : (project.highlights ?? [])
              const thumbs = project.thumbnails ?? []

              return (
                <li key={project.slug} className={styles.projectCard}>
                  <article aria-label={project.title}>
                    <div className={styles.projectCover} aria-hidden="true">
                      <img
                        src={project.coverImage}
                        alt=""
                        className={styles.projectCoverImg}
                        loading="lazy"
                        decoding="async"
                        onLoad={(e) => {
                          const img = e.currentTarget
                          const fallback = img.parentElement?.querySelector('[data-cover-fallback="true"]')
                          if (fallback instanceof HTMLElement) fallback.style.display = 'none'
                        }}
                        onError={(e) => {
                          // If the asset path is missing, hide the broken image and show the fallback letter.
                          const img = e.currentTarget
                          img.style.display = 'none'
                          const fallback = img.parentElement?.querySelector('[data-cover-fallback="true"]')
                          if (fallback instanceof HTMLElement) fallback.style.display = 'flex'
                        }}
                      />
                      <div className={styles.projectCoverPlaceholder} data-cover-fallback="true">
                        <span>{project.title[0]}</span>
                      </div>
                    </div>

                    <div className={styles.projectMeta}>
                      <p className={styles.projectYear}>{project.year}</p>
                      <h3 className={styles.projectTitle}>{project.title}</h3>
                      <p className={styles.projectTagline}>
                        {isEs ? (projectTaglineEsBySlug[project.slug] ?? project.tagline) : project.tagline}
                      </p>

                      <div
                        className={styles.projectScrollArea}
                        role="region"
                        tabIndex={0}
                        aria-label={isEs ? `Más información sobre ${project.title}` : `More info about ${project.title}`}
                      >
                        <p className={styles.projectDescription}>{description}</p>

                        {highlights.length > 0 && (
                          <ul className={styles.projectHighlights} aria-label={isEs ? 'Highlights' : 'Highlights'}>
                            {highlights.slice(0, 5).map((h) => (
                              <li key={h} className={styles.projectHighlightItem}>
                                <span className={styles.projectHighlightDot} aria-hidden="true" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        )}

                        <ul className={styles.techList} aria-label={ui.technologies}>
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

                      <div className={styles.projectActions}>
                        <Link
                          to={`/projects/${project.slug}`}
                          className={styles.projectLink}
                        >
                          {ui.viewCaseStudy}
                          <span aria-hidden="true"> →</span>
                        </Link>
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.projectGithubLink}
                            aria-label={isEs ? `${project.title} código fuente en GitHub` : `${project.title} source code on GitHub`}
                          >
                            GitHub <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>

          <Link to="/projects" className={styles.allProjectsLink}>
            {ui.allProjects}
            <span aria-hidden="true"> →</span>
          </Link>
        </div>
      </section>

      {/* ─── Chapter: Contact ───────────────────────────────── */}
      <section
        id="chapter-contact"
        className={`${styles.chapter} ${styles.chapterContact}`}
        aria-labelledby="chapter-contact-heading"
      >
        <div className={styles.chapterInner}>
          <p className={styles.chapterIndex} aria-hidden="true">04</p>
          <h2 id="chapter-contact-heading" className={styles.chapterHeading}>
            {ui.contactHeading}
          </h2>
          <p className={styles.chapterLead}>
            {ui.contactLead}
          </p>

          <address className={styles.contactGrid}>
            <div className={styles.contactGroup}>
              <span className={styles.contactLabel}>{ui.contactEmail}</span>
              <a
                href={`mailto:${contactV2.email}`}
                className={styles.contactLink}
              >
                {contactV2.email}
              </a>
            </div>
            <div className={styles.contactGroup}>
              <span className={styles.contactLabel}>{ui.contactWhatsApp}</span>
              <a
                href={contactV2.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                {contactV2.whatsappDisplay}
              </a>
            </div>
            <div className={styles.contactGroup}>
              <span className={styles.contactLabel}>{ui.contactLocation}</span>
              <span className={styles.contactValue}>{contactV2.location}</span>
            </div>
            <div className={styles.contactGroup}>
              <span className={styles.contactLabel}>{ui.contactGitHub}</span>
              <a
                href={contactV2.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
                aria-label={ui.contactAriaGitHubProfile}
              >
                github.com/jcunto2010
              </a>
            </div>
            <div className={styles.contactGroup}>
              <span className={styles.contactLabel}>{ui.contactLinkedIn}</span>
              <a
                href={contactV2.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
                aria-label={ui.contactAriaLinkedInProfile}
              >
                jonathan-cuntodiaz
              </a>
            </div>
          </address>
        </div>
      </section>

      </main>{/* end #main-content */}

      <footer className={styles.footer} role="contentinfo">
        <div className={styles.footerInner}>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} Jonathan Cunto Díaz. {ui.footerRights}
          </p>
          <div className={styles.footerSocials}>
            <a
              href={contactV2.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerSocialLink}
              aria-label={ui.footerAriaGitHub}
            >
              GitHub
            </a>
            <a
              href={contactV2.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerSocialLink}
              aria-label={ui.footerAriaLinkedIn}
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${contactV2.email}`}
              className={styles.footerSocialLink}
              aria-label={ui.footerAriaSendEmail}
            >
              {ui.contactEmail}
            </a>
          </div>
        </div>
      </footer>
    </div>
    </ScrollContext.Provider>
  )
}
