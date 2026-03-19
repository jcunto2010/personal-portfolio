import { Link, useParams } from 'react-router-dom'
import { getProjectBySlug } from '../../data/projects.v2'
import { useLocale } from '../../lib/localeContext'
import styles from './ProjectDetailV2.module.css'

/**
 * /projects/:slug — V2 project case-study page.
 *
 * Content migrated from V1 sources:
 *   - Reservo.AI:     src/components/project-sections/ProjectReservo.tsx
 *   - StartupConnect: src/components/project-sections/ProjectStartupFlow.tsx
 *
 * Case-study narrative content per project is defined inline below as
 * a clean data structure, keeping the presentation layer separate.
 *
 * Note: cover images reference existing V1 assets already in /public.
 * [NV] = asset exists in V1 public folder but not yet confirmed in V2 public.
 */

interface CaseStudySection {
  id: string
  heading: string
  body: string[]
}

interface KeyCapability {
  label: string
}

interface ProjectCaseStudy {
  category: string
  overview: string
  challenge: string
  solution: string
  role: string
  capabilities: KeyCapability[]
  userFlowSteps: { label: string; description: string }[]
  screens: { name: string; image: string }[]
  additionalSections?: CaseStudySection[]
}

const caseStudiesEn: Record<string, ProjectCaseStudy> = {
  'reservo-ai': {
    category: 'Mobile Application',
    overview:
      'Reservo.AI is a multiplatform Flutter application designed to revolutionise appointment booking. Powered by Google Gemini, it enables conversational booking, intelligent suggestions, and personalised reminders.',
    challenge:
      'Booking appointments across industries is often a fragmented, manual process. Users struggle with finding availability, communicating with businesses, and keeping track of upcoming bookings across multiple apps.',
    solution:
      'Built a cross-platform Flutter app (iOS & Android) with an integrated AI assistant powered by Google Gemini. The AI handles natural-language booking conversations, suggests relevant businesses, and sends personalised reminders. Biometric authentication (Face ID / Fingerprint) and Rive-animated onboarding create a polished, premium feel from the first launch.',
    role: 'Mobile Development Manager & Founder',
    capabilities: [
      { label: 'Real-time AI chat (Google Gemini)' },
      { label: 'Biometric authentication' },
      { label: 'Smart push notifications' },
      { label: 'Cross-platform (iOS & Android)' },
      { label: 'Rive animations' },
      { label: 'Lottie animated onboarding' },
    ],
    userFlowSteps: [
      { label: 'Launch & Auth', description: 'User starts with a splash screen and authenticates via SignUp or Login.' },
      { label: 'Main Dashboard', description: 'Central navigation hub for accessing all core application features.' },
      { label: 'Core Navigation', description: 'Access Home, Settings, and Profile management.' },
      { label: 'AI Assistant', description: 'Engage with Google Gemini for conversational appointment booking.' },
      { label: 'Booking Flow', description: 'Search shops, select services, and pick an available time slot.' },
      { label: 'Confirmation', description: 'Review details and confirm booking with automated reminders.' },
    ],
    screens: [
      { name: 'Home', image: '/assets/projects/reservo/home.png' },
      { name: 'Shop Selection', image: '/assets/projects/reservo/shop.png' },
      { name: 'Calendar', image: '/assets/projects/reservo/calendar.png' },
      { name: 'Booking Summary', image: '/assets/projects/reservo/book summary.png' },
    ],
  },
  'startupconnect': {
    category: 'Professional Networking Platform',
    overview:
      'StartupConnect combines LinkedIn-style professional networking with Tinder-inspired swipe mechanics to create meaningful connections between entrepreneurs, investors, and mentors.',
    challenge:
      'The startup ecosystem lacks an efficient way for founders, investors, and mentors to discover each other. Existing platforms are either too formal (LinkedIn) or lack the discovery layer needed for early-stage connections.',
    solution:
      'Built a mobile-first web app with React and TypeScript that introduces swipe-based matching for startup professionals. A smart algorithm considers user type, industry, location, investment range, expertise, and availability to surface relevant connections. Complemented by a social feed for community engagement and real-time chat for direct communication.',
    role: 'Founder & Front-End Developer',
    capabilities: [
      { label: 'Swipe-to-match (Tinder-style cards)' },
      { label: 'Social feed (LinkedIn-style)' },
      { label: 'Community rooms (public & private)' },
      { label: 'Real-time individual & group chat' },
      { label: 'Smart matching algorithm' },
      { label: 'Multi-step onboarding' },
    ],
    userFlowSteps: [
      { label: 'Onboarding', description: 'Launch the platform and complete a multi-step registration flow.' },
      { label: 'Discovery Hub', description: 'Access the main navigation to discover startups, mentors, or investors.' },
      { label: 'Swipe to Match', description: 'Interactive card-stack to find potential partners based on the matching algorithm.' },
      { label: 'Social Engagement', description: 'View the community feed, share updates, and celebrate milestones.' },
      { label: 'Real-time Chat', description: 'Connect instantly via private messages or group rooms.' },
      { label: 'Ecosystem Growth', description: 'Manage connections, update profiles, and grow your network.' },
    ],
    screens: [
      { name: 'Login', image: '/assets/projects/startupconnect/login.png' },
      { name: 'Feed', image: '/assets/projects/startupconnect/feed.png' },
      { name: 'Matching', image: '/assets/projects/startupconnect/matching.png' },
      { name: 'Community Rooms', image: '/assets/projects/startupconnect/community rooms.png' },
    ],
  },
}

