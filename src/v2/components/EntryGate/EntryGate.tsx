import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useAppMode, type AppMode } from '../../lib/appModeContext'
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher'
import { useLocale } from '../../lib/localeContext'
import styles from './EntryGate.module.css'

interface EntryGateProps {
  onEnter: () => void
  /** When true, content appears immediately without animations (e.g. when returning from a mode). */
  skipAnimations?: boolean
}

const STAR_COUNT = 150

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function useStarfield() {
  return useMemo(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => {
      const rand = mulberry32(i + 1)
      return {
        left: rand() * 100,
        top: rand() * 100,
        baseOpacity: rand() * 0.7 + 0.3,
        dimOpacity: rand() * 0.2,
        flickerOpacity: rand() * 0.7 + 0.3,
        duration: rand() * 4 + 2,
      }
    })
  }, [])
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(mediaQuery.matches)

    update()

    // Safari fallback (legacy)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update)
      return () => mediaQuery.removeEventListener('change', update)
    }
    mediaQuery.addListener(update)
    return () => mediaQuery.removeListener(update)
  }, [])

  return prefersReducedMotion
}

export function EntryGate({ onEnter, skipAnimations = false }: EntryGateProps) {
  const { mode, audioEnabled, setMode, setAudioEnabled, requestFullscreen, isFullscreen } =
    useAppMode()
  const { locale } = useLocale()
  const [localMode, setLocalMode] = useState<AppMode>(mode)
  const [localAudio, setLocalAudio] = useState<boolean>(audioEnabled)
  const stars = useStarfield()
  const reduceMotion = usePrefersReducedMotion()

  const shouldAnimate = !skipAnimations && !reduceMotion
  const [animateIntro, setAnimateIntro] = useState(false)

  // Trigger CSS animations after the initial paint, so LCP isn't delayed by JS/parse time.
  useEffect(() => {
    if (!shouldAnimate) {
      const id = requestAnimationFrame(() => setAnimateIntro(false))
      return () => cancelAnimationFrame(id)
    }
    const id = requestAnimationFrame(() => setAnimateIntro(true))
    return () => cancelAnimationFrame(id)
  }, [shouldAnimate])

  const isEs = locale === 'es'
  const ui = isEs
    ? {
        ariaEntry: 'Entrada al portafolio',
        introTitlePrefix: 'Hola, mi nombre es',
        introName: 'Jonathan Cunto Diaz',
        introRole: 'Frontend Developer',
        introDesc1:
          'Creo aplicaciones web hermosas, responsivas y fáciles de usar usando tecnologías modernas como React, TypeScript y Tailwind CSS. Apasionado por el código limpio y experiencias de usuario excepcionales.',
        introDesc2: '',
        introButtonsGroup: 'Selecciona el modo de experiencia',
        immersiveLabel: 'Modo Inmersivo',
        recommended: 'Recomendado',
        immersiveSub: 'Experiencia en pantalla completa con sonido ambiental',
        immersiveBtnAria: 'Activar modo inmersivo',
        audioAriaOn: 'Silenciar sonido',
        audioAriaOff: 'Activar sonido',
        classicLabel: 'Modo clásico',
        classicSub: 'Experiencia editorial enfocada en contenido',
      }
    : {
        ariaEntry: 'Portfolio entry',
        introTitlePrefix: 'Hi, my name is',
        introName: 'Jonathan Cunto Diaz',
        introRole: 'Frontend Developer',
        introDesc1:
          'I create beautiful, responsive, and user-friendly web applications using modern technologies like React, TypeScript, and Tailwind CSS. Passionate about clean code and exceptional user experiences.',
        introDesc2: '',
        introButtonsGroup: 'Select experience mode',
        immersiveLabel: 'Immersive Mode',
        recommended: 'Recommended',
        immersiveSub: 'Full screen experience with ambient sound',
        immersiveBtnAria: 'Activate immersive mode',
        audioAriaOn: 'Mute sound',
        audioAriaOff: 'Unmute sound',
        classicLabel: 'Classic mode',
        classicSub: 'Editorial experience focused on content',
      }

  async function commitSelection(nextMode: AppMode) {
    setMode(nextMode)
    setAudioEnabled(localAudio)
    if (nextMode === 'immersive' && !isFullscreen) {
      await requestFullscreen()
    }
    onEnter()
  }

  async function handleImmersiveMode() {
    setLocalMode('immersive')
    await commitSelection('immersive')
  }

  async function handleClassicMode() {
    setLocalMode('non-immersive')
    await commitSelection('non-immersive')
  }

  // Evita TS6133 mientras el botón modo clásico está comentado en el JSX.
  void handleClassicMode

  const isMuted = !localAudio

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={ui.ariaEntry}
    >
      <div className={styles.starfield}>
        {stars.map((star, i) => (
          <div
            key={i}
            className={`${styles.star} ${shouldAnimate ? styles.starFadeIn : ''}`}
            style={
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                opacity: shouldAnimate ? 0 : star.baseOpacity,
                animationDelay: shouldAnimate ? `${i * 0.04}s` : undefined,
                '--endOpacity': star.baseOpacity,
              } as CSSProperties & { '--endOpacity'?: number }
            }
            aria-hidden="true"
          />
        ))}
      </div>

      <div className={styles.languageSwitcherWrap}>
        <LanguageSwitcher />
      </div>

      <div className={styles.introContent}>
        <div className={styles.introTitleBlock}>
          <div className={styles.introTitleInner}>
            <h1
              className={`${styles.introH1} ${
                shouldAnimate && animateIntro ? styles.introH1In : ''
              }`}
            >
              {ui.introTitlePrefix} <span className={styles.introName}>{ui.introName}</span>
            </h1>
            <div
              className={styles.introDivider}
              style={
                shouldAnimate
                  ? {
                      opacity: 0,
                      animation: animateIntro
                        ? `introFadeIn 1.5s ease forwards`
                        : undefined,
                      animationDelay: animateIntro ? '2.5s' : undefined,
                    }
                  : { opacity: 1 }
              }
            />
          </div>
          <p
            className={styles.introRole}
            style={
              shouldAnimate
                ? {
                    opacity: 0,
                    animation: animateIntro ? `introFadeIn 1.5s ease forwards` : undefined,
                    animationDelay: animateIntro ? '4s' : undefined,
                  }
                : { opacity: 1 }
            }
          >
            {ui.introRole}
          </p>
          <p
            className={styles.introDesc}
            style={
              shouldAnimate
                ? {
                    opacity: 0,
                    animation: animateIntro ? `introFadeIn 1.5s ease forwards` : undefined,
                    animationDelay: animateIntro ? '5.5s' : undefined,
                  }
                : { opacity: 1 }
            }
          >
            {ui.introDesc1}
            {ui.introDesc2 ? (
              <>
                <br />
                {ui.introDesc2}
              </>
            ) : null}
          </p>
        </div>

        <div
          className={styles.introButtons}
          style={
            shouldAnimate
              ? {
                  opacity: 0,
                  animation: animateIntro ? `introFadeIn 1.5s ease forwards` : undefined,
                  animationDelay: animateIntro ? '7.5s' : undefined,
                }
              : { opacity: 1 }
          }
          role="group"
          aria-label={ui.introButtonsGroup}
        >
          <div className={styles.introBtnImmersiveWrap}>
            <button
              type="button"
              className={styles.introBtnImmersive}
              onClick={handleImmersiveMode}
              aria-pressed={localMode === 'immersive'}
              aria-label={ui.immersiveBtnAria}
            >
              <div className={styles.introBtnImmersiveSweep} aria-hidden="true" />
              <div className={styles.introBtnImmersiveInner}>
                <div className={styles.introBtnImmersiveText}>
                  <div className={styles.introBtnImmersiveRow}>
                    <span className={styles.introBtnImmersiveLabel}>{ui.immersiveLabel}</span>
                    <span className={styles.introBtnImmersiveBadge}>{ui.recommended}</span>
                  </div>
                  <span className={styles.introBtnImmersiveSub}>
                    {ui.immersiveSub}
                  </span>
                </div>
              </div>
            </button>
            <button
              type="button"
              className={styles.introAudioToggle}
              onClick={(e) => {
                e.stopPropagation()
                setLocalAudio((prev) => !prev)
              }}
              aria-pressed={localAudio}
              aria-label={
                localAudio
                  ? ui.audioAriaOn
                  : ui.audioAriaOff
              }
            >
              <span
                className={styles.introAudioToggleIcon}
                style={{
                  color: isMuted ? 'rgba(255,255,255,0.4)' : '#00D9A3',
                }}
                aria-hidden="true"
              >
                {isMuted ? (
                  <VolumeX size={22} strokeWidth={2} absoluteStrokeWidth />
                ) : (
                  <Volume2 size={22} strokeWidth={2} absoluteStrokeWidth />
                )}
              </span>
            </button>
          </div>

          {/* CLASSIC MODE — temporalmente oculto, restaurar al hacer merge desde rama classic-mode
          <button
            type="button"
            className={styles.introBtnClassic}
            onClick={handleClassicMode}
            aria-pressed={localMode === 'non-immersive'}
          >
            <div className={styles.introBtnClassicText}>
              <span className={styles.introBtnClassicLabel}>{ui.classicLabel}</span>
              <span className={styles.introBtnClassicSub}>
                {ui.classicSub}
              </span>
            </div>
          </button>
          */}
        </div>
      </div>

      <div
        className={`${styles.introCorner} ${styles.introCornerTopLeft}`}
        style={
          shouldAnimate
            ? {
                opacity: 0,
                animation: animateIntro ? `introFadeIn 1.5s ease forwards` : undefined,
                animationDelay: animateIntro ? '9.5s' : undefined,
              }
            : { opacity: 1 }
        }
        aria-hidden="true"
      />
      <div
        className={`${styles.introCorner} ${styles.introCornerBottomRight}`}
        style={
          shouldAnimate
            ? {
                opacity: 0,
                animation: animateIntro ? `introFadeIn 1.5s ease forwards` : undefined,
                animationDelay: animateIntro ? '9.5s' : undefined,
              }
            : { opacity: 1 }
        }
        aria-hidden="true"
      />
    </div>
  )
}
