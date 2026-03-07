import { useEffect, useState } from 'react'
import { useScrollContext } from '../../lib/scrollContext'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './TableOfContents.module.css'

export interface TocEntry {
  id: string
  label: string
}

const CHAPTERS: TocEntry[] = [
  { id: 'chapter-intro',      label: 'Intro' },
  { id: 'chapter-about',      label: 'About' },
  { id: 'chapter-notes',      label: 'Experience' },
  { id: 'chapter-work',       label: 'Work' },
  { id: 'chapter-contact',    label: 'Contact' },
]

export function TableOfContents() {
  const [active, setActive] = useState<string>('')
  const lenisRef = useScrollContext()
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    CHAPTERS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    // Delegate to Lenis when active so the smooth-scroll engine drives
    // the animation. Fall back to native scrollIntoView otherwise.
    if (lenisRef?.current) {
      lenisRef.current.scrollTo(el, { offset: 0 })
    } else {
      el.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <nav
      className={styles.toc}
      aria-label="Page chapters"
    >
      <ol className={styles.list} role="list">
        {CHAPTERS.map(({ id, label }) => (
          <li key={id} className={styles.item}>
            <button
              type="button"
              onClick={() => handleClick(id)}
              className={`${styles.link} ${active === id ? styles.active : ''}`}
              aria-current={active === id ? 'location' : undefined}
            >
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.label}>{label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
