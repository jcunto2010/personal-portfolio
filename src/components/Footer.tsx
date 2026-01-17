import React from 'react'
import { FaGithub, FaLinkedin, FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import { HiArrowUp } from 'react-icons/hi'

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: FaGithub, href: 'https://github.com/jcunto2010', label: 'GitHub' },
    { icon: FaLinkedin, href: 'https://www.linkedin.com/in/jonathan-cuntodiaz-41149a1bb', label: 'LinkedIn' },
    { icon: FaWhatsapp, href: 'https://wa.me/584242572739', label: 'WhatsApp' },
    { icon: FaEnvelope, href: 'mailto:cnto.jnthn.97@gmail.com', label: 'Email' },
  ]

  return (
    <footer className="bg-black/60 backdrop-blur-xl text-white py-16 relative z-10 border-t border-white/5">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10">

          {/* Modular Block 1: Social Navigation */}
          <div className="flex items-center justify-center gap-8">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110"
                aria-label={social.label}
              >
                <social.icon size={26} />
              </a>
            ))}
          </div>

          {/* Modular Block 2: Copyright & Meta */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500 text-center font-body text-sm tracking-wide">
              &copy; {currentYear} Jonathan Cunto Diaz
            </p>
            <p className="text-gray-600 text-xs font-body uppercase tracking-[0.2em]">
              Built with Passion
            </p>
          </div>

          {/* Modular Block 3: Actions */}
          <div className="pt-4">
            <button
              onClick={scrollToTop}
              className="group flex flex-col items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 font-body"
              aria-label="Back to top"
            >
              <span className="text-xs uppercase tracking-[0.3em]">Back to top</span>
              <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center group-hover:border-white/30 transition-all">
                <HiArrowUp className="transform group-hover:-translate-y-1 transition-transform duration-500" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
