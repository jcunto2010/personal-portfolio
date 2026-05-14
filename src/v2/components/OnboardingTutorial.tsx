/**
 * OnboardingTutorial — modal de bienvenida al modo solar.
 *
 * Imágenes en disco (canónicas):
 *   public/assets/projects/sun-no-card.webp
 *   public/assets/projects/sun-with-card.webp
 *   public/assets/projects/mercury-card.webp
 */

import { useCallback, useMemo, useState, type CSSProperties, type ReactElement } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useLocale, type V2Locale } from '../lib/localeContext'

/** Alineado con `src/v2/tokens/tokens.css` — Proxima Nova en V2 */
const FONT_BODY =
  "var(--v2-font-body, 'Proxima Nova', 'Inter', 'Arial', sans-serif)"

const IMG_SUN_NO = '/assets/projects/sun-no-card.webp'
const IMG_SUN_WITH = '/assets/projects/sun-with-card.webp'
const IMG_MERCURY = '/assets/projects/mercury-card.webp'

export interface OnboardingTutorialProps {
  onDone: () => void
}

interface TutorialStep {
  imgL: string
  labelL: string
  imgR: string
  labelR: string
  tag: string
  title: string
  desc: string
  btn: string
}

interface TutorialChrome {
  skip: string
}

const TUTORIAL_CHROME: Record<V2Locale, TutorialChrome> = {
  es: { skip: 'Omitir' },
  en: { skip: 'Skip' },
}

const TUTORIAL_STEPS: Record<V2Locale, readonly TutorialStep[]> = {
  es: [
    {
      imgL: IMG_SUN_NO,
      labelL: 'Sol — vista inicial',
      imgR: IMG_MERCURY,
      labelR: 'Mercurio — siguiente planeta',
      tag: 'Tutorial 1 de 2',
      title: 'Haz scroll ↑↓ o swipe ↑↓ para viajar entre planetas',
      desc:
        'Desplázate hacia abajo para avanzar al siguiente planeta · Hacia arriba para volver al anterior',
      btn: 'Siguiente →',
    },
    {
      imgL: IMG_SUN_NO,
      labelL: 'Sol — sin card',
      imgR: IMG_SUN_WITH,
      labelR: 'Sol — card visible',
      tag: 'Tutorial 2 de 2',
      title: 'Haz click o tap en el planeta para revelar su información',
      desc:
        'Vuelve a hacer click o tap para ocultarla · Cada planeta representa una sección del portafolio',
      btn: 'Explorar ✦',
    },
  ],
  en: [
    {
      imgL: IMG_SUN_NO,
      labelL: 'Sun — initial view',
      imgR: IMG_MERCURY,
      labelR: 'Mercury — next planet',
      tag: 'Tutorial 1 of 2',
      title: 'Scroll ↑↓ or swipe ↑↓ to move between planets',
      desc:
        'Scroll down to go to the next planet · Up to return to the previous one',
      btn: 'Next →',
    },
    {
      imgL: IMG_SUN_NO,
      labelL: 'Sun — panel hidden',
      imgR: IMG_SUN_WITH,
      labelR: 'Sun — panel visible',
      tag: 'Tutorial 2 of 2',
      title: 'Click or tap the planet to show its details',
      desc:
        'Click or tap again to hide it · Each planet is a portfolio section',
      btn: 'Explore ✦',
    },
  ],
}

