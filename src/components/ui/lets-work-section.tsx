import { useState, type FormEvent, type MouseEvent } from 'react'
import { ArrowLeft, ArrowUpRight, Calendar, Github, Linkedin, Mail } from 'lucide-react'

interface LetsWorkTogetherCopy {
  successLabel: string
  successTitle: string
  bookCallLabel: string
  discussLabel: string
  githubLabel: string
  linkedinLabel: string
  headingLine1: string
  headingLine2: string
  description: string
  formTitle: string
  nameLabel: string
  emailLabel: string
  messageLabel: string
  sendLabel: string
  sendingLabel: string
  formSuccessLabel: string
  formErrorLabel: string
}

interface LetsWorkTogetherProps {
  copy?: LetsWorkTogetherCopy
  onBookCall?: () => void
  bookCallHref?: string
  githubHref?: string
  linkedinHref?: string
  locale?: 'en' | 'es'
}

const defaultCopy: LetsWorkTogetherCopy = {
  successLabel: 'Perfect',
  successTitle: "Let's talk",
  bookCallLabel: 'Book a call',
  discussLabel: "Let's discuss",
  githubLabel: 'GitHub',
  linkedinLabel: 'LinkedIn',
  headingLine1: "Let's work",
  headingLine2: 'together',
  description:
    "Have a project in mind? I'd love to hear about it. Let's create something exceptional together.",
  formTitle: 'Tell me about your project',
  nameLabel: 'Name',
  emailLabel: 'Email',
  messageLabel: 'Message',
  sendLabel: 'Send message',
  sendingLabel: 'Sending...',
  formSuccessLabel: 'Message sent. I will get back to you soon.',
  formErrorLabel: 'Something went wrong. Please try again.',
}

