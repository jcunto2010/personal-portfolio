import { useLayoutEffect } from 'react'
import { Hero } from '../../../components/ui/animated-hero'
import LightPillar from '../../../components/ui/LightPillar'
import { useLenis } from '../../hooks/useLenis'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ScrollContext } from '../../lib/scrollContext'
import { AboutTextBlock } from './AboutTextBlock'
import { ContactSection } from './ContactSection'
import { ExperienceSection } from './ExperienceSection'
import { ReservoSection } from './ReservoSection'
import { SkillsSection } from './SkillsSection'
import { StartupConnectSection } from './StartupConnectSection'

export default function ClassicModePage() {
  const lenisRef = useLenis()
  const prefersReduced = useReducedMotion()

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
          <SkillsSection />
          <ReservoSection />
          <StartupConnectSection />
          <ExperienceSection />
          <ContactSection />
        </div>
      </main>
    </ScrollContext.Provider>
  )
}