const caseStudiesEs: Record<string, ProjectCaseStudy> = {
  'reservo-ai': {
    category: 'Aplicación móvil',
    overview:
      'Reservo.AI es una aplicación Flutter multiplataforma pensada para revolucionar la reserva de citas. Impulsada por Google Gemini, permite reservas conversacionales, sugerencias inteligentes y recordatorios personalizados.',
    challenge:
      'Reservar citas a través de distintas industrias suele ser un proceso fragmentado y manual. Los usuarios tienen dificultades para encontrar disponibilidad, comunicarse con los negocios y llevar el control de las reservas próximas entre varias apps.',
    solution:
      'Construimos una app Flutter multiplataforma (iOS y Android) con un asistente de IA integrado impulsado por Google Gemini. La IA gestiona conversaciones de reserva en lenguaje natural, sugiere negocios relevantes y envía recordatorios personalizados. La autenticación biométrica (Face ID / huella) y el onboarding animado con Rive crean una experiencia pulida y premium desde el primer lanzamiento.',
    role: 'Líder de Desarrollo Mobile & Fundador/a',
    capabilities: [
      { label: 'Chat de IA en tiempo real (Google Gemini)' },
      { label: 'Autenticación biométrica' },
      { label: 'Notificaciones push inteligentes' },
      { label: 'Multiplataforma (iOS y Android)' },
      { label: 'Animaciones con Rive' },
      { label: 'Onboarding animado con Lottie' },
    ],
    userFlowSteps: [
      { label: 'Inicio y acceso', description: 'El usuario comienza con una pantalla splash y se autentica con SignUp o Login.' },
      { label: 'Panel principal', description: 'Centro de navegación para acceder a todas las funciones principales de la app.' },
      { label: 'Navegación central', description: 'Acceso a Home, Settings y gestión de Profile.' },
      { label: 'Asistente de IA', description: 'Interactúa con Google Gemini para reservar citas de forma conversacional.' },
      { label: 'Flujo de reservas', description: 'Busca negocios, selecciona servicios y elige un horario disponible.' },
      { label: 'Confirmación', description: 'Revisa los detalles y confirma la reserva con recordatorios automatizados.' },
    ],
    screens: [
      { name: 'Home', image: '/assets/projects/reservo/home.png' },
      { name: 'Selección de tiendas', image: '/assets/projects/reservo/shop.png' },
      { name: 'Calendario', image: '/assets/projects/reservo/calendar.png' },
      { name: 'Resumen de reserva', image: '/assets/projects/reservo/book summary.png' },
    ],
  },
  'startupconnect': {
    category: 'Plataforma de networking profesional',
    overview:
      'StartupConnect combina networking profesional estilo LinkedIn con mecánicas de swipe inspiradas en Tinder para crear conexiones significativas entre emprendedores, inversores y mentores.',
    challenge:
      'El ecosistema startup carece de una forma eficiente para que founders, inversores y mentores se descubran entre sí. Las plataformas existentes son demasiado formales (LinkedIn) o no ofrecen la capa de descubrimiento necesaria para conexiones en etapas tempranas.',
    solution:
      'Creamos una web app mobile-first con React y TypeScript que introduce matching basado en swipe para profesionales del mundo startup. Un algoritmo inteligente considera tipo de usuario, industria, ubicación, rango de inversión, experiencia y disponibilidad para mostrar conexiones relevantes. Se complementa con un feed social para la interacción de la comunidad y un chat en tiempo real para comunicación directa.',
    role: 'Fundador y Desarrollador Front-End',
    capabilities: [
      { label: 'Swipe-to-match (tarjetas estilo Tinder)' },
      { label: 'Feed social (estilo LinkedIn)' },
      { label: 'Salas de la comunidad (públicas y privadas)' },
      { label: 'Chat individual y grupal en tiempo real' },
      { label: 'Algoritmo de matching inteligente' },
      { label: 'Onboarding multi-paso' },
    ],
    userFlowSteps: [
      { label: 'Onboarding', description: 'Lanza la plataforma y completa un flujo de registro de varios pasos.' },
      { label: 'Centro de descubrimiento', description: 'Accede a la navegación principal para descubrir startups, mentores o inversores.' },
      { label: 'Swipe to Match', description: 'Card-stack interactivo para encontrar potenciales partners según el algoritmo de matching.' },
      { label: 'Engagement social', description: 'Revisa el feed de la comunidad, comparte actualizaciones y celebra hitos.' },
      { label: 'Chat en tiempo real', description: 'Conecta al instante mediante mensajes privados o salas grupales.' },
      { label: 'Crecimiento del ecosistema', description: 'Gestiona conexiones, actualiza perfiles y haz crecer tu red.' },
    ],
    screens: [
      { name: 'Inicio de sesión', image: '/assets/projects/startupconnect/login.png' },
      { name: 'Feed', image: '/assets/projects/startupconnect/feed.png' },
      { name: 'Matching', image: '/assets/projects/startupconnect/matching.png' },
      { name: 'Salas de la comunidad', image: '/assets/projects/startupconnect/community rooms.png' },
    ],
  },
}

