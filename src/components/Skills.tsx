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

  // Preload all skill icons
  const allIcons = skills.map(skill => skill.icon)

  return (
    <section ref={sectionRef} id="skills" className="py-20 bg-black/20 backdrop-blur-md relative z-10 animate-subtle-pulse overflow-hidden">
      {/* Hidden preload for icons */}
      <div className="hidden">
        {allIcons.map((Icon, i) => <Icon key={i} />)}
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
                  
                  {/* Infinite Carousel */}
                  <div className="relative overflow-hidden py-4">
                    <div className="flex justify-center">
                      <div className="flex animate-scroll-infinite-smooth" style={{ width: 'fit-content' }}>
                        {/* Skills Set */}
                        {categorySkills.map((skill, index) => (
                          <div
                            key={`${category}-${index}`}
                            className="flex-shrink-0 mx-3 group"
                            style={{ width: '200px' }}
                          >
                            <div className="flex flex-col items-center p-2 transition-all duration-300 cursor-pointer">
                              <skill.icon
                                className="text-6xl mb-2 text-gray-200 group-hover:text-white transition-all duration-300 group-hover:scale-125 transform"
                              />
                              <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-300 text-center font-body whitespace-nowrap">
                                {skill.name}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {/* Duplicate Set for Infinite Loop */}
                        {categorySkills.map((skill, index) => (
                          <div
                            key={`duplicate-${category}-${index}`}
                            className="flex-shrink-0 mx-3 group"
                            style={{ width: '200px' }}
                          >
                            <div className="flex flex-col items-center p-2 transition-all duration-300 cursor-pointer">
                              <skill.icon
                                className="text-6xl mb-2 text-gray-200 group-hover:text-white transition-all duration-300 group-hover:scale-125 transform"
                              />
                              <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-300 text-center font-body whitespace-nowrap">
                                {skill.name}
                              </span>
                            </div>
                          </div>
                        ))}
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