function ArrowDivider(): ReactElement {
  return (
    <div
      style={{
        flex: '0 0 clamp(36px, 4vw, 48px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
      }}
    >
      <div
        style={{
          width: 'clamp(32px, 3.5vw, 40px)',
          height: 'clamp(32px, 3.5vw, 40px)',
          borderRadius: '50%',
          background: 'rgba(10,10,14,0.9)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden
      >
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          {/* Flecha →: vástago hasta x=15 + punta (tip en 20.5, 12) */}
          <path
            d="M4 12H15"
            stroke="rgba(255,255,255,0.72)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path
            d="M15 7.5L20.5 12 15 16.5"
            stroke="rgba(255,255,255,0.72)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

function StepImages({ step }: { step: TutorialStep }): ReactElement {
  const labelStyle: CSSProperties = {
    position: 'absolute',
    bottom: 'clamp(8px, 1.2vh, 16px)',
    left: 'clamp(8px, 1.2vh, 16px)',
    background: 'rgba(0,0,0,0.6)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    fontFamily: FONT_BODY,
    fontSize: 'clamp(10px, 1.1vw, 14px)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
    padding: 'clamp(4px, 0.5vh, 8px) clamp(8px, 1vw, 12px)',
  }

  /** Panorámico 16:9 por panel: más contexto horizontal y menos crop tipo “cuadrado”. */
  const wrapStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    aspectRatio: '21 / 9',
  }

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    opacity: 0.9,
    display: 'block',
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(12px, 1.5vh, 24px) clamp(12px, 1.5vw, 28px) 0',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div style={wrapStyle}>
          <img src={step.imgL} alt="" style={imgStyle} />
          <span style={labelStyle}>{step.labelL}</span>
        </div>
        <ArrowDivider />
        <div style={wrapStyle}>
          <img src={step.imgR} alt="" style={imgStyle} />
          <span style={labelStyle}>{step.labelR}</span>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingTutorial({ onDone }: OnboardingTutorialProps): ReactElement {
  const { locale } = useLocale()
  const steps = useMemo(() => TUTORIAL_STEPS[locale], [locale])
  const chrome = TUTORIAL_CHROME[locale]

  const [step, setStep] = useState(0)
  const [overlayVisible, setOverlayVisible] = useState(true)

  const handleExitComplete = useCallback(() => {
    onDone()
  }, [onDone])

  const requestClose = useCallback(() => {
    setOverlayVisible(false)
  }, [])

  const handleSkip = useCallback(() => {
    requestClose()
  }, [requestClose])

  const handlePrimary = useCallback(() => {
    if (step === 0) {
      setStep(1)
      return
    }
    requestClose()
  }, [step, requestClose])

  const lastStepIndex = Math.max(0, steps.length - 1)
  const safeStep = Math.min(step, lastStepIndex)
  const current = steps[safeStep] ?? steps[0]

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {overlayVisible && (
        <m.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-tutorial-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            role="button"
            style={{
              width: '70vw',
              height: '70vh',
              maxWidth: '100%',
              maxHeight: '100%',
              boxSizing: 'border-box',
              fontFamily: FONT_BODY,
              background: 'rgba(12, 12, 16, 0.72)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
            tabIndex={0}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
          >
            <m.div
              key={`${locale}-${safeStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
              }}
            >
              <StepImages step={current} />

              <div
                style={{
                  padding:
                    'clamp(16px, 2vh, 28px) clamp(20px, 2.5vw, 40px) clamp(12px, 1.5vh, 20px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(8px, 1vh, 14px)',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 'clamp(10px, 1.1vw, 14px)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.28)',
                  }}
                >
                  {current.tag}
                </span>
                <h2
                  id="onboarding-tutorial-title"
                  style={{
                    margin: 0,
                    fontFamily: FONT_BODY,
                    fontSize: 'clamp(18px, 2.4vw, 32px)',
                    fontWeight: 500,
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.88)',
                    lineHeight: 1.45,
                  }}
                >
                  {current.title}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontFamily: FONT_BODY,
                    fontSize: 'clamp(14px, 1.6vw, 22px)',
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.38)',
                    lineHeight: 1.6,
                  }}
                >
                  {current.desc}
                </p>
              </div>
            </m.div>

            <div
              style={{
                padding:
                  'clamp(12px, 1.5vh, 20px) clamp(20px, 2.5vw, 40px) clamp(16px, 2vh, 28px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={handleSkip}
                style={{
                  fontFamily: FONT_BODY,
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 999,
                  background: 'none',
                  fontSize: 'clamp(12px, 1.25vw, 16px)',
                  color: 'rgba(255,255,255,0.35)',
                  padding: 'clamp(8px, 1vh, 12px) clamp(16px, 2vw, 24px)',
                  cursor: 'pointer',
                }}
              >
                {chrome.skip}
              </button>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {steps.map((_, dotIdx) => (
                  <span
                    key={dotIdx === 0 ? 'dot-a' : 'dot-b'}
                    style={{
                      width: 'clamp(6px, 0.7vw, 9px)',
                      height: 'clamp(6px, 0.7vw, 9px)',
                      borderRadius: '50%',
                      background: dotIdx === safeStep ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.18)',
                      transform: dotIdx === safeStep ? 'scale(1.2)' : 'scale(1)',
                      transition: 'background 0.25s ease, transform 0.25s ease',
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handlePrimary}
                style={{
                  fontFamily: FONT_BODY,
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.07)',
                  fontSize: 'clamp(13px, 1.35vw, 18px)',
                  color: 'rgba(255,255,255,0.78)',
                  padding: 'clamp(9px, 1.1vh, 14px) clamp(20px, 2.5vw, 32px)',
                  cursor: 'pointer',
                }}
              >
                {current.btn}
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
