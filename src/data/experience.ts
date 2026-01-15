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
    role: 'CTO',
    company: 'Xmotics',
    period: 'Jan 2025 - Present',
    description: 'Leading technical strategy and architecture for industrial automation platform. Currently developing roadmap for real-time monitoring dashboards and WebSocket-based live data visualization systems.',
    project: 'xmotics',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'WebSocket', 'Docker']
  },
  {
    id: '2',
    role: 'Director of Frontend Development & Co-Founder',
    company: 'EmprendIA',
    period: 'Aug 2024 - Present',
    description: 'Co-founded and lead frontend architecture for multi-platform ecosystem connecting startups with investors. Built web dashboard with React and cross-platform mobile app with Flutter, including 10-step progressive registration flow.',
    project: 'emprendia',
    technologies: ['React', 'TypeScript', 'Flutter', 'Supabase', 'PostgreSQL', 'Tailwind CSS']
  },
  {
    id: '3',
    role: 'Mobile Development Manager & Founder',
    company: 'Reservo.AI',
    period: 'Mar 2024 - Present',
    description: 'Founded and lead mobile development for AI-powered appointment booking app. Integrated Google Gemini for conversational interface and implemented biometric authentication with Rive animations.',
    project: 'reservo',
    technologies: ['Flutter', 'Firebase', 'Gemini AI', 'Riverpod', 'Rive']
  }
]
