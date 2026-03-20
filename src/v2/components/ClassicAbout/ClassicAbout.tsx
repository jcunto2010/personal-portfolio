import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ClassicAboutShaderBackground } from './ClassicAboutShaderBackground'
import styles from './ClassicAbout.module.css'

interface ClassicAboutProps {
  id: string
  title: string
  paragraphs: string[]
  highlights: string[]
  ctaPrimary: { label: string; onClick: () => void }
  ctaSecondary: { label: string; onClick: () => void }
}

export function ClassicAbout({
  id,
  title,
  paragraphs,
  highlights,
  ctaPrimary,
  ctaSecondary,
}: ClassicAboutProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: sectionRef })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const rotateX = useTransform(scrollYProgress, [0, 1], [prefersReducedMotion ? 0 : 20, 0])
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : isMobile ? [0.7, 0.9] : [1.05, 1]
  )
  const translateY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -100])

  return (
    <section id={id} ref={sectionRef} className={styles.section} aria-label="Classic about">
      <ClassicAboutShaderBackground />
      <div className={styles.overlayLayer} aria-hidden="true" />
      <div className={styles.stage}>
        <motion.header style={{ y: translateY }} className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </motion.header>

        <motion.article style={{ rotateX, scale }} className={styles.card}>
          <div className={styles.screen}>
            <div className={styles.content}>
              <div className={styles.textColumn}>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} className={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}

                <div className={styles.actions}>
                  <button type="button" className={styles.actionPrimary} onClick={ctaPrimary.onClick}>
                    {ctaPrimary.label}
                  </button>
                  <button type="button" className={styles.actionSecondary} onClick={ctaSecondary.onClick}>
                    {ctaSecondary.label}
                  </button>
                </div>
              </div>

              <aside className={styles.infoPanel} aria-label="About highlights">
                <ul className={styles.highlightList}>
                  {highlights.map((item) => (
                    <li key={item} className={styles.highlightItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  )
}
