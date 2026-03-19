/**
 * V2 Projects — source of truth for Portfolio V2.
 *
 * Only MVP projects are listed here (Reservo.AI + StartupConnect).
 * This is intentionally separate from src/data/projects.ts (V1).
 * Additional projects will be added in T-004 after content review.
 */

export interface ProjectV2 {
  /** URL-safe slug used for /projects/:slug */
  slug: string
  title: string
  tagline: string
  description: string
  /** Relative path inside /public or full URL */
  coverImage: string
  technologies: string[]
  role: string
  year: string
  demoUrl?: string
  githubUrl?: string
  featured: boolean
  descriptionEs?: string
  highlights?: string[]
  highlightsEs?: string[]
  thumbnails?: { src: string; alt: string }[]
  codeSnippetEn?: string
  codeSnippetEs?: string
}

export const projectsV2: ProjectV2[] = [
  {
    slug: 'reservo-ai',
    title: 'Reservo.AI',
    tagline: 'AI-powered appointment booking platform with conversational interface.',
    description:
      'A multiplatform Flutter application designed to simplify appointment booking flows for service businesses. Powered by Google Gemini, it enables conversational scheduling, contextual suggestions, and personalized reminders. The product includes real-time AI chat, biometric authentication, push notifications, and a polished onboarding built with Rive and Lottie.',
    coverImage: '/assets/projects/reservo/main screen.png',
    technologies: [
      'Flutter',
      'Dart',
      'Firebase',
      'Gemini AI',
      'Riverpod',
      'Rive',
    ],
    role: 'Mobile Development Manager & Founder',
    year: '2024',
    githubUrl: 'https://github.com/jcunto2010/reservo_ai',
    featured: true,
    descriptionEs:
      'Reservo.AI es una aplicación Flutter multiplataforma creada para simplificar la reserva de citas en negocios de servicios. Impulsada por Google Gemini, permite reservar por conversación, ofrece sugerencias contextuales y envía recordatorios personalizados.',
    highlights: [
      'Real-time AI chat powered by Google Gemini',
      'Biometric authentication (Face ID / Fingerprint)',
      'Smart push notifications with personalized reminders',
      'Cross-platform experience (iOS & Android)',
      'Rive-powered onboarding animations',
      'Unified booking flow with business-hours validation',
    ],
    highlightsEs: [
      'Chat de IA en tiempo real con Google Gemini',
      'Autenticación biométrica (Face ID / huella)',
      'Notificaciones push inteligentes con recordatorios personalizados',
      'Experiencia multiplataforma (iOS y Android)',
      'Onboarding con animaciones Rive',
      'Flujo de reserva unificado con validación de horarios',
    ],
    thumbnails: [
      { src: '/assets/projects/reservo/home.png', alt: 'Reservo.AI — pantalla Home' },
      { src: '/assets/projects/reservo/calendar.png', alt: 'Reservo.AI — vista calendario' },
      { src: '/assets/projects/reservo/shop.png', alt: 'Reservo.AI — selección de tiendas' },
    ],
    codeSnippetEn:
      `const steps = [
  { id: '1', label: 'Launch & Auth' },
  { id: '2', label: 'Main Dashboard' },
  { id: '3', label: 'Core Navigation' },
  { id: '4', label: 'AI Assistant' },
  { id: '5', label: 'Booking Flow' },
  { id: '6', label: 'Confirmation' },
]

<FlowStepper accentColor="violet" steps={steps} />`,
    codeSnippetEs:
      `const steps = [
  { id: '1', label: 'Launch & Auth' },
  { id: '2', label: 'Main Dashboard' },
  { id: '3', label: 'Core Navigation' },
  { id: '4', label: 'AI Assistant' },
  { id: '5', label: 'Booking Flow' },
  { id: '6', label: 'Confirmation' },
]

<FlowStepper accentColor="violet" steps={steps} />`,
  },
  {
    slug: 'startupconnect',
    title: 'StartupConnect',
    tagline: 'LinkedIn meets Tinder — a social network for the startup ecosystem.',
    description:
      'A professional networking platform combining LinkedIn-style networking with swipe-based discovery to create relevant connections between founders, investors, and mentors. It includes a social feed, public/private communities, real-time messaging, and a guided onboarding that improves profile quality and matching accuracy.',
    coverImage: '/assets/projects/startupconnect/feed.png',
    technologies: [
      'React',
      'TypeScript',
      'Spring Boot',
      'PostgreSQL',
      'Tailwind CSS',
    ],
    role: 'Founder & Front-End Developer',
    year: '2025',
    githubUrl: 'https://github.com/jcunto2010/Entrepeneur_app',
    featured: true,
    descriptionEs:
      'StartupConnect es una plataforma de networking profesional mobile-first que mezcla estilo LinkedIn con descubrimiento por swipe para generar conexiones relevantes entre emprendedores, inversores y mentores.',
    highlights: [
      'Swipe-to-match (Tinder-style cards)',
      'LinkedIn-style social feed for community updates',
      'Public & private community rooms',
      'Real-time 1:1 and group chat',
      'Smart matching algorithm',
      'Progressive onboarding to increase profile quality',
    ],
    highlightsEs: [
      'Swipe-to-match (tarjetas estilo Tinder)',
      'Feed social estilo LinkedIn para actualizaciones de la comunidad',
      'Salas de la comunidad públicas y privadas',
      'Chat en tiempo real 1:1 y grupal',
      'Algoritmo de matching inteligente',
      'Onboarding progresivo para mejorar calidad de perfiles',
    ],
    thumbnails: [
      { src: '/assets/projects/startupconnect/login.png', alt: 'StartupConnect — inicio de sesión' },
      { src: '/assets/projects/startupconnect/feed.png', alt: 'StartupConnect — feed de la comunidad' },
      { src: '/assets/projects/startupconnect/matching.png', alt: 'StartupConnect — pantalla de matching' },
    ],
    codeSnippetEn:
      `const steps = [
  { id: '1', label: 'Onboarding' },
  { id: '2', label: 'Discovery Hub' },
  { id: '3', label: 'Swipe to Match' },
  { id: '4', label: 'Social Engagement' },
  { id: '5', label: 'Real-time Chat' },
  { id: '6', label: 'Ecosystem Growth' },
]

<FlowStepper accentColor="blue" steps={steps} />`,
    codeSnippetEs:
      `const steps = [
  { id: '1', label: 'Onboarding' },
  { id: '2', label: 'Discovery Hub' },
  { id: '3', label: 'Swipe to Match' },
  { id: '4', label: 'Social Engagement' },
  { id: '5', label: 'Real-time Chat' },
  { id: '6', label: 'Ecosystem Growth' },
]

<FlowStepper accentColor="blue" steps={steps} />`,
  },
]

/** Quick lookup by slug */
export function getProjectBySlug(slug: string): ProjectV2 | undefined {
  return projectsV2.find((p) => p.slug === slug)
}
