import { Hero } from '../../../components/ui/animated-hero'
import LightPillar from '../../../components/ui/LightPillar'
import { AboutTextBlock } from './AboutTextBlock'
import { SkillsSection } from './SkillsSection'

export default function EditorialGlowupPage() {
  return (
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
        <Hero />
        <AboutTextBlock />
        <SkillsSection />
      </div>
    </main>
  )
}
