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
}

export const projectsV2: ProjectV2[] = [
  {
    slug: 'reservo-ai',
    title: 'Reservo.AI',
    tagline: 'AI-powered appointment booking platform with conversational interface.',
    description:
      'A multiplatform Flutter application designed to revolutionise appointment booking. Powered by Google Gemini, it enables conversational booking, intelligent suggestions, and personalised reminders. Features real-time AI chat, biometric authentication, push notifications, cross-platform support (iOS & Android), Rive animations, and Lottie-animated onboarding.',
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
  },
  {
    slug: 'startupconnect',
    title: 'StartupConnect',
    tagline: 'LinkedIn meets Tinder — a social network for the startup ecosystem.',
    description:
      'A professional networking platform combining LinkedIn-style networking with swipe-based matching to create meaningful connections between entrepreneurs, investors, and mentors. Features a social feed, community rooms, real-time chat, smart matching algorithm, and a multi-step onboarding flow.',
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
  },
]

/** Quick lookup by slug */
export function getProjectBySlug(slug: string): ProjectV2 | undefined {
  return projectsV2.find((p) => p.slug === slug)
}
