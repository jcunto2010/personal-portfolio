import { Link, useParams } from 'react-router-dom'
import { getProjectBySlug } from '../../data/projects.v2'
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

const caseStudies: Record<string, ProjectCaseStudy> = {
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

export default function ProjectDetailV2() {
  const { slug } = useParams<{ slug: string }>()
  const project = slug ? getProjectBySlug(slug) : undefined
  const caseStudy = slug ? caseStudies[slug] : undefined

  if (!project) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1 className={styles.notFoundHeading}>Project not found</h1>
          <p className={styles.notFoundText}>
            No project matches the slug <code>{slug}</code>.
          </p>
          <Link to="/projects" className={styles.backLink}>
            <span aria-hidden="true">←</span> Back to projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Navigation breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/" className={styles.breadcrumbLink}>Home</Link>
        <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
        <Link to="/projects" className={styles.breadcrumbLink}>Projects</Link>
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
              <p className={styles.metaLabel}>Role</p>
              <p className={styles.metaValue}>{project.role}</p>
            </div>
            <div className={styles.metaItem}>
              <p className={styles.metaLabel}>Year</p>
              <p className={styles.metaValue}>{project.year}</p>
            </div>
          </div>

          <ul className={styles.techList} aria-label="Technologies">
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
                aria-label={`View ${project.title} source code on GitHub`}
              >
                View on GitHub ↗
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
              <h2 id="cs-overview-heading" className={styles.sectionHeading}>Overview</h2>
              <p className={styles.sectionBody}>{caseStudy.overview}</p>
            </section>

            {/* Challenge */}
            <section className={styles.section} aria-labelledby="cs-challenge-heading">
              <h2 id="cs-challenge-heading" className={styles.sectionHeading}>Challenge</h2>
              <p className={styles.sectionBody}>{caseStudy.challenge}</p>
            </section>

            {/* Solution */}
            <section className={styles.section} aria-labelledby="cs-solution-heading">
              <h2 id="cs-solution-heading" className={styles.sectionHeading}>Solution</h2>
              <p className={styles.sectionBody}>{caseStudy.solution}</p>
            </section>

            {/* Role & Capabilities */}
            <section className={styles.section} aria-labelledby="cs-role-heading">
              <h2 id="cs-role-heading" className={styles.sectionHeading}>My Role</h2>
              <p className={`${styles.sectionBody} ${styles.roleTitle}`}>{caseStudy.role}</p>
              <ul className={styles.capabilitiesList} aria-label="Key capabilities">
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
              <h2 id="cs-userflow-heading" className={styles.sectionHeading}>User Flow</h2>
              <ol className={styles.flowStepper} aria-label="User journey steps">
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
              <h2 id="cs-screens-heading" className={styles.sectionHeading}>App Screens</h2>
              <p className={styles.sectionSubtitle}>Key interfaces and user flows</p>
              <ul className={styles.screensGrid} aria-label="Application screenshots">
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
            <h2 id="cs-overview-heading" className={styles.sectionHeading}>Overview</h2>
            <p className={styles.sectionBody}>{project.description}</p>
          </section>
        )}
      </main>

      {/* Footer nav */}
      <nav className={styles.footerNav} aria-label="Case study navigation">
        <Link to="/projects" className={styles.footerNavLink}>
          <span aria-hidden="true">←</span> All projects
        </Link>
      </nav>
    </div>
  )
}
