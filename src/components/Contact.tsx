import React, { useState, useEffect, useRef } from 'react'
import { FaGithub, FaLinkedin, FaArrowRight, FaWhatsapp } from 'react-icons/fa'
import { HiMail } from 'react-icons/hi'

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const elements = ref.current?.querySelectorAll('.animate-on-scroll')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return ref
}

const Contact: React.FC = () => {
  const sectionRef = useScrollAnimation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setIsSubmitting(false)
    
    // Reset after showing success
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', message: '' })
    }, 3000)
  }

  return (
    <section id="contact" className="relative py-32 overflow-hidden" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] to-[#0f0a15]" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-64 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Main Content - Two Column */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Left: Big Typography & Info */}
            <div>
              {/* Header */}
              <div className="mb-16">
                <p className="animate-on-scroll text-white/40 text-xs uppercase tracking-[0.3em] mb-4">
                  Get in Touch
                </p>
                <h2 className="animate-on-scroll stagger-1 text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-[0.9]">
                  <span className="text-white">Let's build</span><br />
                  <span className="text-white/40">something</span><br />
                  <span className="text-white">together.</span>
                </h2>
              </div>

              {/* Contact Info - Minimal */}
              <div className="animate-on-scroll stagger-2 space-y-8">
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Email</p>
                  <a 
                    href="mailto:cnto.jnthn.97@gmail.com" 
                    className="text-xl md:text-2xl text-white hover:text-white/70 transition-colors font-body"
                  >
                    cnto.jnthn.97@gmail.com
                  </a>
                </div>

                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Phone</p>
                  <a 
                    href="https://wa.me/584242572739"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl md:text-2xl text-white hover:text-white/70 transition-colors font-body"
                  >
                    +58 424 257 2739
                  </a>
                </div>

                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Based in</p>
                  <p className="text-xl md:text-2xl text-white/70 font-body">
                    Caracas, Venezuela
                  </p>
                </div>

                {/* Social Links - Clean */}
                <div className="pt-8">
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Connect</p>
                  <div className="flex gap-6">
                    <a
                      href="https://github.com/jcunto2010"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors"
                    >
                      <FaGithub size={20} />
                      <span className="text-sm">GitHub</span>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/jonathan-cuntodiaz-41149a1bb"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors"
                    >
                      <FaLinkedin size={20} />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                    <a
                      href="https://wa.me/584242572739"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors"
                    >
                      <FaWhatsapp size={20} />
                      <span className="text-sm">WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form - Clean Design */}
            <div className="animate-on-scroll stagger-3">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-white/30 text-xs uppercase tracking-widest mb-3">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-white text-lg focus:outline-none focus:border-white/50 transition-colors placeholder-white/20 font-body"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-white/30 text-xs uppercase tracking-widest mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-white text-lg focus:outline-none focus:border-white/50 transition-colors placeholder-white/20 font-body"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-white/30 text-xs uppercase tracking-widest mb-3">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-white text-lg focus:outline-none focus:border-white/50 transition-colors resize-none placeholder-white/20 font-body"
                    placeholder="Tell me about your project..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || submitted}
                    className="group relative inline-flex items-center gap-4 text-white"
                  >
                    {submitted ? (
                      <>
                        <span className="text-lg font-medium">Message Sent</span>
                        <span className="text-emerald-400">✓</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-medium">
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                        </span>
                        <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                          <FaArrowRight className={isSubmitting ? 'animate-pulse' : 'group-hover:translate-x-1 transition-transform'} />
                        </span>
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* Quick Contact Option */}
              <div className="mt-16 pt-8 border-t border-white/10">
                <p className="text-white/30 text-sm mb-4">Prefer email?</p>
                <a 
                  href="mailto:cnto.jnthn.97@gmail.com"
                  className="inline-flex items-center gap-3 text-white/60 hover:text-white transition-colors"
                >
                  <HiMail size={18} />
                  <span className="text-sm">cnto.jnthn.97@gmail.com</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>

    </section>
  )
}

export default Contact
