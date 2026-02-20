import React, { useState, useEffect } from 'react'
import { HiMenu, HiX } from 'react-icons/hi'
import { useDeveloperMode } from '../features/case-studies/context/DeveloperModeContext'

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { developerMode, setDeveloperMode } = useDeveloperMode()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ]

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/40 backdrop-blur-xl shadow-2xl py-4' : 'bg-black/20 backdrop-blur-md py-6'
        }`}
    >
      <nav className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#home')
            }}
            className="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity"
          >
            JCD
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              type="button"
              onClick={() => setDeveloperMode(!developerMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${developerMode ? 'bg-primary-500/30 text-primary-200 border border-primary-400/50' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:border-white/20'}`}
              aria-label="Toggle developer mode"
              title="Developer mode: show architecture & wireframes"
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              Dev
            </button>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(link.href)
                }}
                className="text-white hover:text-primary-300 transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-primary-300 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <button
              type="button"
              onClick={() => { setDeveloperMode(!developerMode); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mb-2 w-full ${developerMode ? 'bg-primary-500/30 text-primary-200' : 'bg-white/5 text-gray-400'}`}
            >
              <span className="w-2 h-2 rounded-full bg-current" /> Developer mode {developerMode ? 'ON' : 'OFF'}
            </button>
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(link.href)
                  }}
                  className="text-white hover:text-primary-300 transition-colors font-medium text-lg"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
