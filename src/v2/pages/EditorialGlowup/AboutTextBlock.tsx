import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitText from '../../../components/ui/SplitText'
import { useLocale } from '../../lib/localeContext'
import styles from './AboutTextBlock.module.css'

gsap.registerPlugin(ScrollTrigger)

export function AboutTextBlock() {
  const { locale } = useLocale()
  const isEs = locale === 'es'
  const sectionRef = useRef<HTMLElement | null>(null)
  const photoWrapRef = useRef<HTMLDivElement | null>(null)
  const gradientWords = isEs
    ? ['ingeniería', 'producto', 'desarrollo', 'impacto', 'estrategia', 'escalables']
    : ['engineering', 'product', 'development', 'impact', 'strategy', 'scalable']

  const paragraphOne = isEs
    ? 'Soy un perfil híbrido entre ingeniería, producto y desarrollo. Diseño y construyo experiencias digitales de alto impacto con foco en rendimiento, claridad visual y resultados medibles.'
    : 'I am a hybrid profile across engineering, product, and development. I design and build high-impact digital experiences focused on performance, visual clarity, and measurable outcomes.'

  const paragraphTwo = isEs
    ? 'Trabajo desde la estrategia hasta la implementación, conectando decisiones de negocio con ejecución técnica para entregar productos sólidos y escalables.'
    : 'I work from strategy to implementation, connecting business decisions with technical execution to deliver solid and scalable products.'

  useEffect(() => {
    if (!sectionRef.current || !photoWrapRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 66%',
      end: '+=240',
      scrub: 0.6,
      animation: gsap.fromTo(
        photoWrapRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, ease: 'none' },
      ),
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <section id="about" className={styles.section} ref={sectionRef}>
      <div className={styles.textColumn}>
        <SplitText
          tag="p"
          text={paragraphOne}
          className={styles.text}
          gradientWords={gradientWords}
          delay={18}
          duration={0.95}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 22 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.34}
          rootMargin="0px"
          end="+=240"
          scrub={0.6}
          textAlign="left"
        />
        <SplitText
          tag="p"
          text={paragraphTwo}
          className={styles.text}
          gradientWords={gradientWords}
          delay={18}
          duration={0.95}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 22 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.22}
          rootMargin="0px"
          end="+=180"
          scrub={0.5}
          textAlign="left"
        />
      </div>

      <div className={styles.photoWrap} ref={photoWrapRef}>
        <img
          src="/assets/projects/johnny_hero.webp"
          alt={isEs ? 'Foto de Jonathan Cunto-Diaz' : 'Jonathan Cunto-Diaz portrait'}
          className={styles.photo}
          loading="lazy"
        />
      </div>
    </section>
  )
}
