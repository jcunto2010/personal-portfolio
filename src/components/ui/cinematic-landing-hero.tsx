"use client"

import React, { useEffect, useRef } from 'react'
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
import { CodeSnippet } from './code-snippet'

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

  .cinematic-no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
  .cinematic-no-scrollbar::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
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
  /** Escala del teléfono mockup por breakpoint (Tailwind classes). */
  mockupScaleClassName?: string
  showFinalCta?: boolean
  ctaHeading?: string
  ctaDescription?: string
  finalActions?: StoreLink[]
  secondaryAction?: StoreLink
  /** Chips de stack debajo del snippet (fuera del panel), no en la columna de features. */
  stackBelowSnippet?: boolean
  /** Tres columnas iguales en lg+: snippet | mockup | features. */
  equalThirdsColumns?: boolean
  /** Panel de código estilo editor: sin títulos, traffic lights ni textos promocionales. */
  minimalSnippetChrome?: boolean
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
  videoSrc,
  videoLabel = 'Demo video',
  videoStatus = 'Coming soon',
  videoFlowLabel = 'MVP Flow',
  videoPlaceholderTitle = 'Demo coming soon',
  videoPlaceholderDescription = 'This space will hold the real product walkthrough: biometric login, AI booking, calendar, and confirmation.',
  metricValue = 8,
  metricLabel = 'Core modules',
  stackLabel = 'Stack',
  mockupScaleClassName = 'scale-[0.52] sm:scale-[0.62] md:scale-[0.72] lg:scale-[0.84] min-[1440px]:scale-[1]',
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
  stackBelowSnippet = false,
  equalThirdsColumns = false,
  minimalSnippetChrome = false,
  className,
  ...props
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mainCardRef = useRef<HTMLDivElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)
  const cardVerticalScrollRef = useRef<HTMLDivElement>(null)
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
    const scope = containerRef.current
    if (!scope) return

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
      const isCompactLayout = window.innerWidth < 1024
      // 3-column horizontal layout needs real width; from lg (1024px) matches Tailwind.
      const isDesktopLayout = window.innerWidth >= 1024
      const mockupRevealScale = isMobile ? 0.62 : isTablet ? 0.82 : 1

      // Mobile/tablet should use natural document flow (no pinned cinematic timeline),
      // so users can scroll through mock -> features -> snippet globally.
      if (isCompactLayout) {
        gsap.set('.main-card', { clearProps: 'transform,width,height,borderRadius,opacity,visibility' })
        gsap.set(['.mockup-scroll-wrapper', '.mockup-widget', '.card-left-text', '.card-right-text'], {
          autoAlpha: 1,
          clearProps: 'transform,filter,clipPath',
        })
        gsap.set(['.hero-text-wrapper', '.cta-wrapper'], { autoAlpha: 0 })
        return
      }

      gsap.set('.text-track', { autoAlpha: 0, y: 60, scale: 0.85, filter: 'blur(20px)', rotationX: -20 })
      gsap.set('.text-days', { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' })
      gsap.set('.main-card', { y: window.innerHeight + 200, autoAlpha: 1 })
      gsap.set(['.mockup-scroll-wrapper', '.floating-badge', '.mockup-widget'], { autoAlpha: 0 })
      if (isDesktopLayout) {
        if (equalThirdsColumns) {
          gsap.set('.card-left-text', { autoAlpha: 0, x: -50, y: 0 })
          gsap.set('.card-right-text', { autoAlpha: 0, x: 50, y: 0, scale: 0.8 })
        } else {
          gsap.set('.card-left-text', { autoAlpha: 0, x: -50, y: 0 })
          gsap.set('.card-right-text', { autoAlpha: 0, x: 50, y: 0, scale: 0.8 })
        }
      } else if (equalThirdsColumns) {
        gsap.set('.card-right-text', { autoAlpha: 0, x: 0, y: 90, scale: 1 })
        gsap.set('.card-left-text', { autoAlpha: 0, x: 0, y: 80 })
      } else {
        gsap.set('.card-left-text', { autoAlpha: 0, x: 0, y: 80 })
        gsap.set('.card-right-text', { autoAlpha: 0, x: 0, y: 90, scale: 1 })
      }
      if (showFinalCta) {
        gsap.set('.cta-wrapper', { autoAlpha: 0, scale: 0.8, filter: 'blur(30px)' })
      }

      const introTl = gsap.timeline({ delay: 0.3 })
      introTl
        .to('.text-track', { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', rotationX: 0, ease: 'expo.out' })
        .to('.text-days', { duration: 1.4, clipPath: 'inset(0 0% 0 0)', ease: 'power4.inOut' }, '-=1.0')

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
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

      if (isDesktopLayout) {
        if (equalThirdsColumns) {
          scrollTl
            .fromTo('.card-left-text', { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: 'power4.out', duration: 1.5 }, '-=1.5')
            .fromTo('.card-right-text', { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 1.5 }, '<')
        } else {
          scrollTl
            .fromTo('.card-left-text', { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: 'power4.out', duration: 1.5 }, '-=1.5')
            .fromTo('.card-right-text', { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 1.5 }, '<')
        }
      } else if (equalThirdsColumns) {
        scrollTl
          .to({}, { duration: 0.8 })
          .to('.card-left-text', { y: 0, autoAlpha: 1, ease: 'power4.out', duration: 1.4 })
          .to({}, { duration: 0.7 })
          .to('.card-right-text', { y: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 1.4 })
      } else {
        scrollTl
          .to({}, { duration: 0.8 })
          .to('.card-left-text', { y: 0, autoAlpha: 1, ease: 'power4.out', duration: 1.4 })
          .to({}, { duration: 0.7 })
          .to('.card-right-text', { y: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 1.4 })
      }

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
    }, scope)

    return () => ctx.revert()
  }, [metricValue, showFinalCta, equalThirdsColumns])

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
      className={cn('relative flex h-screen w-full items-center justify-center overflow-hidden bg-transparent text-[#F5F7FF] antialiased max-lg:h-auto max-lg:overflow-visible', className)}
      style={{ perspective: '1500px' }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden="true" />
      <div className="bg-grid-theme absolute inset-0 z-0 opacity-50 pointer-events-none" aria-hidden="true" />

      <div className="hero-text-wrapper transform-style-3d absolute inset-0 z-10 flex w-full flex-col items-center justify-center px-5 text-center will-change-transform">
        <h2 className="text-track gsap-reveal text-3d-matte mb-1 max-w-[95vw] py-1.5 text-4xl font-bold leading-[1.14] tracking-tight sm:text-5xl md:text-6xl lg:text-[6rem] min-[1440px]:text-[8rem]">
          {tagline1}
        </h2>
        <h2 className="text-days gsap-reveal text-silver-matte max-w-[95vw] py-1.5 text-4xl font-extrabold leading-[1.14] tracking-tighter sm:text-5xl md:text-6xl lg:text-[6rem] min-[1440px]:text-[8rem]">
          {tagline2}
        </h2>
      </div>

      {showFinalCta && (
        <div className="cta-wrapper gsap-reveal absolute inset-0 z-10 flex w-full flex-col items-center justify-center px-4 text-center pointer-events-auto will-change-transform">
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

      <div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none max-lg:relative max-lg:inset-auto max-lg:block max-lg:pointer-events-auto"
        style={{ perspective: '1500px' }}
      >
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card gsap-reveal relative flex h-[94vh] w-[94vw] max-lg:min-h-0 items-center justify-center overflow-hidden rounded-[30px] pointer-events-auto max-lg:h-auto max-lg:overflow-visible md:h-[90vh] md:w-[90vw] md:rounded-[36px] lg:h-[85vh] lg:w-[85vw] lg:flex-col lg:items-stretch lg:justify-center lg:rounded-[40px] lg:py-3 min-[1440px]:h-[88vh] min-[1440px]:w-[88vw]"
        >
          <div className="card-sheen" aria-hidden="true" />

          <div
            ref={cardVerticalScrollRef}
            className={cn(
              'relative z-10 box-border mx-auto flex h-full min-h-0 w-full max-w-[1200px] flex-1 flex-col items-center justify-start overflow-visible px-4 py-6 lg:w-full lg:flex-1 lg:overflow-visible lg:px-6',
              'max-lg:snap-y max-lg:snap-mandatory max-lg:touch-pan-y max-lg:overscroll-y-auto max-lg:gap-0',
              'max-lg:h-auto max-lg:flex-none',
              'gap-6 md:px-6 md:py-7 lg:gap-8',
              equalThirdsColumns
                ? 'lg:grid lg:max-w-[1500px] lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)] lg:place-items-center lg:overflow-visible lg:px-10 lg:py-2 min-[1440px]:max-w-[1840px] min-[1440px]:gap-12 min-[1440px]:px-14 min-[1440px]:py-3'
                : 'lg:grid lg:max-w-[1500px] lg:grid-cols-[1.22fr_0.9fr_1.05fr] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch lg:justify-evenly lg:overflow-visible lg:px-10 lg:py-2 min-[1440px]:max-w-[1840px] min-[1440px]:gap-12 min-[1440px]:px-14 min-[1440px]:py-3',
            )}
          >
            <div
              className={cn(
                'max-lg:snap-start max-lg:snap-always flex w-full max-lg:min-h-[88dvh] max-lg:shrink-0 max-lg:flex-col max-lg:items-center max-lg:justify-center max-lg:py-3',
                'lg:contents',
              )}
            >
            <div
              className={cn(
                'mockup-scroll-wrapper relative z-10 flex h-[290px] w-full min-h-0 items-center justify-center sm:h-[330px] md:h-[420px] lg:mb-0 lg:flex lg:h-full lg:max-h-full lg:min-h-0 lg:items-center lg:justify-center',
                equalThirdsColumns ? 'order-1 lg:order-2 lg:mx-auto lg:w-full lg:max-w-none lg:px-2' : 'order-1 lg:order-2',
              )}
              style={{ perspective: '1000px' }}
            >
              <div className={cn('relative flex h-full min-h-0 w-full items-center justify-center', mockupScaleClassName)}>
                <div
                  ref={mockupRef}
                  className="iphone-bezel transform-style-3d relative flex h-[520px] w-[252px] flex-col rounded-[2.5rem] will-change-transform sm:h-[560px] sm:w-[272px] sm:rounded-[2.8rem] lg:h-[500px] lg:w-[244px] lg:rounded-[2.75rem] min-[1440px]:h-[548px] min-[1440px]:w-[268px] min-[1440px]:rounded-[3rem]"
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
            </div>

            <div
              className={cn(
                'max-lg:snap-start max-lg:snap-always flex w-full max-lg:min-h-[88dvh] max-lg:shrink-0 max-lg:flex-col max-lg:items-center max-lg:justify-center max-lg:px-0 max-lg:py-4',
                'lg:contents',
              )}
            >
            <div
              className={cn(
                'card-left-text cinematic-no-scrollbar gsap-reveal z-20 flex w-full max-w-[52rem] flex-col justify-center px-1 text-center lg:mb-0 lg:h-full lg:max-h-full lg:min-h-0 lg:max-w-none lg:items-start lg:justify-start lg:overflow-visible lg:px-0 lg:pt-1 lg:text-left',
                equalThirdsColumns ? 'order-2 lg:order-1 lg:mx-auto lg:w-full lg:max-w-none lg:px-2' : 'order-2 lg:order-1',
                equalThirdsColumns ? 'lg:items-center lg:justify-center lg:overflow-visible lg:pt-0 lg:text-center' : '',
              )}
            >
              {caseLabel ? (
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-50/75 sm:text-xs min-[1440px]:text-sm">
                  {caseLabel}
                </p>
              ) : null}
              <h3 className="mb-2 text-xl font-bold tracking-tight text-white sm:text-2xl md:text-[1.65rem] lg:text-4xl min-[1440px]:text-5xl">
                {cardHeading}
              </h3>
              <p
                className={cn(
                  'mx-auto max-w-[34rem] text-xs font-normal leading-relaxed text-white/80 sm:text-sm md:text-[0.95rem] lg:mx-0 lg:max-w-none lg:text-base min-[1440px]:text-lg',
                  equalThirdsColumns ? 'lg:mx-auto lg:max-w-none' : '',
                )}
              >
                {cardDescription}
              </p>
              <div
                className={cn(
                  'mt-4 grid gap-1.5 sm:gap-2 lg:mt-3 lg:gap-1',
                  equalThirdsColumns ? 'lg:mx-auto lg:w-full lg:max-w-none' : '',
                )}
              >
                {featureItems.map((feature) => (
                  <div
                    key={feature}
                    className="phone-widget widget-depth flex items-center gap-2.5 rounded-xl p-2.5 text-left sm:gap-3 sm:rounded-2xl sm:p-3 lg:gap-2 lg:rounded-lg lg:p-2"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyan-100" aria-hidden="true" />
                    <p className="text-[11px] leading-relaxed text-white/82 sm:text-xs min-[1440px]:text-sm">{feature}</p>
                  </div>
                ))}
              </div>
              {!stackBelowSnippet ? (
                <div className="mt-3.5 sm:mt-4">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-50/70 sm:text-[10px]">
                    {stackLabel}
                  </p>
                  <div className={cn('flex flex-wrap justify-center gap-1.5 sm:gap-2 lg:justify-start', equalThirdsColumns ? 'lg:justify-center' : '')}>
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
              ) : null}
            </div>
            </div>

            <div
              className={cn(
                'max-lg:snap-start max-lg:snap-always flex w-full max-lg:min-h-[88dvh] max-lg:shrink-0 max-lg:flex-col max-lg:items-center max-lg:justify-start max-lg:px-0 max-lg:pb-8 max-lg:pt-4',
                'lg:contents',
              )}
            >
            <div
              className={cn(
                'card-right-text cinematic-no-scrollbar gsap-reveal z-20 flex w-full min-w-0 flex-col lg:h-full lg:max-h-full lg:min-h-0 lg:overflow-visible lg:pt-1',
                equalThirdsColumns ? 'order-3 items-center justify-center lg:order-3 lg:w-full lg:max-w-none lg:items-center lg:justify-center lg:px-2' : 'order-3 items-center justify-center lg:order-3',
                minimalSnippetChrome && !equalThirdsColumns ? 'lg:items-center lg:justify-center' : '',
                !minimalSnippetChrome && !equalThirdsColumns ? 'lg:items-start lg:justify-start' : '',
                minimalSnippetChrome && equalThirdsColumns ? 'lg:items-center lg:justify-center lg:overflow-visible lg:pt-0' : '',
              )}
            >
              <CodeSnippet
                files={snippets.map((s) => ({ filename: s.title, language: detectLanguage(s.code, s.title), code: s.code }))}
                autoHeight
                className={cn(
                  equalThirdsColumns ? 'w-full' : 'w-full max-w-[28rem] lg:scale-[0.94] min-[1440px]:scale-100',
                )}
              />
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
