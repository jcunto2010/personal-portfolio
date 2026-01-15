import React, { useState, useEffect } from 'react'
import { FaHandPointDown } from 'react-icons/fa'
import { ProjectReservo, ProjectEmprendIA, ProjectXmotics, ProjectStartupFlow } from './project-sections'

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
      {/* Section intro */}
      <section className="py-20 relative z-10 min-h-[60vh] flex flex-col justify-center">
        {/* Floating 3D Shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* 3D Sphere - Left */}
          <div className="absolute top-20 left-12 animate-float-3d-slow opacity-50">
            <div className="sphere-3d" style={{ width: '60px', height: '60px' }}></div>
          </div>
          
          {/* 3D Cube - Right */}
          <div className="absolute top-32 right-16 animate-float-3d opacity-50" style={{ perspective: '1000px' }}>
            <div className="cube-3d" style={{ width: '50px', height: '50px' }}>
              <div className="cube-face front" style={{ width: '50px', height: '50px', transform: 'rotateY(0deg) translateZ(25px)' }}></div>
              <div className="cube-face back" style={{ width: '50px', height: '50px', transform: 'rotateY(180deg) translateZ(25px)' }}></div>
              <div className="cube-face right" style={{ width: '50px', height: '50px', transform: 'rotateY(90deg) translateZ(25px)' }}></div>
              <div className="cube-face left" style={{ width: '50px', height: '50px', transform: 'rotateY(-90deg) translateZ(25px)' }}></div>
              <div className="cube-face top" style={{ width: '50px', height: '50px', transform: 'rotateX(90deg) translateZ(25px)' }}></div>
              <div className="cube-face bottom" style={{ width: '50px', height: '50px', transform: 'rotateX(-90deg) translateZ(25px)' }}></div>
            </div>
          </div>
          
          {/* Gradient Spheres */}
          <div className="absolute top-1/4 left-8 w-40 h-40 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-1/4 right-8 w-48 h-48 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-2xl animate-float-delayed"></div>
          
          {/* Rotating Diamonds */}
          <div className="absolute bottom-1/3 left-20 w-10 h-10 animate-float-rotate">
            <div className="w-full h-full bg-gradient-to-br from-pink-400/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-lg transform rotate-45"></div>
          </div>
          <div className="absolute top-1/3 right-24 w-12 h-12 animate-float-rotate-reverse">
            <div className="w-full h-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-lg transform rotate-12"></div>
          </div>
          
          {/* Small Floating Dots */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-400/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-pink-400/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Gradient Lines */}
          <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-purple-400/20 to-transparent animate-float-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-px h-40 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-float"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white font-heading">
              Featured{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Projects
              </span>
            </h2>
            <p className="text-xl text-gray-300 font-body">
              A deep dive into my most impactful work — from AI-powered applications 
              to industrial automation platforms
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer group"
          onClick={scrollToFirstProject}
        >
          {/* Icon Container with Transition */}
          <div className="animate-bounce relative w-10 h-10 flex items-center justify-center">
            {/* Mouse Icon */}
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                showHand ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
              }`}
            >
              <div className="w-6 h-10 border-2 border-white/70 group-hover:border-white rounded-full flex items-start justify-center p-2 transition-colors duration-300">
                <div className="w-1 h-3 bg-white/70 group-hover:bg-white rounded-full animate-scroll transition-colors duration-300"></div>
              </div>
            </div>
            
            {/* Hand Icon */}
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                showHand ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
            >
              <FaHandPointDown className="text-4xl text-white/70 group-hover:text-white transition-colors duration-300" />
            </div>
          </div>
          
          {/* Text */}
          <p className="text-sm text-white/70 group-hover:text-white transition-colors duration-300 font-body">
            Explore my work
          </p>
        </div>
      </section>

      {/* Individual Project Sections */}
      <div id="project-reservo">
        <ProjectReservo />
      </div>
      <ProjectEmprendIA />
      <ProjectStartupFlow />
      <ProjectXmotics />
    </div>
  )
}

export default Projects
