import React from 'react'
import { useDeveloperMode } from '../context/DeveloperModeContext'

const generateStars = (count: number) => {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
      opacity: Math.random() * 0.5 + 0.3,
    })
  }
  return stars
}

const stars = generateStars(80)

const StarryBackground: React.FC<{ shootingStars?: boolean }> = ({ shootingStars = true }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {stars.map((star) => (
      <div
        key={star.id}
        className="absolute rounded-full bg-white animate-twinkle"
        style={{
          left: star.left,
          top: star.top,
          width: `${star.size}px`,
          height: `${star.size}px`,
          animationDelay: `${star.delay}s`,
          animationDuration: `${star.duration}s`,
          opacity: star.opacity,
        }}
      />
    ))}
    {shootingStars && (
      <>
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-shooting-star" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 left-2/3 w-1 h-1 bg-white rounded-full animate-shooting-star" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white rounded-full animate-shooting-star" style={{ animationDelay: '8s' }} />
      </>
    )}
  </div>
)

export interface CaseStudyLayoutProps {
  title: string
  subtitle: string
  badge: string
  accent?: 'violet' | 'orange' | 'cyan'
  children: React.ReactNode
  architectureOverlay?: React.ReactNode
}

const accentStyles = {
  violet: {
    gradient: 'from-violet-900/20 via-transparent to-fuchsia-900/10',
    glow: 'bg-violet-600/20',
    glow2: 'bg-fuchsia-600/20',
    badge: 'text-violet-400',
    titleGradient: 'from-white via-violet-200 to-white',
  },
  orange: {
    gradient: 'from-orange-900/10 via-transparent to-amber-900/5',
    glow: 'bg-orange-600/15',
    glow2: 'bg-amber-600/15',
    badge: 'text-orange-400',
    titleGradient: 'from-white via-orange-200 to-white',
  },
  cyan: {
    gradient: 'from-cyan-900/20 via-transparent to-blue-900/10',
    glow: 'bg-cyan-600/20',
    glow2: 'bg-blue-600/20',
    badge: 'text-cyan-400',
    titleGradient: 'from-white via-cyan-200 to-white',
  },
}

export const CaseStudyLayout: React.FC<CaseStudyLayoutProps> = ({
  title,
  subtitle,
  badge,
  accent = 'violet',
  children,
  architectureOverlay,
}) => {
  const { developerMode } = useDeveloperMode()
  const style = accentStyles[accent]

  return (
    <section className="relative overflow-hidden">
      {/* Hero */}
      <div className="relative min-h-[70vh] flex items-center justify-center py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#0f0f2a]" />
        <StarryBackground />
        <div className={`absolute inset-0 bg-gradient-to-t ${style.gradient}`} />
        <div className={`absolute top-1/4 -left-32 w-96 h-96 ${style.glow} rounded-full blur-[128px] animate-glow-pulse-subtle`} />
        <div className={`absolute bottom-1/4 -right-32 w-96 h-96 ${style.glow2} rounded-full blur-[128px] animate-glow-pulse-subtle`} style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className={`animate-fade-in-up ${style.badge} text-sm uppercase tracking-[0.3em] mb-4 font-medium`} style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              {badge}
            </p>
            <h2 className="animate-fade-in-up text-5xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <span className={`bg-gradient-to-r ${style.titleGradient} bg-clip-text text-transparent`}>
                {title}
              </span>
            </h2>
            <p className="animate-fade-in-up text-gray-400 text-lg md:text-xl mt-6 font-body" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative py-24 bg-gradient-to-b from-[#0f0f2a] to-[#0a0a1a]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`content-${star.id}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {children}
        </div>
      </div>

      {/* Architecture overlay – only when Developer Mode is ON */}
      {developerMode && architectureOverlay && (
        <div className="relative py-12 border-t border-white/10 bg-black/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-[0.3em] text-primary-400 mb-4">Technical architecture (Developer Mode)</p>
            {architectureOverlay}
          </div>
        </div>
      )}
    </section>
  )
}
