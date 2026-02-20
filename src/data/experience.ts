export interface Experience {
  id: string
  role: string
  company: string
  period: string
  description: string
  project?: string
  technologies: string[]
}

export const experiences: Experience[] = [
  {
    id: '1',
    role: 'Mobile Development Manager & Founder',
    company: 'Reservo.AI',
    period: 'Mar 2024 - Present',
    description: 'Founded and lead mobile development for AI-powered appointment booking app. Integrated Google Gemini for conversational interface and implemented biometric authentication with Rive animations.',
    project: 'reservo',
    technologies: ['Flutter', 'Firebase', 'Gemini AI', 'Riverpod', 'Rive']
  }
]
