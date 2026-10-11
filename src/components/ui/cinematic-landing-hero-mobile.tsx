'use client'

import { useEffect, useMemo, useRef } from 'react'
import { PlayCircle } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '../../lib/utils'
import { CodeSnippet } from './code-snippet'
import {
  CINEMATIC_MOCK_VIDEO_SCALE,
  CINEMATIC_MOCK_VIDEO_SCALE_X_RATIO,
  CINEMATIC_MOCK_VIDEO_SCALE_Y_RATIO,
  CINEMATIC_MOCK_VIDEO_TRANSLATE_X_DEFAULT_PX,
  type CinematicHeroProps,
} from './cinematic-landing-hero'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const EMPTY_STRING_LIST: string[] = []

export function CinematicHeroMobile({
  tagline1 = 'My projects,',
  tagline2 = 'starting with Reservo.AI.',
  cardHeading = 'AI-powered booking in Flutter.',
  cardDescription,
  caseLabel,
  featureItems = EMPTY_STRING_LIST,
  stackItems = EMPTY_STRING_LIST,
  codeSnippetTitle = 'Snippet',
  codeSnippet,
  codeSnippets,
  appLabel = 'App',
  videoSrc,
  videoTranslateXPx,
  videoScale,
  videoScaleXRatio,
  videoScaleYRatio,
  videoLabel = 'Demo video',
  videoFlowLabel = 'MVP Flow',
  videoPlaceholderTitle = 'Demo pending',
  videoPlaceholderDescription = 'Demo will be added soon.',
  stackLabel = 'Stack',
  className,
  ...props
}: CinematicHeroProps) {
  const videoNudgeX = videoTranslateXPx ?? CINEMATIC_MOCK_VIDEO_TRANSLATE_X_DEFAULT_PX
  const videoScaleBase = videoScale ?? CINEMATIC_MOCK_VIDEO_SCALE
  const xRatio = videoScaleXRatio ?? CINEMATIC_MOCK_VIDEO_SCALE_X_RATIO
  const yRatio = videoScaleYRatio ?? CINEMATIC_MOCK_VIDEO_SCALE_Y_RATIO
  const videoScaleY = videoScaleBase * yRatio
  const videoScaleX = videoScaleBase * xRatio

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
      language: s.title.endsWith('.dart') ? 'dart' : 'typescript',
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
          <h2 className="text-4xl font-semibold leading-[1.14] tracking-tight sm:text-5xl">{tagline1}</h2>
          <h2 className="mt-2 text-4xl font-extrabold leading-[1.14] tracking-tight sm:text-5xl">{tagline2}</h2>
        </div>
      </section>

      {/* Card glassmorphism with scroll animations - mobile edge-to-edge with safe padding */}
      <section className="relative w-full pb-20">
        <div
          ref={cardRef}
          className="relative mx-auto w-[calc(100%-1rem)] max-w-[34rem] overflow-hidden rounded-[32px] border border-white/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0.035)_100%)] px-3 sm:px-6 py-6 shadow-[0_40px_120px_-28px_rgba(0,0,0,0.78),0_18px_50px_-24px_rgba(6,182,212,0.28),inset_0_1px_1px_rgba(255,255,255,0.24),inset_0_-1px_2px_rgba(0,0,0,0.24)] backdrop-blur-[30px] will-change-transform"
        >
          {/* Header */}
          <div className="mb-6 text-center">
            {caseLabel ? (
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-50/75">{caseLabel}</p>
            ) : null}
            <h3 className="text-3xl font-semibold tracking-tight text-white">{cardHeading}</h3>
            {cardDescription ? <div className="mt-2 text-sm leading-relaxed text-white/80">{cardDescription}</div> : null}
          </div>

          {/* MOCK with animation */}
          <div ref={mockRef} className="mx-auto flex w-full max-w-[16rem] flex-col items-center justify-center py-4 will-change-transform">
            <div className="relative mb-4 h-[28rem] w-[14rem] sm:h-[30rem] sm:w-[15rem] rounded-[2.6rem] border border-white/20 bg-[#050914] p-[7px] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <div className="relative h-full w-full overflow-hidden rounded-[2.35rem] bg-[#050914]">
                {videoSrc ? (
                  <div className="absolute inset-0 z-20 overflow-hidden rounded-[2.35rem] bg-[#050914]">
                    <video
                      className="pointer-events-none block h-full w-full min-h-full min-w-full max-h-none max-w-none object-cover object-center"
                      style={{
                        transform: `translate3d(${videoNudgeX}px, 0, 0) scaleX(${videoScaleX}) scaleY(${videoScaleY})`,
                        transformOrigin: 'center center',
                      }}
                      src={videoSrc}
                      muted
                      autoPlay
                      loop
                      playsInline
                      preload="auto"
                    />
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-x-5 top-4 flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/65">{appLabel}</span>
                      <span className="text-[10px] font-semibold text-white/85">{videoLabel}</span>
                    </div>
                    <div className="absolute inset-x-5 top-10 flex items-center justify-between">
                      <span className="rounded-full border border-cyan-200/20 bg-white/5 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-100/75">
                        {videoFlowLabel}
                      </span>
                      <span className="size-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.85)]" />
                    </div>
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                        <PlayCircle className="mb-4 size-14 text-cyan-100" aria-hidden="true" />
                        <p className="text-3xl font-black tracking-tight text-white">{videoPlaceholderTitle}</p>
                        <p className="mt-3 text-xs leading-relaxed text-cyan-100/65">{videoPlaceholderDescription}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* FEATURES with staggered animation - clean glassmorphism */}
          {featureItems.length > 0 && (
            <div ref={featuresRef} className="mt-6 border-t border-white/10 pt-6">
              <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-50/75">Features</p>
              <div className="grid gap-3">
                {featureItems.map((feature) => (
                  <div key={feature} className="feature-item rounded-xl border border-white/10 bg-white/[0.06] p-3 text-left will-change-transform backdrop-blur-sm">
                    <p className="text-sm leading-relaxed text-white/90">{feature}</p>
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

          {/* STACK with staggered chip animation - clean glassmorphism */}
          {stackItems.length > 0 && (
            <div ref={stackRef} className="mt-6 border-t border-white/10 pt-6 text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-50/70">{stackLabel}</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {stackItems.map((item) => (
                  <span
                    key={item}
                    className="stack-chip rounded-full border border-white/10 bg-white/[0.08] px-2.5 py-1 text-[10px] font-semibold text-white/90 will-change-transform backdrop-blur-sm"
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
