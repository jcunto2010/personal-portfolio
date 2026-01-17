import React, { useEffect, useRef } from 'react'
import { experiences } from '../data/experience'

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

    const elements = ref.current?.querySelectorAll('.animate-on-scroll')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return ref
}

const Experience: React.FC = () => {
  const sectionRef = useScrollAnimation()

  const scrollToProject = (projectId: string) => {
    const element = document.getElementById(`project-${projectId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const getCompanyGradient = (company: string) => {
    if (company.toLowerCase().includes('reservo')) {
      return 'bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent'
    } else if (company.toLowerCase().includes('emprendia')) {
      return 'bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent'
    } else if (company.toLowerCase().includes('xmotics')) {
      return 'bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent'
    }
    return 'text-white'
  }

  return (
    <section id="experience" className="relative py-[clamp(5rem,15vh,10rem)] overflow-hidden" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />

      {/* Subtle gradient accents */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-[clamp(4rem,12vh,8rem)]">

          {/* Modular Block 1: Section Header */}
          <div className="flex flex-col items-start max-w-3xl">
            <p className="animate-on-scroll text-white/40 text-xs uppercase tracking-[0.3em] mb-6">
              Professional Journey
            </p>
            <h2 className="animate-on-scroll stagger-1 text-5xl md:text-7xl font-bold font-heading leading-tight">
              <span className="text-white">Where I've</span><br />
              <span className="text-white/40">made impact.</span>
            </h2>
          </div>

          {/* Modular Block 2: Experience Timeline Items */}
          <div className="flex flex-col gap-[clamp(3rem,10vh,6rem)]">
            {experiences.map((exp, index) => (
              <div
                key={exp.id}
                className={`animate-on-scroll stagger-${index + 2} flex flex-col gap-12 md:gap-16`}
              >
                {/* Individual Experience Container */}
                <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-start">

                  {/* Left Column: Context & Identity */}
                  <div className="md:col-span-5 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-white/20 uppercase tracking-widest px-3 py-1 border border-white/10 rounded-full">
                        {exp.period}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className={`text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight ${getCompanyGradient(exp.company)}`}>
                        {exp.company}
                      </h3>
                      <p className="text-xl md:text-2xl text-white/60 font-body">
                        {exp.role}
                      </p>
                    </div>

                    {/* View Project Action */}
                    {exp.project && (
                      <button
                        onClick={() => scrollToProject(exp.project!)}
                        className="group inline-flex items-center gap-4 text-sm text-white/40 hover:text-white transition-all duration-300 mt-4"
                      >
                        <span className="w-8 h-[1px] bg-white/20 group-hover:w-16 group-hover:bg-white/60 transition-all duration-500" />
                        <span className="uppercase tracking-[0.2em]">View Impact</span>
                      </button>
                    )}
                  </div>

                  {/* Right Column: Narrative & Stack */}
                  <div className="md:col-span-7 flex flex-col gap-8">
                    <p className="text-lg md:text-xl text-white/70 font-body leading-relaxed">
                      {exp.description}
                    </p>

                    {/* Tech List Container */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-sm text-white/30 font-body hover:text-white/60 transition-colors cursor-default"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Divider Block */}
                {index !== experiences.length - 1 && (
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Experience
