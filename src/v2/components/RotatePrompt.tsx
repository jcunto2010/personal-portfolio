import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useLocale } from '../lib/localeContext'

export interface RotatePromptProps {
  /** `true` cuando el preload de assets (p. ej. GLBs iniciales) ha terminado. */
  isReady: boolean
}

interface StarParticle {
  x: number
  y: number
  r: number
  o: number
  sp: number
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function createParticles(count: number): StarParticle[] {
  const out: StarParticle[] = []
  for (let i = 0; i < count; i += 1) {
    out.push({
      x: Math.random(),
      y: Math.random(),
      r: randomBetween(0.3, 1.5),
      o: randomBetween(0.08, 0.55),
      sp: randomBetween(0.1, 0.5),
    })
  }
  return out
}

export default function RotatePrompt({ isReady }: RotatePromptProps): ReactElement {
  const { locale } = useLocale()
  const copy = useMemo(
    () =>
      locale === 'es'
        ? {
            loadingHeadline: 'Cargando experiencia...',
            rotateHeadline: 'Gira tu dispositivo',
            rotateSub:
              'El modo inmersivo está optimizado para pantalla horizontal',
          }
        : {
            loadingHeadline: 'Loading experience…',
            rotateHeadline: 'Rotate your device',
            rotateSub: 'Immersive mode is optimized for landscape',
          },
    [locale],
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<StarParticle[] | null>(null)
  const [show, setShow] = useState<boolean>(false)
  const [isPortraitLayout, setIsPortraitLayout] = useState<boolean>(true)

  useEffect(() => {
    const computeLayout = (): void => {
      const isMobile = window.matchMedia('(pointer: coarse)').matches
      const isPortrait = window.innerWidth < window.innerHeight
      const isLandscape = !isPortrait
      const shouldShow = isMobile && !(isLandscape && isReady)
      setShow(shouldShow)
      setIsPortraitLayout(isPortrait)
    }

    computeLayout()
    window.addEventListener('resize', computeLayout)
    return () => window.removeEventListener('resize', computeLayout)
  }, [isReady])

  useEffect(() => {
    if (!show) return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    if (!particlesRef.current) {
      particlesRef.current = createParticles(90)
    }
    const particles = particlesRef.current

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let observer: ResizeObserver | null = null

    const resizeCanvas = (): void => {
      const w = container.clientWidth
      const h = container.clientHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.cssText = `width:${w}px;height:${h}px;`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resizeCanvas()
    observer = new ResizeObserver(() => {
      resizeCanvas()
    })
    observer.observe(container)

    const tick = (tMs: number): void => {
      const t = tMs / 1000
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      ctx.clearRect(0, 0, cw, ch)
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i]
        const opacity = p.o * (0.6 + 0.4 * Math.sin(t * p.sp + p.x * 10))
        ctx.beginPath()
        ctx.fillStyle = `rgba(180, 190, 255, ${opacity})`
        ctx.arc(p.x * cw, p.y * ch, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      rafId = window.requestAnimationFrame(tick)
    }
    rafId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(rafId)
      observer?.disconnect()
    }
  }, [show])

  const loadingLandscape = !isReady && !isPortraitLayout

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(3, 7, 18, 0.97)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            ref={containerRef}
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
              }}
              aria-hidden
            />
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 90,
                height: 90,
                marginBottom: '0.5rem',
              }}
            >
              <svg
                className="rotatePrompt__arcSvg"
                width={90}
                height={90}
                viewBox="0 0 90 90"
                style={{ position: 'absolute', inset: 0 }}
                aria-hidden
              >
                <circle
                  cx={45}
                  cy={45}
                  r={38}
                  fill="none"
                  stroke="rgba(99,102,241,0.2)"
                  strokeWidth={1}
                />
                <g className="rotatePrompt__arcSpin" style={{ transformOrigin: '45px 45px' }}>
                  <path
                    d="M 45 7 A 38 38 0 0 1 83 45"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                </g>
              </svg>

              <svg
                className="rotatePrompt__phoneSvg"
                width={90}
                height={90}
                viewBox="-2 0 42 64"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 48,
                  height: 48,
                }}
                aria-hidden
              >
                <rect
                  x={0.6}
                  y={0.6}
                  width={36.8}
                  height={62.8}
                  rx={9}
                  fill="rgba(99,102,241,0.10)"
                  stroke="#6366f1"
                  strokeWidth={1.2}
                />
                <rect x={12} y={4.5} width={14} height={5} rx={2.5} fill="#6366f1" opacity={0.55} />
                <rect
                  x={4}
                  y={13}
                  width={30}
                  height={38}
                  rx={3}
                  fill="rgba(99,102,241,0.12)"
                />
                <rect x={13} y={57} width={12} height={2.5} rx={1.25} fill="#6366f1" opacity={0.45} />
                <rect x={37.2} y={18} width={1.5} height={8} rx={0.75} fill="#6366f1" opacity={0.35} />
                <rect x={-0.7} y={16} width={1.5} height={6} rx={0.75} fill="#6366f1" opacity={0.35} />
                <rect x={-0.7} y={25} width={1.5} height={6} rx={0.75} fill="#6366f1" opacity={0.35} />
              </svg>
            </div>

            {loadingLandscape ? (
              <>
                <p
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 500,
                    color: '#f0f4ff',
                    letterSpacing: '-0.02em',
                    textAlign: 'center',
                  }}
                >
                  {copy.loadingHeadline}
                </p>
                <div className="rotatePrompt__loadingSub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="rotatePrompt__dot" />
                  <span className="rotatePrompt__dot" />
                  <span className="rotatePrompt__dot" />
                </div>
              </>
            ) : (
              <>
                <p
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 500,
                    color: '#f0f4ff',
                    letterSpacing: '-0.02em',
                    textAlign: 'center',
                  }}
                >
                  {copy.rotateHeadline}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: 'rgba(160,175,210,0.6)',
                    maxWidth: 220,
                    lineHeight: 1.65,
                    textAlign: 'center',
                  }}
                >
                  {copy.rotateSub}
                </p>
              </>
            )}
          </div>

          <style>{`
            @keyframes rotatePhone {
              0%   { transform: translate(-50%, -50%) rotate(0deg);   opacity: 1;   }
              35%  { transform: translate(-50%, -50%) rotate(-90deg); opacity: 1;   }
              65%  { transform: translate(-50%, -50%) rotate(-90deg); opacity: 1;   }
              85%  { transform: translate(-50%, -50%) rotate(0deg);   opacity: 0.5; }
              100% { transform: translate(-50%, -50%) rotate(0deg);   opacity: 1;   }
            }
            @keyframes spinArc {
              0%   { transform: rotate(0deg);   opacity: 0; }
              12%  { opacity: 1; }
              35%  { transform: rotate(-90deg); opacity: 0; }
              100% { transform: rotate(-90deg); opacity: 0; }
            }
            @keyframes rotatePromptDot {
              0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
              40% { transform: scale(1); opacity: 1; }
            }
            .rotatePrompt__phoneSvg {
              animation: rotatePhone 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              transform-origin: center center;
            }
            .rotatePrompt__arcSpin {
              animation: spinArc 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            .rotatePrompt__dot {
              display: inline-block;
              width: 8px;
              height: 8px;
              margin: 0 4px;
              border-radius: 50%;
              background: rgba(99, 102, 241, 0.85);
              animation: rotatePromptDot 1.2s ease-in-out infinite;
            }
            .rotatePrompt__dot:nth-child(2) { animation-delay: 0.15s; }
            .rotatePrompt__dot:nth-child(3) { animation-delay: 0.3s; }
          `}</style>
        </m.div>
      )}
    </AnimatePresence>
  )
}
