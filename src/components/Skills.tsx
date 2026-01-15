import React, { useState, useEffect, useRef } from 'react'
import { skills, skillCategories } from '../data/skills'

const Skills: React.FC = () => {
  const categories: Array<'language' | 'framework' | 'tool'> = ['language', 'framework', 'tool']
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="skills" className="py-20 bg-black/20 backdrop-blur-md relative z-10 animate-subtle-pulse overflow-hidden">
      {/* Floating 3D Shapes - Left Side */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 3D Sphere - Top Left */}
        <div className="absolute top-20 left-8 animate-float-3d-slow opacity-60">
          <div className="sphere-3d" style={{ width: '80px', height: '80px' }}></div>
        </div>
        
        {/* 3D Cube - Middle Left */}
        <div className="absolute top-1/3 left-12 animate-float-3d" style={{ perspective: '1000px' }}>
          <div className="cube-3d" style={{ width: '60px', height: '60px' }}>
            <div className="cube-face front" style={{ width: '60px', height: '60px', transform: 'rotateY(0deg) translateZ(30px)' }}></div>
            <div className="cube-face back" style={{ width: '60px', height: '60px', transform: 'rotateY(180deg) translateZ(30px)' }}></div>
            <div className="cube-face right" style={{ width: '60px', height: '60px', transform: 'rotateY(90deg) translateZ(30px)' }}></div>
            <div className="cube-face left" style={{ width: '60px', height: '60px', transform: 'rotateY(-90deg) translateZ(30px)' }}></div>
            <div className="cube-face top" style={{ width: '60px', height: '60px', transform: 'rotateX(90deg) translateZ(30px)' }}></div>
            <div className="cube-face bottom" style={{ width: '60px', height: '60px', transform: 'rotateX(-90deg) translateZ(30px)' }}></div>
          </div>
        </div>
        
        {/* Gradient Sphere - Bottom Left */}
        <div className="absolute bottom-1/4 left-4 w-40 h-40 bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-full blur-2xl animate-float"></div>
        
        {/* Rotating Diamond - Left */}
        <div className="absolute bottom-1/3 left-16 w-12 h-12 animate-float-rotate">
          <div className="w-full h-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-lg transform rotate-45"></div>
        </div>

        {/* 3D Shapes - Right Side */}
        {/* 3D Sphere - Top Right */}
        <div className="absolute top-32 right-10 animate-float-3d opacity-60">
          <div className="sphere-3d" style={{ width: '70px', height: '70px' }}></div>
        </div>
        
        {/* 3D Cube - Middle Right */}
        <div className="absolute top-1/2 right-8 animate-float-3d-reverse" style={{ perspective: '1000px' }}>
          <div className="cube-3d" style={{ width: '50px', height: '50px' }}>
            <div className="cube-face front" style={{ width: '50px', height: '50px', transform: 'rotateY(0deg) translateZ(25px)' }}></div>
            <div className="cube-face back" style={{ width: '50px', height: '50px', transform: 'rotateY(180deg) translateZ(25px)' }}></div>
            <div className="cube-face right" style={{ width: '50px', height: '50px', transform: 'rotateY(90deg) translateZ(25px)' }}></div>
            <div className="cube-face left" style={{ width: '50px', height: '50px', transform: 'rotateY(-90deg) translateZ(25px)' }}></div>
            <div className="cube-face top" style={{ width: '50px', height: '50px', transform: 'rotateX(90deg) translateZ(25px)' }}></div>
            <div className="cube-face bottom" style={{ width: '50px', height: '50px', transform: 'rotateX(-90deg) translateZ(25px)' }}></div>
          </div>
        </div>
        
        {/* Gradient Sphere - Right */}
        <div className="absolute top-1/4 right-4 w-48 h-48 bg-gradient-to-br from-pink-500/15 to-cyan-500/15 rounded-full blur-2xl animate-float-delayed"></div>
        
        {/* Rotating Square - Bottom Right */}
        <div className="absolute bottom-20 right-16 w-14 h-14 animate-float-rotate-reverse">
          <div className="w-full h-full bg-gradient-to-br from-purple-400/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-lg transform rotate-12"></div>
        </div>
        
        {/* Small Floating Dots */}
        <div className="absolute top-1/4 left-24 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-24 w-3 h-3 bg-blue-400/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-32 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-28 w-2 h-2 bg-cyan-400/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Gradient Lines */}
        <div className="absolute top-0 left-20 w-px h-32 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-float-slow"></div>
        <div className="absolute bottom-0 right-24 w-px h-40 bg-gradient-to-b from-transparent via-purple-400/20 to-transparent animate-float"></div>
        <div className="absolute top-1/3 right-12 w-px h-24 bg-gradient-to-b from-transparent via-pink-400/15 to-transparent animate-float-delayed"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-10 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full animate-float-particle"></div>
      <div className="absolute top-20 right-1/3 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-float-particle" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-pink-400/30 rounded-full animate-float-particle" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-cyan-400/30 rounded-full animate-float-particle" style={{ animationDelay: '6s' }}></div>
      <div className="absolute bottom-10 right-1/2 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-float-particle" style={{ animationDelay: '3s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white font-heading">
              {isVisible && (
                <span className="inline-block">
                  {'Skills & Technologies'.split('').map((char, index) => (
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
              )}
              {!isVisible && <span className="opacity-0">Skills & Technologies</span>}
            </h2>
            <p 
              className={`text-xl text-gray-200 max-w-2xl mx-auto font-body transition-all duration-1000 ${
                isVisible ? 'animate-subtitle-entry' : 'opacity-0 translate-y-4'
              }`}
            >
              Technologies and tools I use to bring ideas to life
            </p>
          </div>

          {/* Skills Carousels by Category */}
          <div className="space-y-16">
            {categories.map((category, categoryIndex) => {
              const categorySkills = skills.filter((skill) => skill.category === category)
              return (
                <div key={category}>
                  <h3 className="text-2xl font-semibold mb-8 text-white font-heading text-center">
                    {isVisible && (
                      <span className="inline-block animate-bounce-periodic" style={{ animationDelay: `${categoryIndex * 0.5}s` }}>
                        {skillCategories[category].split('').map((char, index) => (
                          <span
                            key={index}
                            className="inline-block animate-name-entry"
                            style={{
                              animationDelay: `${(categoryIndex * 0.3) + (index * 0.03)}s`,
                              animationFillMode: 'both',
                            }}
                          >
                            {char === ' ' ? '\u00A0' : char}
                          </span>
                        ))}
                      </span>
                    )}
                    {!isVisible && <span className="opacity-0">{skillCategories[category]}</span>}
                  </h3>
                  
                  {/* Orbital Circle */}
                  <div className="flex justify-center items-center">
                    <div 
                      className="relative mx-auto w-full max-w-[400px] aspect-square"
                      style={{ 
                        width: 'min(400px, 100%)',
                        height: 'min(400px, 100%)'
                      }}
                    >
                      {/* Orbiting icons container */}
                      <div 
                        className="absolute inset-0 animate-spin-slow motion-reduce:animate-none"
                        style={{ 
                          animationDuration: `${40 + categoryIndex * 10}s`
                        }}
                      >
                        {categorySkills.map((skill, index) => {
                          const Icon = skill.icon
                          const totalItems = categorySkills.length
                          const angle = (360 / totalItems) * index
                          // Responsive radius: scale with container size (150px base, scales down on mobile)
                          // Use CSS calc or a percentage-based approach for better responsiveness
                          const radius = 150
                          
                          // Calculate position on circle using trigonometry
                          const x = Math.cos((angle - 90) * Math.PI / 180) * radius
                          const y = Math.sin((angle - 90) * Math.PI / 180) * radius
                          
                          return (
                            <div
                              key={`${category}-${index}`}
                              className="absolute"
                              style={{
                                left: '50%',
                                top: '50%',
                                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                              }}
                            >
                              {/* Counter-rotate to keep icon upright */}
                              <div 
                                className={`animate-spin-reverse motion-reduce:animate-none group transition-all duration-500 ${
                                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                                }`}
                                style={{ 
                                  animationDuration: `${40 + categoryIndex * 10}s`,
                                  transitionDelay: `${(categoryIndex * 200) + (index * 100)}ms`
                                }}
                              >
                                <div className="flex flex-col items-center cursor-pointer">
                                  <div className="w-14 h-14 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300">
                                    <Icon
                                      size={40}
                                      className="text-gray-200 group-hover:text-white transition-colors duration-300"
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors duration-300 text-center font-body whitespace-nowrap">
                                    {skill.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Center Sun - Interactive */}
                      <div className="absolute inset-0 flex items-center justify-center group/sun">
                        {/* Hover target area */}
                        <div className="absolute w-32 h-32 rounded-full cursor-pointer z-10" />
                        
                        {/* Outer glow - expands on hover */}
                        <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-xl animate-pulse transition-all duration-300 group-hover/sun:w-44 group-hover/sun:h-44 group-hover/sun:from-purple-500/40 group-hover/sun:via-blue-500/40 group-hover/sun:to-cyan-500/40" />
                        
                        {/* Middle glow ring - brightens on hover */}
                        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400/30 via-purple-400/30 to-pink-400/30 blur-md animate-spin-slow transition-all duration-300 group-hover/sun:w-32 group-hover/sun:h-32 group-hover/sun:from-cyan-400/50 group-hover/sun:via-purple-400/50 group-hover/sun:to-pink-400/50" style={{ animationDuration: '20s' }} />
                        
                        {/* Inner sun core - glows brighter on hover */}
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-white/20 via-purple-300/30 to-blue-400/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg shadow-purple-500/20 transition-all duration-300 group-hover/sun:w-20 group-hover/sun:h-20 group-hover/sun:from-white/40 group-hover/sun:via-purple-300/50 group-hover/sun:to-blue-400/40 group-hover/sun:shadow-xl group-hover/sun:shadow-purple-500/40 group-hover/sun:border-white/40">
                          {/* Inner bright spot - intensifies on hover */}
                          <div className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-sm transition-all duration-300 group-hover/sun:w-10 group-hover/sun:h-10 group-hover/sun:from-white/70" style={{ top: '20%', left: '20%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Skills
