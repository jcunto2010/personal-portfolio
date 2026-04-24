import {
  FloatingIconsHero,
  type FloatingIconsHeroProps,
} from './floating-icons-hero-section'
import {
  SiCss,
  SiDart,
  SiFirebase,
  SiFigma,
  SiFlutter,
  SiFramer,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si'

const demoIcons: FloatingIconsHeroProps['icons'] = [
  { id: 1, icon: SiFlutter, className: 'top-[10%] left-[10%]' },
  { id: 2, icon: SiReact, className: 'top-[20%] right-[8%]' },
  { id: 3, icon: SiTailwindcss, className: 'top-[80%] left-[10%]' },
  { id: 4, icon: SiTypescript, className: 'bottom-[10%] right-[10%]' },
  { id: 5, icon: SiJavascript, className: 'top-[5%] left-[30%]' },
  { id: 6, icon: SiDart, className: 'top-[5%] right-[30%]' },
  { id: 7, icon: SiHtml5, className: 'bottom-[8%] left-[25%]' },
  { id: 8, icon: SiCss, className: 'top-[40%] left-[15%]' },
  { id: 9, icon: SiFirebase, className: 'top-[75%] right-[25%]' },
  { id: 10, icon: SiSupabase, className: 'top-[90%] left-[70%]' },
  { id: 11, icon: SiPostgresql, className: 'top-[50%] right-[5%]' },
  { id: 12, icon: SiFigma, className: 'top-[55%] left-[5%]' },
  { id: 13, icon: SiGit, className: 'top-[5%] left-[55%]' },
  { id: 14, icon: SiGithub, className: 'bottom-[5%] right-[45%]' },
  { id: 15, icon: SiFramer, className: 'top-[25%] right-[20%]' },
  { id: 16, icon: SiNodedotjs, className: 'top-[60%] left-[30%]' },
]

export default function FloatingIconsHeroDemo() {
  return (
    <FloatingIconsHero
      title="Skills"
      subtitle="Technologies I use to build performant, scalable products."
      icons={demoIcons}
    />
  )
}
