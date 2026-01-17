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
    <section id="contact" className="relative py-[clamp(5rem,15vh,10rem)] overflow-hidden animate-on-scroll" ref={sectionRef}>
      {/* Background and Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0a14] to-[#0f0a18] z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a18] via-transparent to-transparent z-0 opacity-60" />

      {/* Visual Orbs */}
      <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl animate-pulse z-0" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 -left-64 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse z-0" style={{ animationDuration: '10s', animationDelay: '2s' }} />

      <div className="container mx-auto px-6 lg:px-8 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col gap-[clamp(4rem,10vh,6rem)]">

          {/* Main Content Layout Grid */}
          <div className="grid lg:grid-cols-2 gap-[clamp(3rem,8vh,6rem)] items-start">

            {/* Modular Block 1: Direct Communication */}
            <div className="flex flex-col gap-10 relative">
              {/* Geometric Decoration */}
              <div className="absolute -top-12 -left-12 w-32 h-32 border border-white/5 transform rotate-45 hidden md:block" />

              <div className="flex flex-col gap-3">
                <span className="text-white/20 text-xs uppercase tracking-[0.4em]">Section 01</span>
                <h2 className="text-6xl md:text-8xl font-bold font-heading leading-none">
                  <span className="text-white">Get in</span><br />
                  <span className="text-white/40">Touch</span>
                </h2>
              </div>

              <div className="flex flex-col gap-8">
                <a
                  href="mailto:cnto.jnthn.97@gmail.com"
                  className="group flex flex-col gap-2 pl-8 border-l-2 border-white/5 hover:border-white/20 transition-all duration-500"
                >
                  <div className="text-white/30 text-xs uppercase tracking-widest">Email</div>
                  <div className="text-xl md:text-2xl text-white group-hover:translate-x-3 transition-transform duration-500 font-body">
                    cnto.jnthn.97@gmail.com
                  </div>
                </a>

                <a
                  href="https://wa.me/584242572739"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-2 pl-8 border-l-2 border-white/5 hover:border-white/20 transition-all duration-500"
                >
                  <div className="text-white/30 text-xs uppercase tracking-widest">WhatsApp</div>
                  <div className="text-xl md:text-2xl text-white group-hover:translate-x-3 transition-transform duration-500 font-body">
                    +58 424 257 2739
                  </div>
                </a>

                <div className="flex flex-col gap-2 pl-8 border-l-2 border-white/5">
                  <div className="text-white/30 text-xs uppercase tracking-widest">Location</div>
                  <div className="text-xl md:text-2xl text-white/70 font-body">
                    Caracas, Venezuela
                  </div>
                </div>
              </div>
            </div>

            {/* Modular Block 2: Professional Presence */}
            <div className="flex flex-col gap-10 relative">
              {/* Geometric Decoration */}
              <div className="absolute -bottom-12 -right-12 w-32 h-32 border border-white/5 transform rotate-12 hidden md:block" />

              <div className="flex flex-col gap-3">
                <span className="text-white/20 text-xs uppercase tracking-[0.4em]">Section 02</span>
                <h2 className="text-6xl md:text-8xl font-bold font-heading leading-none">
                  <span className="text-white/40">Connect</span><br />
                  <span className="text-white">Online</span>
                </h2>
              </div>

              <div className="flex flex-col gap-6">
                {[
                  { name: 'GitHub', href: 'https://github.com/jcunto2010', icon: FaGithub },
                  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/jonathan-cuntodiaz-41149a1bb', icon: FaLinkedin },
                  { name: 'WhatsApp', href: 'https://wa.me/584242572739', icon: FaWhatsapp }
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-6 p-1 text-white/50 hover:text-white transition-all duration-500"
                  >
                    <div className="w-14 h-14 border border-white/5 flex items-center justify-center group-hover:border-white/20 group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700 bg-white/0 hover:bg-white/[0.02]">
                      <social.icon size={22} />
                    </div>
                    <span className="text-xl font-body uppercase tracking-[0.1em]">{social.name}</span>
                    <span className="ml-auto text-white/10 group-hover:text-white group-hover:translate-x-2 transition-all duration-500 opacity-0 group-hover:opacity-100">
                      View Profile →
                    </span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
