export interface PlanetContent {
  body: string[]
}

export const PLANET_CONTENT: Record<string, PlanetContent> = {
  sun: {
    body: [
      "Welcome. I'm Jonathan — a full-stack developer and builder who loves creating things that matter.",
      "This solar system is my portfolio. Each planet is a chapter of my story. Scroll forward to begin the journey.",
    ],
  },
  mercury: {
    body: [
      'Core stack: TypeScript, React, Node.js, Python, PostgreSQL, Redis, and Docker.',
      "I move fast and build lean. Mercury is small but it's always the first to orbit the sun — speed and precision are the idea.",
    ],
  },
  venus: {
    body: [
      'This portfolio is built with React + Three.js (React Three Fiber), lazy-loaded GLB models, and CSS Modules.',
      'The immersive mode loads only what you need, when you need it. Progressive loading groups keep the initial payload small.',
    ],
  },
  earth: {
    body: [
      "A hub of everything I've shipped. Projects range from AI-powered SaaS tools to developer infrastructure.",
      'Click through the planets orbiting Earth to explore individual projects in depth.',
    ],
  },
  moon: {
    body: [
      'Reservo.AI — an AI scheduling assistant that integrates with Google Calendar and learns your preferences over time.',
      'Built with Next.js, OpenAI function calling, and a PostgreSQL backend. Reduced scheduling overhead by ~40% in beta testing.',
    ],
  },
  mars: {
    body: [
      'StartupConnect — a matchmaking platform for early-stage founders and co-founders.',
      'Full-stack: React frontend, Express + TypeScript API, PostgreSQL with full-text search, deployed on Railway.',
    ],
  },
  neptune: {
    body: [
      '5+ years building production systems across fintech, health-tech, and developer tooling.',
      'Comfortable leading small teams, owning end-to-end delivery, and mentoring junior engineers.',
    ],
  },
  uranus: {
    body: [
      "Interested in working together? I'm open to full-time roles, contracts, and meaningful side projects.",
      'Reach me at: jonathan@example.com — or find me on GitHub and LinkedIn.',
    ],
  },
  blackhole: {
    body: [
      "You've reached the event horizon.",
      'Beyond this point, the journey loops — every ending is a new beginning. Press Escape or close this panel to reset.',
    ],
  },
}

