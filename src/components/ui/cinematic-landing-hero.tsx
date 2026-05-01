"use client"

import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Github,
  PlayCircle,
} from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '../../lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }
  .transform-style-3d { transform-style: preserve-3d; }

  .film-grain {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.05; mix-blend-mode: overlay;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .bg-grid-theme {
      background-size: 60px 60px;
      background-image:
          linear-gradient(to right, rgba(245, 247, 255, 0.055) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(245, 247, 255, 0.055) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .text-3d-matte {
      color: #F5F7FF;
      text-shadow:
          0 10px 30px rgba(245, 247, 255, 0.2),
          0 2px 4px rgba(245, 247, 255, 0.1);
  }

  .text-silver-matte {
      background: linear-gradient(180deg, #FFFFFF 0%, rgba(184, 192, 217, 0.82) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter:
          drop-shadow(0px 10px 20px rgba(245, 247, 255, 0.12))
          drop-shadow(0px 2px 4px rgba(245, 247, 255, 0.08));
  }

  .text-card-silver-matte {
      background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter:
          drop-shadow(0px 12px 24px rgba(0,0,0,0.8))
          drop-shadow(0px 4px 8px rgba(0,0,0,0.6));
  }

  .premium-depth-card {
      background:
          radial-gradient(circle at 18% 18%, rgba(124, 58, 237, 0.24), transparent 34%),
          radial-gradient(circle at 72% 32%, rgba(6, 182, 212, 0.18), transparent 36%),
          linear-gradient(145deg, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.035) 100%);
      backdrop-filter: blur(34px) saturate(210%);
      -webkit-backdrop-filter: blur(34px) saturate(210%);
      box-shadow:
          0 40px 120px -28px rgba(0, 0, 0, 0.78),
          0 18px 50px -24px rgba(6, 182, 212, 0.28),
          inset 0 1px 1px rgba(255, 255, 255, 0.24),
          inset 0 -1px 2px rgba(0, 0, 0, 0.24);
      border: 1px solid rgba(255, 255, 255, 0.16);
      position: relative;
  }

  .premium-depth-card::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
          linear-gradient(90deg, rgba(3, 6, 18, 0.64) 0%, rgba(3, 6, 18, 0.24) 34%, transparent 58%),
          radial-gradient(circle at 77% 48%, rgba(3, 6, 18, 0.58), transparent 32%);
      z-index: 0;
  }

  .card-sheen {
      position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
      background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06) 0%, transparent 40%);
      mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  .iphone-bezel {
      background-color: #111;
      box-shadow:
          inset 0 0 0 2px #52525B,
          inset 0 0 0 7px #000,
          0 40px 80px -15px rgba(0,0,0,0.9),
          0 15px 25px -5px rgba(0,0,0,0.7);
      transform-style: preserve-3d;
  }

  .hardware-btn {
      background: linear-gradient(90deg, #404040 0%, #171717 100%);
      box-shadow:
          -2px 0 5px rgba(0,0,0,0.8),
          inset -1px 0 1px rgba(255,255,255,0.15),
          inset 1px 0 2px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(255,255,255,0.05);
  }

  .screen-glare {
      background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }

  .widget-depth {
      background:
          linear-gradient(180deg, rgba(5, 8, 18, 0.58) 0%, rgba(5, 8, 18, 0.36) 100%);
      backdrop-filter: blur(18px) saturate(170%);
      -webkit-backdrop-filter: blur(18px) saturate(170%);
      box-shadow:
          0 10px 20px rgba(0,0,0,0.3),
          inset 0 1px 1px rgba(255,255,255,0.10),
          inset 0 -1px 1px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.10);
  }

  .floating-ui-badge {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 25px 50px -12px rgba(0, 0, 0, 0.8),
          inset 0 1px 1px rgba(255,255,255,0.2),
          inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  .btn-modern-light, .btn-modern-dark {
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .btn-modern-light {
      background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
      color: #0F172A;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15), 0 20px 32px -6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-dark {
      background: linear-gradient(180deg, #27272A 0%, #18181B 100%);
      color: #FFFFFF;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:hover {
      transform: translateY(-3px);
      background: linear-gradient(180deg, #3F3F46 0%, #27272A 100%);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 6px 12px -2px rgba(0,0,0,0.7), 0 20px 32px -6px rgba(0,0,0,1), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.8);
  }

  .progress-ring {
      transform: rotate(-90deg);
      transform-origin: center;
      stroke-dasharray: 402;
      stroke-dashoffset: 402;
      stroke-linecap: round;
  }
`

interface StoreLink {
  label: string
  sublabel: string
  href: string
  variant: 'light' | 'dark'
}

interface CodeSnippetContent {
  title: string
  code: string
}

export interface CinematicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  tagline1?: string
  tagline2?: string
  cardHeading?: string
  cardDescription?: React.ReactNode
  caseLabel?: string
  featureItems?: string[]
  stackItems?: string[]
  codeSnippetTitle?: string
  codeSnippet?: string
  codeSnippets?: CodeSnippetContent[]
  appLabel?: string
  sourcePanelTitle?: string
  sourcePanelEyebrow?: string
  videoSrc?: string
  videoLabel?: string
  videoStatus?: string
  videoFlowLabel?: string
  videoPlaceholderTitle?: string
  videoPlaceholderDescription?: string
  metricValue?: number
  metricLabel?: string
  stackLabel?: string
  showFinalCta?: boolean
  ctaHeading?: string
  ctaDescription?: string
  finalActions?: StoreLink[]
  secondaryAction?: StoreLink
}

export function CinematicHero({
  tagline1 = 'Booking,',
  tagline2 = 'with AI flow.',
  cardHeading = 'Conversational booking, built from scratch.',
  cardDescription = (
    <>
      <span className="font-semibold text-white">Reservo.AI</span> connects Flutter, Gemini AI,
      Firebase, biometrics, Riverpod, Rive, and Lottie into one mobile MVP for service bookings.
    </>
  ),
  caseLabel = 'Live MVP architecture',
  featureItems = [
    'Natural-language booking parsed by Gemini AI',
    'Firebase auth, Firestore, and push notification layer',
    'Biometric session restore with Riverpod state management',
  ],
  stackItems = ['Flutter', 'Dart', 'Firebase', 'Gemini AI', 'Riverpod', 'Rive'],
  codeSnippetTitle = 'Gemini booking parser',
  codeSnippet = `Future<Map<String, dynamic>?> extractReservationInfo(
  String userMessage,
) async {
  final raw = await sendMessage(prompt);
  return jsonDecode(raw) as Map<String, dynamic>?;
}`,
  codeSnippets,
  appLabel = 'Reservo.AI',
  sourcePanelTitle = 'Real Reservo.AI source',
  sourcePanelEyebrow = 'Source snippets',
  videoSrc,
  videoLabel = 'Demo video',
  videoStatus = 'Coming soon',
  videoFlowLabel = 'MVP Flow',
  videoPlaceholderTitle = 'Demo coming soon',
  videoPlaceholderDescription = 'This space will hold the real product walkthrough: biometric login, AI booking, calendar, and confirmation.',
  metricValue = 8,
  metricLabel = 'Core modules',
  stackLabel = 'Stack',
  showFinalCta = true,
  ctaHeading = 'Explore Reservo.AI.',
  ctaDescription = 'A Flutter MVP for appointment booking, built solo from product idea to technical implementation.',
  finalActions,
  secondaryAction = {
    label: 'GitHub',
    sublabel: 'View source',
    href: 'https://github.com/jcunto2010/reservo_ai',
    variant: 'dark',
  },
  className,
  ...props
}: CinematicHeroProps) {
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const mainCardRef = useRef<HTMLDivElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return

      cancelAnimationFrame(requestRef.current)

      requestRef.current = requestAnimationFrame(() => {
        if (!mainCardRef.current || !mockupRef.current) return

        const rect = mainCardRef.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        mainCardRef.current.style.setProperty('--mouse-x', `${mouseX}px`)
        mainCardRef.current.style.setProperty('--mouse-y', `${mouseY}px`)

        const xVal = (e.clientX / window.innerWidth - 0.5) * 2
        const yVal = (e.clientY / window.innerHeight - 0.5) * 2

        gsap.to(mockupRef.current, {
          rotationY: xVal * 12,
          rotationX: -yVal * 12,
          ease: 'power3.out',
          duration: 1.2,
        })
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(requestRef.current)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
      const mockupRevealScale = isMobile ? 0.62 : isTablet ? 0.82 : 1

      gsap.set('.text-track', { autoAlpha: 0, y: 60, scale: 0.85, filter: 'blur(20px)', rotationX: -20 })
      gsap.set('.text-days', { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' })
      gsap.set('.main-card', { y: window.innerHeight + 200, autoAlpha: 1 })
      gsap.set(['.card-left-text', '.card-right-text', '.mockup-scroll-wrapper', '.floating-badge', '.mockup-widget'], { autoAlpha: 0 })
      gsap.set('.card-left-text', { y: 80 })
      gsap.set('.card-right-text', { y: 90 })
      if (showFinalCta) {
        gsap.set('.cta-wrapper', { autoAlpha: 0, scale: 0.8, filter: 'blur(30px)' })
      }

      const introTl = gsap.timeline({ delay: 0.3 })
      introTl
        .to('.text-track', { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', rotationX: 0, ease: 'expo.out' })
        .to('.text-days', { duration: 1.4, clipPath: 'inset(0 0% 0 0)', ease: 'power4.inOut' }, '-=1.0')

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=7000',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      })

      scrollTl
        .to(['.hero-text-wrapper', '.bg-grid-theme'], { scale: 1.15, filter: 'blur(20px)', opacity: 0.2, ease: 'power2.inOut', duration: 2 }, 0)
        .to('.main-card', { y: 0, ease: 'power3.inOut', duration: 2 }, 0)
        .to('.main-card', { width: '100%', height: '100%', borderRadius: '0px', ease: 'power3.inOut', duration: 1.5 })
        .fromTo(
          '.mockup-scroll-wrapper',
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: mockupRevealScale, ease: 'expo.out', duration: 2.3 },
          '-=0.8',
        )
        .fromTo('.mockup-widget', { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: 'back.out(1.2)', duration: 1.5 }, '-=1.5')
        .to('.progress-ring', { strokeDashoffset: 60, duration: 2, ease: 'power3.inOut' }, '-=1.2')
        .to('.counter-val', { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 2, ease: 'expo.out' }, '-=2.0')
        .fromTo('.floating-badge', { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: 'back.out(1.5)', duration: 1.4, stagger: 0.2 }, '-=1.9')
        .to({}, { duration: 0.8 })
        .to('.card-left-text', { y: 0, autoAlpha: 1, ease: 'power4.out', duration: 1.4 })
        .to({}, { duration: 0.7 })
        .to('.card-right-text', { y: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 1.4 })

      if (showFinalCta) {
        scrollTl
          .to({}, { duration: 2.5 })
          .set('.hero-text-wrapper', { autoAlpha: 0 })
          .set('.cta-wrapper', { autoAlpha: 1 })
          .to({}, { duration: 1.5 })
          .to(['.mockup-scroll-wrapper', '.floating-badge', '.card-left-text', '.card-right-text'], {
            scale: 0.9,
            y: -40,
            z: -200,
            autoAlpha: 0,
            ease: 'power3.in',
            duration: 1.2,
            stagger: 0.05,
          })
          .to(
            '.main-card',
            {
              width: isMobile ? '92vw' : '85vw',
              height: isMobile ? '92vh' : '85vh',
              borderRadius: isMobile ? '32px' : '40px',
              ease: 'expo.inOut',
              duration: 1.8,
            },
            'pullback',
          )
          .to('.cta-wrapper', { scale: 1, filter: 'blur(0px)', ease: 'expo.inOut', duration: 1.8 }, 'pullback')
          .to('.main-card', { y: -window.innerHeight - 300, ease: 'power3.in', duration: 1.5 })
      } else {
        scrollTl
          .to({}, { duration: 2.2 })
          .to(['.mockup-scroll-wrapper', '.card-left-text', '.card-right-text'], {
            autoAlpha: 0,
            y: -24,
            ease: 'power2.inOut',
            duration: 0.9,
            stagger: 0.05,
          })
          .to('.main-card', { y: -window.innerHeight - 220, ease: 'power3.in', duration: 1.2 })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [metricValue, showFinalCta])

  const renderAction = (action: StoreLink) => {
    return (
      <a
        href={action.href}
        aria-label={`${action.sublabel}: ${action.label}`}
        className={cn(
          'group relative inline-flex h-14 w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full border p-1.5 ps-7 pe-16 text-base font-semibold whitespace-nowrap transition-all duration-500 hover:ps-16 hover:pe-7 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-[#070B1A] min-[1440px]:h-16 min-[1440px]:p-2 min-[1440px]:ps-8 min-[1440px]:pe-[4.5rem] min-[1440px]:text-lg min-[1440px]:hover:ps-[4.5rem] min-[1440px]:hover:pe-8',
          action.variant === 'light'
            ? 'border-[#F5F7FF]/25 bg-[#070B1A] text-[#F5F7FF] hover:bg-[#101935]'
            : 'border-white/15 bg-black text-[#F5F7FF] shadow-[0_18px_45px_rgba(0,0,0,0.45)] hover:bg-[#050505]',
        )}
      >
        <span className="relative z-10 inline-flex items-center gap-2 transition-all duration-500">
          <Github className="h-5 w-5 min-[1440px]:h-6 min-[1440px]:w-6" aria-hidden="true" />
          {action.label}
        </span>
        <span className="absolute right-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F7FF] text-[#070B1A] transition-all duration-500 group-hover:right-[calc(100%-50px)] group-hover:rotate-45 min-[1440px]:right-2 min-[1440px]:h-12 min-[1440px]:w-12 min-[1440px]:group-hover:right-[calc(100%-56px)]">
          <ArrowUpRight size={19} aria-hidden="true" />
        </span>
      </a>
    )
  }

  const snippets = codeSnippets ?? (codeSnippet ? [{ title: codeSnippetTitle, code: codeSnippet }] : [])
  const ctaActions = finalActions?.length ? finalActions : [secondaryAction]

  return (
    <div
      ref={containerRef}
      className={cn('relative flex h-screen w-full items-center justify-center overflow-hidden bg-transparent text-[#F5F7FF] antialiased', className)}
      style={{ perspective: '1500px' }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden="true" />
      <div className="bg-grid-theme absolute inset-0 z-0 opacity-50 pointer-events-none" aria-hidden="true" />

      <div className="hero-text-wrapper transform-style-3d absolute z-10 flex w-full flex-col items-center justify-center px-5 text-center will-change-transform">
        <h2 className="text-track gsap-reveal text-3d-matte mb-1 max-w-[95vw] py-1.5 text-4xl font-bold leading-[1.14] tracking-tight sm:text-5xl md:text-6xl lg:text-[6rem] min-[1440px]:text-[8rem]">
          {tagline1}
        </h2>
        <h2 className="text-days gsap-reveal text-silver-matte max-w-[95vw] py-1.5 text-4xl font-extrabold leading-[1.14] tracking-tighter sm:text-5xl md:text-6xl lg:text-[6rem] min-[1440px]:text-[8rem]">
          {tagline2}
        </h2>
      </div>

      {showFinalCta && (
        <div className="cta-wrapper gsap-reveal absolute z-10 flex w-full flex-col items-center justify-center px-4 text-center pointer-events-auto will-change-transform">
          <h2 className="text-silver-matte mb-5 max-w-[94vw] py-2 text-3xl font-bold leading-[1.14] tracking-tight sm:text-4xl md:text-5xl lg:text-7xl min-[1440px]:text-[6.5rem]">
            {ctaHeading}
          </h2>
          <p className="mx-auto mb-10 max-w-[22rem] text-base font-light leading-relaxed text-[#B8C0D9] sm:max-w-xl sm:text-lg md:text-xl min-[1440px]:max-w-3xl min-[1440px]:text-2xl">
            {ctaDescription}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {ctaActions.map((action) => (
              <React.Fragment key={`${action.href}-${action.label}`}>
                {renderAction(action)}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: '1500px' }}>
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card gsap-reveal relative flex h-[94vh] w-[94vw] items-center justify-center overflow-hidden rounded-[30px] pointer-events-auto md:h-[90vh] md:w-[90vw] md:rounded-[36px] lg:h-[85vh] lg:w-[85vw] lg:rounded-[40px] min-[1440px]:h-[88vh] min-[1440px]:w-[88vw]"
        >
          <div className="card-sheen" aria-hidden="true" />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] flex-col items-center justify-start gap-6 overflow-y-auto px-4 py-6 md:gap-8 md:px-6 md:py-7 lg:max-w-[1320px] lg:gap-10 lg:px-8 lg:py-8 min-[1440px]:max-w-[1480px] min-[1440px]:gap-12 min-[1440px]:px-10 min-[1440px]:py-10">
            <div className="mockup-scroll-wrapper order-1 relative z-10 mb-2 flex h-[290px] w-full items-center justify-center sm:h-[330px] md:mb-3 md:h-[440px] lg:mb-4 lg:h-[560px] min-[1440px]:h-[680px]" style={{ perspective: '1000px' }}>
              <div className="relative flex h-full w-full scale-[0.52] items-center justify-center sm:scale-[0.62] md:scale-[0.78] lg:scale-[0.95] min-[1440px]:scale-[1.08]">
                <div
                  ref={mockupRef}
                  className="iphone-bezel transform-style-3d relative flex h-[520px] w-[252px] flex-col rounded-[2.5rem] will-change-transform sm:h-[560px] sm:w-[272px] sm:rounded-[2.8rem] md:h-[600px] md:w-[292px] md:rounded-[3rem]"
                >
                  <div className="hardware-btn absolute -left-[3px] top-[120px] z-0 h-[25px] w-[3px] rounded-l-md" aria-hidden="true" />
                  <div className="hardware-btn absolute -left-[3px] top-[160px] z-0 h-[45px] w-[3px] rounded-l-md" aria-hidden="true" />
                  <div className="hardware-btn absolute -left-[3px] top-[220px] z-0 h-[45px] w-[3px] rounded-l-md" aria-hidden="true" />
                  <div className="hardware-btn absolute -right-[3px] top-[170px] z-0 h-[70px] w-[3px] scale-x-[-1] rounded-r-md" aria-hidden="true" />

                  <div className="absolute inset-[7px] z-10 overflow-hidden rounded-[2.5rem] bg-[#050914] text-white shadow-[inset_0_0_15px_rgba(0,0,0,1)]">
                    <div className="screen-glare absolute inset-0 z-40 pointer-events-none" aria-hidden="true" />

                    <div className="absolute left-0 right-0 top-[5px] z-50 mx-auto flex h-[28px] w-[100px] items-center justify-end rounded-full bg-black px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    </div>

                    <div className="relative flex h-full w-full flex-col px-5 pb-7 pt-12">
                      <div className="phone-widget mockup-widget mb-4 flex flex-shrink-0 items-center justify-between">
                        <div className="flex flex-col">
                          <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{appLabel}</span>
                          <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">{videoLabel}</span>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-neutral-200 shadow-lg shadow-black/50">
                          JC
                        </div>
                      </div>

                      <div className="phone-widget mockup-widget widget-depth relative mb-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-[#071427]">
                        {videoSrc ? (
                          <video
                            className="absolute inset-0 h-full w-full object-cover"
                            src={videoSrc}
                            muted
                            playsInline
                            controls
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(6,182,212,0.24),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />
                            <div className="absolute inset-x-5 top-5 flex items-center justify-between">
                              <span className="rounded-full border border-cyan-200/15 bg-white/5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-100/70">
                                {videoFlowLabel}
                              </span>
                              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.9)]" />
                            </div>
                            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
                              <PlayCircle className="mb-5 h-16 w-16 flex-shrink-0 text-cyan-100 drop-shadow-[0_0_24px_rgba(6,182,212,0.45)]" aria-hidden="true" />
                              <p className="text-2xl font-black tracking-tight text-white">{videoPlaceholderTitle}</p>
                              <p className="mt-3 max-w-[13rem] text-xs leading-relaxed text-cyan-100/55">
                                {videoPlaceholderDescription}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="phone-widget mockup-widget widget-depth flex flex-shrink-0 items-center justify-between rounded-2xl p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 shadow-inner">
                            <CalendarCheck className="h-4 w-4 text-emerald-300 drop-shadow-md" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{videoStatus}</p>
                            <p className="text-[10px] text-cyan-100/45">{metricValue} {metricLabel}</p>
                          </div>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                      </div>

                      <div className="absolute bottom-2 left-1/2 h-[4px] w-[120px] -translate-x-1/2 rounded-full bg-white/20 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="card-left-text gsap-reveal order-2 z-20 mb-2 flex w-full max-w-[52rem] flex-col justify-center px-1 text-center md:mb-3 lg:mb-4 lg:px-2">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-50/75 sm:text-xs min-[1440px]:text-sm">
                {caseLabel}
              </p>
              <h3 className="mb-2 text-xl font-bold tracking-tight text-white sm:text-2xl md:text-[1.7rem] lg:text-[2.2rem] min-[1440px]:text-5xl">
                {cardHeading}
              </h3>
              <p className="mx-auto max-w-[34rem] text-xs font-normal leading-relaxed text-white/80 sm:text-sm md:text-[0.95rem] min-[1440px]:text-lg">
                {cardDescription}
              </p>
              <div className="mt-4 grid gap-1.5 sm:gap-2">
                {featureItems.map((feature) => (
                  <div
                    key={feature}
                    className="phone-widget widget-depth flex items-center gap-2.5 rounded-xl p-2.5 text-left sm:gap-3 sm:rounded-2xl sm:p-3"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyan-100" aria-hidden="true" />
                    <p className="text-[11px] leading-relaxed text-white/82 sm:text-xs min-[1440px]:text-sm">{feature}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 sm:mt-4">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-50/70 sm:text-[10px]">
                  {stackLabel}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {stackItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/15 bg-black/25 px-2 py-0.5 text-[9px] font-semibold text-white/82 sm:px-2.5 sm:py-1 sm:text-[10px] min-[1440px]:px-3 min-[1440px]:py-1.5 min-[1440px]:text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-right-text gsap-reveal order-3 z-20 flex w-full flex-col items-center justify-center">
              <div className="w-full max-w-[23rem] overflow-hidden rounded-[1.3rem] border border-white/20 bg-[#050812]/55 text-left shadow-[0_30px_90px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-2xl backdrop-saturate-200 sm:max-w-[28rem] md:max-w-[31rem] min-[1440px]:max-w-[40rem]">
                <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3 sm:px-5 sm:py-4 min-[1440px]:px-6 min-[1440px]:py-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/65 sm:text-[10px] min-[1440px]:text-xs">
                      {sourcePanelEyebrow}
                    </p>
                    <p className="mt-1 text-base font-black tracking-tight text-white sm:text-lg min-[1440px]:text-2xl">
                      {sourcePanelTitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-black/10 px-2.5 py-2.5 sm:px-3 sm:py-3">
                  {snippets.map((snippet, index) => (
                    <button
                      key={snippet.title}
                      type="button"
                      onClick={() => setSelectedSnippetIndex(index)}
                      className={cn(
                        'shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] transition-colors sm:px-3 sm:py-1.5 sm:text-[10px] min-[1440px]:px-4 min-[1440px]:py-2 min-[1440px]:text-xs',
                        selectedSnippetIndex === index
                          ? 'border-white/35 bg-white/20 text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)]'
                          : 'border-white/10 bg-black/15 text-white/55 hover:bg-white/10 hover:text-white/85',
                      )}
                    >
                      {snippet.title}
                    </button>
                  ))}
                </div>
                {snippets[selectedSnippetIndex] && (
                  <pre className="max-h-[12rem] overflow-auto whitespace-pre-wrap bg-[#050712]/70 px-4 py-3 text-[9px] leading-relaxed text-slate-50/95 shadow-[inset_0_1px_24px_rgba(0,0,0,0.45)] sm:max-h-[16rem] sm:px-5 sm:py-4 sm:text-[10px] md:max-h-[20rem] lg:max-h-[28rem] min-[1440px]:max-h-[36rem] min-[1440px]:px-6 min-[1440px]:py-5 min-[1440px]:text-[13px]">
                    <code>{snippets[selectedSnippetIndex].code.trim()}</code>
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
