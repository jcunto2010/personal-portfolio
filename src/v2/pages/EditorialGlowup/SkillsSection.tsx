import { useCallback, useMemo } from 'react'
import { useLocale } from '../../lib/localeContext'
import {
  FloatingIconsHero,
  type FloatingIconsHeroProps,
} from '../../../components/ui/floating-icons-hero-section'
import {
  SiCss,
  SiCloudflare,
  SiDart,
  SiFirebase,
  SiFigma,
  SiFlutter,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiPostgresql,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from 'react-icons/si'
import type { SVGProps } from 'react'

const IconGA4 = ({ className }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="10" width="4.5" height="11" rx="2.2" fill="#F9AB00" />
    <rect x="9.75" y="6.5" width="4.5" height="14.5" rx="2.2" fill="#E8710A" />
    <rect x="16.5" y="3" width="4.5" height="18" rx="2.2" fill="#D93025" />
  </svg>
)

export function SkillsSection() {
  const { locale } = useLocale()
  const isEs = locale === 'es'
  const t = useCallback((es: string, en: string) => (isEs ? es : en), [isEs])

  const icons: FloatingIconsHeroProps['icons'] = useMemo(
    () => [
      {
        id: 1,
        name: 'Flutter',
        level: t('Medio', 'Intermediate'),
        usedIn: 'Reservo.ai',
        details: [
          t('Arquitectura principal de la app móvil.', 'Main architecture of the mobile app.'),
          t(
            'Integración de UI compleja con estado y navegación.',
            'Complex UI integration with state and navigation.',
          ),
          t(
            'Consumo de servicios externos y flujos productivos.',
            'External service consumption and production flows.',
          ),
        ],
        icon: SiFlutter,
        className: 'top-[18%] left-[22%]',
        iconClassName: 'text-[#02569B]',
      },
      {
        id: 2,
        name: 'React',
        level: t('Medio', 'Intermediate'),
        usedIn: t('Portafolio y StartupConnect', 'Portfolio and StartupConnect'),
        details: [
          t('Desarrollo de interfaces modulares y reusables.', 'Development of modular, reusable interfaces.'),
          t(
            'Animaciones e interacciones avanzadas con Framer Motion/GSAP.',
            'Advanced animations and interactions with Framer Motion/GSAP.',
          ),
          t('Componentización orientada a escalabilidad.', 'Component architecture designed for scale.'),
        ],
        icon: SiReact,
        className: 'top-[22%] right-[20%]',
        iconClassName: 'text-[#61DAFB]',
      },
      {
        id: 3,
        name: 'Tailwind CSS',
        level: t('Medio', 'Intermediate'),
        usedIn: t('Portafolio y StartupConnect', 'Portfolio and StartupConnect'),
        details: [
          t('Diseño responsive rápido con utilidades.', 'Fast responsive design with utilities.'),
          t('Sistemas visuales consistentes y mantenibles.', 'Consistent and maintainable visual systems.'),
        ],
        icon: SiTailwindcss,
        className: 'top-[72%] left-[22%]',
        iconClassName: 'text-[#06B6D4]',
      },
      {
        id: 4,
        name: 'TypeScript',
        level: t('Medio', 'Intermediate'),
        usedIn: t('Portafolio y StartupConnect', 'Portfolio and StartupConnect'),
        details: [
          t('Tipado estricto para reducir bugs en runtime.', 'Strict typing to reduce runtime bugs.'),
          t('Modelado de componentes y flujos de datos.', 'Modeling components and data flows.'),
        ],
        icon: SiTypescript,
        className: 'bottom-[16%] right-[20%]',
        iconClassName: 'text-[#3178C6]',
      },
      {
        id: 5,
        name: 'JavaScript',
        level: t('Medio-avanzado', 'Upper-intermediate'),
        usedIn: t('Scripts en Google Suite y frontend web', 'Google Suite scripts and web frontend'),
        details: [
          t('Automatización de tareas y lógica de negocio.', 'Task automation and business logic.'),
          t(
            'Base sólida para desarrollo UI y manipulación de estado.',
            'Solid foundation for UI development and state handling.',
          ),
        ],
        icon: SiJavascript,
        className: 'top-[12%] left-[36%]',
        iconClassName: 'text-[#F7DF1E]',
      },
      {
        id: 6,
        name: 'Dart',
        level: t('Medio', 'Intermediate'),
        usedIn: t('Reservo.ai (con Flutter)', 'Reservo.ai (with Flutter)'),
        details: [
          t('Lógica de aplicación, modelos y flujos de UI.', 'Application logic, models, and UI flows.'),
          t('Gestión de estructura de proyecto móvil.', 'Mobile project structure management.'),
        ],
        icon: SiDart,
        className: 'top-[12%] right-[36%]',
        iconClassName: 'text-[#0175C2]',
      },
      {
        id: 7,
        name: 'HTML5',
        level: t('Medio', 'Intermediate'),
        usedIn: t('Portafolio y StartupConnect', 'Portfolio and StartupConnect'),
        details: [
          t('Estructura semántica y accesibilidad base.', 'Semantic structure and baseline accessibility.'),
          t('Composición de layouts modernos.', 'Composition of modern layouts.'),
        ],
        icon: SiHtml5,
        className: 'bottom-[16%] left-[34%]',
        iconClassName: 'text-[#E34F26]',
      },
      {
        id: 8,
        name: 'CSS',
        level: t('Medio', 'Intermediate'),
        usedIn: t('Portafolio y StartupConnect', 'Portfolio and StartupConnect'),
        details: [
          t('Animaciones, layout avanzado y responsive.', 'Animations, advanced layout, and responsive behavior.'),
          t('Ajustes finos de tipografía y jerarquía visual.', 'Fine tuning for typography and visual hierarchy.'),
        ],
        icon: SiCss,
        className: 'top-[40%] left-[24%]',
        iconClassName: 'text-[#1572B6]',
      },
      {
        id: 9,
        name: 'Firebase',
        level: t('Bajo', 'Basic'),
        usedIn: t('Reservo.ai (integración ligera con Gemini)', 'Reservo.ai (light Gemini integration)'),
        details: [
          t('Uso puntual para servicios backend y autenticación.', 'Focused use for backend services and authentication.'),
          t('Conexiones de apoyo en flujos de la app.', 'Supporting connections across app flows.'),
        ],
        icon: SiFirebase,
        className: 'top-[66%] right-[32%]',
        iconClassName: 'text-[#FFCA28]',
      },
      {
        id: 10,
        name: 'Supabase',
        level: t('Bajo', 'Basic'),
        usedIn: t('Prototipos y pruebas backend', 'Backend prototypes and tests'),
        details: [
          t('Base rápida para PoCs y validaciones de idea.', 'Fast base for PoCs and idea validation.'),
        ],
        icon: SiSupabase,
        className: 'bottom-[20%] left-[58%]',
        iconClassName: 'text-[#3ECF8E]',
      },
      {
        id: 11,
        name: 'PostgreSQL',
        level: t('Medio', 'Intermediate'),
        usedIn: 'Reservo.ai',
        details: [
          t('Diseño de entidades y consultas en backend.', 'Entity and query design in backend systems.'),
          t('Persistencia estructurada para datos clave.', 'Structured persistence for key data.'),
        ],
        icon: SiPostgresql,
        className: 'top-[52%] right-[22%]',
        iconClassName: 'text-[#336791]',
      },
      {
        id: 12,
        name: 'Figma',
        level: t('Medio', 'Intermediate'),
        usedIn: t('Portafolio y StartupConnect', 'Portfolio and StartupConnect'),
        details: [
          t('Diseño de pantallas y sistema visual.', 'Screen design and visual system work.'),
          t('Iteración rápida de UX antes de implementar.', 'Fast UX iteration before implementation.'),
        ],
        icon: SiFigma,
        className: 'top-[56%] left-[20%]',
        iconClassName: 'text-[#F24E1E]',
      },
      {
        id: 13,
        name: 'Vercel',
        level: t('Medio-avanzado', 'Upper-intermediate'),
        usedIn: t('Deployment de este portafolio', 'Deployment of this portfolio'),
        details: [
          t('Deploy continuo con integración Git.', 'Continuous deployment with Git integration.'),
          t('Variables de entorno separadas por entorno.', 'Environment variables separated by environment.'),
          t('Aprovechamiento de CDN edge y caché para performance.', 'Use of edge CDN and caching for performance.'),
          t(
            'Manejo de previews para validar cambios antes de producción.',
            'Preview deployments to validate changes before production.',
          ),
        ],
        icon: SiVercel,
        className: 'top-[16%] left-[52%]',
        iconClassName: 'text-[#FFFFFF]',
      },
      {
        id: 14,
        name: 'GitHub',
        level: t('Medio-avanzado', 'Upper-intermediate'),
        usedIn: t('Flujo diario de desarrollo', 'Daily development workflow'),
        details: [
          t('Buenas prácticas de commits y ramas limpias.', 'Good practices for commits and clean branches.'),
          t('Manejo de CI/CD, PRs y revisión de cambios.', 'CI/CD, PR, and code review workflows.'),
          t('Uso de merge, rebase y cherry-pick según contexto.', 'Merge, rebase, and cherry-pick depending on context.'),
        ],
        icon: SiGithub,
        className: 'bottom-[14%] right-[46%]',
        iconClassName: 'text-[#FFFFFF]',
      },
      {
        id: 15,
        name: 'Cloudflare',
        level: t('Medio-bajo', 'Lower-intermediate'),
        usedIn: t('Hosting y DNS de este repositorio', 'Hosting and DNS for this repository'),
        details: [
          t('Gestión de DNS y capa de distribución.', 'DNS and distribution layer management.'),
          t('Ajustes básicos de seguridad y performance edge.', 'Basic security and edge performance tuning.'),
        ],
        icon: SiCloudflare,
        className: 'top-[28%] right-[30%]',
        iconClassName: 'text-[#F38020]',
      },
      {
        id: 16,
        name: 'GA4',
        level: t('Bajo', 'Basic'),
        usedIn: t('Solo en el portafolio', 'Portfolio only'),
        details: [
          t('Medición básica de tráfico y eventos principales.', 'Basic traffic and core event measurement.'),
          t('Seguimiento inicial de comportamiento de usuarios.', 'Initial tracking of user behavior.'),
        ],
        icon: IconGA4,
        className: 'top-[62%] left-[36%]',
      },
    ],
    [t],
  )

  return (
    <section id="skills">
      <FloatingIconsHero
        title={isEs ? 'Skills' : 'Skills'}
        subtitle={
          isEs
            ? 'Tecnologías y herramientas que uso para construir productos performantes y escalables.'
            : 'Technologies and tools I use to build performant and scalable products.'
        }
        icons={icons}
      />
    </section>
  )
}