export function LetsWorkTogether({
  copy = defaultCopy,
  onBookCall,
  bookCallHref = 'https://calendly.com/cnto-jnthn-97/30min',
  githubHref = 'https://github.com/jcunto2010',
  linkedinHref = 'https://www.linkedin.com/in/jonathan-cuntodiaz-41149a1bb',
  locale = 'en',
}: LetsWorkTogetherProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    company: '',
  })

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setIsClicked(true)

    setTimeout(() => {
      setShowSuccess(true)
    }, 500)
  }

  const handleBookCall = () => {
    if (onBookCall) {
      onBookCall()
      return
    }
    window.open(bookCallHref, '_blank')
  }

  const openHref = (href?: string) => {
    if (!href) return
    window.open(href, '_blank')
  }

  const handleDiscuss = () => {
    setShowContactForm(true)
    setFormStatus('idle')
  }

  const handleBack = () => {
    setShowSuccess(false)
    setIsClicked(false)
    setHoveredAction(null)
    setShowContactForm(false)
    setFormStatus('idle')
  }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormStatus('submitting')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, locale }),
      })

      if (!response.ok) throw new Error('Contact request failed')

      setFormStatus('success')
      setFormData({ name: '', email: '', message: '', company: '' })
    } catch {
      setFormStatus('error')
    }
  }

  return (
    <section
      className="flex min-h-screen items-center justify-center px-6 bg-transparent"
      style={{
        background: 'transparent',
        fontFamily: "var(--v2-font-body, 'Proxima Nova', 'Inter', 'Arial', sans-serif)",
      }}
    >
      <div className="relative flex flex-col items-center gap-12">
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: showSuccess ? 1 : 0,
            transform: showSuccess ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            pointerEvents: showSuccess ? 'auto' : 'none',
          }}
        >
          <button
            type="button"
            onClick={handleBack}
            aria-label="Regresar"
            className="absolute -top-3 -left-3 flex size-11 items-center justify-center rounded-full border border-white/85 bg-white text-[#070B1A] transition-all duration-300 hover:bg-[#070B1A] hover:text-white sm:size-12"
          >
            <ArrowLeft className="size-5 sm:size-6" strokeWidth={1.8} />
          </button>

          <div className="flex flex-col items-center gap-2">
            <span
              className="text-xs min-[1440px]:text-sm font-medium tracking-[0.3em] uppercase text-white/70 transition-all duration-500"
              style={{
                transform: showSuccess ? 'translateY(0)' : 'translateY(10px)',
                opacity: showSuccess ? 1 : 0,
                transitionDelay: '100ms',
              }}
            >
              {copy.successLabel}
            </span>
            <h3
              className="text-3xl min-[1440px]:text-5xl font-light tracking-tight text-white transition-all duration-500 sm:text-4xl"
              style={{
                transform: showSuccess ? 'translateY(0)' : 'translateY(10px)',
                opacity: showSuccess ? 1 : 0,
                transitionDelay: '200ms',
              }}
            >
              {copy.successTitle}
            </h3>
          </div>

          {showContactForm ? (
            <form
              onSubmit={handleFormSubmit}
              className="flex w-[min(92vw,28rem)] flex-col gap-3 transition-all duration-500"
              style={{
                opacity: showSuccess ? 1 : 0,
                transform: showSuccess ? 'translateY(0)' : 'translateY(15px)',
                transitionDelay: '150ms',
              }}
            >
              <p className="text-center text-sm font-medium tracking-wide text-white/80">
                {copy.formTitle}
              </p>
              <input
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                className="rounded-2xl border-0 bg-white px-5 py-3 text-sm text-[#070B1A] outline-none placeholder:text-[#070B1A]/45"
                placeholder={copy.nameLabel}
                minLength={2}
                maxLength={120}
                required
              />
              <input
                value={formData.email}
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                className="rounded-2xl border-0 bg-white px-5 py-3 text-sm text-[#070B1A] outline-none placeholder:text-[#070B1A]/45"
                placeholder={copy.emailLabel}
                type="email"
                maxLength={160}
                required
              />
              <textarea
                value={formData.message}
                onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))}
                className="min-h-32 resize-none rounded-2xl border-0 bg-white px-5 py-3 text-sm text-[#070B1A] outline-none placeholder:text-[#070B1A]/45"
                placeholder={copy.messageLabel}
                minLength={10}
                maxLength={2000}
                required
              />
              <input
                value={formData.company}
                onChange={(event) => setFormData((current) => ({ ...current, company: event.target.value }))}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#070B1A] transition-colors duration-300 hover:bg-[#070B1A] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {formStatus === 'submitting' ? copy.sendingLabel : copy.sendLabel}
              </button>
              {formStatus === 'success' ? (
                <p className="text-center text-xs text-emerald-200">{copy.formSuccessLabel}</p>
              ) : null}
              {formStatus === 'error' ? (
                <p className="text-center text-xs text-red-200">{copy.formErrorLabel}</p>
              ) : null}
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4">
            {[
              {
                id: 'book',
                label: copy.bookCallLabel,
                icon: Calendar,
                onClick: handleBookCall,
              },
              {
                id: 'discuss',
                label: copy.discussLabel,
                icon: Mail,
                onClick: handleDiscuss,
              },
              {
                id: 'github',
                label: copy.githubLabel,
                icon: Github,
                onClick: () => openHref(githubHref),
              },
              {
                id: 'linkedin',
                label: copy.linkedinLabel,
                icon: Linkedin,
                onClick: () => openHref(linkedinHref),
              },
            ].map((action, idx) => {
              const isButtonHovered = hoveredAction === action.id
              const Icon = action.icon

              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  onMouseEnter={() => setHoveredAction(action.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                  className="group relative flex items-center gap-4 transition-all duration-500 cursor-pointer appearance-none border-0 bg-transparent p-0"
                  style={{
                    transform: showSuccess
                      ? isButtonHovered
                        ? 'translateY(0) scale(1.02)'
                        : 'translateY(0) scale(1)'
                      : 'translateY(15px) scale(1)',
                    opacity: showSuccess ? 1 : 0,
                    transitionDelay: `${150 + idx * 70}ms`,
                    backgroundColor: 'transparent',
                  }}
                >
                  <div
                    className="h-px w-8 bg-border transition-all duration-500 sm:w-12"
                    style={{
                      transform: isButtonHovered ? 'scaleX(0)' : 'scaleX(1)',
                      opacity: isButtonHovered ? 0 : 0.5,
                    }}
                  />

                  <div
                    className="relative flex w-[17rem] sm:w-[19rem] min-[1440px]:w-[22rem] items-center justify-between gap-3 overflow-hidden rounded-full px-6 py-3 transition-all duration-500 sm:px-8 sm:py-4"
                    style={{
                      backgroundColor: isButtonHovered ? '#070B1A' : '#F5F7FF',
                      boxShadow: isButtonHovered
                        ? '0 0 30px rgba(0,0,0,0.1), 0 10px 40px rgba(0,0,0,0.08)'
                        : 'none',
                    }}
                  >
                    <Icon
                      className="size-4 transition-all duration-500 sm:size-5"
                      strokeWidth={1.5}
                      style={{
                        color: isButtonHovered ? '#F5F7FF' : '#070B1A',
                      }}
                    />
                    <span
                      className="text-sm min-[1440px]:text-lg font-medium tracking-wide transition-all duration-500 sm:text-base"
                      style={{
                        color: isButtonHovered ? '#F5F7FF' : '#070B1A',
                      }}
                    >
                      {action.label}
                    </span>
                    <ArrowUpRight
                      className="size-4 transition-all duration-500 sm:size-5"
                      strokeWidth={1.5}
                      style={{
                        color: isButtonHovered ? '#F5F7FF' : '#070B1A',
                        transform: isButtonHovered
                          ? 'translate(3px, -3px) scale(1.1)'
                          : 'translate(0, 0) scale(1)',
                      }}
                    />
                  </div>

                  <div
                    className="h-px w-8 bg-border transition-all duration-500 sm:w-12"
                    style={{
                      transform: isButtonHovered ? 'scaleX(0)' : 'scaleX(1)',
                      opacity: isButtonHovered ? 0 : 0.5,
                    }}
                  />
                </button>
              )
            })}
            </div>
          )}

        </div>

        <div
          className="group relative cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => handleClick(e as unknown as MouseEvent<HTMLAnchorElement>)}
          style={{
            pointerEvents: isClicked ? 'none' : 'auto',
          }}
        >
          <div className="flex flex-col items-center gap-6">
            <h2
              className="relative text-center text-5xl font-light tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl min-[1440px]:text-9xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                opacity: isClicked ? 0 : 1,
                transform: isClicked ? 'translateY(-40px) scale(0.95)' : 'translateY(0) scale(1)',
              }}
            >
              <span className="block overflow-hidden">
                <span
                  className="block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: isHovered && !isClicked ? 'translateY(-8%)' : 'translateY(0)',
                  }}
                >
                  {copy.headingLine1}
                </span>
              </span>
              <span className="block overflow-hidden">
                <span
                  className="block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-75"
                  style={{
                    transform: isHovered && !isClicked ? 'translateY(-8%)' : 'translateY(0)',
                  }}
                >
                  <span className="text-white/70">{copy.headingLine2}</span>
                </span>
              </span>
            </h2>

            <div className="relative mt-4 flex size-16 items-center justify-center sm:size-20">
              <div
                className="pointer-events-none absolute inset-0 rounded-full transition-all ease-out"
                style={{
                  backgroundColor: isClicked ? 'transparent' : isHovered ? '#070B1A' : '#F5F7FF',
                  transform: isClicked ? 'scale(3)' : isHovered ? 'scale(1.1)' : 'scale(1)',
                  opacity: isClicked ? 0 : 1,
                  transitionDuration: isClicked ? '700ms' : '500ms',
                }}
              />
              <ArrowUpRight
                className="size-6 transition-all ease-[cubic-bezier(0.16,1,0.3,1)] sm:size-7"
                style={{
                  transform: isClicked
                    ? 'translate(100px, -100px) scale(0.5)'
                    : isHovered
                      ? 'translate(2px, -2px)'
                      : 'translate(0, 0)',
                  opacity: isClicked ? 0 : 1,
                  color: isHovered && !isClicked ? '#F5F7FF' : '#070B1A',
                  transitionDuration: isClicked ? '600ms' : '500ms',
                }}
              />
            </div>
          </div>

          <div className="absolute -left-8 top-1/2 -translate-y-1/2 sm:-left-16">
            <div
              className="h-px w-8 bg-border transition-all duration-500 sm:w-12"
              style={{
                transform: isClicked
                  ? 'scaleX(0) translateX(-20px)'
                  : isHovered
                    ? 'scaleX(1.5)'
                    : 'scaleX(1)',
                opacity: isClicked ? 0 : isHovered ? 1 : 0.5,
              }}
            />
          </div>
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 sm:-right-16">
            <div
              className="h-px w-8 bg-border transition-all duration-500 sm:w-12"
              style={{
                transform: isClicked
                  ? 'scaleX(0) translateX(20px)'
                  : isHovered
                    ? 'scaleX(1.5)'
                    : 'scaleX(1)',
                opacity: isClicked ? 0 : isHovered ? 1 : 0.5,
              }}
            />
          </div>
        </div>

        <div
          className="mt-8 flex flex-col items-center gap-4 text-center transition-all duration-500 delay-100"
          style={{
            opacity: isClicked ? 0 : 1,
            transform: isClicked ? 'translateY(20px)' : 'translateY(0)',
            pointerEvents: isClicked ? 'none' : 'auto',
          }}
        >
          <p className="max-w-md text-sm min-[1440px]:max-w-2xl min-[1440px]:text-lg leading-relaxed text-white/80">
            {copy.description}
          </p>
        </div>
      </div>
    </section>
  )
}
