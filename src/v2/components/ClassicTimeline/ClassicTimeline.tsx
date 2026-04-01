import { motion, useScroll, useTransform } from 'framer-motion'
import { useId, useRef } from 'react'
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

function TimelineItem({ entry, idx }: { entry: ClassicTimelineEntry; idx: number }) {
  return (
    <motion.li
      className={styles.item}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className={styles.markerCol} aria-hidden="true">
        <div className={styles.marker} />
      </div>

      <div className={styles.meta}>
        <p className={styles.itemTitle}>{entry.title}</p>
        {entry.subtitle ? <p className={styles.itemSubtitle}>{entry.subtitle}</p> : null}
      </div>

      <div className={styles.body}>
        <p className={styles.itemDescription}>{entry.description}</p>
        {entry.bullets && entry.bullets.length > 0 ? (
          <ul className={styles.bullets}>
            {entry.bullets.map((b, bulletIdx) => (
              <li key={`${idx}-${bulletIdx}`}>{b}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </motion.li>
  )
}

export function ClassicTimeline({ heading, intro, entries }: ClassicTimelineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const headingId = useId()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  })
  const trackHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section className={styles.root} aria-labelledby={headingId}>
      <div className={styles.header}>
        <h3 className={styles.heading} id={headingId}>
          {heading}
        </h3>
        <p className={styles.intro}>{intro}</p>
      </div>

      <div className={styles.listWrap} ref={containerRef}>
        <div className={styles.track} aria-hidden="true">
          <div className={styles.trackBase} />
          <motion.div className={styles.trackFill} style={{ height: trackHeight }} />
        </div>

        <ol className={styles.list}>
          {entries.map((entry, idx) => (
            <TimelineItem key={`${entry.title}-${idx}`} entry={entry} idx={idx} />
          ))}
        </ol>
      </div>
    </section>
  )
}
