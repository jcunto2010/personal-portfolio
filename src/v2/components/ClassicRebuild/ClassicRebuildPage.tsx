import { useMemo } from 'react'
import { Github, Instagram, Linkedin, Twitter } from 'lucide-react'
import type { IconType } from 'react-icons'
import * as SiIcons from 'react-icons/si'
import { ClassicAbout } from '../ClassicAbout/ClassicAbout'
import { ClassicFocus } from '../ClassicFocus/ClassicFocus'
import { ClassicHero } from '../ClassicHero/ClassicHero'
import { ClassicTimeline } from '../ClassicTimeline/ClassicTimeline'
import NeuralBackground from '../NeuralBackground'
import Contact from '../Contact/Contact'
import { TableOfContents } from '../TableOfContents/TableOfContents'
import { contactV2 } from '../../data/contact.v2'
import { experienceV2 } from '../../data/experience.v2'
import { getProjectBySlug, type ProjectV2 } from '../../data/projects.v2'
import { skillsV2 } from '../../data/skills.v2'
import { InfiniteSlider } from '../ui/infinite-slider'
import { useLocale } from '../../lib/localeContext'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './ClassicRebuildPage.module.css'

export function ClassicRebuildPage() {
  const { locale } = useLocale()
  const isEs = locale === 'es'
  const prefersReduced = useReducedMotion()
  const reservoProject = useMemo(() => getProjectBySlug('reservo-ai'), [])
  const startupProject = useMemo(() => getProjectBySlug('startupconnect'), [])

  function getSkillIcon(iconKey: string): IconType | null {
    const exportNameByKey: Record<string, string> = {
      javascript: 'SiJavascript',
      typescript: 'SiTypescript',
      dart: 'SiDart',
      html5: 'SiHtml5',
      css3: 'SiCss',
      react: 'SiReact',
      nextjs: 'SiNextdotjs',
      flutter: 'SiFlutter',
      tailwindcss: 'SiTailwindcss',
      framermotion: 'SiFramer',
      vite: 'SiVite',
      firebase: 'SiFirebase',
      supabase: 'SiSupabase',
      postgresql: 'SiPostgresql',
      figma: 'SiFigma',
      rive: 'SiRive',
      git: 'SiGit',
      github: 'SiGithub',
      nodejs: 'SiNodedotjs',
      webpack: 'SiWebpack',
    }

    const exportName = exportNameByKey[iconKey]
    if (!exportName) return null

    const icon = (SiIcons as unknown as Record<string, IconType | undefined>)[exportName]
    return icon ?? null
  }

  const skillGroups = [
    {
      key: 'language' as const,
      label: isEs ? 'Lenguajes' : 'Languages',
      speed: 70,
      speedOnHover: 35,
      reverse: false,
      skills: skillsV2.filter((s) => s.category === 'language'),
    },
    {
      key: 'framework' as const,
      label: isEs ? 'Frameworks y librerías' : 'Frameworks & Libraries',
      speed: 80,
      speedOnHover: 40,
      reverse: true,
      skills: skillsV2.filter((s) => s.category === 'framework'),
    },
    {
      key: 'tool' as const,
      label: isEs ? 'Herramientas y plataformas' : 'Tools & Platforms',
      speed: 90,
      speedOnHover: 45,
      reverse: false,
      skills: skillsV2.filter((s) => s.category === 'tool'),
    },
  ]

  const ui = {
    modeBadge: isEs ? 'Modo clásico' : 'Classic mode',
    title: isEs ? 'Jonathan Cunto Diaz' : 'Jonathan Cunto Diaz',
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
        <ClassicHero
          logoText={ui.title}
          navLinks={[
            { label: isEs ? 'Inicio' : 'Home', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
            { label: isEs ? 'Acerca' : 'About', onClick: () => scrollToSection('chapter-about') },
            { label: isEs ? 'Exp.' : 'Exp.', onClick: () => scrollToSection('chapter-notes') },
            { label: 'Reservo', onClick: () => scrollToSection('chapter-reservo') },
            { label: 'Startup', onClick: () => scrollToSection('chapter-startupconnect') },
            { label: 'Skills', onClick: () => scrollToSection('classic-skills') },
            { label: isEs ? 'Contacto' : 'Contact', onClick: () => scrollToSection('chapter-contact') },
          ]}
          heroHeading={ui.heroHeading}
          mainText={ui.heroMainText}
          ctaPrimary={{ label: ui.ctaWork, onClick: () => scrollToSection('chapter-reservo') }}
          ctaSecondary={{ label: ui.ctaContact, onClick: () => scrollToSection('chapter-contact') }}
          imageSrc="/assets/projects/johnny_hero.webp"
          imageAlt="Jonathan hero portrait"
          socialLinks={[
            { icon: Github, href: contactV2.github, label: 'GitHub' },
            { icon: Linkedin, href: contactV2.linkedin, label: 'LinkedIn' },
            { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
            { icon: Twitter, href: 'https://x.com', label: 'X' },
          ]}
          locationText={ui.heroLocation}
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
        <h2>{ui.skillsTitle}</h2>
        <div className={styles.skillsSliders}>
          {skillGroups.map((group) => (
            <div key={group.key} className={styles.skillsSliderGroup}>
              <h3 className={styles.skillsSliderLabel}>{group.label}</h3>
              <div className={styles.skillsSliderArea}>
                <InfiniteSlider
                  gap={10}
                  speed={group.speed}
                  speedOnHover={group.speedOnHover}
                  reverse={group.reverse}
                  className={styles.skillsSlider}
                >
                  {group.skills.map((skill) => (
                    <span key={`${group.key}-${skill.name}`} className={styles.skillSliderItem}>
                      {(() => {
                        const Icon = getSkillIcon(skill.iconKey)
                        return (
                          <span className={styles.skillSliderPill}>
                            {Icon && <Icon className={styles.skillSliderIcon} aria-hidden="true" />}
                            <span className={styles.skillSliderText}>{skill.name}</span>
                          </span>
                        )
                      })()}
                    </span>
                  ))}
                </InfiniteSlider>
              </div>
            </div>
          ))}
        </div>
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
