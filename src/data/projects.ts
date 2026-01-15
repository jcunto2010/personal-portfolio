export interface Project {
  id: string
  title: string
  description: string
  image: string
  technologies: string[]
  demoUrl?: string
  githubUrl?: string
  featured: boolean
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'Reservo.AI',
    description: 'A multiplatform Flutter application for booking appointments with businesses across various industries. Features an AI assistant powered by Google Gemini for conversational booking, intelligent suggestions, and personalized reminders. Includes real-time chat, biometric authentication, push notifications, and a modern, responsive UI.',
    image: '/assets/projects/reservo-ai.jpg',
    technologies: ['Flutter', 'Dart', 'Firebase', 'Firestore', 'Cloud Functions', 'Gemini AI', 'Riverpod', 'Rive Animations'],
    demoUrl: '#',
    githubUrl: '#',
    featured: true
  },
  {
    id: '2',
    title: 'EmprendIA - Startup Registration Platform',
    description: 'A comprehensive multi-actor platform for startup registration and management. Features a progressive 10-tab registration form, React web app with shadcn/ui components, Flutter mobile app, and PostgreSQL database integration. Designed to connect startups with investors, incubators, and mentors in the entrepreneurial ecosystem.',
    image: '/assets/projects/emprendia.jpg',
    technologies: ['React', 'TypeScript', 'Flutter', 'Dart', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'shadcn/ui', 'TanStack Query'],
    demoUrl: '#',
    githubUrl: '#',
    featured: true
  },
  {
    id: '3',
    title: 'Animated Flutter App with Rive',
    description: 'A beautiful Flutter application showcasing advanced animations using Rive. Features animated backgrounds with shapes and blur effects, animated buttons with loading states, success animations with confetti, and animated bottom navigation icons. Demonstrates expertise in Flutter animations and Rive integration.',
    image: '/assets/projects/rive-animation.jpg',
    technologies: ['Flutter', 'Dart', 'Rive', 'Flutter SVG', 'Custom Fonts'],
    demoUrl: '#',
    githubUrl: '#',
    featured: false
  },
  {
    id: '4',
    title: 'E-Commerce Platform',
    description: 'A modern e-commerce platform built with React and TypeScript, featuring product catalog, shopping cart, and checkout functionality with responsive design.',
    image: '/assets/projects/ecommerce.jpg',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Context API'],
    demoUrl: '#',
    githubUrl: '#',
    featured: false
  },
  {
    id: '3',
    title: 'Task Management App',
    description: 'A collaborative task management application with drag-and-drop functionality, real-time updates, and team collaboration features.',
    image: '/assets/projects/taskmanager.jpg',
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    demoUrl: '#',
    githubUrl: '#',
    featured: false
  },
  {
    id: '4',
    title: 'Weather Dashboard',
    description: 'Interactive weather dashboard that displays current weather conditions and forecasts using external APIs with beautiful data visualizations.',
    image: '/assets/projects/weather.jpg',
    technologies: ['React', 'JavaScript', 'CSS', 'REST API'],
    demoUrl: '#',
    githubUrl: '#',
    featured: false
  }
]
