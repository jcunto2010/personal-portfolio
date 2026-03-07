/**
 * V2 Experience — migrated from src/data/experience.ts.
 */

export interface ExperienceV2 {
  id: string
  role: string
  company: string
  period: string
  description: string
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
    technologies: ['Flutter', 'Firebase', 'Gemini AI', 'Riverpod', 'Rive'],
    projectSlug: 'reservo-ai',
  },
]
