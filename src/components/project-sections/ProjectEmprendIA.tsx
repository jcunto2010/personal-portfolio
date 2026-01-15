import React, { useEffect, useRef } from 'react'
import { FaMobile, FaDesktop } from 'react-icons/fa'
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

const ProjectEmprendIA: React.FC = () => {
  const sectionRef = useScrollAnimation()

  return (
    <section id="project-emprendia" className="relative overflow-hidden" ref={sectionRef}>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center py-24">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a0f0a] to-[#0f0a0a]" />
        
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
                      {/* Screenshot placeholder */}
                      <div className="aspect-[16/9] bg-gradient-to-br from-slate-900 via-orange-950/20 to-slate-900 flex items-center justify-center">
                        <div className="text-center p-8">
                          <FaDesktop className="text-6xl text-orange-500/30 mx-auto mb-4" />
                          <p className="text-orange-300/50 text-lg font-medium">Dashboard Preview</p>
                          <p className="text-orange-400/30 text-sm mt-2">Screenshot Coming Soon</p>
                        </div>
                      </div>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Main Description */}
            <div className="mb-20">
              <p className="animate-on-scroll text-2xl md:text-3xl lg:text-4xl text-white/90 font-light leading-relaxed font-body">
                EmprendIA is a <span className="text-orange-400 font-medium">multi-platform ecosystem</span> that bridges 
                the gap between emerging startups and the resources they need to grow. Built with 
                <span className="text-amber-400 font-medium"> modern technologies</span>, it provides role-based experiences 
                for startups, investors, incubators, and mentors.
              </p>
            </div>

            {/* Tech Stack Line */}
            <div className="animate-on-scroll stagger-1 mb-20">
              <p className="text-gray-500 text-sm tracking-wide">
                React · TypeScript · Flutter · Supabase · PostgreSQL · Tailwind CSS
              </p>
              <p className="text-white/50 text-sm mt-3">
                Web & Mobile · Multi-Actor Platform
              </p>
            </div>

            {/* Divider */}
            <div className="animate-on-scroll stagger-2 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent mb-20" />

            {/* Role Description */}
            <div className="animate-on-scroll stagger-3 mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">My Role</p>
              <p className="text-gray-300 text-lg leading-relaxed font-body max-w-2xl mx-auto">
                Full-stack development spanning web and mobile platforms. Implemented the 10-step progressive 
                registration flow, real-time data synchronization, and role-based access control system.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* The Ecosystem - Editorial Layout */}
      <div className="relative py-32 bg-[#0a0a0f]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Section Title - Left aligned, editorial */}
            <div className="mb-20">
              <p className="animate-on-scroll text-orange-400 text-xs uppercase tracking-[0.3em] mb-4">The Ecosystem</p>
              <h3 className="animate-on-scroll stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight">
                Four actors,<br />
                <span className="text-gray-500">one platform.</span>
              </h3>
            </div>

            {/* Actors - Staggered editorial layout */}
            <div className="space-y-16 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-20 md:gap-y-16">
              
              {/* Startups */}
              <div className="animate-on-scroll stagger-2 group">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-6xl md:text-7xl font-bold text-orange-500/20 font-heading">01</span>
                  <h4 className="text-2xl md:text-3xl font-bold text-white font-heading">Startups</h4>
                </div>
                <p className="text-gray-400 font-body leading-relaxed pl-0 md:pl-20">
                  Early-stage ventures seeking funding, mentorship, and growth opportunities. 
                  Complete profiles, track milestones, and connect with the right partners.
                </p>
              </div>

              {/* Investors */}
              <div className="animate-on-scroll stagger-3 group md:mt-12">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-6xl md:text-7xl font-bold text-amber-500/20 font-heading">02</span>
                  <h4 className="text-2xl md:text-3xl font-bold text-white font-heading">Investors</h4>
                </div>
                <p className="text-gray-400 font-body leading-relaxed pl-0 md:pl-20">
                  Capital providers looking for promising opportunities. Browse curated startups, 
                  review metrics, and make informed investment decisions.
                </p>
              </div>

              {/* Incubators */}
              <div className="animate-on-scroll stagger-4 group">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-6xl md:text-7xl font-bold text-emerald-500/20 font-heading">03</span>
                  <h4 className="text-2xl md:text-3xl font-bold text-white font-heading">Incubators</h4>
                </div>
                <p className="text-gray-400 font-body leading-relaxed pl-0 md:pl-20">
                  Growth accelerators nurturing the next generation. Manage cohorts, 
                  track progress, and provide structured support programs.
                </p>
              </div>

              {/* Mentors */}
              <div className="animate-on-scroll stagger-5 group md:mt-12">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-6xl md:text-7xl font-bold text-blue-500/20 font-heading">04</span>
                  <h4 className="text-2xl md:text-3xl font-bold text-white font-heading">Mentors</h4>
                </div>
                <p className="text-gray-400 font-body leading-relaxed pl-0 md:pl-20">
                  Industry experts sharing knowledge and experience. Guide startups through 
                  challenges, offer insights, and help shape success stories.
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Screenshots Showcase - Infinite Scroll Gallery */}
      <div className="relative py-24 bg-[#0a0a0f] overflow-hidden">
        <div className="mb-16 text-center">
          <h3 className="animate-on-scroll text-3xl md:text-4xl font-bold text-white font-heading mb-4">
            Platform Interfaces
          </h3>
          <p className="animate-on-scroll stagger-1 text-gray-500 font-body">
            A glimpse into the user experience across web and mobile
          </p>
        </div>

        {/* Row 1 - Scrolling Left */}
        <div className="mb-6 overflow-hidden">
          <div className="animate-scroll-infinite-smooth flex gap-6">
            {/* First set */}
            {[
              { type: 'desktop', label: 'Dashboard Overview', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Mobile Home', aspect: 'aspect-[9/16]' },
              { type: 'desktop', label: 'Startup Registration', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Profile View', aspect: 'aspect-[9/16]' },
              { type: 'desktop', label: 'Investor Portal', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Notifications', aspect: 'aspect-[9/16]' },
            ].map((screen, index) => (
              <div 
                key={index} 
                className={`flex-shrink-0 ${screen.type === 'desktop' ? 'w-[500px]' : 'w-[200px]'}`}
              >
                <div className={`${screen.aspect} rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-950/20 to-slate-900">
                    <div className="text-center p-4">
                      {screen.type === 'desktop' ? (
                        <FaDesktop className="text-3xl text-orange-500/30 mx-auto mb-2" />
                      ) : (
                        <FaMobile className="text-2xl text-orange-500/30 mx-auto mb-2" />
                      )}
                      <p className="text-orange-300/40 text-xs">{screen.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              { type: 'desktop', label: 'Dashboard Overview', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Mobile Home', aspect: 'aspect-[9/16]' },
              { type: 'desktop', label: 'Startup Registration', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Profile View', aspect: 'aspect-[9/16]' },
              { type: 'desktop', label: 'Investor Portal', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Notifications', aspect: 'aspect-[9/16]' },
            ].map((screen, index) => (
              <div 
                key={`dup-${index}`} 
                className={`flex-shrink-0 ${screen.type === 'desktop' ? 'w-[500px]' : 'w-[200px]'}`}
              >
                <div className={`${screen.aspect} rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-950/20 to-slate-900">
                    <div className="text-center p-4">
                      {screen.type === 'desktop' ? (
                        <FaDesktop className="text-3xl text-orange-500/30 mx-auto mb-2" />
                      ) : (
                        <FaMobile className="text-2xl text-orange-500/30 mx-auto mb-2" />
                      )}
                      <p className="text-orange-300/40 text-xs">{screen.label}</p>
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
              { type: 'desktop', label: 'Analytics Dashboard', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Search Startups', aspect: 'aspect-[9/16]' },
              { type: 'desktop', label: 'Mentor Matching', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Chat Interface', aspect: 'aspect-[9/16]' },
              { type: 'desktop', label: 'Progress Tracking', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Settings', aspect: 'aspect-[9/16]' },
            ].map((screen, index) => (
              <div 
                key={index} 
                className={`flex-shrink-0 ${screen.type === 'desktop' ? 'w-[500px]' : 'w-[200px]'}`}
              >
                <div className={`${screen.aspect} rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-950/20 to-slate-900">
                    <div className="text-center p-4">
                      {screen.type === 'desktop' ? (
                        <FaDesktop className="text-3xl text-amber-500/30 mx-auto mb-2" />
                      ) : (
                        <FaMobile className="text-2xl text-amber-500/30 mx-auto mb-2" />
                      )}
                      <p className="text-amber-300/40 text-xs">{screen.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              { type: 'desktop', label: 'Analytics Dashboard', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Search Startups', aspect: 'aspect-[9/16]' },
              { type: 'desktop', label: 'Mentor Matching', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Chat Interface', aspect: 'aspect-[9/16]' },
              { type: 'desktop', label: 'Progress Tracking', aspect: 'aspect-[16/10]' },
              { type: 'mobile', label: 'Settings', aspect: 'aspect-[9/16]' },
            ].map((screen, index) => (
              <div 
                key={`dup-${index}`} 
                className={`flex-shrink-0 ${screen.type === 'desktop' ? 'w-[500px]' : 'w-[200px]'}`}
              >
                <div className={`${screen.aspect} rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-950/20 to-slate-900">
                    <div className="text-center p-4">
                      {screen.type === 'desktop' ? (
                        <FaDesktop className="text-3xl text-amber-500/30 mx-auto mb-2" />
                      ) : (
                        <FaMobile className="text-2xl text-amber-500/30 mx-auto mb-2" />
                      )}
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="animate-on-scroll text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">Built With</p>
            <div className="animate-on-scroll stagger-1 flex flex-wrap justify-center gap-4">
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
