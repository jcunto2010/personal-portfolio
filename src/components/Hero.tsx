import React, { useState, useRef, useEffect } from 'react'
import { FaGithub, FaLinkedin, FaHandPointDown } from 'react-icons/fa'
import Pyramid3D from './Pyramid3D'

const Hero: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false)
  const [gradientPosition, setGradientPosition] = useState({ x: 50, y: 50 })
  const [showHand, setShowHand] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Cycle between mouse and hand icon every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHand(prev => !prev)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLHeadingElement>) => {
    if (!titleRef.current) return
    
    const rect = titleRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setGradientPosition({ x, y })
  }

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden"
    >
      {/* Floating 3D Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Real 3D Sphere - Top Left */}
        <div className="absolute top-24 left-20 animate-float-3d-slow">
          <div className="sphere-3d"></div>
        </div>

        {/* Real 3D Cube - Top Right */}
        <div className="absolute top-32 right-32 animate-float-3d" style={{ perspective: '1000px' }}>
          <div className="cube-3d">
            <div className="cube-face front"></div>
            <div className="cube-face back"></div>
            <div className="cube-face right"></div>
            <div className="cube-face left"></div>
            <div className="cube-face top"></div>
            <div className="cube-face bottom"></div>
          </div>
        </div>

        {/* Real 3D Pyramid using Three.js - Bottom Left */}
        <div className="absolute bottom-20 left-16 animate-float-3d-reverse">
          <Pyramid3D />
        </div>
        
        {/* Large Gradient Sphere */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
        
        {/* Medium Gradient Sphere */}
        <div className="absolute bottom-32 right-20 w-48 h-48 bg-gradient-to-br from-pink-500/20 to-cyan-500/20 rounded-full blur-2xl animate-float-delayed"></div>
        
        {/* Rotating Cube 1 */}
        <div className="absolute top-40 right-1/4 w-20 h-20 animate-float-rotate">
          <div className="w-full h-full bg-gradient-to-br from-blue-400/10 to-purple-600/10 backdrop-blur-sm border border-white/10 rounded-lg transform rotate-45"></div>
        </div>
        
        {/* Rotating Cube 2 */}
        <div className="absolute bottom-40 left-1/4 w-16 h-16 animate-float-rotate-reverse">
          <div className="w-full h-full bg-gradient-to-br from-pink-400/10 to-cyan-600/10 backdrop-blur-sm border border-white/10 rounded-lg transform rotate-12"></div>
        </div>
        
        {/* Triangle/Diamond Shape */}
        <div className="absolute top-1/2 left-20 w-24 h-24 animate-float-delayed">
          <div className="w-full h-full bg-gradient-to-br from-cyan-400/10 to-blue-600/10 backdrop-blur-sm border border-white/10 transform rotate-45 rounded-sm"></div>
        </div>
        
        {/* Small Floating Dots */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-purple-400/40 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Gradient Lines */}
        <div className="absolute top-0 left-1/4 w-px h-40 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-float-slow"></div>
        <div className="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-b from-transparent via-purple-400/20 to-transparent animate-float"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Greeting */}
          <div className="mb-6 animate-fade-in">
            <span className="text-primary-300 font-semibold text-lg">
              Hi, my name is
            </span>
          </div>

          {/* Name */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 font-heading">
            <span className="text-white inline-block">
              {'Jonathan Cunto Diaz'.split('').map((char, index) => (
                <span
                  key={index}
                  className="inline-block animate-name-entry"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both',
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </h1>

          {/* Title */}
          <div className="animate-fade-in-up">
            <h2 
              ref={titleRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-8 font-heading cursor-pointer transition-all duration-300 inline-block ${
                isHovering ? '' : 'animate-gradient-pulse'
              }`}
              style={{
                ...(isHovering
                  ? {
                      backgroundImage: `radial-gradient(circle 1000px at ${gradientPosition.x}% ${gradientPosition.y}%, #60a5fa, #a78bfa, #ec4899, #06b6d4, #60a5fa)`,
                    }
                  : {
                      backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa, #ec4899, #06b6d4, #60a5fa)',
                      backgroundSize: '200% 100%',
                    }),
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              } as React.CSSProperties}
            >
              Frontend Developer
            </h2>
          </div>

          {/* Description */}
          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up font-body">
            I create beautiful, responsive, and user-friendly web applications
            using modern technologies like React, TypeScript, and Tailwind CSS.
            Passionate about clean code and exceptional user experiences.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up">
            <button
              onClick={() => scrollToSection('#projects')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-purple-900 font-semibold rounded-lg hover:bg-primary-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View My Work
            </button>
            <button
              onClick={() => scrollToSection('#contact')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white/10 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Get In Touch
            </button>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center space-x-6 animate-fade-in-up">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-white transition-colors duration-300"
              aria-label="GitHub"
            >
              <FaGithub size={28} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-white transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={28} />
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer group"
        onClick={() => scrollToSection('#skills')}
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
          Scroll to discover more
        </p>
      </div>
    </section>
  )
}

export default Hero
