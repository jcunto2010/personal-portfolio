import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
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

function TimelineItem({
  entry,
  idx,
  total,
  reducedMotion,
  scrollYProgress,
}: {
  entry: ClassicTimelineEntry
  idx: number
  total: number
  reducedMotion: boolean
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
}) {
  // Convertimos el avance global del scroll en un rango por ítem para animar
  // marker + contenido de forma continua.
  const safeTotal = Math.max(total, 1)
  const start = idx / safeTotal
  const end = (idx + 1) / safeTotal

  const itemOpacity = useTransform(scrollYProgress, [start, start + (end - start) * 0.7], [0.35, 1])
  const itemY = useTransform(scrollYProgress, [start, start + (end - start) * 0.7], [10, 0])

  const markerScale = useTransform(scrollYProgress, [start, end], [0.75, 1])
  const markerOpacity = useTransform(scrollYProgress, [start, end], [0.4, 1])

  const itemStyle = reducedMotion
    ? {
        opacity: itemOpacity,
      }
    : {
        opacity: itemOpacity,
        y: itemY,
      }

  const markerStyle = reducedMotion
    ? {
        opacity: markerOpacity,
      }
    : {
        scale: markerScale,
        opacity: markerOpacity,
      }

  return (
    <motion.li
      className={styles.item}
      style={itemStyle}
    >
      <motion.div
        className={styles.marker}
        aria-hidden="true"
        style={markerStyle}
      />

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
  const containerRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useReducedMotion() ?? false
  const headingId = useId()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 10%', 'end 50%'],
  })

  const [trackHeight, setTrackHeight] = useState(0)

  useEffect(() => {
    const measure = () => {
      const node = trackRef.current
      if (!node) return
      setTrackHeight(node.getBoundingClientRect().height)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const beamHeight = useTransform(scrollYProgress, [0, 1], [0, trackHeight])
  // Empezar visible antes para que el efecto sea evidente al hacer scroll.
  const beamOpacity = useTransform(scrollYProgress, [0, 0.05], [0.25, 1])
  const stableEntries = useMemo(() => entries, [entries])

  return (
    <section className={styles.root} ref={containerRef} aria-labelledby={headingId}>
      <div className={styles.header}>
        <h3 className={styles.heading} id={headingId}>
          {heading}
        </h3>
        <p className={styles.intro}>{intro}</p>
      </div>

      <div className={styles.listWrap}>
        <div className={styles.track} aria-hidden="true" ref={trackRef}>
          <div className={styles.trackBase} />
          <motion.div className={styles.trackFill} style={{ height: beamHeight, opacity: beamOpacity }} />
        </div>

        <ol className={styles.list}>
          {stableEntries.map((entry, idx) => (
            <TimelineItem
              key={`${entry.title}-${idx}`}
              entry={entry}
              idx={idx}
              total={stableEntries.length}
              reducedMotion={reducedMotion}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}
