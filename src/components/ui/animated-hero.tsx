import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Github, Linkedin } from 'lucide-react'
import { useLocale } from '../../v2/lib/localeContext'
import ButtonWithIconDemo from './button-witn-icon'

interface HeroProps {
  onExploreWork?: () => void
  onContact?: () => void
}

function Hero({ onExploreWork, onContact }: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0)
  const { locale } = useLocale()
  const isEs = locale === 'es'

  const titles = useMemo(
    () =>
      isEs
        ? [
            'Desarrollador Frontend',
            'Desarrollador Mobile',
            'Product Manager',
            'Diseñador de Producto',
          ]
        : [
            'Frontend Developer',
            'Mobile Developer',
            'Product Manager',
            'Product Designer',
          ],
    [isEs],
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1))
    }, 2000)
    return () => window.clearTimeout(timeoutId)
  }, [titleNumber, titles])

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-8 py-20 lg:py-32 flex-col text-center">
          <div className="flex gap-4 flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl min-[1440px]:text-7xl max-w-6xl tracking-tight text-center font-semibold text-white flex flex-col items-center">
              <span className="text-white">
                {isEs
                  ? 'Bienvenido, soy Jonathan Cunto-Diaz:'
                  : "Welcome, I'm Jonathan Cunto-Diaz:"}
              </span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 h-[1.08em]">
                {titles.map((title, index) => (
                  <motion.span
                    key={title}
                    className="absolute font-semibold text-sky-300 whitespace-nowrap"
                    initial={{ opacity: 0, y: -70 }}
                    transition={{ type: 'spring', stiffness: 55, damping: 16 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -120 : 120, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl min-[1440px]:text-2xl leading-relaxed tracking-tight text-slate-300 max-w-2xl min-[1440px]:max-w-3xl text-center mx-auto">
              {isEs
                ? 'De Ingeniería Industrial al desarrollo de software: frontend moderno, apps con IA y productos digitales con foco en negocio, datos y ejecución.'
                : 'From Industrial Engineering to software development: modern frontend, AI-powered apps, and digital products focused on business, data, and execution.'}
            </p>
          </div>

          <div className="flex flex-row gap-3 flex-wrap justify-center items-center">
            <ButtonWithIconDemo
              label={isEs ? 'Contactar' : 'Get in touch'}
              variant="outline"
              onClick={onContact}
              className="!border-0"
            />
            <ButtonWithIconDemo
              label={isEs ? 'Ver mis trabajos' : 'View my work'}
              onClick={onExploreWork}
              className="!border-0"
            />
          </div>

          {/* Social links */}
          <div className="flex flex-row gap-4 items-center mt-2">
            <a
              href="https://github.com/jcunto2010"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/jonathan-cuntodiaz-41149a1bb"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              <span className="text-sm">LinkedIn</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

export { Hero }
