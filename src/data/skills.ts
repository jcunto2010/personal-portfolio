import { 
  SiReact, 
  SiJavascript, 
  SiTypescript, 
  SiHtml5, 
  SiCss3, 
  SiTailwindcss,
  SiNextdotjs,
  SiVite,
  SiGit,
  SiGithub,
  SiNodedotjs,
  SiWebpack,
  SiFlutter,
  SiDart,
  SiFirebase,
  SiPostgresql,
  SiSupabase
} from 'react-icons/si'
import { IconType } from 'react-icons'

export interface Skill {
  name: string
  icon: IconType
  category: 'language' | 'framework' | 'tool'
}

export const skills: Skill[] = [
  // Languages
  { name: 'JavaScript', icon: SiJavascript, category: 'language' },
  { name: 'TypeScript', icon: SiTypescript, category: 'language' },
  { name: 'Dart', icon: SiDart, category: 'language' },
  { name: 'HTML5', icon: SiHtml5, category: 'language' },
  { name: 'CSS3', icon: SiCss3, category: 'language' },
  
  // Frameworks & Libraries
  { name: 'React', icon: SiReact, category: 'framework' },
  { name: 'Next.js', icon: SiNextdotjs, category: 'framework' },
  { name: 'Flutter', icon: SiFlutter, category: 'framework' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, category: 'framework' },
  { name: 'Vite', icon: SiVite, category: 'framework' },
  
  // Tools
  { name: 'Firebase', icon: SiFirebase, category: 'tool' },
  { name: 'Supabase', icon: SiSupabase, category: 'tool' },
  { name: 'PostgreSQL', icon: SiPostgresql, category: 'tool' },
  { name: 'Git', icon: SiGit, category: 'tool' },
  { name: 'GitHub', icon: SiGithub, category: 'tool' },
  { name: 'Node.js', icon: SiNodedotjs, category: 'tool' },
  { name: 'Webpack', icon: SiWebpack, category: 'tool' },
]

export const skillCategories = {
  language: 'Languages',
  framework: 'Frameworks & Libraries',
  tool: 'Tools & Platforms'
}
