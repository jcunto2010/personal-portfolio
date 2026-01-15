import React, { useEffect, useRef, useState } from 'react'
import { FaCogs, FaChartBar, FaExternalLinkAlt, FaRocket } from 'react-icons/fa'
import { SiReact, SiTypescript, SiNodedotjs, SiDocker, SiMongodb } from 'react-icons/si'

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

// CountUp component with scroll trigger
interface CountUpProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
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
          opacity: Math.random() * 0.5 + 0.3,
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

const CountUp: React.FC<CountUpProps> = ({ end, suffix = '', prefix = '', duration = 2000, decimals = 0 }) => {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)
            
            const startTime = performance.now()
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / duration, 1)
              
              // Easing function (ease-out cubic)
              const easeOut = 1 - Math.pow(1 - progress, 3)
              const currentCount = easeOut * end
              
              setCount(currentCount)
              
              if (progress < 1) {
                requestAnimationFrame(animate)
              }
            }
            
            requestAnimationFrame(animate)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count)

  return (
    <span ref={ref}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}

const ProjectXmotics: React.FC = () => {
  const sectionRef = useScrollAnimation()

  return (
    <section id="project-xmotics" className="relative overflow-hidden" ref={sectionRef}>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center py-24">
        {/* Premium dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#0a0f0f]" />
        
        {/* Starry background */}
        <StarryBackground />
        
        {/* Subtle cyan gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 via-transparent to-teal-900/5" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Decorative glows */}
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-[128px] animate-glow-pulse-subtle" />
        <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-teal-600/15 rounded-full blur-[128px] animate-glow-pulse-subtle" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Project Title */}
            <div className="text-center mb-20">
              <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <FaRocket className="text-cyan-400 text-sm" />
                <span className="text-cyan-400 text-sm font-medium">Coming Soon</span>
              </div>
              <p className="animate-fade-in-up text-cyan-400 text-sm uppercase tracking-[0.3em] mb-4 font-medium" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
                Industrial Automation
              </p>
              <h2 className="animate-fade-in-up text-6xl md:text-8xl lg:text-9xl font-bold font-heading tracking-tight mb-6" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Xmotics
                </span>
              </h2>
              <p className="animate-fade-in-up text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-body" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                Industrial automation platform with real-time monitoring, PLC integration, and advanced analytics
              </p>
            </div>

            {/* Hero Mockup - Website Preview */}
            <div className="animate-fade-in-up relative flex justify-center" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
              <div className="relative w-full max-w-5xl">
                {/* Monitor frame */}
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />
                  <div className="relative bg-slate-900 rounded-2xl p-4 border border-white/10 shadow-2xl shadow-cyan-500/10">
                    {/* Screen */}
                    <div className="bg-[#0a0f0f] rounded-xl overflow-hidden">
                      {/* Browser bar */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-cyan-500/10">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        </div>
                        <div className="flex-1 mx-8">
                          <div className="bg-slate-900/80 rounded-lg px-4 py-1.5 text-xs text-cyan-400/70 text-center flex items-center justify-center gap-2">
                            <span>xmotics.com</span>
                            <FaExternalLinkAlt className="text-[10px]" />
                          </div>
                        </div>
                      </div>
                      {/* Video Player */}
                      <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 overflow-hidden group">
                        <video
                          className="w-full h-full object-contain"
                          controls
                          playsInline
                          preload="metadata"
                          loop
                          autoPlay
                          muted
                        >
                          <source src="/assets/projects/xmotics/Xmotics - Screencastify - January 15, 2026 1_40 PM.mp4" type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        {/* Website link overlay on hover */}
                        <a 
                          href="https://xmotics.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-100"
                        >
                          <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/90 hover:bg-cyan-500 border border-cyan-400/50 text-white text-sm font-medium transition-all shadow-lg">
                            <span>Visit xmotics.com</span>
                            <FaExternalLinkAlt className="text-xs" />
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* Monitor stand */}
                  <div className="flex justify-center">
                    <div className="w-24 h-8 bg-gradient-to-b from-slate-800 to-slate-900 rounded-b-lg border-x border-b border-white/5" />
                  </div>
                  <div className="flex justify-center -mt-1">
                    <div className="w-48 h-3 bg-gradient-to-b from-slate-900 to-slate-950 rounded-full border border-white/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Overview - Editorial Style */}
      <div className="relative py-32 bg-gradient-to-b from-[#0a0f0f] to-[#0a0a0f]">
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
                Xmotics will deliver <span className="text-cyan-400 font-medium">real-time industrial monitoring</span> with 
                seamless PLC integration. The platform will process <span className="text-teal-400 font-medium">thousands of data points</span> per 
                second, enabling predictive maintenance and operational insights for manufacturing facilities.
              </p>
            </div>

            {/* Status Badge */}
            <div className="mb-12 flex justify-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-cyan-500/5 border border-cyan-500/20">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-400/80 text-sm">Project in Planning Phase</span>
              </div>
            </div>

            {/* Tech Stack Line */}
            <div className="mb-20">
              <p className="text-gray-500 text-sm tracking-wide">
                React · TypeScript · Node.js · MongoDB · Docker · MQTT · WebSocket
              </p>
              <p className="text-white/50 text-sm mt-3">
                Web Dashboard · Industrial IoT · Real-time Analytics
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent mb-20" />

            {/* Role Description */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">My Role</p>
              <h4 className="text-cyan-400 text-lg font-semibold mb-3">CTO</h4>
              <p className="text-gray-300 text-lg leading-relaxed font-body max-w-2xl mx-auto">
                Leading technical strategy and architecture for industrial automation platform. Currently defining 
                the technical roadmap for real-time monitoring dashboards and WebSocket-based live data visualization systems.
              </p>
            </div>

            {/* Work in Progress Notice */}
            <div className="flex justify-center mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500/5 border border-cyan-500/20 text-cyan-400/70 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Work in progress - More details coming soon</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Data Pipeline - Editorial Layout */}
      <div className="relative py-32 bg-[#0a0a0f] overflow-hidden">
        {/* Starry background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`pipeline-${star.id}`}
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
          <div className="max-w-6xl mx-auto">
            
            {/* Section Title - Left aligned, editorial */}
            <div className="mb-20">
              <p className="text-cyan-400 text-xs uppercase tracking-[0.3em] mb-4">Planned Architecture</p>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight">
                From sensor<br />
                <span className="text-gray-500">to insight.</span>
              </h3>
            </div>

            {/* Two column layout: Steps + Animated Visual */}
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
              
              {/* Left: Pipeline Steps */}
              <div className="space-y-10">
                
                {/* Step 1: PLCs & Sensors */}
                <div className="group">
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-5xl font-bold text-cyan-500/20 font-heading">01</span>
                    <h4 className="text-xl md:text-2xl font-bold text-white font-heading">PLCs & Sensors</h4>
                  </div>
                  <p className="text-gray-400 font-body leading-relaxed pl-16">
                    Industrial equipment generates thousands of data points per second — temperature, pressure, 
                    vibration, and operational metrics flowing from the factory floor.
                  </p>
                </div>

                {/* Step 2: Edge Gateway */}
                <div className="group">
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-5xl font-bold text-teal-500/20 font-heading">02</span>
                    <h4 className="text-xl md:text-2xl font-bold text-white font-heading">Edge Processing</h4>
                  </div>
                  <p className="text-gray-400 font-body leading-relaxed pl-16">
                    MQTT and OPC-UA protocols normalize data at the edge. Filtering and aggregation 
                    reduce bandwidth while preserving critical signals.
                  </p>
                </div>

                {/* Step 3: Backend */}
                <div className="group">
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-5xl font-bold text-emerald-500/20 font-heading">03</span>
                    <h4 className="text-xl md:text-2xl font-bold text-white font-heading">Real-time Backend</h4>
                  </div>
                  <p className="text-gray-400 font-body leading-relaxed pl-16">
                    Node.js processes streams via WebSocket. Analytics engines detect anomalies and 
                    feed ML models for predictive maintenance.
                  </p>
                </div>

                {/* Step 4: Database */}
                <div className="group">
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-5xl font-bold text-blue-500/20 font-heading">04</span>
                    <h4 className="text-xl md:text-2xl font-bold text-white font-heading">Time-Series Storage</h4>
                  </div>
                  <p className="text-gray-400 font-body leading-relaxed pl-16">
                    MongoDB stores historical data with optimized time-series collections enabling 
                    instant access to operational history.
                  </p>
                </div>

                {/* Step 5: Dashboard */}
                <div className="group">
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-5xl font-bold text-violet-500/20 font-heading">05</span>
                    <h4 className="text-xl md:text-2xl font-bold text-white font-heading">Live Dashboard</h4>
                  </div>
                  <p className="text-gray-400 font-body leading-relaxed pl-16">
                    React renders real-time visualizations with sub-second updates. Operators monitor 
                    health, track KPIs, and respond to alerts instantly.
                  </p>
                </div>

              </div>

              {/* Right: Vertical Data Flow Visualization */}
              <div className="hidden lg:flex items-center justify-center relative">
                <div className="relative w-full max-w-sm h-[520px]">
                  
                  {/* Vertical flow diagram showing the 5 pipeline stages */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 520">
                    <defs>
                      {/* Glow filter for nodes */}
                      <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                      
                      {/* Gradient for the main flow line */}
                      <linearGradient id="flowLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="25%" stopColor="#14b8a6" />
                        <stop offset="50%" stopColor="#10b981" />
                        <stop offset="75%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>

                    {/* Main vertical flow line */}
                    <line x1="150" y1="50" x2="150" y2="470" stroke="url(#flowLineGradient)" strokeWidth="2" opacity="0.3" />
                    
                    {/* Animated data packets flowing down */}
                    <circle r="4" fill="#22d3ee" filter="url(#nodeGlow)">
                      <animate attributeName="cy" values="50;470" dur="4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3" fill="#14b8a6" filter="url(#nodeGlow)">
                      <animate attributeName="cy" values="50;470" dur="4s" repeatCount="indefinite" begin="1s" />
                      <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" begin="1s" />
                    </circle>
                    <circle r="3" fill="#10b981" filter="url(#nodeGlow)">
                      <animate attributeName="cy" values="50;470" dur="4s" repeatCount="indefinite" begin="2s" />
                      <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" begin="2s" />
                    </circle>
                    <circle r="4" fill="#8b5cf6" filter="url(#nodeGlow)">
                      <animate attributeName="cy" values="50;470" dur="4s" repeatCount="indefinite" begin="3s" />
                      <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" begin="3s" />
                    </circle>
                    {/* Set cx for all animated circles */}
                    <g>
                      <circle cx="150" r="4" fill="#22d3ee" filter="url(#nodeGlow)">
                        <animate attributeName="cy" values="50;470" dur="4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="150" r="3" fill="#14b8a6" filter="url(#nodeGlow)">
                        <animate attributeName="cy" values="50;470" dur="4s" repeatCount="indefinite" begin="1.3s" />
                        <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" begin="1.3s" />
                      </circle>
                      <circle cx="150" r="3" fill="#3b82f6" filter="url(#nodeGlow)">
                        <animate attributeName="cy" values="50;470" dur="4s" repeatCount="indefinite" begin="2.6s" />
                        <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" begin="2.6s" />
                      </circle>
                    </g>

                    {/* Stage 1: Sensors - Top */}
                    <g>
                      <circle cx="150" cy="50" r="24" fill="#0a1515" stroke="#22d3ee" strokeWidth="1.5" />
                      <circle cx="150" cy="50" r="16" fill="#22d3ee" opacity="0.15" />
                      <circle cx="150" cy="50" r="6" fill="#22d3ee" opacity="0.8">
                        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                      </circle>
                      {/* Sensor icon - signal waves */}
                      <path d="M142 50 Q150 42 158 50" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
                      <path d="M138 50 Q150 38 162 50" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.4" />
                    </g>
                    
                    {/* Stage 2: Edge - */}
                    <g>
                      <circle cx="150" cy="155" r="24" fill="#0a1515" stroke="#14b8a6" strokeWidth="1.5" />
                      <circle cx="150" cy="155" r="16" fill="#14b8a6" opacity="0.15" />
                      {/* Edge icon - filter/funnel shape */}
                      <path d="M140 148 L160 148 L155 155 L155 162 L145 162 L145 155 Z" fill="#14b8a6" opacity="0.6" />
                    </g>

                    {/* Stage 3: Backend */}
                    <g>
                      <circle cx="150" cy="260" r="24" fill="#0a1515" stroke="#10b981" strokeWidth="1.5" />
                      <circle cx="150" cy="260" r="16" fill="#10b981" opacity="0.15" />
                      {/* Backend icon - server/process */}
                      <rect x="143" y="252" width="14" height="4" rx="1" fill="#10b981" opacity="0.7" />
                      <rect x="143" y="258" width="14" height="4" rx="1" fill="#10b981" opacity="0.5" />
                      <rect x="143" y="264" width="14" height="4" rx="1" fill="#10b981" opacity="0.7" />
                    </g>

                    {/* Stage 4: Database */}
                    <g>
                      <circle cx="150" cy="365" r="24" fill="#0a1515" stroke="#3b82f6" strokeWidth="1.5" />
                      <circle cx="150" cy="365" r="16" fill="#3b82f6" opacity="0.15" />
                      {/* Database icon - cylinder */}
                      <ellipse cx="150" cy="358" rx="8" ry="3" fill="#3b82f6" opacity="0.7" />
                      <rect x="142" y="358" width="16" height="12" fill="#3b82f6" opacity="0.5" />
                      <ellipse cx="150" cy="370" rx="8" ry="3" fill="#3b82f6" opacity="0.7" />
                    </g>

                    {/* Stage 5: Dashboard - Bottom */}
                    <g>
                      <circle cx="150" cy="470" r="24" fill="#0a1515" stroke="#8b5cf6" strokeWidth="1.5" />
                      <circle cx="150" cy="470" r="16" fill="#8b5cf6" opacity="0.15" />
                      {/* Dashboard icon - monitor */}
                      <rect x="141" y="463" width="18" height="12" rx="2" fill="none" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.7" />
                      <line x1="150" y1="475" x2="150" y2="478" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.7" />
                      <line x1="145" y1="478" x2="155" y2="478" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.7" />
                    </g>

                    {/* Stage labels */}
                    <text x="190" y="54" fill="#22d3ee" fontSize="11" fontFamily="sans-serif" opacity="0.8">Sensors</text>
                    <text x="190" y="159" fill="#14b8a6" fontSize="11" fontFamily="sans-serif" opacity="0.8">Edge</text>
                    <text x="190" y="264" fill="#10b981" fontSize="11" fontFamily="sans-serif" opacity="0.8">Backend</text>
                    <text x="190" y="369" fill="#3b82f6" fontSize="11" fontFamily="sans-serif" opacity="0.8">Storage</text>
                    <text x="190" y="474" fill="#8b5cf6" fontSize="11" fontFamily="sans-serif" opacity="0.8">Dashboard</text>

                    {/* Connection segments between nodes (dotted) */}
                    <line x1="150" y1="74" x2="150" y2="131" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                    <line x1="150" y1="179" x2="150" y2="236" stroke="#14b8a6" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                    <line x1="150" y1="284" x2="150" y2="341" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                    <line x1="150" y1="389" x2="150" y2="446" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

                  </svg>

                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="relative py-24 bg-gradient-to-b from-[#0a0a0f] to-[#0a0f0f]">
        {/* Starry background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`metrics-${star.id}`}
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">

            {/* Metrics Cards with Count-Up Animation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Data Points */}
              <div className="text-center p-6">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent font-heading">
                  <CountUp end={10} suffix="K+" duration={2000} />
                </p>
                <p className="text-white font-medium text-sm mt-2">Data Points</p>
                <p className="text-gray-500 text-xs">per second</p>
              </div>

              {/* Latency */}
              <div className="text-center p-6">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent font-heading">
                  <CountUp end={50} prefix="<" suffix="ms" duration={1800} />
                </p>
                <p className="text-white font-medium text-sm mt-2">Latency</p>
                <p className="text-gray-500 text-xs">real-time</p>
              </div>

              {/* Uptime */}
              <div className="text-center p-6">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent font-heading">
                  <CountUp end={99.9} suffix="%" duration={2200} decimals={1} />
                </p>
                <p className="text-white font-medium text-sm mt-2">Uptime</p>
                <p className="text-gray-500 text-xs">reliability</p>
              </div>

              {/* Devices */}
              <div className="text-center p-6">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent font-heading">
                  <CountUp end={100} suffix="+" duration={2000} />
                </p>
                <p className="text-white font-medium text-sm mt-2">Devices</p>
                <p className="text-gray-500 text-xs">connected</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Website CTA Section */}
      <div className="relative py-24 bg-[#0a0a0f]">
        {/* Starry background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`cta-${star.id}`}
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
            <h3 className="text-3xl md:text-4xl font-bold text-white font-heading mb-4">
              Visit the Website
            </h3>
            <p className="text-gray-400 font-body mb-8 max-w-xl mx-auto">
              Learn more about Xmotics and stay updated on our progress as we build the next generation of industrial automation tools.
            </p>
            <a 
              href="https://xmotics.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
            >
              <span>Visit xmotics.com</span>
              <FaExternalLinkAlt className="text-sm" />
            </a>
          </div>
        </div>
      </div>

      {/* Tech Stack Footer */}
      <div className="relative py-20 bg-gradient-to-b from-[#0a0a0f] to-[#0a0f0f]">
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
                animationDelay: `${star.delay + 2}s`,
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
                { icon: SiNodedotjs, name: 'Node.js' },
                { icon: SiMongodb, name: 'MongoDB' },
                { icon: SiDocker, name: 'Docker' },
              ].map((tech, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-colors"
                >
                  <tech.icon className="text-sm text-cyan-400/80" />
                  <span className="text-gray-400 text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {['MQTT', 'WebSocket', 'OPC-UA', 'Redis'].map((tech, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 rounded-full bg-cyan-500/5 text-cyan-400/60 text-xs border border-cyan-500/10"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

export default ProjectXmotics
