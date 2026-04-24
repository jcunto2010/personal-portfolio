import { useMemo } from 'react'
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

  const icons: FloatingIconsHeroProps['icons'] = useMemo(
    () => [
      {
        id: 1,
        name: 'Flutter',
        level: 'Medio',
        usedIn: 'Reservo.ai',
        details: [
          'Arquitectura principal de la app móvil.',
          'Integración de UI compleja con estado y navegación.',
          'Consumo de servicios externos y flujos productivos.',
        ],
        icon: SiFlutter,
        className: 'top-[18%] left-[22%]',
        iconClassName: 'text-[#02569B]',
      },
      {
        id: 2,
        name: 'React',
        level: 'Medio',
        usedIn: 'Portafolio y StartupConnect',
        details: [
          'Desarrollo de interfaces modulares y reusables.',
          'Animaciones e interacciones avanzadas con Framer Motion/GSAP.',
          'Componentización orientada a escalabilidad.',
        ],
        icon: SiReact,
        className: 'top-[22%] right-[20%]',
        iconClassName: 'text-[#61DAFB]',
      },
      {
        id: 3,
        name: 'Tailwind CSS',
        level: 'Medio',
        usedIn: 'Portafolio y StartupConnect',
        details: [
          'Diseño responsive rápido con utilidades.',
          'Sistemas visuales consistentes y mantenibles.',
        ],
        icon: SiTailwindcss,
        className: 'top-[72%] left-[22%]',
        iconClassName: 'text-[#06B6D4]',
      },
      {
        id: 4,
        name: 'TypeScript',
        level: 'Medio',
        usedIn: 'Portafolio y StartupConnect',
        details: [
          'Tipado estricto para reducir bugs en runtime.',
          'Modelado de componentes y flujos de datos.',
        ],
        icon: SiTypescript,
        className: 'bottom-[16%] right-[20%]',
        iconClassName: 'text-[#3178C6]',
      },
      {
        id: 5,
        name: 'JavaScript',
        level: 'Medio-avanzado',
        usedIn: 'Scripts en Google Suite y frontend web',
        details: [
          'Automatización de tareas y lógica de negocio.',
          'Base sólida para desarrollo UI y manipulación de estado.',
        ],
        icon: SiJavascript,
        className: 'top-[12%] left-[36%]',
        iconClassName: 'text-[#F7DF1E]',
      },
      {
        id: 6,
        name: 'Dart',
        level: 'Medio',
        usedIn: 'Reservo.ai (con Flutter)',
        details: [
          'Lógica de aplicación, modelos y flujos de UI.',
          'Gestión de estructura de proyecto móvil.',
        ],
        icon: SiDart,
        className: 'top-[12%] right-[36%]',
        iconClassName: 'text-[#0175C2]',
      },
      {
        id: 7,
        name: 'HTML5',
        level: 'Medio',
        usedIn: 'Portafolio y StartupConnect',
        details: [
          'Estructura semántica y accesibilidad base.',
          'Composición de layouts modernos.',
        ],
        icon: SiHtml5,
        className: 'bottom-[16%] left-[34%]',
        iconClassName: 'text-[#E34F26]',
      },
      {
        id: 8,
        name: 'CSS',
        level: 'Medio',
        usedIn: 'Portafolio y StartupConnect',
        details: [
          'Animaciones, layout avanzado y responsive.',
          'Ajustes finos de tipografía y jerarquía visual.',
        ],
        icon: SiCss,
        className: 'top-[40%] left-[24%]',
        iconClassName: 'text-[#1572B6]',
      },
      {
        id: 9,
        name: 'Firebase',
        level: 'Bajo',
        usedIn: 'Reservo.ai (integración ligera con Gemini)',
        details: [
          'Uso puntual para servicios backend y autenticación.',
          'Conexiones de apoyo en flujos de la app.',
        ],
        icon: SiFirebase,
        className: 'top-[66%] right-[32%]',
        iconClassName: 'text-[#FFCA28]',
      },
      {
        id: 10,
        name: 'Supabase',
        level: 'Bajo',
        usedIn: 'Prototipos y pruebas backend',
        details: [
          'Base rápida para PoCs y validaciones de idea.',
        ],
        icon: SiSupabase,
        className: 'bottom-[20%] left-[58%]',
        iconClassName: 'text-[#3ECF8E]',
      },
      {
        id: 11,
        name: 'PostgreSQL',
        level: 'Medio',
        usedIn: 'Reservo.ai',
        details: [
          'Diseño de entidades y consultas en backend.',
          'Persistencia estructurada para datos clave.',
        ],
        icon: SiPostgresql,
        className: 'top-[52%] right-[22%]',
        iconClassName: 'text-[#336791]',
      },
      {
        id: 12,
        name: 'Figma',
        level: 'Medio',
        usedIn: 'Portafolio y StartupConnect',
        details: [
          'Diseño de pantallas y sistema visual.',
          'Iteración rápida de UX antes de implementar.',
        ],
        icon: SiFigma,
        className: 'top-[56%] left-[20%]',
        iconClassName: 'text-[#F24E1E]',
      },
      {
        id: 13,
        name: 'Vercel',
        level: 'Medio-avanzado',
        usedIn: 'Deployment de este portafolio',
        details: [
          'Deploy continuo con integración Git.',
          'Variables de entorno separadas por entorno.',
          'Aprovechamiento de CDN edge y caché para performance.',
          'Manejo de previews para validar cambios antes de producción.',
        ],
        icon: SiVercel,
        className: 'top-[16%] left-[52%]',
        iconClassName: 'text-[#FFFFFF]',
      },
      {
        id: 14,
        name: 'GitHub',
        level: 'Medio-avanzado',
        usedIn: 'Flujo diario de desarrollo',
        details: [
          'Buenas prácticas de commits y ramas limpias.',
          'Manejo de CI/CD, PRs y revisión de cambios.',
          'Uso de merge, rebase y cherry-pick según contexto.',
        ],
        icon: SiGithub,
        className: 'bottom-[14%] right-[46%]',
        iconClassName: 'text-[#FFFFFF]',
      },
      {
        id: 15,
        name: 'Cloudflare',
        level: 'Medio-bajo',
        usedIn: 'Hosting y DNS de este repositorio',
        details: [
          'Gestión de DNS y capa de distribución.',
          'Ajustes básicos de seguridad y performance edge.',
        ],
        icon: SiCloudflare,
        className: 'top-[28%] right-[30%]',
        iconClassName: 'text-[#F38020]',
      },
      {
        id: 16,
        name: 'GA4',
        level: 'Bajo',
        usedIn: 'Solo en el portafolio',
        details: [
          'Medición básica de tráfico y eventos principales.',
          'Seguimiento inicial de comportamiento de usuarios.',
        ],
        icon: IconGA4,
        className: 'top-[62%] left-[36%]',
      },
    ],
    [],
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
