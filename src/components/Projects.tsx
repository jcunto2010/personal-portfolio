import React, { useState, useEffect } from 'react'
import { FaHandPointDown } from 'react-icons/fa'
import { ProjectReservo, ProjectStartupFlow } from './project-sections'

const Projects: React.FC = () => {
  const [showHand, setShowHand] = useState(false)

  // Cycle between mouse and hand icon every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHand(prev => !prev)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const scrollToFirstProject = () => {
    const element = document.querySelector('#project-reservo')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div id="projects">
      {/* Section intro - Modular Container */}
      <section className="py-[clamp(5rem,15vh,10rem)] relative z-10 min-h-[60vh] flex flex-col justify-center overflow-hidden">
        {/* Atmosphere Layer */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-8 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-8 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col gap-8 md:gap-10">
            {/* Modular Title Block */}
            <div className="flex flex-col gap-4">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white font-heading tracking-tight">
                Featured{' '}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Projects
                </span>
              </h2>
            </div>

            {/* Modular Description Block */}
            <div className="max-w-2xl mx-auto">
              <p className="text-xl md:text-2xl text-gray-300 font-body leading-relaxed opacity-80">
                A deep dive into my most impactful work — from AI-powered applications
                to industrial automation platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator Block */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4 cursor-pointer group z-20"
          onClick={scrollToFirstProject}
          role="button"
          aria-label="Explore my work"
        >
          <div className="animate-bounce relative w-12 h-12 flex items-center justify-center">
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${showHand ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
              <div className="w-7 h-11 border-2 border-white/40 group-hover:border-white rounded-full flex items-start justify-center p-2">
                <div className="w-1 h-3 bg-white/40 group-hover:bg-white rounded-full animate-scroll"></div>
              </div>
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${showHand ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
              <FaHandPointDown className="text-4xl text-white/40 group-hover:text-white" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors font-body">
            Explore my work
          </p>
        </div>
      </section>

      <div id="project-reservo">
        <ProjectReservo />
      </div>
      <ProjectStartupFlow />
    </div>
  )
}

export default Projects
