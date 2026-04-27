import { ClassicTimeline } from '../../components/ClassicTimeline/ClassicTimeline'
import { experienceV2 } from '../../data/experience.v2'
import { useLocale } from '../../lib/localeContext'

export function ExperienceSection() {
  const { locale } = useLocale()
  const isEs = locale === 'es'

  return (
    <section
      id="chapter-experience"
      aria-label={isEs ? 'Experiencia' : 'Experience'}
      style={{
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        overflow: 'hidden',
      }}
    >
      <ClassicTimeline
        heading={isEs ? 'Experiencia' : 'Experience'}
        intro={
          isEs
            ? 'De Ingeniería Industrial al desarrollo de software, pasando por producto, datos y automatización.'
            : 'From Industrial Engineering to software development, through product, data, and automation.'
        }
        entries={experienceV2.map((exp) => ({
          title: exp.role,
          subtitle: `${exp.period} · ${exp.company}`,
          description: isEs ? (exp.descriptionEs ?? exp.description) : exp.description,
          bullets: exp.technologies,
        }))}
      />
    </section>
  )
}
