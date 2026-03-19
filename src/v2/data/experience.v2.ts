/**
 * V2 Experience — migrated from src/data/experience.ts.
 */

export interface ExperienceV2 {
  id: string
  role: string
  company: string
  period: string
  description: string
  descriptionEs?: string
  technologies: string[]
  projectSlug?: string
}

export const experienceV2: ExperienceV2[] = [
  {
    id: '1',
    role: 'Mobile Development Manager & Founder',
    company: 'Reservo.AI',
    period: 'Mar 2024 – Present',
    description:
      'Founded and lead mobile development for an AI-powered appointment booking app. Integrated Google Gemini for conversational interface and implemented biometric authentication with Rive animations.',
    descriptionEs:
      'Fundé y lidero el desarrollo mobile de una app de reservas con IA. Integré Google Gemini para la interfaz conversacional e implementé autenticación biométrica con animaciones en Rive.',
    technologies: ['Flutter', 'Firebase', 'Gemini AI', 'Riverpod', 'Rive'],
    projectSlug: 'reservo-ai',
  },
  {
    id: '2',
    role: 'Frontend Engineer',
    company: 'Freelance / Product Collaborations',
    period: '2023 – Present',
    description:
      'Designed and implemented responsive interfaces for startups and digital products. Built reusable UI patterns, improved loading performance, and aligned implementation with product and design requirements.',
    descriptionEs:
      'Diseñé e implementé interfaces responsivas para startups y productos digitales. Construí patrones reutilizables de UI, mejoré tiempos de carga y alineé implementación con objetivos de producto y diseño.',
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    id: '3',
    role: 'Full Stack Product Builder',
    company: 'StartupConnect',
    period: '2025',
    description:
      'Built a networking platform for the startup ecosystem with swipe matching, social feed, and real-time chat features. Led frontend architecture and coordinated API integration with backend services.',
    descriptionEs:
      'Desarrollé una plataforma de networking para el ecosistema startup con matching por swipe, feed social y chat en tiempo real. Lideré la arquitectura frontend y la integración con servicios backend.',
    technologies: ['React', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'WebSocket'],
    projectSlug: 'startupconnect',
  },
]
