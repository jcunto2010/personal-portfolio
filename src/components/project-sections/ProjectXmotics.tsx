import React, { useEffect, useRef, useState } from 'react'
import { FaCogs, FaChartBar } from 'react-icons/fa'
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f0f] via-[#0a1a1a] to-[#0a0f0f]" />
        
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
              <p className="animate-fade-in-up text-cyan-400 text-sm uppercase tracking-[0.3em] mb-4 font-medium" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
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

            {/* Hero Mockup - Dashboard Preview */}
            <div className="animate-fade-in-up relative flex justify-center" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
              <div className="relative w-full max-w-5xl">
                {/* Monitor frame */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />
                  <div className="relative bg-slate-900 rounded-2xl p-4 border border-white/10 shadow-2xl shadow-cyan-500/10">
                    {/* Screen */}
                    <div className="bg-[#0a0f0f] rounded-xl overflow-hidden">
                      {/* Status bar */}
                      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/80 border-b border-cyan-500/10">
                        <div className="flex items-center gap-3">
                          <FaCogs className="text-cyan-400" />
                          <span className="text-white text-sm font-medium">Xmotics Control Center</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-emerald-400 text-xs">All Systems Online</span>
                        </div>
                      </div>
                      {/* Dashboard placeholder */}
                      <div className="aspect-[16/9] bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 flex items-center justify-center">
                        <div className="text-center p-8">
                          <FaChartBar className="text-6xl text-cyan-500/30 mx-auto mb-4" />
                          <p className="text-cyan-300/50 text-lg font-medium">Control Dashboard</p>
                          <p className="text-cyan-400/30 text-sm mt-2">Screenshot Coming Soon</p>
                        </div>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Main Description */}
            <div className="mb-20">
              <p className="animate-on-scroll text-2xl md:text-3xl lg:text-4xl text-white/90 font-light leading-relaxed font-body">
                Xmotics delivers <span className="text-cyan-400 font-medium">real-time industrial monitoring</span> with 
                seamless PLC integration. The platform processes <span className="text-teal-400 font-medium">thousands of data points</span> per 
                second, enabling predictive maintenance and operational insights for manufacturing facilities.
              </p>
            </div>

            {/* Tech Stack Line */}
            <div className="animate-on-scroll stagger-1 mb-20">
              <p className="text-gray-500 text-sm tracking-wide">
                React · TypeScript · Node.js · MongoDB · Docker · MQTT · WebSocket
              </p>
              <p className="text-white/50 text-sm mt-3">
                Web Dashboard · Industrial IoT · Real-time Analytics
              </p>
            </div>

            {/* Divider */}
            <div className="animate-on-scroll stagger-2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent mb-20" />

            {/* Role Description */}
            <div className="animate-on-scroll stagger-3 mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">My Role</p>
              <p className="text-gray-300 text-lg leading-relaxed font-body max-w-2xl mx-auto">
                Frontend architecture and real-time data visualization. Implemented WebSocket-based 
                live updates, interactive dashboards, and responsive monitoring interfaces for industrial equipment.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Data Pipeline - Editorial Layout */}
      <div className="relative py-32 bg-[#0a0a0f] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Section Title - Left aligned, editorial */}
            <div className="mb-20">
              <p className="animate-on-scroll text-cyan-400 text-xs uppercase tracking-[0.3em] mb-4">Data Pipeline</p>
              <h3 className="animate-on-scroll stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight">
                From sensor<br />
                <span className="text-gray-500">to insight.</span>
              </h3>
            </div>

            {/* Two column layout: Steps + Animated Visual */}
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
              
              {/* Left: Pipeline Steps */}
              <div className="space-y-10">
                
                {/* Step 1: PLCs & Sensors */}
                <div className="animate-on-scroll stagger-2 group">
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
                <div className="animate-on-scroll stagger-3 group">
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
                <div className="animate-on-scroll stagger-4 group">
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
                <div className="animate-on-scroll stagger-5 group">
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
                <div className="animate-on-scroll stagger-6 group">
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">

            {/* Metrics Cards with Count-Up Animation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Data Points */}
              <div className="animate-on-scroll stagger-3 text-center p-6">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent font-heading">
                  <CountUp end={10} suffix="K+" duration={2000} />
                </p>
                <p className="text-white font-medium text-sm mt-2">Data Points</p>
                <p className="text-gray-500 text-xs">per second</p>
              </div>

              {/* Latency */}
              <div className="animate-on-scroll stagger-4 text-center p-6">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent font-heading">
                  <CountUp end={50} prefix="<" suffix="ms" duration={1800} />
                </p>
                <p className="text-white font-medium text-sm mt-2">Latency</p>
                <p className="text-gray-500 text-xs">real-time</p>
              </div>

              {/* Uptime */}
              <div className="animate-on-scroll stagger-5 text-center p-6">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent font-heading">
                  <CountUp end={99.9} suffix="%" duration={2200} decimals={1} />
                </p>
                <p className="text-white font-medium text-sm mt-2">Uptime</p>
                <p className="text-gray-500 text-xs">reliability</p>
              </div>

              {/* Devices */}
              <div className="animate-on-scroll stagger-6 text-center p-6">
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

      {/* Screenshots Showcase - Infinite Scroll Gallery */}
      <div className="relative py-24 bg-[#0a0a0f] overflow-hidden">
        <div className="mb-16 text-center">
          <h3 className="animate-on-scroll text-3xl md:text-4xl font-bold text-white font-heading mb-4">
            Dashboard Interfaces
          </h3>
          <p className="animate-on-scroll stagger-1 text-gray-500 font-body">
            Industrial monitoring and control interfaces
          </p>
        </div>

        {/* Row 1 - Scrolling Left */}
        <div className="mb-6 overflow-hidden">
          <div className="animate-scroll-infinite-smooth flex gap-6">
            {/* First set */}
            {[
              { label: 'Main Dashboard', aspect: 'aspect-[16/10]', width: 'w-[550px]' },
              { label: 'Device Status Panel', aspect: 'aspect-[4/3]', width: 'w-[350px]' },
              { label: 'Real-time Monitoring', aspect: 'aspect-[16/10]', width: 'w-[550px]' },
              { label: 'Alert Management', aspect: 'aspect-[4/3]', width: 'w-[350px]' },
              { label: 'Historical Analytics', aspect: 'aspect-[16/10]', width: 'w-[550px]' },
            ].map((screen, index) => (
              <div key={index} className={`flex-shrink-0 ${screen.width}`}>
                <div className={`${screen.aspect} rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/10 overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-950/20 to-slate-900">
                    <div className="text-center p-4">
                      <FaChartBar className="text-3xl text-cyan-500/30 mx-auto mb-2" />
                      <p className="text-cyan-300/40 text-xs">{screen.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              { label: 'Main Dashboard', aspect: 'aspect-[16/10]', width: 'w-[550px]' },
              { label: 'Device Status Panel', aspect: 'aspect-[4/3]', width: 'w-[350px]' },
              { label: 'Real-time Monitoring', aspect: 'aspect-[16/10]', width: 'w-[550px]' },
              { label: 'Alert Management', aspect: 'aspect-[4/3]', width: 'w-[350px]' },
              { label: 'Historical Analytics', aspect: 'aspect-[16/10]', width: 'w-[550px]' },
            ].map((screen, index) => (
              <div key={`dup-${index}`} className={`flex-shrink-0 ${screen.width}`}>
                <div className={`${screen.aspect} rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/10 overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-950/20 to-slate-900">
                    <div className="text-center p-4">
                      <FaChartBar className="text-3xl text-cyan-500/30 mx-auto mb-2" />
                      <p className="text-cyan-300/40 text-xs">{screen.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Scrolling Right (reverse) */}
        <div className="overflow-hidden">
          <div className="animate-scroll-infinite-smooth-reverse flex gap-6">
            {/* First set */}
            {[
              { label: 'PLC Configuration', aspect: 'aspect-[16/10]', width: 'w-[550px]' },
              { label: 'Sensor Network Map', aspect: 'aspect-[4/3]', width: 'w-[400px]' },
              { label: 'Performance Metrics', aspect: 'aspect-[16/10]', width: 'w-[550px]' },
              { label: 'System Logs', aspect: 'aspect-[4/3]', width: 'w-[350px]' },
              { label: 'User Management', aspect: 'aspect-[16/10]', width: 'w-[500px]' },
            ].map((screen, index) => (
              <div key={index} className={`flex-shrink-0 ${screen.width}`}>
                <div className={`${screen.aspect} rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-teal-500/10 overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-950/20 to-slate-900">
                    <div className="text-center p-4">
                      <FaCogs className="text-3xl text-teal-500/30 mx-auto mb-2" />
                      <p className="text-teal-300/40 text-xs">{screen.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              { label: 'PLC Configuration', aspect: 'aspect-[16/10]', width: 'w-[550px]' },
              { label: 'Sensor Network Map', aspect: 'aspect-[4/3]', width: 'w-[400px]' },
              { label: 'Performance Metrics', aspect: 'aspect-[16/10]', width: 'w-[550px]' },
              { label: 'System Logs', aspect: 'aspect-[4/3]', width: 'w-[350px]' },
              { label: 'User Management', aspect: 'aspect-[16/10]', width: 'w-[500px]' },
            ].map((screen, index) => (
              <div key={`dup-${index}`} className={`flex-shrink-0 ${screen.width}`}>
                <div className={`${screen.aspect} rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-teal-500/10 overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-950/20 to-slate-900">
                    <div className="text-center p-4">
                      <FaCogs className="text-3xl text-teal-500/30 mx-auto mb-2" />
                      <p className="text-teal-300/40 text-xs">{screen.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack Footer */}
      <div className="relative py-20 bg-gradient-to-b from-[#0a0a0f] to-[#0a0f0f]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="animate-on-scroll text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">Built With</p>
            <div className="animate-on-scroll stagger-1 flex flex-wrap justify-center gap-4">
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
            <div className="animate-on-scroll stagger-2 flex flex-wrap justify-center gap-3 mt-4">
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
