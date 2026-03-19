import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import styles from './ClassicZoomParallax.module.css'

interface ClassicZoomImage {
  src: string
  alt: string
}

interface ClassicZoomParallaxProps {
  title: string
  images: ClassicZoomImage[]
  compact?: boolean
}

export function ClassicZoomParallax({ title, images, compact = false }: ClassicZoomParallaxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const zoomA = useTransform(scrollYProgress, [0, 1], [1, 1.45])
  const zoomB = useTransform(scrollYProgress, [0, 1], [1, 1.7])
  const zoomC = useTransform(scrollYProgress, [0, 1], [1, 1.9])
  const zooms = [zoomA, zoomB, zoomC]

  return (
    <section className={styles.root} aria-label={title}>
      <p className={styles.title}>{title}</p>
      <div className={`${styles.container} ${compact ? styles.containerCompact : ''}`} ref={containerRef}>
        <div className={styles.sticky}>
          {images.slice(0, 7).map((img, index) => (
            <motion.figure
              key={img.src}
              style={{ scale: zooms[index % zooms.length] }}
              className={`${styles.card} ${styles[`card${index + 1}`] ?? ''}`}
            >
              <img src={img.src} alt={img.alt} loading="lazy" decoding="async" className={styles.image} />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
