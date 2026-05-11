import { m } from 'framer-motion'
import styles from './ClassicFocus.module.css'

interface ClassicFocusProps {
  locale: 'es' | 'en'
}

export function ClassicFocus({ locale }: ClassicFocusProps) {
  const isEs = locale === 'es'

  const eyebrow = isEs ? 'Filosofía de trabajo' : 'Working philosophy'
  const title = isEs ? 'Cómo pienso cuando construyo' : 'How I think when I build'

  const cards = isEs
    ? [
        {
          icon: '⬡',
          title: 'Código que el negocio pueda entender y evolucionar',
          desc: 'La solución más simple que resuelve el problema real. Sin sobre-ingeniería, sin deuda técnica innecesaria.',
        },
        {
          icon: '◈',
          title: 'Producto antes que tecnología',
          desc: 'El stack sirve al problema, no al revés. Elijo herramientas por lo que resuelven, no por lo que suenan bien.',
        },
        {
          icon: '◉',
          title: 'Datos como evidencia, no como decoración',
          desc: 'Cada decisión de producto o arquitectura tiene que tener una razón medible. Si no se puede medir, no se puede mejorar.',
        },
      ]
    : [
        {
          icon: '⬡',
          title: 'Code the business can understand and evolve',
          desc: 'The simplest solution that solves the real problem. No over-engineering, no unnecessary technical debt.',
        },
        {
          icon: '◈',
          title: 'Product before technology',
          desc: 'The stack serves the problem, not the other way around. I choose tools for what they solve, not for how they sound.',
        },
        {
          icon: '◉',
          title: 'Data as evidence, not decoration',
          desc: 'Every product or architecture decision needs a measurable reason. If you can\'t measure it, you can\'t improve it.',
        },
      ]

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.inner}>
        <m.p
          className={styles.eyebrow}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {eyebrow}
        </m.p>

        <m.h2
          className={styles.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          viewport={{ once: true }}
        >
          {title}
        </m.h2>

        <m.div
          className={styles.grid}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          viewport={{ once: true }}
        >
          {cards.map((card) => (
            <article key={card.title} className={styles.card}>
              <span className={styles.cardIcon} aria-hidden="true">{card.icon}</span>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.desc}</p>
            </article>
          ))}
        </m.div>
      </div>
    </section>
  )
}
