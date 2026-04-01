import styles from './ClassicFocus.module.css'

interface ClassicFocusProps {
  locale: 'es' | 'en'
}

export function ClassicFocus({ locale }: ClassicFocusProps) {
  const isEs = locale === 'es'
  const title = isEs ? 'Qué priorizo en cada entrega' : 'What I prioritize in every delivery'
  const items = isEs
    ? [
        'Arquitectura simple y escalable',
        'Accesibilidad y UX desde el inicio',
        'Medición de rendimiento en producción',
      ]
    : [
        'Simple and scalable architecture',
        'Accessibility and UX from day one',
        'Performance measurement in production',
      ]

  return (
    <section className={styles.block} aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item} className={styles.item}>
            <span className={styles.dot} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
