import { useEffect, useLayoutEffect } from 'react'
import { Hero } from '../../../components/ui/animated-hero'
import LightPillar from '../../../components/ui/LightPillar'
import { IntegrationHero } from '../../../components/ui/integration-hero'
import { useLenis } from '../../hooks/useLenis'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLocale } from '../../lib/localeContext'
import { ScrollContext } from '../../lib/scrollContext'
import { AboutTextBlock } from './AboutTextBlock'
import { ContactSection } from './ContactSection'
import { ExperienceSection } from './ExperienceSection'
import { ReservoSection } from './ReservoSection'
import { StartupConnectSection } from './StartupConnectSection'

export default function ClassicModePage() {
  const lenisRef = useLenis()
  const prefersReduced = useReducedMotion()
  const { locale } = useLocale()
  const isEs = locale === 'es'

  // index.html carries the home page's title and canonical; this page has its own.
  useEffect(() => {
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const home = { title: document.title, href: canonical?.href }
    document.title = isEs
      ? 'Jonathan Cunto Díaz — Proyectos y experiencia'
      : 'Jonathan Cunto Díaz — Projects & Experience'
    if (canonical) canonical.href = 'https://www.jonathancuntodiaz.com/classic-mode'
    return () => {
      document.title = home.title
      if (canonical && home.href) canonical.href = home.href
    }
  }, [isEs])

  useLayoutEffect(() => {
    const root = document.documentElement
    const body = document.body
    root.classList.add('classic-mode-scrollbar-none')
    body.classList.add('classic-mode-scrollbar-none')
    return () => {
      root.classList.remove('classic-mode-scrollbar-none')
      body.classList.remove('classic-mode-scrollbar-none')
    }
  }, [])

  function scrollToSection(id: string) {
    const node = document.getElementById(id)
    if (!node) return

    if (lenisRef.current) {
      lenisRef.current.scrollTo(node, { offset: 0 })
      return
    }

    node.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <ScrollContext.Provider value={lenisRef}>
      <main
        style={{
          minHeight: '100vh',
          background: '#070B1A',
          padding: '2rem 1rem',
          fontFamily: 'var(--v2-font-body)',
          position: 'relative',
          overflowX: 'clip',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            opacity: 1,
            zIndex: 0,
          }}
        >
          <LightPillar
            topColor="#5227FF"
            bottomColor="#7C3AED"
            intensity={0.78}
            rotationSpeed={0.2}
            glowAmount={0.003}
            pillarWidth={4}
            pillarHeight={0.3}
            noiseIntensity={0}
            pillarRotation={26}
            interactive={false}
            mixBlendMode="normal"
            quality="medium"
          />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Hero
            onExploreWork={() => scrollToSection('chapter-reservo')}
            onContact={() => scrollToSection('contact')}
          />
          <AboutTextBlock />
          <IntegrationHero
            title={isEs ? 'Skills' : 'Skills'}
            description={
              isEs
                ? 'Tecnologías y herramientas que uso para construir productos de alto rendimiento y escalables.'
                : 'Technologies and tools I use to build performant and scalable products.'
            }
          />
          <ReservoSection />
          <StartupConnectSection />
          <ExperienceSection />
          <ContactSection />
        </div>
      </main>
    </ScrollContext.Provider>
  )
}
