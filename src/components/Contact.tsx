import React, { useEffect, useRef } from 'react'
import { FaGithub, FaLinkedin, FaWhatsapp } from 'react-icons/fa'

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

    // Use setTimeout to ensure DOM is ready
    const timeoutId = window.setTimeout(() => {
      if (ref.current) {
        // Check if the ref element itself has the animate-on-scroll class
        if (ref.current.classList.contains('animate-on-scroll')) {
          const rect = ref.current.getBoundingClientRect()
          const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
          if (isInViewport) {
            ref.current.classList.add('is-visible')
          }
          observer.observe(ref.current)
        }
        
        // Also observe all descendant elements with animate-on-scroll
        const elements = ref.current.querySelectorAll('.animate-on-scroll')
        elements.forEach((el) => {
          // Check if element is already in viewport
          const rect = el.getBoundingClientRect()
          const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
          if (isInViewport) {
            el.classList.add('is-visible')
          }
          observer.observe(el)
        })
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [])

  return ref
}

const Contact: React.FC = () => {
  const sectionRef = useScrollAnimation()

  return (
    <section id="contact" className="relative py-32 overflow-hidden animate-on-scroll" ref={sectionRef}>
      {/* Background with visible gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0a14] to-[#0f0a18] z-0" />
      
      {/* Additional gradient layers for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a18] via-transparent to-transparent z-0 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0a0a12]/50 to-transparent z-0" />
      
      {/* Gradient orbs - more visible */}
      <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl animate-pulse z-0" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 -left-64 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse z-0" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-6xl mx-auto">
          
          {/* Diagonal Split Layout */}
          <div className="relative">
            {/* Diagonal divider line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 transform -translate-x-1/2 hidden lg:block" 
                 style={{ transform: 'translateX(-50%) rotate(15deg)' }} />
            
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
              
              {/* Left Side - Contact Info */}
              <div className="relative">
                {/* Geometric accent */}
                <div className="absolute -top-8 -left-8 w-32 h-32 border border-white/5 transform rotate-45 hidden md:block" />
                
                <div className="mb-8">
                  <span className="text-white/20 text-xs uppercase tracking-[0.3em]">01</span>
                  <h2 className="text-6xl md:text-7xl font-bold font-heading leading-none mt-2 mb-6">
                    <span className="text-white">Get in</span><br />
                    <span className="text-white/40">Touch</span>
                  </h2>
                </div>

                <div className="space-y-8">
                  <a
                    href="mailto:cnto.jnthn.97@gmail.com"
                    className="group block relative pl-8 border-l-2 border-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/20 group-hover:w-1 transition-all duration-300" />
                    <div className="text-white/30 text-xs uppercase tracking-widest mb-2">Email</div>
                    <div className="text-xl text-white group-hover:translate-x-2 transition-transform duration-300">
                      cnto.jnthn.97@gmail.com
                    </div>
                  </a>

                  <a
                    href="https://wa.me/584242572739"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block relative pl-8 border-l-2 border-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/20 group-hover:w-1 transition-all duration-300" />
                    <div className="text-white/30 text-xs uppercase tracking-widest mb-2">Phone</div>
                    <div className="text-xl text-white group-hover:translate-x-2 transition-transform duration-300">
                      +58 424 257 2739
                    </div>
                  </a>

                  <div className="relative pl-8 border-l-2 border-white/10">
                    <div className="text-white/30 text-xs uppercase tracking-widest mb-2">Location</div>
                    <div className="text-xl text-white/70">
                      Caracas, Venezuela
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Social & CTA */}
              <div className="relative">
                {/* Geometric accent */}
                <div className="absolute -bottom-8 -right-8 w-24 h-24 border border-white/5 transform -rotate-45 hidden md:block" />
                
                <div className="mb-8">
                  <span className="text-white/20 text-xs uppercase tracking-[0.3em]">02</span>
                  <h2 className="text-6xl md:text-7xl font-bold font-heading leading-none mt-2 mb-6">
                    <span className="text-white/40">Connect</span><br />
                    <span className="text-white">Online</span>
                  </h2>
                </div>

                <div className="space-y-6">
                  <a
                    href="https://github.com/jcunto2010"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 text-white/60 hover:text-white transition-all duration-300"
                  >
                    <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:rotate-[360deg] transition-all duration-500">
                      <FaGithub size={20} />
                    </div>
                    <span className="text-lg">GitHub</span>
                    <span className="ml-auto text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all">→</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/jonathan-cuntodiaz-41149a1bb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 text-white/60 hover:text-white transition-all duration-300"
                  >
                    <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:rotate-[360deg] transition-all duration-500">
                      <FaLinkedin size={20} />
                    </div>
                    <span className="text-lg">LinkedIn</span>
                    <span className="ml-auto text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all">→</span>
                  </a>

                  <a
                    href="https://wa.me/584242572739"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 text-white/60 hover:text-white transition-all duration-300"
                  >
                    <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:rotate-[360deg] transition-all duration-500">
                      <FaWhatsapp size={20} />
                    </div>
                    <span className="text-lg">WhatsApp</span>
                    <span className="ml-auto text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all">→</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </section>
  )
}

export default Contact
