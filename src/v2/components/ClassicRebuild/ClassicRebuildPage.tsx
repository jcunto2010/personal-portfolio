import { useMemo } from 'react'
import { Github, Instagram, Linkedin, Twitter } from 'lucide-react'
import type { IconType } from 'react-icons'
import * as SiIcons from 'react-icons/si'
import { ClassicAbout } from '../ClassicAbout/ClassicAbout'
import { ClassicHero } from '../ClassicHero/ClassicHero'
import { contactV2 } from '../../data/contact.v2'
import { experienceV2 } from '../../data/experience.v2'
import { projectsV2 } from '../../data/projects.v2'
import { skillsV2 } from '../../data/skills.v2'
import { InfiniteSlider } from '../ui/infinite-slider'
import { useLocale } from '../../lib/localeContext'
import styles from './ClassicRebuildPage.module.css'

export function ClassicRebuildPage() {
  const { locale } = useLocale()
  const isEs = locale === 'es'
  const featuredProjects = useMemo(() => projectsV2.filter((p) => p.featured), [])

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
        ? 'Creo aplicaciones y experiencias digitales enfocadas en claridad, rendimiento y resultado de negocio.'
        : 'I build digital products focused on clarity, performance, and business outcomes.',
    aboutTitle: isEs ? 'Acerca de' : 'About',
    about1:
      isEs
        ? 'Soy un desarrollador frontend y mobile con enfoque en producto. Me involucro desde la definición hasta la entrega para que cada funcionalidad sea útil, medible y mantenible.'
        : 'I am a frontend and mobile developer with a product mindset. I stay involved from definition to delivery so every feature is useful, measurable, and maintainable.',
    about2:
      isEs
        ? 'Actualmente lidero el desarrollo de Reservo.AI y colaboro en productos donde la velocidad de ejecución y la calidad visual son igual de importantes.'
        : 'I currently lead development for Reservo.AI and collaborate on products where execution speed and visual quality are equally important.',
    about3:
      isEs
        ? 'Mi trabajo conecta diseño, ingeniería y producto para que cada lanzamiento sea consistente, rápido y fácil de evolucionar.'
        : 'My work connects design, engineering, and product so every release is consistent, fast, and easy to evolve.',
    aboutHighlights: isEs
      ? [
          '4+ años construyendo productos web y mobile.',
          'Experiencia en arquitectura frontend escalable.',
          'Enfoque fuerte en performance, DX y mantenibilidad.',
          'Colaboración directa con diseño, negocio y stakeholders.',
          'Entrega end-to-end: discovery, build, QA y release.',
        ]
      : [
          '4+ years building web and mobile products.',
          'Experience designing scalable frontend architecture.',
          'Strong focus on performance, DX, and maintainability.',
          'Direct collaboration with design, business, and stakeholders.',
          'End-to-end delivery: discovery, build, QA, and release.',
        ],
    skillsTitle: isEs ? 'Skills' : 'Skills',
    experienceTitle: isEs ? 'Experiencia' : 'Experience',
    workTitle: isEs ? 'Proyectos destacados' : 'Featured projects',
    technologies: isEs ? 'Tecnologías' : 'Technologies',
    contactTitle: isEs ? 'Contacto' : 'Contact',
    github: isEs ? 'Código en GitHub' : 'Source on GitHub',
    heroMainText:
      isEs
        ? 'Desarrollo experiencias web y mobile con enfoque en producto, performance y diseño. Trabajo de extremo a extremo: desde arquitectura frontend hasta entrega en producción.'
        : 'I build web and mobile experiences with a product, performance, and design mindset. I work end-to-end, from frontend architecture to production delivery.',
    heroHeading:
      isEs
        ? 'Construyo experiencias digitales con foco en claridad y ejecución'
        : 'I build digital experiences focused on clarity and execution',
    ctaWork: isEs ? 'View my work' : 'View my work',
    ctaContact: isEs ? 'Get in touch' : 'Get in touch',
    navHome: isEs ? 'Inicio' : 'Home',
    ctaExperience: isEs ? 'Experiencia' : 'Experience',
    ctaProjects: isEs ? 'Proyectos' : 'Projects',
    heroLocation: isEs ? 'Caracas, Venezuela' : 'Caracas, Venezuela',
    navAbout: isEs ? 'Acerca' : 'About',
    aboutCtaSkills: isEs ? 'Ver skills' : 'View skills',
    aboutCtaContact: isEs ? 'Contactar' : 'Contact',
  }

  function scrollToSection(id: string) {
    const node = document.getElementById(id)
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <ClassicHero
          logoText={ui.title}
          navLinks={[
            { label: ui.navHome, onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
            { label: ui.navAbout, onClick: () => scrollToSection('classic-about') },
            { label: ui.ctaExperience, onClick: () => scrollToSection('classic-experience') },
            { label: ui.ctaProjects, onClick: () => scrollToSection('classic-work') },
            { label: ui.skillsTitle, onClick: () => scrollToSection('classic-skills') },
            { label: ui.contactTitle, onClick: () => scrollToSection('classic-contact') },
          ]}
          heroHeading={ui.heroHeading}
          mainText={ui.heroMainText}
          ctaPrimary={{ label: ui.ctaWork, onClick: () => scrollToSection('classic-work') }}
          ctaSecondary={{ label: ui.ctaContact, onClick: () => scrollToSection('classic-contact') }}
          imageSrc="/assets/projects/johnny_hero.png"
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
        id="classic-about"
        title={ui.aboutTitle}
        paragraphs={[ui.about1, ui.about2, ui.about3]}
        highlights={ui.aboutHighlights}
        ctaPrimary={{ label: ui.aboutCtaSkills, onClick: () => scrollToSection('classic-skills') }}
        ctaSecondary={{ label: ui.aboutCtaContact, onClick: () => scrollToSection('classic-contact') }}
      />

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

      <section className={styles.section} id="classic-experience">
        <h2>{ui.experienceTitle}</h2>
        <ol className={styles.timeline}>
          {experienceV2.map((exp) => (
            <li key={exp.id} className={styles.timelineItem}>
              <div className={styles.timelinePeriod}>{exp.period}</div>
              <div>
                <h3>{exp.role}</h3>
                <p className={styles.muted}>{exp.company}</p>
                <p>{isEs ? (exp.descriptionEs ?? exp.description) : exp.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} id="classic-work">
        <h2>{ui.workTitle}</h2>
        <div className={styles.projects}>
          {featuredProjects.map((project) => {
            const description = isEs ? (project.descriptionEs ?? project.description) : project.description
            const highlights = isEs ? (project.highlightsEs ?? project.highlights ?? []) : (project.highlights ?? [])
            return (
              <article key={project.slug} className={styles.projectCard}>
                <img src={project.coverImage} alt={project.title} className={styles.cover} loading="lazy" />
                <div className={styles.projectBody}>
                  <p className={styles.year}>{project.year}</p>
                  <h3>{project.title}</h3>
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
          })}
        </div>
      </section>

      <section className={styles.section} id="classic-contact">
        <h2>{ui.contactTitle}</h2>
        <div className={styles.contactGrid}>
          <a href={`mailto:${contactV2.email}`} className={styles.link}>{contactV2.email}</a>
          <a href={contactV2.whatsapp} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {contactV2.whatsappDisplay}
          </a>
          <a href={contactV2.github} target="_blank" rel="noopener noreferrer" className={styles.link}>
            github.com/jcunto2010
          </a>
          <a href={contactV2.linkedin} target="_blank" rel="noopener noreferrer" className={styles.link}>
            jonathan-cuntodiaz
          </a>
        </div>
      </section>
    </div>
  )
}
