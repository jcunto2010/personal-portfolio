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
    <footer className="bg-black/40 backdrop-blur-md text-white py-12 relative z-10 border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Social Links */}
          <div className="flex space-x-6 mb-8">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-300"
                aria-label={social.label}
              >
                <social.icon size={24} />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-gray-300 text-center mb-8 font-body">
            &copy; {currentYear} Jonathan Cunto Diaz. All rights reserved.
          </p>

          {/* Back to Top Button */}
          <button
            onClick={scrollToTop}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 group font-body"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <HiArrowUp className="group-hover:translate-y-[-4px] transition-transform duration-300" />
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
