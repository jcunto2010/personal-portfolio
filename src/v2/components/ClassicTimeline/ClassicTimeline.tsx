import { motion, useScroll, useTransform } from 'framer-motion'
import { useMemo, useRef } from 'react'
import styles from './ClassicTimeline.module.css'

export interface ClassicTimelineEntry {
  title: string
  subtitle?: string
  description: string
  bullets?: string[]
}

interface ClassicTimelineProps {
  heading: string
  intro: string
  entries: ClassicTimelineEntry[]
}

export function ClassicTimeline({ heading, intro, entries }: ClassicTimelineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 15%', 'end 70%'],
  })

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])
  const stableEntries = useMemo(() => entries, [entries])

  return (
    <section className={styles.root} ref={containerRef} aria-label={heading}>
      <div className={styles.header}>
        <h3 className={styles.heading}>{heading}</h3>
        <p className={styles.intro}>{intro}</p>
      </div>

      <div className={styles.track} aria-hidden="true">
        <div className={styles.trackBase} />
        <motion.div className={styles.trackFill} style={{ scaleY: lineScale }} />
      </div>

      <ol className={styles.list}>
        {stableEntries.map((entry) => (
          <li key={entry.title} className={styles.item}>
            <div className={styles.marker} aria-hidden="true" />
            <div className={styles.meta}>
              <p className={styles.itemTitle}>{entry.title}</p>
              {entry.subtitle ? <p className={styles.itemSubtitle}>{entry.subtitle}</p> : null}
            </div>
            <div className={styles.body}>
              <p className={styles.itemDescription}>{entry.description}</p>
              {entry.bullets && entry.bullets.length > 0 ? (
                <ul className={styles.bullets}>
                  {entry.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
