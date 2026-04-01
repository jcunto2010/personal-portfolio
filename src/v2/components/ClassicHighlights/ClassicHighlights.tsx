import styles from './ClassicHighlights.module.css'

interface ClassicHighlightsProps {
  locale: 'es' | 'en'
  totalProjects: number
  featuredProjects: number
}

export function ClassicHighlights({
  locale,
  totalProjects,
  featuredProjects,
}: ClassicHighlightsProps) {
  const isEs = locale === 'es'

  const cards = isEs
    ? [
        { label: 'Experiencia activa', value: '2024 - Hoy', detail: 'Construyendo y lanzando productos reales' },
        { label: 'Proyectos en portafolio', value: `${totalProjects}`, detail: `${featuredProjects} destacados en la vista principal` },
        { label: 'Enfoque de trabajo', value: 'UX + Rendimiento', detail: 'Interfaces claras, rápidas y mantenibles' },
      ]
    : [
        { label: 'Active experience', value: '2024 - Today', detail: 'Building and shipping real products' },
        { label: 'Portfolio projects', value: `${totalProjects}`, detail: `${featuredProjects} featured on the main view` },
        { label: 'Working focus', value: 'UX + Performance', detail: 'Clear, fast, and maintainable interfaces' },
      ]

  return (
    <div className={styles.grid} aria-label={isEs ? 'Datos destacados del perfil' : 'Profile highlights'}>
      {cards.map((card) => (
        <article key={card.label} className={styles.card}>
          <p className={styles.label}>{card.label}</p>
          <p className={styles.value}>{card.value}</p>
          <p className={styles.detail}>{card.detail}</p>
        </article>
      ))}
    </div>
  )
}
