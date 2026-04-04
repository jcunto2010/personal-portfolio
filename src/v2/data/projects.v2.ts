/**
 * Projects — source of truth for the portfolio app.
 *
 * Only MVP projects are listed here (Reservo.AI + StartupConnect).
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
  descriptionEs?: string
  highlights?: string[]
  highlightsEs?: string[]
  thumbnails?: { src: string; alt: string }[]
  codeSnippetEn?: string
  codeSnippetEs?: string
}

export const projectsV2: ProjectV2[] = [
  {
    slug: 'reservo-ai',
    title: 'Reservo.AI',
    tagline: 'From zero Flutter knowledge to a full AI-powered booking app.',
    description:
      'A multiplatform Flutter app built to simplify appointment booking for service businesses. Powered by Google Gemini, it enables conversational scheduling and contextual reminders. Built entirely from scratch — including learning Flutter along the way — tackling every layer: biometric authentication (Face ID / fingerprint), Firebase backend integration, state management with Riverpod, and a polished onboarding experience animated with Rive and Lottie. Currently an MVP in active development.',
    coverImage: '/assets/projects/reservo/main screen.webp',
    technologies: ['Flutter', 'Dart', 'Firebase', 'Gemini AI', 'Riverpod', 'Rive', 'Lottie', 'Biometrics'],
    role: 'Sole Developer & Co-Founder',
    year: '2024',
    githubUrl: 'https://github.com/jcunto2010/reservo_ai',
    featured: true,
    descriptionEs:
      'Una app Flutter multiplataforma para simplificar la reserva de citas en negocios de servicios. Potenciada por Google Gemini para reservas conversacionales y recordatorios contextuales. Construida completamente desde cero — incluyendo aprender Flutter en el proceso — resolviendo cada capa: autenticación biométrica (Face ID / huella), integración con Firebase, gestión de estado con Riverpod y un onboarding animado con Rive y Lottie. Actualmente es un MVP en desarrollo activo.',
    highlights: [
      'Built entirely solo — from learning Flutter to full-stack integration',
      'Conversational AI booking powered by Google Gemini',
      'Biometric authentication: Face ID & fingerprint',
      'State management architecture with Riverpod',
      'Firebase backend: auth, Firestore, and push notifications',
      'Custom onboarding flows animated with Rive',
    ],
    highlightsEs: [
      'Construida completamente en solitario — desde aprender Flutter hasta integración full-stack',
      'Reservas conversacionales con IA mediante Google Gemini',
      'Autenticación biométrica: Face ID y huella dactilar',
      'Arquitectura de gestión de estado con Riverpod',
      'Backend Firebase: auth, Firestore y notificaciones push',
      'Flujos de onboarding personalizados animados con Rive',
    ],
    thumbnails: [
      { src: '/assets/projects/reservo/home.webp', alt: 'Reservo.AI — Home screen' },
      { src: '/assets/projects/reservo/calendar.webp', alt: 'Reservo.AI — Calendar view' },
      { src: '/assets/projects/reservo/shop.webp', alt: 'Reservo.AI — Business selection' },
    ],
    codeSnippetEn:
      `// gemini_service.dart — natural language → structured booking
// The user types "haircut Friday 5pm" — Gemini parses it to JSON

Future<Map<String, dynamic>?> extractReservationInfo(
  String userMessage,
) async {
  final prompt = """
Extract booking info as JSON. Reply ONLY with valid JSON or "null".

Format: {
  "servicio": "service name",
  "fecha":    "YYYY-MM-DD",
  "hora":     "HH:MM",
  "notas":    "optional notes"
}

Message: "$userMessage"
""";

  final raw = await sendMessage(prompt);   // → Cloud Function → Gemini
  try {
    return jsonDecode(raw) as Map<String, dynamic>?;
  } catch (_) {
    return null;   // graceful fallback if Gemini returns prose
  }
}`,
    codeSnippetEs:
      `// gemini_service.dart — lenguaje natural → reserva estructurada
// El usuario escribe "corte el viernes a las 5pm" — Gemini lo parsea a JSON

Future<Map<String, dynamic>?> extractReservationInfo(
  String userMessage,
) async {
  final prompt = """
Extrae la info de reserva como JSON. Responde SOLO JSON o "null".

Formato: {
  "servicio": "nombre del servicio",
  "fecha":    "YYYY-MM-DD",
  "hora":     "HH:MM",
  "notas":    "notas opcionales"
}

Mensaje: "$userMessage"
""";

  final raw = await sendMessage(prompt);   // → Cloud Function → Gemini
  try {
    return jsonDecode(raw) as Map<String, dynamic>?;
  } catch (_) {
    return null;   // fallback si Gemini responde en prosa
  }
}`,
  },
  {
    slug: 'startupconnect',
    title: 'StartupConnect',
    tagline: 'A full-stack networking platform for founders, investors, and mentors.',
    description:
      'A professional networking platform combining LinkedIn-style feeds with swipe-based discovery to connect founders, investors, and mentors. Built as a formative project to push my skills into real product territory: React + TypeScript frontend, Spring Boot + PostgreSQL backend, real-time messaging via WebSocket, community rooms, a compatibility-based matching algorithm, and a progressive onboarding flow. Never publicly launched, but fully functional as an MVP demo — and it validated my ability to architect and ship a complex multi-feature product end to end.',
    coverImage: '/assets/projects/startupconnect/feed.webp',
    technologies: ['React', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Tailwind CSS', 'WebSocket', 'TanStack Query'],
    role: 'Founder & Frontend Developer',
    year: '2025',
    githubUrl: 'https://github.com/jcunto2010/Entrepeneur_app',
    featured: true,
    descriptionEs:
      'Una plataforma de networking profesional que combina feeds estilo LinkedIn con descubrimiento por swipe para conectar emprendedores, inversores y mentores. Construida como proyecto formativo: frontend en React + TypeScript, backend en Spring Boot + PostgreSQL, mensajería en tiempo real con WebSocket, salas de comunidad, algoritmo de matching por compatibilidad y onboarding progresivo. Nunca se lanzó públicamente, pero funciona como MVP demo completo — y validó mi capacidad de arquitectar y entregar un producto complejo de extremo a extremo.',
    highlights: [
      'Full-stack project built solo: React + TypeScript + Spring Boot + PostgreSQL',
      'Swipe-to-match with compatibility scoring algorithm',
      'Real-time 1:1 and group chat via WebSocket',
      'LinkedIn-style social feed with likes, shares, and filters',
      'Public & private community rooms with member management',
      'Progressive multi-step onboarding to improve match accuracy',
    ],
    highlightsEs: [
      'Proyecto full-stack construido en solitario: React + TypeScript + Spring Boot + PostgreSQL',
      'Swipe-to-match con algoritmo de puntuación de compatibilidad',
      'Chat en tiempo real 1:1 y grupal con WebSocket',
      'Feed social estilo LinkedIn con likes, compartidos y filtros',
      'Salas de comunidad públicas y privadas con gestión de miembros',
      'Onboarding progresivo multi-paso para mejorar precisión del matching',
    ],
    thumbnails: [
      { src: '/assets/projects/startupconnect/login.webp', alt: 'StartupConnect — Login' },
      { src: '/assets/projects/startupconnect/feed.webp', alt: 'StartupConnect — Community feed' },
      { src: '/assets/projects/startupconnect/matching.webp', alt: 'StartupConnect — Matching screen' },
    ],
    codeSnippetEn:
      `// MatchService.java — compatibility scoring algorithm
// Complementary pairs score higher; preferences & industry stack on top

private double calculateMatchScore(
    User current, User target, UserPreferences prefs) {

  double score = 0;

  // Complementary role pairs score higher than same-type
  var complementary = Set.of(
    Set.of(ENTREPRENEUR, INVESTOR),
    Set.of(ENTREPRENEUR, MENTOR),
    Set.of(INVESTOR,     MENTOR)
  );
  if (complementary.contains(Set.of(current.type, target.type)))
    score += 20;
  else
    score += 10; // same type still gets base points

  if (prefs == null) return score;

  // Explicit seeking preference match
  if (prefs.seekingTypes.contains(target.type))  score += 15;

  // Shared industry via startup profiles
  if (industryOverlap(prefs, target))             score += 10;

  // Mentor availability bonus
  if (current.type == ENTREPRENEUR
      && target.type == MENTOR
      && prefs.availableForMentoring)             score += 8;

  return score;
}

// Reciprocal swipe → auto-promote both records to MATCHED
if (reciprocalMatch.isPresent()) {
  reciprocal.setStatus(MATCHED);
  match.setStatus(MATCHED);
  matchRepository.save(reciprocal);
}`,
    codeSnippetEs:
      `// MatchService.java — algoritmo de puntuación de compatibilidad
// Los pares complementarios puntúan más; preferencias e industria se suman

private double calculateMatchScore(
    User current, User target, UserPreferences prefs) {

  double score = 0;

  // Pares de roles complementarios puntúan más que el mismo tipo
  var complementarios = Set.of(
    Set.of(ENTREPRENEUR, INVESTOR),
    Set.of(ENTREPRENEUR, MENTOR),
    Set.of(INVESTOR,     MENTOR)
  );
  if (complementarios.contains(Set.of(current.type, target.type)))
    score += 20;
  else
    score += 10; // mismo tipo igual recibe puntos base

  if (prefs == null) return score;

  // Coincidencia con preferencia de búsqueda explícita
  if (prefs.seekingTypes.contains(target.type))  score += 15;

  // Industria compartida a través de perfiles de startup
  if (industryOverlap(prefs, target))             score += 10;

  // Bonus de disponibilidad para mentoría
  if (current.type == ENTREPRENEUR
      && target.type == MENTOR
      && prefs.availableForMentoring)             score += 8;

  return score;
}

// Swipe recíproco → ambos registros se promueven automáticamente a MATCHED
if (reciprocalMatch.isPresent()) {
  reciprocal.setStatus(MATCHED);
  match.setStatus(MATCHED);
  matchRepository.save(reciprocal);
}`,
  },
]

/** Quick lookup by slug */
export function getProjectBySlug(slug: string): ProjectV2 | undefined {
  return projectsV2.find((p) => p.slug === slug)
}
