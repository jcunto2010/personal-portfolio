import type { V2Locale } from '../lib/localeContext'

export interface PlanetContent {
  body: string[]
}

const PLANET_CONTENT_EN: Record<string, PlanetContent> = {
  sun: {
    body: [
      "Hi, I'm Jonathan — an Industrial Engineer turned software developer. I worked in product, data, and automation before writing my first line of code.",
      'This solar system is my portfolio: each planet is a chapter — skills, how it\'s made, projects, experience, and contact. Navigate freely or follow the orbital path.',
    ],
  },
  mercury: {
    body: [
      'Skills: TypeScript, React, Next.js, Tailwind CSS, and Flutter for cross-platform mobile. I build with Firebase and PostgreSQL, and integrate AI services like Google Gemini.',
      'My background also covers Python (ETL pipelines, automation), Figma (UI design), and Agile/Scrum. I bring both engineering discipline and product thinking to every stack decision.',
      'How I think when I build: code the business can understand and evolve · product before technology — the stack serves the problem · data as evidence, not decoration.',
    ],
  },
  venus: {
    body: [
      "How it's made: the cosmic layer is built with React Three Fiber (Three.js in React), using lazy-loaded GLB models and progressive loading waves.",
      'UI text stays fully accessible: overlays are rendered via portals, focus is managed on open, and all motion respects prefers-reduced-motion. WebGL is progressive — the content always works without it.',
    ],
  },
  earth: {
    body: [
      'Projects hub: two case studies anchor this journey — one mobile, one web.',
      'Reservo.AI (Flutter + Gemini AI) and StartupConnect (React + Spring Boot) each have their own stop — the Moon and Mars — with role, stack, and key technical details.',
    ],
  },
  moon: {
    body: [
      'Reservo.AI — Flutter app for appointment booking, built from scratch while learning the framework. Every layer was my responsibility: auth, state, AI, backend.',
      'Auth layer uses Riverpod StateNotifier with robust offline-first storage: session restore from SecureStorage, biometric credential retrieval, and migration versioning — all before the user sees the home screen.',
    ],
  },
  mars: {
    body: [
      'StartupConnect — full-stack networking platform: React + TypeScript frontend, Spring Boot + PostgreSQL backend, WebSocket real-time chat, community rooms, and swipe-based discovery.',
      'Match lifecycle: new swipes land as LIKED. When the target swipes back, a reciprocal check auto-promotes both records to MATCHED — no polling, no webhooks needed for the state transition.',
    ],
  },
  neptune: {
    body: [
      'Experience: before writing code, I spent 3 years at Banesco (Venezuela\'s largest private bank) managing products and building ETL automation in Python — cutting operational load by 80%.',
      'Then Product Owner at Ridery (mobility startup), Co-founder at SCI developing Reservo.AI, and now Business Analysis Manager at DFW IT Partner, shipping Odoo ERP customizations in Python.',
    ],
  },
  uranus: {
    body: [
      'Open to frontend roles, mobile development, and product-engineering collaborations where both technical depth and business context matter.',
    ],
  },
  blackhole: {
    body: [
      "You've crossed the event horizon — there's no going back, only forward.",
      "If something you saw here sparked an idea, a question, or an opportunity: that's exactly the kind of gravity worth following. Reach out via Neptune, or find me on LinkedIn and GitHub.",
      "The journey resets from the Sun — but the conversation doesn't have to.",
    ],
  },
}

const PLANET_CONTENT_ES: Record<string, PlanetContent> = {
  sun: {
    body: [
      'Hola, soy Jonathan — Ingeniero Industrial reconvertido en desarrollador de software. Trabajé en producto, datos y automatización antes de escribir mi primera línea de código.',
      'Este sistema solar es mi portafolio: cada planeta es un capítulo — habilidades, cómo se hizo, proyectos, experiencia y contacto. Navega libremente o sigue el camino orbital.',
    ],
  },
  mercury: {
    body: [
      'Habilidades: TypeScript, React, Next.js, Tailwind CSS y Flutter para mobile multiplataforma. Construyo con Firebase y PostgreSQL, e integro servicios de IA como Google Gemini.',
      'Mi background también cubre Python (pipelines ETL, automatización), Figma (diseño UI) y Agile/Scrum. Llevo tanto disciplina de ingeniería como visión de producto a cada decisión de stack.',
      'Cómo pienso cuando construyo: código que el negocio pueda entender y evolucionar · producto antes que tecnología — el stack sirve al problema · datos como evidencia, no como decoración.',
    ],
  },
  venus: {
    body: [
      'Cómo se hizo: la capa cósmica está construida con React Three Fiber (Three.js en React), usando modelos GLB cargados bajo demanda y progressive loading waves.',
      'El texto de UI se mantiene accesible: overlays vía portals, el foco se gestiona al abrir y el movimiento respeta prefers-reduced-motion. WebGL es progresivo — el contenido siempre funciona sin él.',
    ],
  },
  earth: {
    body: [
      'Hub de proyectos: dos case studies anclan este viaje — uno mobile, uno web.',
      'Reservo.AI (Flutter + Gemini AI) y StartupConnect (React + Spring Boot) tienen cada uno su propia parada — la Luna y Marte — con rol, stack y detalles técnicos clave.',
    ],
  },
  moon: {
    body: [
      'Reservo.AI — app Flutter para reserva de citas, construida desde cero aprendiendo el framework. Cada capa fue responsabilidad mía: auth, estado, IA y backend.',
      'La capa de auth usa Riverpod StateNotifier con almacenamiento offline-first: restauración de sesión desde SecureStorage, recuperación biométrica de credenciales y migración por versiones — todo antes de que el usuario vea la pantalla de inicio.',
    ],
  },
  mars: {
    body: [
      'StartupConnect — plataforma de networking full-stack: frontend React + TypeScript, backend Spring Boot + PostgreSQL, chat en tiempo real con WebSocket, salas de comunidad y descubrimiento por swipe.',
      'Ciclo de vida del match: los swipes nuevos quedan como LIKED. Cuando el otro usuario hace swipe de vuelta, una verificación recíproca promueve automáticamente ambos registros a MATCHED — sin polling ni webhooks para la transición de estado.',
    ],
  },
  neptune: {
    body: [
      'Experiencia: antes de escribir código, pasé 3 años en Banesco (el banco privado más grande de Venezuela) gestionando productos y construyendo automatización ETL en Python — reduciendo la carga operativa un 80%.',
      'Luego Product Owner en Ridery (startup de movilidad), Co-fundador en SCI desarrollando Reservo.AI, y ahora Business Analysis Manager en DFW IT Partner, desarrollando personalizaciones de Odoo ERP en Python.',
    ],
  },
  uranus: {
    body: [
      'Abierto a roles frontend, desarrollo mobile y colaboraciones de producto-ingeniería donde tanto la profundidad técnica como el contexto de negocio importan.',
    ],
  },
  blackhole: {
    body: [
      'Cruzaste el horizonte de eventos — ya no hay vuelta atrás, solo hacia adelante.',
      'Si algo de lo que viste aquí generó una idea, una pregunta o una oportunidad: esa es exactamente la clase de gravedad que vale la pena seguir. Escríbeme desde Neptuno, o encuéntrame en LinkedIn y GitHub.',
      'El viaje reinicia desde el Sol — pero la conversación no tiene por qué hacerlo.',
    ],
  },
}

export function getPlanetContent(id: string, locale: V2Locale): PlanetContent | undefined {
  const byLocale = locale === 'es' ? PLANET_CONTENT_ES : PLANET_CONTENT_EN
  return byLocale[id]
}

