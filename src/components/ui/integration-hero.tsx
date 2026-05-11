'use client'

import { cn } from '../../lib/utils'
import {
  siReact,
  siTypescript,
  siJavascript,
  siNodedotjs,
  siFlutter,
  siDart,
  siGit,
  siFirebase,
  siSupabase,
  siTailwindcss,
  siCss,
  siHtml5,
  siFigma,
  siNextdotjs,
  siPython,
  siPostgresql,
} from 'simple-icons/icons'

// Official tech logos from simple-icons library
interface TechLogo {
  icon: { path: string; hex: string; title: string }
  name: string
  color: string
}

const ICONS_ROW1: TechLogo[] = [
  { icon: siReact, name: 'React', color: '#61DAFB' },
  { icon: siTypescript, name: 'TypeScript', color: '#3178C6' },
  { icon: siJavascript, name: 'JavaScript', color: '#F7DF1E' },
  { icon: siNodedotjs, name: 'Node.js', color: '#339933' },
  { icon: siFlutter, name: 'Flutter', color: '#02569B' },
  { icon: siDart, name: 'Dart', color: '#00B4AB' },
  { icon: siGit, name: 'Git', color: '#F05032' },
  { icon: siFirebase, name: 'Firebase', color: '#FFCA28' },
]

const ICONS_ROW2: TechLogo[] = [
  { icon: siSupabase, name: 'Supabase', color: '#3ECF8E' },
  { icon: siTailwindcss, name: 'Tailwind', color: '#06B6D4' },
  { icon: siCss, name: 'CSS3', color: '#663399' },
  { icon: siHtml5, name: 'HTML5', color: '#E34F26' },
  { icon: siFigma, name: 'Figma', color: '#F24E1E' },
  { icon: siNextdotjs, name: 'Next.js', color: '#FFFFFF' },
  { icon: siPython, name: 'Python', color: '#FFD43B' },
  { icon: siPostgresql, name: 'PostgreSQL', color: '#4169E1' },
]

// Utility to repeat icons enough times for infinite scroll
const repeatedIcons = (icons: TechLogo[], repeat = 4) =>
  Array.from({ length: repeat }).flatMap(() => icons)

interface IntegrationHeroProps {
  className?: string
  title?: string
  description?: string
}

export function IntegrationHero({
  className,
  title = 'Skills & Technologies',
  description = 'A curated stack of modern tools and frameworks I use to build performant, scalable products.',
}: IntegrationHeroProps) {
  return (
    <section
      className={cn(
        'relative py-24 overflow-hidden bg-transparent',
        className
      )}
    >

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        {/* Title */}
        <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-[#F5F7FF]">
          {title}
        </h2>

        {/* Description */}
        <p className="mt-4 text-lg text-[#B8C0D9] max-w-xl mx-auto">
          {description}
        </p>

        {/* Carousel */}
        <div className="mt-12 overflow-hidden relative pb-2">
          {/* Row 1 - scrolling left */}
          <div className="flex gap-8 whitespace-nowrap animate-scroll-left">
            {repeatedIcons(ICONS_ROW1, 4).map((tech, i) => (
              <TechBubble key={`r1-${i}`} tech={tech} />
            ))}
          </div>

          {/* Row 2 - scrolling right */}
          <div className="flex gap-8 whitespace-nowrap mt-6 animate-scroll-right">
            {repeatedIcons(ICONS_ROW2, 4).map((tech, i) => (
              <TechBubble key={`r2-${i}`} tech={tech} />
            ))}
          </div>

          {/* Fade overlays - transparent to work with any background */}
          <div
            className="absolute left-0 top-0 h-full w-24 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(7,11,26,0.95), transparent)',
            }}
          />
          <div
            className="absolute right-0 top-0 h-full w-24 pointer-events-none"
            style={{
              background: 'linear-gradient(to left, rgba(7,11,26,0.95), transparent)',
            }}
          />
        </div>
      </div>

      {/* Keyframes styles */}
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 30s linear infinite;
        }
      `}</style>
    </section>
  )
}

// Tech bubble component with official logo from simple-icons - circular orb design
function TechBubble({ tech }: { tech: TechLogo }) {
  return (
    <div
      className="h-20 w-20 flex-shrink-0 rounded-full flex items-center justify-center group cursor-pointer transition-all duration-300 hover:scale-110"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${tech.color}25, ${tech.color}08 50%, transparent 70%), linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 50%, rgba(0,0,0,0.1) 100%)`,
        boxShadow: `0 8px 32px ${tech.color}20, inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 1px rgba(0,0,0,0.1)`,
        border: `1px solid ${tech.color}30`,
      }}
      title={tech.name}
    >
      <svg 
        viewBox="0 0 24 24" 
        className="w-9 h-9 transition-all duration-300 group-hover:scale-105"
        style={{ 
          fill: tech.color,
          filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
        }}
      >
        <path d={tech.icon.path} />
      </svg>
    </div>
  )
}
