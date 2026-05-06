'use client'

import { useEffect, useMemo, useRef } from 'react'
import { PlayCircle } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '../../lib/utils'
import { CodeSnippet } from './code-snippet'
import type { CinematicHeroProps } from './cinematic-landing-hero'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Helper to detect language from code for syntax highlighting
function detectLanguage(code: string, filename?: string): string {
  // Detect by filename extension if provided
  if (filename) {
    if (filename.endsWith('.dart')) return 'dart'
    if (filename.endsWith('.kt') || filename.endsWith('.java')) return 'java'
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript'
    if (filename.endsWith('.jsx') || filename.endsWith('.js')) return 'javascript'
  }

  // Check for Dart-specific type patterns (very strong indicators)
  const hasDartTypePattern = /Future<[^>]+>\s+\w+\s*\(/.test(code) ||
    /Map<String\s*,\s*dynamic>/.test(code) ||
    /List<[^>]+>/.test(code)

  // Dart-specific keywords and patterns (weighted more heavily)
  const dartIndicators = [
    { pattern: 'Future<', weight: 3 },
    { pattern: 'Stream<', weight: 3 },
    { pattern: 'await ', weight: 2 },
    { pattern: 'async ', weight: 2 },
    { pattern: 'final ', weight: 2 },
    { pattern: 'const ', weight: 1 },
    { pattern: 'Widget', weight: 3 },
    { pattern: 'StatelessWidget', weight: 5 },
    { pattern: 'StatefulWidget', weight: 5 },
    { pattern: 'BuildContext', weight: 4 },
    { pattern: 'setState(', weight: 4 },
    { pattern: 'mounted', weight: 3 },
    { pattern: 'initState', weight: 4 },
    { pattern: 'dispose()', weight: 3 },
    { pattern: 'Column(', weight: 3 },
    { pattern: 'Row(', weight: 3 },
    { pattern: 'Container(', weight: 3 },
    { pattern: 'Scaffold(', weight: 4 },
    { pattern: 'EdgeInsets', weight: 3 },
    { pattern: 'BoxDecoration', weight: 3 },
    { pattern: 'Colors.', weight: 3 },
    { pattern: 'required ', weight: 2 },
    { pattern: 'factory ', weight: 3 },
    { pattern: 'part ', weight: 2 },
    { pattern: 'extension ', weight: 2 },
    { pattern: 'mixin ', weight: 2 },
    { pattern: 'on ', weight: 1 },
  ]

  // TypeScript/JavaScript indicators
  const tsIndicators = [
    { pattern: 'interface ', weight: 3 },
    { pattern: 'type ', weight: 2 },
    { pattern: 'export const', weight: 2 },
    { pattern: 'export function', weight: 2 },
    { pattern: 'export async', weight: 2 },
    { pattern: 'import React', weight: 3 },
    { pattern: 'from \'react\'', weight: 3 },
    { pattern: 'from "react"', weight: 3 },
    { pattern: 'const [', weight: 2 },
    { pattern: 'useState(', weight: 3 },
    { pattern: 'useEffect(', weight: 3 },
    { pattern: 'useCallback(', weight: 3 },
    { pattern: 'useMemo(', weight: 3 },
    { pattern: 'JSX.', weight: 3 },
    { pattern: 'React.', weight: 2 },
    { pattern: '=> {', weight: 1 },
    { pattern: 'function(', weight: 1 },
    { pattern: 'typeof ', weight: 2 },
    { pattern: 'as ', weight: 1 },
    { pattern: 'namespace ', weight: 3 },
    { pattern: 'declare ', weight: 3 },
    { pattern: 'module.exports', weight: 3 },
    { pattern: 'require(', weight: 2 },
  ]

  // Check for JSX (strong indicator of TypeScript/React)
  const hasJSX = /<[A-Z][a-zA-Z]*/.test(code) || /className=/.test(code) || /on[A-Z][a-zA-Z]*=/.test(code)

  // Calculate weighted scores
  const dartScore = dartIndicators.reduce((sum, { pattern, weight }) => {
    return sum + (code.includes(pattern) ? weight : 0)
  }, 0)

  const tsScore = tsIndicators.reduce((sum, { pattern, weight }) => {
    return sum + (code.includes(pattern) ? weight : 0)
  }, 0)

  // Strong Dart type pattern detection
  if (hasDartTypePattern) return 'dart'

  // JSX is a strong indicator for TypeScript
  if (hasJSX) return 'typescript'

  // Return based on weighted scores with threshold
  if (dartScore >= 3 && dartScore > tsScore) return 'dart'
  if (tsScore >= 3) return 'typescript'

  // Default based on likely patterns
  if (dartScore > 0 && tsScore === 0) return 'dart'
  if (tsScore > 0 && dartScore === 0) return 'typescript'

  // Check for generic Dart patterns in function signatures
  if (/\w+<[^>]+>\s+\w+\s*\([^)]*\)\s*\{/.test(code) && !code.includes('interface') && !code.includes('type ')) {
    return 'dart'
  }

  // Default to typescript for web projects
  return 'typescript'
}

export function CinematicHeroMobile({
  tagline1 = 'My projects,',
  tagline2 = 'starting with Reservo.AI.',
  cardHeading = 'AI-powered booking in Flutter.',
  cardDescription,
  caseLabel,
  featureItems = [],
  stackItems = [],
  codeSnippetTitle = 'Snippet',
  codeSnippet,
  codeSnippets,
  appLabel = 'App',
  videoSrc,
  videoLabel = 'Demo video',
  videoFlowLabel = 'MVP Flow',
  videoPlaceholderTitle = 'Demo pending',
  videoPlaceholderDescription = 'Demo will be added soon.',
  stackLabel = 'Stack',
  className,
  ...props
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const mockRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const snippetRef = useRef<HTMLDivElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)

  // Convert snippets to CodeFile format for CodeSnippet component
  const codeFiles = useMemo(() => {
    const snippetsList = codeSnippets ?? (codeSnippet ? [{ title: codeSnippetTitle, code: codeSnippet }] : [])
    return snippetsList.map((s) => ({
      filename: s.title,
      language: detectLanguage(s.code, s.title),
      code: s.code,
    }))
  }, [codeSnippets, codeSnippet, codeSnippetTitle])

  // Scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Tagline entrance
      gsap.fromTo(
        taglineRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: taglineRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Card entrance with glassmorphism effect
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 60, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Mock phone reveal
      gsap.fromTo(
        mockRef.current,
        { opacity: 0, y: 50, scale: 0.85, rotateX: 15 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: mockRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Features staggered reveal
      if (featuresRef.current) {
        const featureItems = featuresRef.current.querySelectorAll('.feature-item')
        gsap.fromTo(
          featureItems,
          { opacity: 0, x: -30, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      // Snippet reveal
      gsap.fromTo(
        snippetRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: snippetRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Stack chips staggered reveal
      if (stackRef.current) {
        const chips = stackRef.current.querySelectorAll('.stack-chip')
        gsap.fromTo(
          chips,
          { opacity: 0, scale: 0.7, y: 10 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'back.out(1.8)',
            scrollTrigger: {
              trigger: stackRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [featureItems.length, stackItems.length, codeFiles.length])

  return (
    <div ref={containerRef} className={cn('relative w-full bg-transparent text-[#F5F7FF]', className)} {...props}>
      {/* Taglines with animation */}
      <section className="relative flex min-h-[72vh] items-center justify-center px-5 py-10 text-center">
        <div ref={taglineRef} className="will-change-transform">
          <h2 className="text-4xl font-bold leading-[1.14] tracking-tight sm:text-5xl">{tagline1}</h2>
          <h2 className="mt-2 text-4xl font-extrabold leading-[1.14] tracking-tight sm:text-5xl">{tagline2}</h2>
        </div>
      </section>

      {/* Card glassmorphism with scroll animations */}
      <section className="relative px-4 pb-20">
        <div
          ref={cardRef}
          className="mx-auto w-full max-w-[34rem] rounded-[26px] border border-white/20 bg-[#060b17]/70 px-5 py-6 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl will-change-transform"
        >
          {/* Header */}
          <div className="mb-6 text-center">
            {caseLabel ? (
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-50/75">{caseLabel}</p>
            ) : null}
            <h3 className="text-3xl font-bold tracking-tight text-white">{cardHeading}</h3>
            {cardDescription ? <div className="mt-2 text-sm leading-relaxed text-white/80">{cardDescription}</div> : null}
          </div>

          {/* MOCK with animation */}
          <div ref={mockRef} className="mx-auto flex max-w-[17rem] flex-col items-center justify-center py-4 will-change-transform">
            <div className="relative mb-4 h-[30rem] w-[15rem] rounded-[2.6rem] border border-white/20 bg-[#050914] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] bg-[#061022]">
                <div className="absolute inset-x-5 top-4 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/65">{appLabel}</span>
                  <span className="text-[10px] font-semibold text-white/85">{videoLabel}</span>
                </div>
                <div className="absolute inset-x-5 top-10 flex items-center justify-between">
                  <span className="rounded-full border border-cyan-200/20 bg-white/5 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-100/75">
                    {videoFlowLabel}
                  </span>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.85)]" />
                </div>
                <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
                  {videoSrc ? (
                    <video
                      className="absolute inset-0 h-full w-full object-cover"
                      src={videoSrc}
                      muted
                      autoPlay
                      loop
                      playsInline
                      controls
                    />
                  ) : (
                    <>
                      <PlayCircle className="mb-4 h-14 w-14 text-cyan-100" aria-hidden="true" />
                      <p className="text-3xl font-black tracking-tight text-white">{videoPlaceholderTitle}</p>
                      <p className="mt-3 text-xs leading-relaxed text-cyan-100/65">{videoPlaceholderDescription}</p>
                    </>
                  )}
                </div>
                </div>
            </div>
          </div>

          {/* FEATURES with staggered animation */}
          {featureItems.length > 0 && (
            <div ref={featuresRef} className="mt-6 border-t border-white/10 pt-6">
              <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-50/75">Features</p>
              <div className="grid gap-3">
                {featureItems.map((feature) => (
                  <div key={feature} className="feature-item rounded-xl border border-white/15 bg-black/25 p-3 text-left will-change-transform">
                    <p className="text-sm leading-relaxed text-white/88">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SNIPPET with new CodeSnippet component */}
          {codeFiles.length > 0 && (
            <div ref={snippetRef} className="mt-6 border-t border-white/10 pt-6 will-change-transform">
              <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-50/75">Code</p>
              <CodeSnippet files={codeFiles} />
            </div>
          )}

          {/* STACK with staggered chip animation */}
          {stackItems.length > 0 && (
            <div ref={stackRef} className="mt-6 border-t border-white/10 pt-6 text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-50/70">{stackLabel}</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {stackItems.map((item) => (
                  <span
                    key={item}
                    className="stack-chip rounded-full border border-white/15 bg-black/25 px-2 py-0.5 text-[10px] font-semibold text-white/82 will-change-transform"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
