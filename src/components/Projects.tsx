import React from 'react'
import { ProjectReservo, ProjectEmprendIA, ProjectXmotics } from './project-sections'

const Projects: React.FC = () => {
  return (
    <div id="projects">
      {/* Section intro */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
      </section>

      {/* Individual Project Sections */}
      <ProjectReservo />
      <ProjectEmprendIA />
      <ProjectXmotics />
    </div>
  )
}

export default Projects
