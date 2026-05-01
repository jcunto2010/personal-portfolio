import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '../../lib/utils'

gsap.registerPlugin(ScrollTrigger)

interface IconProps {
  id: number
  icon: React.ComponentType<{ className?: string }>
  className: string
  iconClassName?: string
  name?: string
  level?: string
  usedIn?: string
  details?: string[]
}

export interface FloatingIconsHeroProps {
  title: string
  subtitle: string
  icons: IconProps[]
}

function getLevelProgress(level?: string): { progress: number; colorClass: string; label: string } {
  const value = (level ?? '').toLowerCase()
  const isMediumLow = value.includes('medio-bajo') || value.includes('medio bajo')
  const isMediumHigh = value.includes('medio-avanzado') || value.includes('medio avanzado')
  const isLow = value === 'bajo' || (value.includes('bajo') && !isMediumLow)
  const isHigh = (value.includes('avanzado') && !isMediumHigh) || value.includes('alto')

  if (isLow) {
    return { progress: 28, colorClass: 'bg-red-500', label: level ?? 'Bajo' }
  }

  if (isMediumLow) {
    return { progress: 45, colorClass: 'bg-orange-500', label: level ?? 'Medio-bajo' }
  }

  if (isMediumHigh) {
    return { progress: 75, colorClass: 'bg-lime-500', label: level ?? 'Medio-avanzado' }
  }

  if (isHigh) {
    return { progress: 85, colorClass: 'bg-emerald-500', label: level ?? 'Alto' }
  }

  return { progress: 60, colorClass: 'bg-amber-400', label: level ?? 'Medio' }
}

const Icon = ({
  iconData,
  index,
  onSelect,
}: {
  iconData: IconProps
  index: number
  onSelect: (iconData: IconProps) => void
}) => {
  const ref = React.useRef<HTMLButtonElement>(null)

  const IconComp = iconData.icon

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(iconData)}
      aria-label={iconData.name ?? `skill-${iconData.id}`}
      ref={ref}
      initial={{ opacity: 0, scale: 0.3, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.72,
        type: 'spring',
        stiffness: 320,
        damping: 18,
      }}
      className={cn(
        'absolute cursor-pointer bg-transparent border-0 p-0 m-0 appearance-none',
        iconData.className,
      )}
    >
      <motion.div
        className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 p-1.5 sm:p-2 md:p-3"
        animate={{
          y: [0, -8, 0, 8, 0],
          x: [0, 6, 0, -6, 0],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 5 + (index % 5) * 0.9,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      >
        <IconComp
          className={cn(
            'w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]',
            iconData.iconClassName,
          )}
        />
      </motion.div>
    </motion.button>
  )
}

export function FloatingIconsHero({
  className,
  title,
  subtitle,
  icons,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & FloatingIconsHeroProps) {
  const sectionRef = React.useRef<HTMLElement | null>(null)
  const iconsLayerRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const modalRef = React.useRef<HTMLElement | null>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null)
  const dialogTitleId = React.useId()
  const dialogDescriptionId = React.useId()
  const [selectedIcon, setSelectedIcon] = React.useState<IconProps | null>(null)
  const levelData = getLevelProgress(selectedIcon?.level)

  const closeSelectedIcon = React.useCallback(() => {
    setSelectedIcon(null)
  }, [])

  const handleSelectIcon = React.useCallback((iconData: IconProps) => {
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setSelectedIcon(iconData)
  }, [])

  React.useEffect(() => {
    if (!sectionRef.current || !iconsLayerRef.current || !contentRef.current) return

    gsap.set([iconsLayerRef.current, contentRef.current], { opacity: 0, y: 20 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        end: 'top 35%',
        scrub: 0.7,
      },
    })

    tl.to(iconsLayerRef.current, { opacity: 1, y: 0, ease: 'none' }, 0)
      .to(contentRef.current, { opacity: 1, y: 0, ease: 'none' }, 0.05)

    return () => {
      tl.kill()
    }
  }, [])

  React.useEffect(() => {
    if (!selectedIcon) return

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeSelectedIcon()
        return
      }

      if (event.key !== 'Tab' || !modalRef.current) return

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )

      if (!focusableElements.length) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedRef.current?.focus()
      previouslyFocusedRef.current = null
    }
  }, [closeSelectedIcon, selectedIcon])

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative w-full min-h-[128vh] sm:min-h-[122vh] min-[1200px]:min-h-[120vh] flex items-center justify-center overflow-hidden py-14 sm:py-16 md:py-20',
        className,
      )}
      {...props}
    >
      <div
        ref={iconsLayerRef}
        className={cn('absolute inset-0 w-full h-full', selectedIcon && 'pointer-events-none')}
        aria-hidden={selectedIcon ? 'true' : undefined}
      >
        {icons.map((iconData, index) => (
          <Icon
            key={iconData.id}
            iconData={iconData}
            index={index}
            onSelect={handleSelectIcon}
          />
        ))}
      </div>

      <div
        ref={contentRef}
        className={cn(
          'pointer-events-none relative z-10 mx-auto w-full max-w-[min(92vw,42rem)] text-center px-4',
        )}
        aria-hidden={selectedIcon ? 'true' : undefined}
      >
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight text-[#F5F7FF]">
          {title}
        </h2>
        <p className="mt-4 sm:mt-5 max-w-[20rem] sm:max-w-xl mx-auto text-base sm:text-lg text-white/75">
          {subtitle}
        </p>
      </div>

      <AnimatePresence>
        {selectedIcon && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={closeSelectedIcon}
          >
            <motion.article
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              aria-describedby={dialogDescriptionId}
              className="w-[min(92vw,760px)] rounded-2xl border border-white/15 bg-[#070B1A]/95 shadow-2xl p-6 md:p-8"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    id={dialogDescriptionId}
                    className="text-xs uppercase tracking-[0.14em] text-white/60"
                  >
                    Skill details
                  </p>
                  <h3 id={dialogTitleId} className="mt-2 text-2xl md:text-3xl font-bold text-white">
                    {selectedIcon.name ?? `Skill ${selectedIcon.id}`}
                  </h3>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeSelectedIcon}
                  aria-label="Cerrar panel"
                  className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center text-xl leading-none font-semibold"
                >
                  x
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                <div>
                  <p className="text-sm text-white/60">Nivel</p>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-white/15 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', levelData.colorClass)}
                      style={{ width: `${levelData.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-sm text-white/80">{levelData.label}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Dónde lo utilicé</p>
                  <p className="text-base text-white/90">{selectedIcon.usedIn ?? 'No especificado'}</p>
                </div>
                {selectedIcon.details && selectedIcon.details.length > 0 && (
                  <div>
                    <p className="text-sm text-white/60">Detalles</p>
                    <ul className="mt-2 list-disc pl-5 space-y-1 text-white/90">
                      {selectedIcon.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
