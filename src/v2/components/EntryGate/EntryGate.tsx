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

/** Staggered text/UI intro: title first, then +1s per block (fade duration). */
const INTRO_FADE = 'introFadeIn 1s ease forwards'

const CREDITS = [
  {
    section: { en: '3D Models', es: 'Modelos 3D' },
    items: [
      {
        title: 'The Star "Sun"',
        author: 'ARCTIC WOLVES™',
        url: 'https://skfb.ly/oTDVZ',
        license: 'CC BY 4.0',
      },
      { title: 'Mercury', author: 'Yanez Designs', url: 'https://skfb.ly/6AOGX', license: 'CC BY 4.0' },
      {
        title: 'Venus Realistic 8K',
        author: 'Shady Tex',
        url: 'https://skfb.ly/oKrFX',
        license: 'CC BY 4.0',
      },
      { title: 'Planet Earth', author: 'Thomas Kole', url: 'https://skfb.ly/Ft8J', license: 'CC BY 4.0' },
      {
        title: 'The Moon',
        author: 'SebastianSosnowski',
        url: 'https://skfb.ly/6s9oz',
        license: 'CC BY 4.0',
      },
      { title: 'Mars', author: 'AirStudios', url: 'https://skfb.ly/6Uynr', license: 'CC BY 4.0' },
      { title: 'Jupiter', author: 'Nestaeric', url: 'https://skfb.ly/puNrn', license: 'CC BY 4.0' },
      { title: 'Saturn', author: 'Nestaeric', url: 'https://skfb.ly/orVqA', license: 'CC BY 4.0' },
      { title: 'Neptune', author: 'Nestaeric', url: 'https://skfb.ly/pDAHv', license: 'CC BY 4.0' },
      {
        title: 'Uranus',
        author: 'SebastianSosnowski',
        url: 'https://skfb.ly/6THRF',
        license: 'CC BY 4.0',
      },
      { title: 'Black Hole', author: 'Nestaeric', url: 'https://skfb.ly/pq8CF', license: 'CC BY 4.0' },
      {
        title: 'Event Horizon Shader',
        author: 'Radiant Shaders',
        url: 'https://radiant-shaders.com/shader/event-horizon',
      },
    ],
  },
  {
    section: { en: 'Textures & Skybox', es: 'Texturas y Skybox' },
    items: [
      {
        title: 'Solar System Scope Textures',
        author: 'Solar System Scope',
        url: 'https://www.solarsystemscope.com/textures/',
        license: 'CC BY 4.0',
        note: 'Milky Way starfield, Uranus maps',
      },
    ],
  },
  {
    section: { en: 'Music', es: 'Música' },
    items: [
      {
        title: 'Shona Theme',
        author: 'Jake Chudnow',
        url: 'https://www.junodownload.com',
        note: 'Licensed via Juno Download',
      },
    ],
  },
  {
    section: { en: 'UI Components', es: 'Componentes UI' },
    items: [
      {
        title: 'Aceternity UI',
        author: 'Manu Arora',
        url: 'https://ui.aceternity.com',
        note: 'Timeline, animated components',
      },
      {
        title: 'Magic UI',
        author: 'Dillion Verma',
        url: 'https://magicui.design',
        note: 'Animated hero patterns',
      },
      {
        title: 'Framer Motion',
        author: 'Framer',
        url: 'https://www.framer.com/motion/',
        license: 'MIT',
      },
      {
        title: 'React Three Fiber + Drei',
        author: 'Poimandres',
        url: 'https://github.com/pmndrs/react-three-fiber',
        license: 'MIT',
      },
      {
        title: 'GSAP + SplitText',
        author: 'GreenSock',
        url: 'https://gsap.com',
        note: 'Commercial license',
      },
      {
        title: 'Lenis',
        author: 'Studio Freight',
        url: 'https://lenis.darkroom.engineering',
        license: 'MIT',
      },
    ],
  },
  {
    section: { en: 'Typography', es: 'Tipografía' },
    items: [
      {
        title: 'Proxima Nova',
        author: 'Mark Simonson Studio',
        url: 'https://www.marksimonson.com/fonts/view/proxima-nova',
        note: 'Commercial license — primary UI typeface (V2)',
      },
      {
        title: 'PP Object Sans',
        author: 'Pangram Pangram Foundry',
        url: 'https://pangrampangram.com/products/object-sans',
        note: 'Commercial license',
      },
      {
        title: 'PP Neue Machina',
        author: 'Pangram Pangram Foundry',
        url: 'https://pangrampangram.com/products/neue-machina',
        note: 'Commercial license',
      },
    ],
  },
] as const

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
  const [creditsOpen, setCreditsOpen] = useState(false)

  // Trigger CSS animations after the initial paint, so LCP isn't delayed by JS/parse time.
  useEffect(() => {
    if (!shouldAnimate) {
      const id = requestAnimationFrame(() => setAnimateIntro(false))
      return () => cancelAnimationFrame(id)
    }
    const id = requestAnimationFrame(() => setAnimateIntro(true))
    return () => cancelAnimationFrame(id)
  }, [shouldAnimate])

  useEffect(() => {
    if (!creditsOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCreditsOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [creditsOpen])

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
        creditsBtn: 'Créditos',
        creditsTitle: 'Créditos',
        creditsClose: 'Cerrar créditos',
        creditsNote:
          'Si eres el autor de algún recurso listado aquí y los términos de atribución son incorrectos, contáctame directamente.',
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
        creditsBtn: 'Credits',
        creditsTitle: 'Credits',
        creditsClose: 'Close credits',
        creditsNote:
          'If you are the author of any resource listed here and the attribution terms are incorrect, please contact me directly.',
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

  function handleClassicMode() {
    setLocalMode('non-immersive')
    window.location.assign('/classic-mode')
  }

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
            key={`${star.left}-${star.top}-${star.duration}-${i}`}
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
              className={styles.introH1}
              style={
                shouldAnimate
                  ? {
                      opacity: 0,
                      animation: animateIntro ? INTRO_FADE : undefined,
                      animationDelay: animateIntro ? '0.5s' : undefined,
                    }
                  : undefined
              }
            >
              {ui.introTitlePrefix} <span className={styles.introName}>{ui.introName}</span>
            </h1>
            <div
              className={styles.introDivider}
              style={
                shouldAnimate
                  ? {
                      opacity: 0,
                      animation: animateIntro ? INTRO_FADE : undefined,
                      animationDelay: animateIntro ? '1.5s' : undefined,
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
                    animation: animateIntro ? INTRO_FADE : undefined,
                    animationDelay: animateIntro ? '2.5s' : undefined,
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
                    animation: animateIntro ? INTRO_FADE : undefined,
                    animationDelay: animateIntro ? '3.5s' : undefined,
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
                  animation: animateIntro ? INTRO_FADE : undefined,
                  animationDelay: animateIntro ? '4.5s' : undefined,
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
        </div>
      </div>

      <div
        className={`${styles.introCorner} ${styles.introCornerTopLeft}`}
        style={
          shouldAnimate
            ? {
                opacity: 0,
                animation: animateIntro ? INTRO_FADE : undefined,
                animationDelay: animateIntro ? '5.5s' : undefined,
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
                animation: animateIntro ? INTRO_FADE : undefined,
                animationDelay: animateIntro ? '6.5s' : undefined,
              }
            : { opacity: 1 }
        }
        aria-hidden="true"
      />

      {/* Credits trigger — bottom center */}
      <button
        type="button"
        className={styles.creditsBtn}
        onClick={() => setCreditsOpen(true)}
        style={
          shouldAnimate
            ? {
                opacity: 0,
                animation: animateIntro ? INTRO_FADE : undefined,
                animationDelay: animateIntro ? '7.5s' : undefined,
              }
            : { opacity: 1 }
        }
      >
        {ui.creditsBtn}
      </button>

      {/* Credits overlay card */}
      {creditsOpen && (
        <div
          className={styles.creditsOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={ui.creditsTitle}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreditsOpen(false)
          }}
        >
          <div className={styles.creditsCard}>
            {/* Header */}
            <div className={styles.creditsHeader}>
              <h2 className={styles.creditsTitle}>{ui.creditsTitle}</h2>
              <button
                type="button"
                className={styles.creditsCloseBtn}
                onClick={() => setCreditsOpen(false)}
                aria-label={ui.creditsClose}
              >
                ✕
              </button>
            </div>

            {/* Scrollable body */}
            <div className={styles.creditsBody}>
              {CREDITS.map((group) => (
                <div key={group.section.en} className={styles.creditsSection}>
                  <div className={styles.creditsSectionHeader}>
                    <h3 className={styles.creditsSectionTitle}>
                      {isEs ? group.section.es : group.section.en}
                    </h3>
                  </div>
                  {group.items.map((item) => (
                    <div key={item.title} className={styles.creditsItem}>
                      <div className={styles.creditsItemMain}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.creditsItemTitle}
                        >
                          {item.title}
                        </a>
                        {'license' in item && item.license && (
                          <span className={styles.creditsItemBadge}>{item.license}</span>
                        )}
                      </div>
                      <div className={styles.creditsItemMeta}>
                        <span className={styles.creditsItemAuthor}>{item.author}</span>
                        {'note' in item && item.note && (
                          <>
                            <span className={styles.creditsDot} aria-hidden="true">
                              ·
                            </span>
                            <span className={styles.creditsItemNote}>{item.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <p className={styles.creditsFooterNote}>{ui.creditsNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
