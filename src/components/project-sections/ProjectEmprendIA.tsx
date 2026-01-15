import React, { useEffect, useRef, useState } from 'react'
import { FaDesktop } from 'react-icons/fa'
import { SiReact, SiTypescript, SiFlutter, SiPostgresql, SiSupabase, SiTailwindcss } from 'react-icons/si'

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const elements = ref.current?.querySelectorAll('.animate-on-scroll, .animate-fade-up, .animate-scale-up, .animate-slide-left, .animate-slide-right, .animate-blur-in')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return ref
}

// Generate random stars
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

// Starry background component to reuse across sections
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

// Actor connections - which actors connect to which
const actorConnections: Record<string, string[]> = {
  startups: ['investors', 'incubators', 'mentors'],
  investors: ['startups', 'incubators'],
  incubators: ['startups', 'mentors', 'investors'],
  mentors: ['startups', 'incubators'],
}

const ProjectEmprendIA: React.FC = () => {
  const sectionRef = useScrollAnimation()
  const [hoveredActor, setHoveredActor] = useState<string | null>(null)
  
  const isConnected = (actor: string) => {
    if (!hoveredActor) return false
    return actorConnections[hoveredActor]?.includes(actor) || false
  }

  return (
    <section id="project-emprendia" className="relative overflow-hidden" ref={sectionRef}>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center py-24">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#0f0a0a]" />
        
        {/* Starry background */}
        <StarryBackground />
        
        {/* Subtle warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/10 via-transparent to-amber-900/5" />
        
        {/* Decorative glows */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-orange-600/15 rounded-full blur-[128px] animate-glow-pulse-subtle" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-amber-600/15 rounded-full blur-[128px] animate-glow-pulse-subtle" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Project Title */}
            <div className="text-center mb-20">
              <p className="animate-fade-in-up text-orange-400 text-sm uppercase tracking-[0.3em] mb-4 font-medium" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                Startup Ecosystem Platform
              </p>
              <h2 className="animate-fade-in-up text-6xl md:text-8xl lg:text-9xl font-bold font-heading tracking-tight mb-6" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                  EmprendIA
                </span>
              </h2>
              <p className="animate-fade-in-up text-amber-400/60 text-lg mb-4" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                Including StartupFlow
              </p>
              <p className="animate-fade-in-up text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-body" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                A comprehensive multi-actor platform connecting startups with investors, incubators, and mentors
              </p>
            </div>

            {/* Hero Mockup - Editorial Style Laptop */}
            <div className="animate-fade-in-up relative flex justify-center" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
              <div className="relative w-full max-w-4xl">
                {/* Laptop frame */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-yellow-500/20 rounded-3xl blur-2xl" />
                  <div className="relative bg-slate-900 rounded-2xl p-3 border border-white/10 shadow-2xl shadow-orange-500/10">
                    {/* Screen bezel */}
                    <div className="bg-[#111] rounded-xl overflow-hidden">
                      {/* Browser bar */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-white/5">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        </div>
                        <div className="flex-1 mx-8">
                          <div className="bg-slate-900/80 rounded-lg px-4 py-1.5 text-xs text-gray-500 text-center">
                            emprendia.platform.io
                          </div>
                        </div>
                      </div>
                      <img 
                        src="/assets/projects/emprendia/home webpage.png" 
                        alt="EmprendIA Home Webpage"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  {/* Laptop base */}
                  <div className="relative h-4 bg-gradient-to-b from-slate-800 to-slate-900 rounded-b-xl mx-16 border-x border-b border-white/5">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-700 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Overview - Editorial Style */}
      <div className="relative py-32 bg-gradient-to-b from-[#0f0a0a] to-[#0a0a0f]">
        {/* Starry background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`overview-${star.id}`}
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
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Main Description */}
            <div className="mb-20">
              <p className="text-2xl md:text-3xl lg:text-4xl text-white/90 font-light leading-relaxed font-body">
                EmprendIA is a <span className="text-orange-400 font-medium">multi-platform ecosystem</span> that bridges 
                the gap between emerging startups and the resources they need to grow. Built with 
                <span className="text-amber-400 font-medium"> modern technologies</span>, it provides role-based experiences 
                for startups, investors, incubators, and mentors.
              </p>
            </div>

            {/* Tech Stack Line */}
            <div className="mb-20">
              <p className="text-gray-500 text-sm tracking-wide">
                React · TypeScript · Flutter · Supabase · PostgreSQL · Tailwind CSS
              </p>
              <p className="text-white/50 text-sm mt-3">
                Web & Mobile · Multi-Actor Platform
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent mb-20" />

            {/* Role Description */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">My Role</p>
              <h4 className="text-orange-400 text-lg font-semibold mb-3">Director of Frontend Development & Co-Founder</h4>
              <p className="text-gray-300 text-lg leading-relaxed font-body max-w-2xl mx-auto">
                Co-founded and lead frontend architecture for multi-platform ecosystem connecting startups with investors. 
                Built web dashboard with React and cross-platform mobile app with Flutter, including 10-step progressive registration flow.
              </p>
            </div>

            {/* NDA Notice */}
            <div className="flex justify-center mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500/5 border border-orange-500/20 text-orange-400/70 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Codebase protected under NDA</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* The Ecosystem - Editorial Layout */}
      <div className="relative py-32 bg-[#0a0a0f]">
        {/* Starry background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`eco-${star.id}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay + 0.5}s`,
                animationDuration: `${star.duration}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            
            {/* Section Title - Left aligned, editorial */}
            <div className="mb-20">
              <p className="text-orange-400 text-xs uppercase tracking-[0.3em] mb-4">The Ecosystem</p>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight">
                Four actors,<br />
                <span className="text-gray-500">one platform.</span>
              </h3>
            </div>

            {/* Actors - Hover to highlight connections */}
            <div 
              className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-12"
              onMouseLeave={() => setHoveredActor(null)}
            >
              
              {/* Startups */}
              <div 
                onMouseEnter={() => setHoveredActor('startups')}
                className={`p-8 rounded-2xl transition-all duration-150 ${
                  hoveredActor === 'startups' 
                    ? 'bg-orange-500/10 scale-[1.02]' 
                    : hoveredActor && !isConnected('startups') 
                      ? 'opacity-40' 
                      : isConnected('startups')
                        ? 'bg-orange-500/5'
                        : ''
                }`}
              >
                <div className="flex items-baseline gap-6 mb-4">
                  <span className={`text-7xl md:text-8xl lg:text-9xl font-bold font-heading transition-colors duration-150 ${
                    hoveredActor === 'startups' ? 'text-orange-500/60' : 'text-orange-500/20'
                  }`}>01</span>
                  <h4 className={`text-3xl md:text-4xl font-bold font-heading transition-colors duration-150 ${
                    hoveredActor === 'startups' ? 'text-orange-400' : 'text-white'
                  }`}>Startups</h4>
                </div>
                <p className={`text-lg font-body leading-relaxed pl-0 md:pl-24 transition-colors duration-150 ${
                  hoveredActor === 'startups' ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  Early-stage ventures seeking funding, mentorship, and growth opportunities. 
                  Complete profiles, track milestones, and connect with the right partners.
                </p>
                {/* Connection hint */}
                <div className={`overflow-hidden transition-all duration-150 ${hoveredActor === 'startups' ? 'max-h-20 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-orange-400/80 text-sm font-body pl-0 md:pl-24">
                    Connects with Investors, Incubators & Mentors
                  </p>
                </div>
              </div>

              {/* Investors */}
              <div 
                onMouseEnter={() => setHoveredActor('investors')}
                className={`p-8 rounded-2xl transition-all duration-150 md:mt-16 ${
                  hoveredActor === 'investors' 
                    ? 'bg-amber-500/10 scale-[1.02]' 
                    : hoveredActor && !isConnected('investors') 
                      ? 'opacity-40' 
                      : isConnected('investors')
                        ? 'bg-amber-500/5'
                        : ''
                }`}
              >
                <div className="flex items-baseline gap-6 mb-4">
                  <span className={`text-7xl md:text-8xl lg:text-9xl font-bold font-heading transition-colors duration-150 ${
                    hoveredActor === 'investors' ? 'text-amber-500/60' : 'text-amber-500/20'
                  }`}>02</span>
                  <h4 className={`text-3xl md:text-4xl font-bold font-heading transition-colors duration-150 ${
                    hoveredActor === 'investors' ? 'text-amber-400' : 'text-white'
                  }`}>Investors</h4>
                </div>
                <p className={`text-lg font-body leading-relaxed pl-0 md:pl-24 transition-colors duration-150 ${
                  hoveredActor === 'investors' ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  Capital providers looking for promising opportunities. Browse curated startups, 
                  review metrics, and make informed investment decisions.
                </p>
                {/* Connection hint */}
                <div className={`overflow-hidden transition-all duration-150 ${hoveredActor === 'investors' ? 'max-h-20 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-amber-400/80 text-sm font-body pl-0 md:pl-24">
                    Connects with Startups & Incubators
                  </p>
                </div>
              </div>

              {/* Incubators */}
              <div 
                onMouseEnter={() => setHoveredActor('incubators')}
                className={`p-8 rounded-2xl transition-all duration-150 ${
                  hoveredActor === 'incubators' 
                    ? 'bg-emerald-500/10 scale-[1.02]' 
                    : hoveredActor && !isConnected('incubators') 
                      ? 'opacity-40' 
                      : isConnected('incubators')
                        ? 'bg-emerald-500/5'
                        : ''
                }`}
              >
                <div className="flex items-baseline gap-6 mb-4">
                  <span className={`text-7xl md:text-8xl lg:text-9xl font-bold font-heading transition-colors duration-150 ${
                    hoveredActor === 'incubators' ? 'text-emerald-500/60' : 'text-emerald-500/20'
                  }`}>03</span>
                  <h4 className={`text-3xl md:text-4xl font-bold font-heading transition-colors duration-150 ${
                    hoveredActor === 'incubators' ? 'text-emerald-400' : 'text-white'
                  }`}>Incubators</h4>
                </div>
                <p className={`text-lg font-body leading-relaxed pl-0 md:pl-24 transition-colors duration-150 ${
                  hoveredActor === 'incubators' ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  Growth accelerators nurturing the next generation. Manage cohorts, 
                  track progress, and provide structured support programs.
                </p>
                {/* Connection hint */}
                <div className={`overflow-hidden transition-all duration-150 ${hoveredActor === 'incubators' ? 'max-h-20 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-emerald-400/80 text-sm font-body pl-0 md:pl-24">
                    Connects with Startups, Mentors & Investors
                  </p>
                </div>
              </div>

              {/* Mentors */}
              <div 
                onMouseEnter={() => setHoveredActor('mentors')}
                className={`p-8 rounded-2xl transition-all duration-150 md:mt-16 ${
                  hoveredActor === 'mentors' 
                    ? 'bg-blue-500/10 scale-[1.02]' 
                    : hoveredActor && !isConnected('mentors') 
                      ? 'opacity-40' 
                      : isConnected('mentors')
                        ? 'bg-blue-500/5'
                        : ''
                }`}
              >
                <div className="flex items-baseline gap-6 mb-4">
                  <span className={`text-7xl md:text-8xl lg:text-9xl font-bold font-heading transition-colors duration-150 ${
                    hoveredActor === 'mentors' ? 'text-blue-500/60' : 'text-blue-500/20'
                  }`}>04</span>
                  <h4 className={`text-3xl md:text-4xl font-bold font-heading transition-colors duration-150 ${
                    hoveredActor === 'mentors' ? 'text-blue-400' : 'text-white'
                  }`}>Mentors</h4>
                </div>
                <p className={`text-lg font-body leading-relaxed pl-0 md:pl-24 transition-colors duration-150 ${
                  hoveredActor === 'mentors' ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  Industry experts sharing knowledge and experience. Guide startups through 
                  challenges, offer insights, and help shape success stories.
                </p>
                {/* Connection hint */}
                <div className={`overflow-hidden transition-all duration-150 ${hoveredActor === 'mentors' ? 'max-h-20 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-blue-400/80 text-sm font-body pl-0 md:pl-24">
                    Connects with Startups & Incubators
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Screenshots Showcase - Infinite Scroll Gallery */}
      <div className="relative py-24 bg-[#0a0a0f] overflow-hidden">
        {/* Starry background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`screens-${star.id}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay + 1}s`,
                animationDuration: `${star.duration}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
        <div className="mb-16 text-center relative z-10">
          <h3 className="text-3xl md:text-4xl font-bold text-white font-heading mb-4">
            Platform Interfaces
          </h3>
          <p className="text-gray-500 font-body">
            A glimpse into the user experience across web and mobile
          </p>
        </div>

        {/* Row 1 - Scrolling Left */}
        <div className="mb-6 overflow-hidden">
          <div className="animate-scroll-infinite-smooth flex gap-6">
            {/* First set */}
            {[
              { type: 'desktop', label: 'Home Webpage', image: 'home webpage.png' },
              { type: 'desktop', label: 'Fintech Webpage', image: 'emprendIA fintech webpage.png' },
              { type: 'desktop', label: 'AI Agents', image: 'ai agents webpage.png' },
              { type: 'desktop', label: 'Subscription', image: 'subscription webpage.png' },
            ].map((screen, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-[500px]"
              >
                <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 overflow-hidden">
                  <img 
                    src={`/assets/projects/emprendia/${screen.image}`}
                    alt={`EmprendIA ${screen.label}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to placeholder if image doesn't exist
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const placeholder = target.nextElementSibling as HTMLElement
                      if (placeholder) placeholder.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-950/20 to-slate-900" style={{ display: 'none' }}>
                    <div className="text-center p-4">
                      <FaDesktop className="text-3xl text-orange-500/30 mx-auto mb-2" />
                      <p className="text-orange-300/40 text-xs">{screen.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              { type: 'desktop', label: 'Home Webpage', image: 'home webpage.png' },
              { type: 'desktop', label: 'Fintech Webpage', image: 'emprendIA fintech webpage.png' },
              { type: 'desktop', label: 'AI Agents', image: 'ai agents webpage.png' },
              { type: 'desktop', label: 'Subscription', image: 'subscription webpage.png' },
            ].map((screen, index) => (
              <div 
                key={`dup-${index}`} 
                className="flex-shrink-0 w-[500px]"
              >
                <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 overflow-hidden">
                  <img 
                    src={`/assets/projects/emprendia/${screen.image}`}
                    alt={`EmprendIA ${screen.label}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const placeholder = target.nextElementSibling as HTMLElement
                      if (placeholder) placeholder.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-950/20 to-slate-900" style={{ display: 'none' }}>
                    <div className="text-center p-4">
                      <FaDesktop className="text-3xl text-orange-500/30 mx-auto mb-2" />
                      <p className="text-orange-300/40 text-xs">{screen.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Scrolling Right (reverse) */}
        <div className="overflow-hidden relative z-10">
          <div className="animate-scroll-infinite-smooth-reverse flex gap-6">
            {/* First set */}
            {[
              { type: 'desktop', label: 'Subscription', image: 'subscription webpage.png' },
              { type: 'desktop', label: 'AI Agents', image: 'ai agents webpage.png' },
              { type: 'desktop', label: 'Fintech Webpage', image: 'emprendIA fintech webpage.png' },
              { type: 'desktop', label: 'Home Webpage', image: 'home webpage.png' },
            ].map((screen, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-[500px]"
              >
                <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 overflow-hidden">
                  <img 
                    src={`/assets/projects/emprendia/${screen.image}`}
                    alt={`EmprendIA ${screen.label}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const placeholder = target.nextElementSibling as HTMLElement
                      if (placeholder) placeholder.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-950/20 to-slate-900" style={{ display: 'none' }}>
                    <div className="text-center p-4">
                      <FaDesktop className="text-3xl text-amber-500/30 mx-auto mb-2" />
                      <p className="text-amber-300/40 text-xs">{screen.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              { type: 'desktop', label: 'Subscription', image: 'subscription webpage.png' },
              { type: 'desktop', label: 'AI Agents', image: 'ai agents webpage.png' },
              { type: 'desktop', label: 'Fintech Webpage', image: 'emprendIA fintech webpage.png' },
              { type: 'desktop', label: 'Home Webpage', image: 'home webpage.png' },
            ].map((screen, index) => (
              <div 
                key={`dup-${index}`} 
                className="flex-shrink-0 w-[500px]"
              >
                <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 overflow-hidden">
                  <img 
                    src={`/assets/projects/emprendia/${screen.image}`}
                    alt={`EmprendIA ${screen.label}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const placeholder = target.nextElementSibling as HTMLElement
                      if (placeholder) placeholder.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-950/20 to-slate-900" style={{ display: 'none' }}>
                    <div className="text-center p-4">
                      <FaDesktop className="text-3xl text-amber-500/30 mx-auto mb-2" />
                      <p className="text-amber-300/40 text-xs">{screen.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack Footer */}
      <div className="relative py-20 bg-gradient-to-b from-[#0a0a0f] to-[#0f0a0a]">
        {/* Starry background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`tech-${star.id}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay + 1.5}s`,
                animationDuration: `${star.duration}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">Built With</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: SiReact, name: 'React' },
                { icon: SiTypescript, name: 'TypeScript' },
                { icon: SiFlutter, name: 'Flutter' },
                { icon: SiSupabase, name: 'Supabase' },
                { icon: SiPostgresql, name: 'PostgreSQL' },
                { icon: SiTailwindcss, name: 'Tailwind' },
              ].map((tech, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors"
                >
                  <tech.icon className="text-sm text-orange-400/80" />
                  <span className="text-gray-400 text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

export default ProjectEmprendIA
