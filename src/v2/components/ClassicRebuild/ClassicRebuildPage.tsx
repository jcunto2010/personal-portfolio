import { useMemo } from 'react'
import { ClassicAbout } from '../ClassicAbout/ClassicAbout'
import { ClassicFocus } from '../ClassicFocus/ClassicFocus'
import { ClassicTimeline } from '../ClassicTimeline/ClassicTimeline'
import NeuralBackground from '../NeuralBackground'
import Contact from '../Contact/Contact'
import { TableOfContents } from '../TableOfContents/TableOfContents'
import { Hero } from '../../../components/ui/animated-hero'
import { experienceV2 } from '../../data/experience.v2'
import { getProjectBySlug, type ProjectV2 } from '../../data/projects.v2'
import { useLocale } from '../../lib/localeContext'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { IntegrationHero } from '../../../components/ui/integration-hero'
import styles from './ClassicRebuildPage.module.css'

export function ClassicRebuildPage() {
  const { locale } = useLocale()
  const isEs = locale === 'es'
  const prefersReduced = useReducedMotion()
  const reservoProject = useMemo(() => getProjectBySlug('reservo-ai'), [])
  const startupProject = useMemo(() => getProjectBySlug('startupconnect'), [])

  const ui = {
    modeBadge: isEs ? 'Modo clásico' : 'Classic mode',
    title: isEs ? 'Jonathan Cunto Díaz' : 'Jonathan Cunto Díaz',
    subtitle: isEs ? 'Frontend Developer' : 'Frontend Developer',
    intro:
      isEs
        ? 'Ingeniero con background en producto y datos que cruzó al desarrollo de software — y construyó el puente completo.'
        : 'Engineer with a product and data background who crossed into software development — and built the whole bridge.',
    aboutTitle: isEs ? 'Acerca de' : 'About',
    about1:
      isEs
        ? 'Soy Ingeniero Industrial reconvertido en desarrollador de software. Pasé años trabajando en producto, datos y automatización antes de escribir mi primera línea de Flutter — y esa trayectoria cambió cómo construyo: entiendo el negocio, el dato y el código al mismo tiempo.'
        : 'I am an Industrial Engineer turned software developer. I spent years working in product, data, and automation before writing my first line of Flutter — and that path changed how I build: I understand the business, the data, and the code at the same time.',
    about2:
      isEs
        ? 'Construí Reservo.AI completamente desde cero — aprendiendo Flutter en el proceso — integrando IA con Google Gemini, autenticación biométrica y un backend en Firebase. Ese proyecto fue mi escuela acelerada de desarrollo móvil real.'
        : 'I built Reservo.AI entirely from scratch — learning Flutter along the way — integrating AI with Google Gemini, biometric authentication, and a Firebase backend. That project was my accelerated school in real mobile development.',
    about3:
      isEs
        ? 'También diseño en Figma, automaticé pipelines ETL en Python con impacto medible y lideré equipos técnicos. El desarrollo de software es mi dirección, pero llego con contexto que la mayoría de devs no tiene.'
        : 'I also design in Figma, automated ETL pipelines in Python with measurable impact, and led technical teams. Software development is my direction, but I arrive with context most devs don\'t have.',
    aboutHighlights: isEs
      ? [
          'Ing. Industrial + desarrollador de software: negocio, datos y código en uno.',
          'Automaticé pipelines ETL en Python con -80% de carga operativa.',
          'Construí Reservo.AI desde cero: Flutter, Gemini AI, Firebase, Rive.',
          'Experiencia real como Product Owner y Business Analyst en empresas.',
          'Diseño en Figma, gestión Agile/Scrum y despliegues en producción.',
        ]
      : [
          'Industrial Engineer + software developer: business, data, and code in one.',
          'Automated ETL pipelines in Python, cutting operational load by 80%.',
          'Built Reservo.AI from scratch: Flutter, Gemini AI, Firebase, Rive.',
          'Real experience as Product Owner and Business Analyst at companies.',
          'Figma design, Agile/Scrum management, and production deployments.',
        ],
    skillsTitle: isEs ? 'Skills' : 'Skills',
    experienceTitle: isEs ? 'Experiencia' : 'Experience',
    technologies: isEs ? 'Tecnologías' : 'Technologies',
    contactTitle: isEs ? 'Contacto' : 'Contact',
    github: isEs ? 'Código en GitHub' : 'Source on GitHub',
    heroMainText:
      isEs
        ? 'Ingeniero Industrial reconvertido en desarrollador de software. Entiendo los productos desde el negocio, los datos y el código — y construyo los tres. Actualmente enfocado en frontend moderno y apps mobile con IA.'
        : 'Industrial Engineer turned software developer. I understand products from the business, data, and code sides — and I build all three. Currently focused on modern frontend and AI-powered mobile apps.',
    // E2E suite asserts the single h1 contains "Jonathan".
    heroHeading: isEs ? 'Jonathan Cunto Díaz' : 'Jonathan Cunto Díaz',
    ctaWork: isEs ? 'View my work' : 'View my work',
    ctaContact: isEs ? 'Get in touch' : 'Get in touch',
    navHome: isEs ? 'Inicio' : 'Home',
    ctaExperience: isEs ? 'Experiencia' : 'Experience',
    heroLocation: isEs ? 'Caracas, Venezuela' : 'Caracas, Venezuela',
    navAbout: isEs ? 'Acerca' : 'About',
    aboutCtaSkills: isEs ? 'Ver skills' : 'View skills',
    aboutCtaContact: isEs ? 'Contactar' : 'Contact',
    footerCopyright: isEs
      ? 'Hecho por mí en 2026. Todos los derechos reservados.'
      : 'Made by me in 2026. All rights reserved.',
  }

  function scrollToSection(id: string) {
    const node = document.getElementById(id)
    if (!node) return
    const top = node.getBoundingClientRect().top + window.scrollY
    if (prefersReduced) {
      // Avoid any smooth-scroll polyfills/quirks on mobile reduced-motion runs.
      window.scrollTo(0, top)
      return
    }
    window.scrollTo({ top, behavior: 'smooth' })
  }

  function renderProjectCard(project: ProjectV2) {
    const description = isEs ? (project.descriptionEs ?? project.description) : project.description
    const highlights = isEs ? (project.highlightsEs ?? project.highlights ?? []) : (project.highlights ?? [])
    return (
      <article className={styles.projectCard}>
        <img src={project.coverImage} alt="" className={styles.cover} loading="lazy" />
        <div className={styles.projectBody}>
          <p className={styles.year}>{project.year}</p>
          <p className={styles.muted}>{project.tagline}</p>
          <p>{description}</p>
          {highlights.length > 0 && (
            <ul className={styles.bullets}>
              {highlights.slice(0, 5).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          <p className={styles.metaLabel}>{ui.technologies}</p>
          <ul className={styles.chips}>
            {project.technologies.map((tech) => (
              <li key={tech} className={styles.chip}>{tech}</li>
            ))}
          </ul>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {ui.github}
            </a>
          )}
        </div>
      </article>
    )
  }

  return (
    <div className={styles.page}>
      <TableOfContents />

      <header className={styles.hero} id="chapter-intro">
        <Hero
          onExploreWork={() => scrollToSection('chapter-reservo')}
          onContact={() => scrollToSection('chapter-contact')}
        />
      </header>

      <ClassicAbout
        id="chapter-about"
        title={ui.aboutTitle}
        paragraphs={[ui.about1, ui.about2, ui.about3]}
        highlights={ui.aboutHighlights}
        ctaPrimary={{ label: ui.aboutCtaSkills, onClick: () => scrollToSection('classic-skills') }}
        ctaSecondary={{ label: ui.aboutCtaContact, onClick: () => scrollToSection('chapter-contact') }}
      />

      <section id="classic-focus">
        <ClassicFocus locale={locale} />
      </section>

      <section className={styles.section} id="classic-skills">
        <IntegrationHero
          title={ui.skillsTitle}
          description={
            isEs
              ? 'Un stack curado de herramientas y frameworks modernos que uso para construir productos de alto rendimiento y escalables.'
              : 'A curated stack of modern tools and frameworks I use to build performant, scalable products.'
          }
        />
      </section>

      <section className={styles.section} id="chapter-notes">
        <ClassicTimeline
          heading={ui.experienceTitle}
          intro={
            isEs
              ? 'De Ingeniería Industrial al desarrollo de software — pasando por producto, datos y automatización.'
              : 'From Industrial Engineering to software development — through product, data, and automation.'
          }
          entries={experienceV2.map((exp) => ({
            title: exp.role,
            subtitle: `${exp.period} \u00b7 ${exp.company}`,
            description: isEs ? (exp.descriptionEs ?? exp.description) : exp.description,
            bullets: exp.technologies,
          }))}
        />
      </section>

      {reservoProject && (
        <section className={styles.section} id="chapter-reservo" aria-labelledby="chapter-reservo-heading">
          <h2 id="chapter-reservo-heading">{reservoProject.title}</h2>
          <div className={styles.projectSingle}>{renderProjectCard(reservoProject)}</div>
        </section>
      )}

      {startupProject && (
        <section className={styles.section} id="chapter-startupconnect" aria-labelledby="chapter-startupconnect-heading">
          <h2 id="chapter-startupconnect-heading">{startupProject.title}</h2>
          <div className={styles.projectSingle}>{renderProjectCard(startupProject)}</div>
        </section>
      )}

      <section
        className={`${styles.section} ${styles.sectionContact}`}
        id="chapter-contact"
        aria-labelledby="chapter-contact-heading"
      >
        <div className={styles.contactNeuralUnderlay} aria-hidden="true">
          <NeuralBackground
            reducedMotion={prefersReduced}
            color="#93c5fd"
            trailOpacity={0.07}
            particleCount={720}
            speed={1}
          />
        </div>
        <h2 id="chapter-contact-heading" className={styles.srOnly}>
          {ui.contactTitle}
        </h2>
        <div className={styles.contactSlot}>
          <Contact />
        </div>
      </section>

      <footer className={styles.siteFooter}>
        <div className={styles.footerDivider} />
        <p className={styles.footerText}>{ui.footerCopyright}</p>
      </footer>
    </div>
  )
}
