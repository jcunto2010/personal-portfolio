import React, { useEffect, useRef } from 'react'
import { FaRobot, FaMobileAlt, FaCalendarCheck, FaBell, FaFingerprint, FaComments } from 'react-icons/fa'

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

    const elements = ref.current?.querySelectorAll('.animate-on-scroll, .animate-fade-up, .animate-scale-up, .animate-slide-left, .animate-slide-right, .animate-blur-in, .animate-title-reveal')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return ref
}

const ProjectReservo: React.FC = () => {
  const sectionRef = useScrollAnimation()

  return (
    <section id="project-reservo" className="relative overflow-hidden" ref={sectionRef}>
      {/* Hero Section with gradient background */}
      <div className="relative min-h-screen flex items-center justify-center py-24">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0f0f2a]" />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/20 via-transparent to-fuchsia-900/10" />
        
        {/* Decorative elements with animation */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-glow-pulse-subtle" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[128px] animate-glow-pulse-subtle" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Project Title - Large and Bold with animations */}
            <div className="text-center mb-16">
              <p className="animate-fade-in-up text-violet-400 text-sm uppercase tracking-[0.3em] mb-4 font-medium" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                Mobile Application
              </p>
              <h2 className="animate-fade-in-up text-6xl md:text-8xl lg:text-9xl font-bold font-heading tracking-tight" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <span className="bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
                  Reservo.AI
                </span>
              </h2>
              <p className="animate-fade-in-up text-gray-400 text-lg md:text-xl mt-6 max-w-2xl mx-auto font-body" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                AI-powered appointment booking platform with conversational interface
              </p>
            </div>

            {/* Phone Mockups - Hero Display with floating feature badges */}
            <div className="relative flex justify-center items-end gap-4 md:gap-8 pb-8">
              
              {/* Floating Badge - Top Left */}
              <div 
                className="animate-fade-in-up absolute -left-4 md:left-[5%] lg:left-[10%] top-[10%] z-20 hidden sm:block"
                style={{ animationDelay: '0.9s', animationFillMode: 'both' }}
              >
                <div className="animate-float-slow flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-violet-500/10">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <FaRobot className="text-sm text-violet-400" />
                  </div>
                  <span className="text-white text-sm font-medium">AI Assistant</span>
                </div>
              </div>

              {/* Floating Badge - Top Right */}
              <div 
                className="animate-fade-in-up absolute -right-4 md:right-[5%] lg:right-[10%] top-[15%] z-20 hidden sm:block"
                style={{ animationDelay: '1.1s', animationFillMode: 'both' }}
              >
                <div className="animate-float-delayed flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-fuchsia-500/10">
                  <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                    <FaCalendarCheck className="text-sm text-fuchsia-400" />
                  </div>
                  <span className="text-white text-sm font-medium">Smart Booking</span>
                </div>
              </div>

              {/* Floating Badge - Bottom Left */}
              <div 
                className="animate-fade-in-up absolute -left-4 md:left-[8%] lg:left-[12%] bottom-[25%] z-20 hidden sm:block"
                style={{ animationDelay: '1.3s', animationFillMode: 'both' }}
              >
                <div className="animate-float flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-cyan-500/10">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <FaBell className="text-sm text-cyan-400" />
                  </div>
                  <span className="text-white text-sm font-medium">Notifications</span>
                </div>
              </div>

              {/* Floating Badge - Bottom Right */}
              <div 
                className="animate-fade-in-up absolute -right-4 md:right-[8%] lg:right-[12%] bottom-[30%] z-20 hidden sm:block"
                style={{ animationDelay: '1.5s', animationFillMode: 'both' }}
              >
                <div className="animate-float-delayed flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-emerald-500/10">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <FaFingerprint className="text-sm text-emerald-400" />
                  </div>
                  <span className="text-white text-sm font-medium">Biometric</span>
                </div>
              </div>

              {/* Left Phone - Tilted */}
              <div 
                className="animate-fade-in-up relative w-36 md:w-52 lg:w-64 transform -rotate-6 translate-y-8 hidden sm:block"
                style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
              >
                <div className="relative animate-phone-float-delayed">
                  <div className="absolute -inset-2 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-[2rem] blur-xl opacity-60" />
                  <div className="relative bg-black rounded-[2rem] p-2 border border-white/10 shadow-2xl">
                    <div className="bg-[#111] rounded-[1.75rem] overflow-hidden aspect-[9/19.5]">
                      {/* Screenshot placeholder */}
                      <div className="w-full h-full bg-gradient-to-br from-violet-950/50 to-slate-950 flex items-center justify-center">
                        <div className="text-center p-3">
                          <FaCalendarCheck className="text-3xl md:text-4xl text-violet-500/40 mx-auto mb-2" />
                          <p className="text-violet-400/40 text-xs">Calendar View</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Phone - Main */}
              <div className="animate-fade-in-up relative w-52 md:w-72 lg:w-80 z-10" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                <div className="relative animate-phone-float">
                  <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/40 via-fuchsia-500/40 to-cyan-500/40 rounded-[3rem] blur-2xl" />
                  <div className="relative bg-black rounded-[3rem] p-3 border border-white/20 shadow-2xl shadow-violet-500/20">
                    {/* Notch */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
                    <div className="bg-[#111] rounded-[2.5rem] overflow-hidden aspect-[9/19.5]">
                      {/* Screenshot placeholder */}
                      <div className="w-full h-full bg-gradient-to-br from-violet-950/30 to-slate-950 flex items-center justify-center">
                        <div className="text-center p-4">
                          <FaMobileAlt className="text-5xl md:text-6xl text-violet-500/50 mx-auto mb-4" />
                          <p className="text-violet-300/60 text-sm font-medium">Main Screen</p>
                          <p className="text-violet-400/30 text-xs mt-1">Screenshot Coming Soon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Phone - Tilted */}
              <div 
                className="animate-fade-in-up relative w-36 md:w-52 lg:w-64 transform rotate-6 translate-y-8 hidden sm:block"
                style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
              >
                <div className="relative animate-phone-float-delayed-2">
                  <div className="absolute -inset-2 bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30 rounded-[2rem] blur-xl opacity-60" />
                  <div className="relative bg-black rounded-[2rem] p-2 border border-white/10 shadow-2xl">
                    <div className="bg-[#111] rounded-[1.75rem] overflow-hidden aspect-[9/19.5]">
                      {/* Screenshot placeholder */}
                      <div className="w-full h-full bg-gradient-to-br from-fuchsia-950/50 to-slate-950 flex items-center justify-center">
                        <div className="text-center p-3">
                          <FaComments className="text-3xl md:text-4xl text-fuchsia-500/40 mx-auto mb-2" />
                          <p className="text-fuchsia-400/40 text-xs">AI Chat</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-only feature badges (shown below phones on small screens) */}
              <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-3 sm:hidden">
                {[
                  { icon: FaRobot, label: 'AI', color: 'violet' },
                  { icon: FaCalendarCheck, label: 'Booking', color: 'fuchsia' },
                  { icon: FaBell, label: 'Alerts', color: 'cyan' },
                  { icon: FaFingerprint, label: 'Secure', color: 'emerald' },
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="animate-fade-in-up flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15]"
                    style={{ animationDelay: `${0.9 + index * 0.1}s`, animationFillMode: 'both' }}
                  >
                    <item.icon className={`text-xs text-${item.color}-400`} />
                    <span className="text-white text-xs font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section - Editorial Style */}
      <div className="relative py-24 bg-gradient-to-b from-[#0f0f2a] to-[#0a0a1a]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Main Description */}
            <div className="mb-16">
              <p className="animate-on-scroll text-2xl md:text-3xl lg:text-4xl text-white/90 font-light leading-relaxed font-body">
                Reservo.AI is a multiplatform <span className="text-violet-400 font-medium">Flutter application</span> designed 
                to revolutionize appointment booking. Powered by <span className="text-fuchsia-400 font-medium">Google Gemini</span>, 
                it enables conversational booking, intelligent suggestions, and personalized reminders.
              </p>
            </div>

            {/* Tech Stack - Clean centered line */}
            <div className="animate-on-scroll stagger-1 mb-16">
              <p className="text-gray-500 text-sm mb-4">
                Flutter · Firebase · Gemini AI · Riverpod · Rive
              </p>
              <p className="text-white/60 text-sm">
                iOS & Android · Booking App
              </p>
            </div>

            {/* Divider */}
            <div className="animate-on-scroll stagger-2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

            {/* Role Description */}
            <div className="animate-on-scroll stagger-3 mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">My Role</p>
              <p className="text-gray-300 text-lg leading-relaxed font-body max-w-2xl mx-auto">
                Full-stack development including UI/UX implementation, AI integration with Google Gemini, 
                real-time data synchronization with Firebase, and state management with Riverpod.
              </p>
            </div>

            {/* Key Capabilities - Centered */}
            <div className="animate-on-scroll stagger-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">Key Capabilities</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-gray-400">
                {[
                  'Real-time AI chat',
                  'Biometric authentication',
                  'Smart notifications',
                  'Cross-platform',
                  'Rive animations',
                  'Lottie animated onboarding'
                ].map((item, index) => (
                  <span key={index} className="flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-violet-500 group-hover:scale-150 transition-transform" />
                    <span className="group-hover:text-white transition-colors">{item}</span>
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Additional Screenshots Section */}
      <div className="relative py-24 bg-[#0a0a1a]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="animate-on-scroll text-2xl md:text-3xl font-bold text-white font-heading mb-2">
                App Screens
              </h3>
              <p className="animate-on-scroll stagger-1 text-gray-500 font-body">Key interfaces and user flows</p>
            </div>

            {/* Screenshots Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {['Home', 'AI Chat', 'Bookings', 'Profile'].map((screen, index) => (
                <div 
                  key={index} 
                  className={`animate-on-scroll stagger-${index + 2} group`}
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-black rounded-3xl p-2 border border-white/10 group-hover:border-violet-500/30 transition-colors hover-lift">
                      <div className="bg-[#111] rounded-[1.25rem] overflow-hidden aspect-[9/16]">
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                          <div className="text-center">
                            <FaMobileAlt className="text-2xl text-violet-500/30 mx-auto mb-2" />
                            <p className="text-violet-400/40 text-xs font-medium">{screen}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-gray-500 text-sm mt-3 font-body">{screen}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectReservo
