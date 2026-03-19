import { useMemo } from 'react'
import { Github, Instagram, Linkedin, Twitter } from 'lucide-react'
import { ClassicHero } from '../ClassicHero/ClassicHero'
import { contactV2 } from '../../data/contact.v2'
import { experienceV2 } from '../../data/experience.v2'
import { projectsV2 } from '../../data/projects.v2'
import { skillsV2 } from '../../data/skills.v2'
import { useLocale } from '../../lib/localeContext'
import styles from './ClassicRebuildPage.module.css'

export function ClassicRebuildPage() {
  const { locale } = useLocale()
  const isEs = locale === 'es'
  const featuredProjects = useMemo(() => projectsV2.filter((p) => p.featured), [])

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
            { label: ui.navHome.toUpperCase(), onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
            { label: ui.ctaExperience.toUpperCase(), onClick: () => scrollToSection('classic-experience') },
            { label: ui.ctaProjects.toUpperCase(), onClick: () => scrollToSection('classic-work') },
            { label: ui.skillsTitle.toUpperCase(), onClick: () => scrollToSection('classic-skills') },
            { label: ui.contactTitle.toUpperCase(), onClick: () => scrollToSection('classic-contact') },
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

      <section className={styles.section} id="classic-about">
        <h2>{ui.aboutTitle}</h2>
        <p>{ui.about1}</p>
        <p>{ui.about2}</p>
      </section>

      <section className={styles.section} id="classic-skills">
        <h2>{ui.skillsTitle}</h2>
        <ul className={styles.chips}>
          {skillsV2.map((skill) => (
            <li key={`${skill.category}-${skill.name}`} className={styles.chip}>
              {skill.name}
            </li>
          ))}
        </ul>
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
