/**
 * V2 Skills — migrated from src/data/skills.ts.
 * Icons are NOT imported here to keep this file framework-agnostic.
 * The icon binding lives in the UI layer.
 */

export type SkillCategory = 'language' | 'framework' | 'tool'

export interface SkillV2 {
  name: string
  category: SkillCategory
  iconKey: string
}

export const skillsV2: SkillV2[] = [
  // Languages
  { name: 'JavaScript', category: 'language', iconKey: 'javascript' },
  { name: 'TypeScript', category: 'language', iconKey: 'typescript' },
  { name: 'Dart',       category: 'language', iconKey: 'dart' },
  { name: 'HTML5',      category: 'language', iconKey: 'html5' },
  { name: 'CSS3',       category: 'language', iconKey: 'css3' },

  // Frameworks & Libraries
  { name: 'React',        category: 'framework', iconKey: 'react' },
  { name: 'Next.js',      category: 'framework', iconKey: 'nextjs' },
  { name: 'Flutter',      category: 'framework', iconKey: 'flutter' },
  { name: 'Tailwind CSS', category: 'framework', iconKey: 'tailwindcss' },
  { name: 'Framer Motion', category: 'framework', iconKey: 'framermotion' },
  { name: 'Vite',         category: 'framework', iconKey: 'vite' },

  // Tools & Platforms
  { name: 'Firebase',   category: 'tool', iconKey: 'firebase' },
  { name: 'Supabase',   category: 'tool', iconKey: 'supabase' },
  { name: 'PostgreSQL', category: 'tool', iconKey: 'postgresql' },
  { name: 'Figma',      category: 'tool', iconKey: 'figma' },
  { name: 'Rive',       category: 'tool', iconKey: 'rive' },
  { name: 'Git',        category: 'tool', iconKey: 'git' },
  { name: 'GitHub',     category: 'tool', iconKey: 'github' },
  { name: 'Node.js',    category: 'tool', iconKey: 'nodejs' },
  { name: 'Webpack',    category: 'tool', iconKey: 'webpack' },
]

export const skillCategoryLabels: Record<SkillCategory, string> = {
  language:  'Languages',
  framework: 'Frameworks & Libraries',
  tool:      'Tools & Platforms',
}
