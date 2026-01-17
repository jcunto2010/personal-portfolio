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
    <section ref={sectionRef} id="skills" className="py-[clamp(5rem,15vh,10rem)] bg-black/20 backdrop-blur-md relative z-10 animate-subtle-pulse overflow-hidden">
      {/* Atmosphere Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-8 animate-float-3d-slow opacity-60">
          <div className="sphere-3d" style={{ width: '80px', height: '80px' }}></div>
        </div>
        <div className="absolute top-1/4 right-4 w-48 h-48 bg-gradient-to-br from-pink-500/10 to-cyan-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col gap-[clamp(4rem,10vh,6rem)]">

          {/* Modular Block 1: Section Header */}
          <div className="text-center flex flex-col gap-6">
            <h2 className="text-5xl md:text-7xl font-bold text-white font-heading tracking-tight">
              {isVisible && (
                <span className="inline-block">
                  {'Skills & Tech'.split('').map((char, index) => (
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
              {!isVisible && <span className="opacity-0">Skills & Tech</span>}
            </h2>

            <div className="max-w-2xl mx-auto">
              <p className={`text-xl md:text-2xl text-gray-300 font-body transition-all duration-1000 ${isVisible ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Technologies and tools I use to bring ideas to life
              </p>
            </div>
          </div>

          {/* Skills Carousels by Category Wrapper */}
          <div className="flex flex-col md:flex-row justify-evenly items-start gap-y-20 md:gap-y-0 md:gap-x-[clamp(1rem,2vw,4rem)] py-4 overflow-hidden">
            {categories.map((category, categoryIndex) => {
              const categorySkills = skills.filter((skill) => skill.category === category)
              return (
                <div
                  key={category}
                  className="w-full max-w-[340px] md:max-w-[240px] lg:max-w-[320px] xl:max-w-[350px] mx-auto flex flex-col items-center"
                >
                  <h3 className="text-xl md:text-base lg:text-xl xl:text-2xl font-semibold mb-12 md:mb-10 text-white font-heading text-center h-8 flex items-center justify-center">
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

                  {/* Orbital Circle Container */}
                  <div className="flex justify-center items-center w-full px-4 md:px-0">
                    <div
                      className="relative w-full aspect-square"
                      style={{
                        maxWidth: '100%'
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

                          // Dynamic Radius: Scales based on category container width
                          // We use a base radius that fits well within 240px-350px width
                          const radius = 105

                          // Calculate position on circle using trigonometry
                          const x = Math.sin(angle * Math.PI / 180) * radius
                          const y = -Math.cos(angle * Math.PI / 180) * radius

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
                                className={`animate-spin-reverse motion-reduce:animate-none group transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                                  }`}
                                style={{
                                  animationDuration: `${40 + categoryIndex * 10}s`,
                                  transitionDelay: `${(categoryIndex * 200) + (index * 100)}ms`
                                }}
                              >
                                <div className="flex flex-col items-center cursor-pointer">
                                  <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300">
                                    <Icon
                                      size={28}
                                      className="text-gray-200 lg:w-8 lg:h-8 xl:w-10 xl:h-10 group-hover:text-white transition-colors duration-300"
                                    />
                                  </div>
                                  <span className="text-[10px] lg:text-[11px] xl:text-xs font-medium text-gray-200 group-hover:text-white transition-colors duration-300 text-center font-body whitespace-nowrap">
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
                        <div className="absolute w-20 h-20 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-full cursor-pointer z-10" />

                        {/* Outer glow - expands on hover */}
                        <div className="absolute w-20 h-20 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-xl animate-pulse transition-all duration-300 group-hover/sun:w-28 lg:group-hover/sun:w-40 xl:group-hover/sun:w-44 group-hover/sun:h-28 lg:group-hover/sun:h-40 xl:group-hover/sun:h-44 group-hover/sun:from-purple-500/40 group-hover/sun:via-blue-500/40 group-hover/sun:to-cyan-500/40" />

                        {/* Middle glow ring - brightens on hover */}
                        <div className="absolute w-14 h-14 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full bg-gradient-to-r from-cyan-400/30 via-purple-400/30 to-pink-400/30 blur-md animate-spin-slow transition-all duration-300 group-hover/sun:w-20 lg:group-hover/sun:w-28 xl:group-hover/sun:w-32 group-hover/sun:h-20 lg:group-hover/sun:h-28 xl:group-hover/sun:h-32 group-hover/sun:from-cyan-400/50 group-hover/sun:via-purple-400/50 group-hover/sun:to-pink-400/50" style={{ animationDuration: '20s' }} />

                        {/* Inner sun core - glows brighter on hover */}
                        <div className="relative w-10 h-10 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full bg-gradient-to-br from-white/20 via-purple-300/30 to-blue-400/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg shadow-purple-500/20 transition-all duration-300 group-hover/sun:w-14 lg:group-hover/sun:w-18 xl:group-hover/sun:w-20 group-hover/sun:h-14 lg:group-hover/sun:h-18 xl:group-hover/sun:h-20 group-hover/sun:from-white/40 group-hover/sun:via-purple-300/50 group-hover/sun:to-blue-400/40 group-hover/sun:shadow-xl group-hover/sun:shadow-purple-500/40 group-hover/sun:border-white/40">
                          {/* Inner bright spot - intensifies on hover */}
                          <div className="absolute w-5 h-5 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-sm transition-all duration-300 group-hover/sun:w-7 lg:group-hover/sun:w-9 xl:group-hover/sun:w-10 group-hover/sun:h-7 lg:group-hover/sun:h-9 xl:group-hover/sun:h-10 group-hover/sun:from-white/70" style={{ top: '20%', left: '20%' }} />
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