export default function ProjectDetailV2() {
  const { locale } = useLocale()
  const isEs = locale === 'es'
  const ui = locale === 'es'
    ? {
        notFoundHeading: 'Proyecto no encontrado',
        notFoundText: 'Ningún proyecto coincide con el slug ',
        backToProjects: 'Volver a proyectos',
        breadcrumbHome: 'Inicio',
        breadcrumbProjects: 'Proyectos',
        roleLabel: 'Rol',
        yearLabel: 'Año',
        techAria: 'Tecnologías',
        githubCta: 'Ver en GitHub ↗',
        overviewHeading: 'Resumen',
        challengeHeading: 'Desafío',
        solutionHeading: 'Solución',
        myRoleHeading: 'Mi rol',
        capabilitiesAria: 'Capacidades clave',
        userFlowHeading: 'Flujo de usuario',
        userJourneyAria: 'Pasos del recorrido del usuario',
        appScreensHeading: 'Pantallas de la app',
        appScreensSubtitle: 'Interfaces clave y flujos de usuario',
        applicationScreenshotsAria: 'Capturas de la aplicación',
        allProjects: 'Todos los proyectos',
        footerNavAria: 'Navegación del caso de estudio',
      }
    : {
        notFoundHeading: 'Project not found',
        notFoundText: 'No project matches the slug ',
        backToProjects: 'Back to projects',
        breadcrumbHome: 'Home',
        breadcrumbProjects: 'Projects',
        roleLabel: 'Role',
        yearLabel: 'Year',
        techAria: 'Technologies',
        githubCta: 'View on GitHub ↗',
        overviewHeading: 'Overview',
        challengeHeading: 'Challenge',
        solutionHeading: 'Solution',
        myRoleHeading: 'My Role',
        capabilitiesAria: 'Key capabilities',
        userFlowHeading: 'User Flow',
        userJourneyAria: 'User journey steps',
        appScreensHeading: 'App Screens',
        appScreensSubtitle: 'Key interfaces and user flows',
        applicationScreenshotsAria: 'Application screenshots',
        allProjects: 'All projects',
        footerNavAria: 'Case study navigation',
      }

  const { slug } = useParams<{ slug: string }>()
  const project = slug ? getProjectBySlug(slug) : undefined
  const caseStudies = locale === 'es' ? caseStudiesEs : caseStudiesEn
  const caseStudy = slug ? caseStudies[slug] : undefined

  if (!project) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1 className={styles.notFoundHeading}>{ui.notFoundHeading}</h1>
          <p className={styles.notFoundText}>
            {ui.notFoundText}
            <code>{slug}</code>.
          </p>
          <Link to="/projects" className={styles.backLink}>
            <span aria-hidden="true">←</span> {ui.backToProjects}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Navigation breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/" className={styles.breadcrumbLink}>{ui.breadcrumbHome}</Link>
        <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
        <Link to="/projects" className={styles.breadcrumbLink}>{ui.breadcrumbProjects}</Link>
        <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
        <span className={styles.breadcrumbCurrent} aria-current="page">
          {project.title}
        </span>
      </nav>

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          {caseStudy && (
            <p className={styles.projectCategory}>{caseStudy.category}</p>
          )}
          <p className={styles.projectYear}>{project.year}</p>
          <h1 className={styles.heading}>{project.title}</h1>
          <p className={styles.tagline}>{project.tagline}</p>

          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <p className={styles.metaLabel}>{ui.roleLabel}</p>
              <p className={styles.metaValue}>{project.role}</p>
            </div>
            <div className={styles.metaItem}>
              <p className={styles.metaLabel}>{ui.yearLabel}</p>
              <p className={styles.metaValue}>{project.year}</p>
            </div>
          </div>

          <ul className={styles.techList} aria-label={ui.techAria}>
            {project.technologies.map((t) => (
              <li key={t} className={styles.techPill}>{t}</li>
            ))}
          </ul>

          {project.githubUrl && (
            <div className={styles.ctaRow}>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaSecondary}
                aria-label={
                  isEs
                    ? `Ver el codigo fuente de ${project.title} en GitHub ↗`
                    : `View ${project.title} source code on GitHub`
                }
              >
                {ui.githubCta}
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Case study body */}
      <main className={styles.main} id="case-study-content">

        {caseStudy ? (
          <>
            {/* Overview */}
            <section className={styles.section} aria-labelledby="cs-overview-heading">
              <h2 id="cs-overview-heading" className={styles.sectionHeading}>{ui.overviewHeading}</h2>
              <p className={styles.sectionBody}>{caseStudy.overview}</p>
            </section>

            {/* Challenge */}
            <section className={styles.section} aria-labelledby="cs-challenge-heading">
              <h2 id="cs-challenge-heading" className={styles.sectionHeading}>{ui.challengeHeading}</h2>
              <p className={styles.sectionBody}>{caseStudy.challenge}</p>
            </section>

            {/* Solution */}
            <section className={styles.section} aria-labelledby="cs-solution-heading">
              <h2 id="cs-solution-heading" className={styles.sectionHeading}>{ui.solutionHeading}</h2>
              <p className={styles.sectionBody}>{caseStudy.solution}</p>
            </section>

            {/* Role & Capabilities */}
            <section className={styles.section} aria-labelledby="cs-role-heading">
              <h2 id="cs-role-heading" className={styles.sectionHeading}>{ui.myRoleHeading}</h2>
              <p className={`${styles.sectionBody} ${styles.roleTitle}`}>{caseStudy.role}</p>
              <ul className={styles.capabilitiesList} aria-label={ui.capabilitiesAria}>
                {caseStudy.capabilities.map((cap) => (
                  <li key={cap.label} className={styles.capabilityItem}>
                    <span className={styles.capabilityDot} aria-hidden="true" />
                    {cap.label}
                  </li>
                ))}
              </ul>
            </section>

            {/* User Flow */}
            <section className={styles.section} aria-labelledby="cs-userflow-heading">
              <h2 id="cs-userflow-heading" className={styles.sectionHeading}>{ui.userFlowHeading}</h2>
              <ol className={styles.flowStepper} aria-label={ui.userJourneyAria}>
                {caseStudy.userFlowSteps.map((step, i) => (
                  <li key={step.label} className={styles.flowStep}>
                    <span className={styles.flowStepNumber} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className={styles.flowStepBody}>
                      <p className={styles.flowStepLabel}>{step.label}</p>
                      <p className={styles.flowStepDesc}>{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* App Screens — images referenced from existing V1 public assets [NV: confirm paths] */}
            <section className={styles.section} aria-labelledby="cs-screens-heading">
              <h2 id="cs-screens-heading" className={styles.sectionHeading}>{ui.appScreensHeading}</h2>
              <p className={styles.sectionSubtitle}>{ui.appScreensSubtitle}</p>
              <ul className={styles.screensGrid} aria-label={ui.applicationScreenshotsAria}>
                {caseStudy.screens.map((screen) => (
                  <li key={screen.name} className={styles.screenItem}>
                    {/* [NV] Image asset — path from V1 public/assets; confirm copied to V2 public */}
                    <div className={styles.screenImageWrap} aria-hidden="true">
                      <div className={styles.screenImagePlaceholder}>
                        <span>{screen.name[0]}</span>
                      </div>
                    </div>
                    <p className={styles.screenLabel}>{screen.name}</p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          /* Fallback: render description from project data if no case study */
          <section className={styles.section} aria-labelledby="cs-overview-heading">
            <h2 id="cs-overview-heading" className={styles.sectionHeading}>{ui.overviewHeading}</h2>
            <p className={styles.sectionBody}>{project.description}</p>
          </section>
        )}
      </main>

      {/* Footer nav */}
      <nav className={styles.footerNav} aria-label={ui.footerNavAria}>
        <Link to="/projects" className={styles.footerNavLink}>
          <span aria-hidden="true">←</span> {ui.allProjects}
        </Link>
      </nav>
    </div>
  )
}
