import { Timeline } from '../../../components/ui/timeline'
import { useLocale } from '../../lib/localeContext'

const dataEs = [
  {
    title: '2026 - Actualidad',
    content: (
      <div>
        <p className="text-neutral-200 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-6 leading-relaxed">
          Desarrollo y evoluciono este portafolio como producto vivo: narrativa editorial, optimización
          de performance y experiencia visual inmersiva.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Enfoque: diseño y desarrollo para contar proyectos reales con contexto técnico.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Impacto: mejor legibilidad, jerarquía visual y experiencia de navegación en V2.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal leading-relaxed">
          Stack principal: React, TypeScript, Vite, Framer Motion, GSAP y Tailwind CSS.
        </p>
      </div>
    ),
  },
  {
    title: '2025',
    content: (
      <div>
        <p className="text-neutral-200 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-6 leading-relaxed">
          Construcción de <span className="font-semibold text-white">StartupConnect</span>, una
          plataforma full-stack de networking profesional con feed social, matching por compatibilidad y
          chat en tiempo real.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Arquitectura frontend modular para features sociales y discovery.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Backend en Spring Boot con APIs y lógica de negocio escalable.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal leading-relaxed">
          Mensajería en tiempo real con WebSocket y salas de comunidad.
        </p>
      </div>
    ),
  },
  {
    title: '2024',
    content: (
      <div>
        <p className="text-neutral-200 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-6 leading-relaxed">
          Desarrollo de <span className="font-semibold text-white">Reservo.AI</span>, MVP móvil de
          reservas conversacionales orientado a negocios de servicios.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Flujo de reserva en lenguaje natural con Gemini AI.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Integración de Firebase para autenticación, datos y notificaciones.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal leading-relaxed">
          Sesión biométrica y estado robusto con Riverpod.
        </p>
      </div>
    ),
  },
]

const dataEn = [
  {
    title: '2026 - Present',
    content: (
      <div>
        <p className="text-neutral-200 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-6 leading-relaxed">
          I build and evolve this portfolio as a living product: editorial storytelling, performance
          optimization, and immersive visual experience.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Focus: design and engineering to present real projects with technical context.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Impact: stronger readability, visual hierarchy, and navigation flow in V2.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal leading-relaxed">
          Core stack: React, TypeScript, Vite, Framer Motion, GSAP, and Tailwind CSS.
        </p>
      </div>
    ),
  },
  {
    title: '2025',
    content: (
      <div>
        <p className="text-neutral-200 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-6 leading-relaxed">
          Built <span className="font-semibold text-white">StartupConnect</span>, a full-stack
          professional networking platform with a social feed, compatibility matching, and real-time chat.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Modular frontend architecture for social and discovery features.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Spring Boot backend with scalable APIs and business rules.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal leading-relaxed">
          Real-time messaging using WebSocket and community rooms.
        </p>
      </div>
    ),
  },
  {
    title: '2024',
    content: (
      <div>
        <p className="text-neutral-200 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-6 leading-relaxed">
          Built <span className="font-semibold text-white">Reservo.AI</span>, a mobile MVP for
          conversational booking focused on service businesses.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Natural-language booking flow powered by Gemini AI.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal mb-3 leading-relaxed">
          Firebase integration for authentication, data, and notifications.
        </p>
        <p className="text-neutral-300 text-xs md:text-sm min-[1440px]:text-lg font-normal leading-relaxed">
          Biometric session recovery and robust state with Riverpod.
        </p>
      </div>
    ),
  },
]

export function ExperienceSection() {
  const { locale } = useLocale()
  const isEs = locale === 'es'

  return (
    <section id="experience" aria-label={isEs ? 'Experiencia profesional' : 'Professional experience'}>
      <div className="w-full">
        <Timeline
          heading={isEs ? 'Experiencia profesional' : 'Professional experience'}
          intro={
            isEs
              ? 'Una línea de tiempo con los productos y decisiones técnicas que han definido mi recorrido.'
              : 'A timeline of the products and technical decisions that have shaped my journey.'
          }
          data={isEs ? [...dataEs].reverse() : [...dataEn].reverse()}
        />
      </div>
    </section>
  )
}
