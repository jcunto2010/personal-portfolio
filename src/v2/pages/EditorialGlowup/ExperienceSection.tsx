import { Timeline } from '../../../components/ui/timeline'
import { experienceV2 } from '../../data/experience.v2'
import { useLocale } from '../../lib/localeContext'

const startYear = (period: string) => Number(period.match(/\d{4}/)?.[0])

// ponytail: ordered by start year only, so same-year entries keep their order in experience.v2.ts.
// Add a start date to the data if two of them ever need swapping.
const chronological = [...experienceV2].sort((a, b) => startYear(a.period) - startYear(b.period))

const paragraph = 'text-xs md:text-sm min-[1440px]:text-lg font-normal leading-relaxed'

export function ExperienceSection() {
  const { locale } = useLocale()
  const isEs = locale === 'es'

  return (
    <section id="experience" aria-label={isEs ? 'Experiencia profesional' : 'Professional experience'}>
      <div className="w-full">
        <Timeline
          heading={isEs ? 'Experiencia profesional' : 'Professional experience'}
          intro={
            isEs
              ? 'De Ingeniería Industrial al desarrollo de software — pasando por producto, datos y automatización.'
              : 'From Industrial Engineering to software development — through product, data, and automation.'
          }
          data={chronological.map((exp) => ({
            title: String(startYear(exp.period)),
            content: (
              <div>
                <p className={`text-neutral-200 ${paragraph} mb-2`}>
                  <span className="font-semibold text-white">{exp.role}</span> · {exp.company}
                </p>
                <p className={`text-neutral-400 ${paragraph} mb-6`}>{exp.period}</p>
                <p className={`text-neutral-300 ${paragraph}`}>
                  {isEs ? (exp.descriptionEs ?? exp.description) : exp.description}
                </p>
              </div>
            ),
          }))}
        />
      </div>
    </section>
  )
}
