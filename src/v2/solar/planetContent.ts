import { contactV2 } from '../data/contact.v2'
import type { V2Locale } from '../lib/localeContext'

export interface PlanetContent {
  body: string[]
}

const PLANET_CONTENT_EN: Record<string, PlanetContent> = {
  sun: {
    body: [
      "Welcome. I'm Jonathan - full-stack developer who enjoys building products with thoughtful UX.",
      'This solar system is my portfolio: each planet is a chapter - skills, how it\'s made, projects, and contact. WebGL is progressive and optional; the readable content lives in the DOM.',
    ],
  },
  mercury: {
    body: [
      'Skills: TypeScript, React, Next.js, Tailwind CSS, and Vite for a clean frontend workflow.',
      'I build with Node.js and PostgreSQL, integrate services like Firebase/Supabase, and ship with Git/GitHub. Typed boundaries and component-driven architecture keep the experience maintainable.',
    ],
  },
  venus: {
    body: [
      "How it's made: the cosmic layer is built with React Three Fiber (Three.js in React), using lazy-loaded GLB models and progressive loading waves.",
      'The UI text stays fully accessible: overlays are rendered via portals, the close button is focused on open, and motion respects `prefers-reduced-motion`.',
    ],
  },
  earth: {
    body: [
      'Projects hub: two MVP case studies anchor this journey.',
      'Reservo.AI and StartupConnect each have a dedicated case-study route (`/projects/:slug`) with role, tech stack, and key product details.',
    ],
  },
  moon: {
    body: [
      'Reservo.AI - an AI scheduling assistant that integrates with Google Calendar.',
      'Built with Flutter, Gemini-powered conversational booking, real-time AI chat, biometric authentication (Rive animations), and push notifications for a responsive, personalized experience.',
    ],
  },
  mars: {
    body: [
      'StartupConnect - LinkedIn meets swipe matching for the startup ecosystem.',
      'Frontend: React + TypeScript + Tailwind CSS. Platform: PostgreSQL-backed backend with Spring Boot and real-time features like feed, community rooms, chat, smart matching, and multi-step onboarding.',
    ],
  },
  neptune: {
    body: [
      'Experience: I founded and led mobile development for an AI-powered appointment booking app at Reservo.AI.',
      'I integrated Google Gemini for the conversational interface and implemented biometric authentication with Rive animations - UX to delivery, end-to-end.',
    ],
  },
  uranus: {
    body: [
      'Contact chapter: open to full-time roles, contracts, and meaningful side projects.',
      `Email ${contactV2.email}, WhatsApp ${contactV2.whatsappDisplay}, based in ${contactV2.location}. Find me on GitHub and LinkedIn.`,
    ],
  },
  blackhole: {
    body: [
      "You've reached the event horizon.",
      'The journey loops - press `Escape` or close this panel to reset back to the Sun.',
    ],
  },
}

const PLANET_CONTENT_ES: Record<string, PlanetContent> = {
  sun: {
    body: [
      'Bienvenido. Soy Jonathan - full-stack developer que disfruta construir productos con una UX cuidada.',
      'Este sistema solar es mi portafolio: cada planeta es un capítulo - habilidades, cómo se hizo, proyectos y contacto. WebGL es progresivo y opcional; el contenido legible vive en el DOM.',
    ],
  },
  mercury: {
    body: [
      'Habilidades: TypeScript, React, Next.js, Tailwind CSS y Vite para un flujo frontend limpio.',
      'Construyo con Node.js y PostgreSQL, integro servicios como Firebase/Supabase y shippeo con Git/GitHub. Boundaries tipados y arquitectura por componentes mantienen la experiencia mantenible.',
    ],
  },
  venus: {
    body: [
      'Cómo se hizo: la capa cósmica está construida con React Three Fiber (Three.js en React), usando modelos GLB cargados bajo demanda y "progressive loading waves".',
      'El texto de UI se mantiene accesible: overlays vía portals, el botón de cerrar recibe foco al abrir y el motion respeta prefers-reduced-motion.',
    ],
  },
  earth: {
    body: [
      'Hub de proyectos: dos case studies MVP anclan este viaje.',
      'Reservo.AI y StartupConnect tienen una ruta dedicada de case study (`/projects/:slug`) con rol, stack tecnológico y detalles clave del producto.',
    ],
  },
  moon: {
    body: [
      'Reservo.AI - un asistente de scheduling con IA que integra con Google Calendar.',
      'Construido con Flutter, reservas conversacionales con Gemini, chat de IA en tiempo real, autenticación biométrica (animaciones de Rive) y notificaciones push para una experiencia responsiva y personalizada.',
    ],
  },
  mars: {
    body: [
      'StartupConnect - LinkedIn meets swipe matching para el ecosistema startup.',
      'Frontend: React + TypeScript + Tailwind CSS. Plataforma: backend con PostgreSQL y Spring Boot, con features en tiempo real como feed, community rooms, chat, matching inteligente y onboarding multi-paso.',
    ],
  },
  neptune: {
    body: [
      'Experiencia: fundé y lideré el desarrollo mobile para una app de reservas con IA en Reservo.AI.',
      'Integré Google Gemini para la interfaz conversacional y añadí autenticación biométrica con Rive - UX a entrega, de punta a punta.',
    ],
  },
  uranus: {
    body: [
      'Capítulo de contacto: abierto a roles full-time, contratos y proyectos secundarios con propósito.',
      `Email ${contactV2.email}, WhatsApp ${contactV2.whatsappDisplay}, basado en ${contactV2.location}. Encuéntrame en GitHub y LinkedIn.`,
    ],
  },
  blackhole: {
    body: [
      'Has llegado al horizonte de eventos.',
      'El viaje se repite: pulsa `Escape` o cierra este panel para reiniciar de vuelta al Sol.',
    ],
  },
}

export function getPlanetContent(id: string, locale: V2Locale): PlanetContent | undefined {
  const byLocale = locale === 'es' ? PLANET_CONTENT_ES : PLANET_CONTENT_EN
  return byLocale[id]
}

