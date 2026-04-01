import type { PlanetId } from './planetRegistry'
import type { V2Locale } from '../lib/localeContext'

export function getPlanetPhaseInfo(planetId: PlanetId, locale: V2Locale): string {
  // Keep keys stable: SolarScene calls this with the correct planetId.
  if (locale === 'es') {
    switch (planetId) {
      case 'sun':
        return "Bienvenido. Soy Jonathan - full-stack developer que disfruta construir productos con una UX cuidada. Este portafolio se narra por capítulos: habilidades, cómo se hizo, proyectos y contacto; optimizado para accesibilidad y mejora progresiva (WebGL es opcional)."
      case 'mercury':
        return "Habilidades y stack: TypeScript + React, Next.js y Tailwind CSS para una UI rápida y consistente. Construyo con Node.js y PostgreSQL, integro servicios como Firebase/Supabase y shippeo con Git/GitHub; boundaries tipados y arquitectura por componentes lo hacen mantenible."
      case 'venus':
        return "Cómo se hizo: la capa cósmica usa React Three Fiber (Three.js dentro de React) con modelos GLB cargados bajo demanda y 'progressive loading waves'. El contenido que lees vive en el DOM: overlays vía portals, foco gestionado al abrir, y motion respetando prefers-reduced-motion."
      case 'earth':
        return 'Hub de proyectos: el viaje se centra en dos case studies MVP. Explora para ver el rol, stack tecnológico y detalles del producto publicado detrás de Reservo.AI y StartupConnect.'
      case 'moon':
        return 'Reservo.AI: scheduling con IA e integración con Google Calendar. Conversaciones con Gemini, Flutter UI responsive y autenticación biométrica con Rive.'
      case 'mars':
        return 'StartupConnect: networking con swipe y matching inteligente. Frontend React + TypeScript + Tailwind y backend con PostgreSQL/Spring Boot; feed, rooms, chat y onboarding.'
      case 'neptune':
        return 'Experiencia: fundé y lideré el desarrollo mobile para una app de reservas de citas con IA en Reservo.AI. Integré Google Gemini para la interfaz conversacional y añadí autenticación biométrica con animaciones de Rive; UX a extremo a extremo.'
      case 'uranus':
        return 'Capítulo de contacto: abierto a roles full-time, contratos y proyectos secundarios con propósito. Email cnto.jnthn.97@gmail.com, WhatsApp +58 424 257 2739, basado en Caracas, Venezuela. O escríbeme en GitHub y LinkedIn.'
      case 'blackhole':
        return 'Has llegado al horizonte de eventos. El viaje se repite: cada final es un nuevo comienzo. Pulsa `Escape` o cierra este panel para volver al Sol.'
    }
  }

  // Default EN
  switch (planetId) {
    case 'sun':
      return "Welcome. I'm Jonathan - full-stack developer who enjoys building products with thoughtful UX. This portfolio is told by chapters: skills, how it's made, projects, and contact - tuned for accessibility and progressive enhancement (WebGL is optional)."
    case 'mercury':
      return "Skills and core stack: TypeScript + React, Next.js, and Tailwind CSS for fast, consistent UI. I build with Node.js and PostgreSQL, integrate services like Firebase/Supabase, and ship with Git/GitHub - typed boundaries and component-driven architecture keep everything maintainable."
    case 'venus':
      return "How it's made: the cosmic layer uses React Three Fiber (Three.js in React) with lazy-loaded GLB models and progressive loading waves. The content you read stays in the DOM - overlays are rendered via portals, focus is managed on open, and motion respects prefers-reduced-motion."
    case 'earth':
      return 'Projects hub: this journey focuses on two MVP case studies. Click through to see the role, tech stack, and the shipped product details behind Reservo.AI and StartupConnect.'
    case 'moon':
      return "Reservo.AI is my AI scheduling companion: it integrates with Google Calendar and uses Gemini-powered conversational booking. Built with Flutter, real-time AI chat, biometric authentication (Rive animations), responsive UI, and push notifications - so scheduling feels fast and personal."
    case 'mars':
      return 'StartupConnect is a matchmaking platform for early-stage founders and co-founders. The experience combines a React + TypeScript frontend with Tailwind CSS, a PostgreSQL-backed platform, and smart swipe-based matching plus social feed, community rooms, real-time chat, and onboarding.'
    case 'neptune':
      return 'Experience: I founded and led mobile development for an AI-powered appointment booking app at Reservo.AI. I integrated Google Gemini for the conversational interface and implemented biometric authentication using Rive animations - UX to delivery, end-to-end.'
    case 'uranus':
      return 'Contact chapter: open to full-time roles, contracts, and meaningful side projects. Email cnto.jnthn.97@gmail.com, WhatsApp +58 424 257 2739, based in Caracas, Venezuela - or reach me on GitHub and LinkedIn.'
    case 'blackhole':
      return "You've reached the event horizon. The journey loops - press Escape or close this panel to reset back to the Sun."
  }
}

