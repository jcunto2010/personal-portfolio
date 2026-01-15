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
    <section id="experience" className="relative py-32 overflow-hidden" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      
      {/* Subtle gradient accents */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header - Editorial Style */}
          <div className="mb-24">
            <p className="animate-on-scroll text-white/40 text-xs uppercase tracking-[0.3em] mb-4">
              Professional Journey
            </p>
            <h2 className="animate-on-scroll stagger-1 text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight">
              <span className="text-white">Where I've</span><br />
              <span className="text-white/40">made impact.</span>
            </h2>
          </div>

          {/* Experience Items - Bold Layout */}
          <div className="space-y-24">
            {experiences.map((exp, index) => (
              <div 
                key={exp.id} 
                className={`animate-on-scroll stagger-${index + 2}`}
              >
                {/* Main Content */}
                <div className="grid md:grid-cols-12 gap-8 md:gap-12">
                  
                  {/* Left: Company & Role - Company More Prominent */}
                  <div className="md:col-span-5">
                    {/* Timeframe - Smaller, less prominent */}
                    <div className="mb-4">
                      <span className="text-xs text-white/20 uppercase tracking-wider">
                        {exp.period}
                      </span>
                    </div>
                    
                    <h3 className={`text-5xl md:text-6xl lg:text-7xl font-bold font-heading mb-3 leading-tight ${getCompanyGradient(exp.company)}`}>
                      {exp.company}
                    </h3>
                    <p className="text-xl md:text-2xl text-white/60 font-body mb-6">
                      {exp.role}
                    </p>
                    
                    {/* Link to project */}
                    {exp.project && (
                      <button
                        onClick={() => scrollToProject(exp.project!)}
                        className="group inline-flex items-center gap-3 text-sm text-white/40 hover:text-white transition-colors"
                      >
                        <span className="w-8 h-px bg-white/20 group-hover:w-12 group-hover:bg-white/40 transition-all" />
                        <span className="uppercase tracking-wider">View Project</span>
                      </button>
                    )}
                  </div>

                  {/* Right: Description & Tech */}
                  <div className="md:col-span-7">
                    <p className="text-lg md:text-xl text-white/70 font-body leading-relaxed mb-8">
                      {exp.description}
                    </p>
                    
                    {/* Technologies - Minimal pills */}
                    <div className="flex flex-wrap gap-3">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-sm text-white/40 font-body"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Divider */}
                {index !== experiences.length - 1 && (
                  <div className="mt-24 w-full h-px bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
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
