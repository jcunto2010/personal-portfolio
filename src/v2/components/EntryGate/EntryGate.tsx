import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { IoVolumeHigh, IoVolumeMute } from 'react-icons/io5'
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

function useStarfield() {
  return useMemo(() => {
    return Array.from({ length: STAR_COUNT }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      baseOpacity: Math.random() * 0.7 + 0.3,
      dimOpacity: Math.random() * 0.2,
      flickerOpacity: Math.random() * 0.7 + 0.3,
      duration: Math.random() * 4 + 2,
    }))
  }, [])
}

export function EntryGate({ onEnter, skipAnimations = false }: EntryGateProps) {
  const { mode, audioEnabled, setMode, setAudioEnabled, requestFullscreen, isFullscreen } =
    useAppMode()
  const { locale } = useLocale()
  const [localMode, setLocalMode] = useState<AppMode>(mode)
  const [localAudio, setLocalAudio] = useState<boolean>(audioEnabled)
  const stars = useStarfield()

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
        audioAriaOn: 'Audio de fondo activado — haz clic para desactivarlo',
        audioAriaOff: 'Audio de fondo desactivado — haz clic para activarlo',
        staticLabel: 'Modo Estático',
        staticSub: 'Experiencia minimalista con contenido de calidad',
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
        audioAriaOn: 'Background audio enabled — click to disable',
        audioAriaOff: 'Background audio disabled — click to enable',
        staticLabel: 'Static Mode',
        staticSub: 'Minimalist experience with quality content',
      }

  const noAnim = skipAnimations
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } }
    : {}

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

  async function handleStaticMode() {
    setLocalMode('non-immersive')
    await commitSelection('non-immersive')
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={ui.ariaEntry}
    >
      <div className={styles.starfield}>
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className={styles.star}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
            }}
            initial={{ opacity: skipAnimations ? star.baseOpacity : 0 }}
            animate={{ opacity: star.baseOpacity }}
            transition={skipAnimations ? { duration: 0 } : { duration: 1.2, delay: i * 0.04 }}
          />
        ))}
      </div>

      <div className={styles.languageSwitcherWrap}>
        <LanguageSwitcher />
      </div>

      <div className={styles.introContent}>
        <div className={styles.introTitleBlock}>
          <div className={styles.introTitleInner}>
            <motion.h1
              className={styles.introH1}
              initial={noAnim.initial ?? { opacity: 0 }}
              animate={noAnim.animate ?? { opacity: 1 }}
              transition={noAnim.transition ?? { duration: 1.2 }}
            >
              {ui.introTitlePrefix} <span className={styles.introName}>{ui.introName}</span>
            </motion.h1>
            <motion.div
              className={styles.introDivider}
              initial={noAnim.initial ?? { opacity: 0 }}
              animate={noAnim.animate ?? { opacity: 1 }}
              transition={noAnim.transition ?? { duration: 1.5, delay: 2.5 }}
            />
          </div>
          <motion.p
            className={styles.introRole}
            initial={noAnim.initial ?? { opacity: 0 }}
            animate={noAnim.animate ?? { opacity: 1 }}
            transition={noAnim.transition ?? { duration: 1.5, delay: 4 }}
          >
            {ui.introRole}
          </motion.p>
          <motion.p
            className={styles.introDesc}
            initial={noAnim.initial ?? { opacity: 0 }}
            animate={noAnim.animate ?? { opacity: 1 }}
            transition={noAnim.transition ?? { duration: 1.5, delay: 5.5 }}
          >
            {ui.introDesc1}
            {ui.introDesc2 ? (
              <>
                <br />
                {ui.introDesc2}
              </>
            ) : null}
          </motion.p>
        </div>

        <motion.div
          className={styles.introButtons}
          initial={noAnim.initial ?? { opacity: 0 }}
          animate={noAnim.animate ?? { opacity: 1 }}
          transition={noAnim.transition ?? { duration: 1.5, delay: 7.5 }}
          role="group"
          aria-label={ui.introButtonsGroup}
        >
          <button
            type="button"
            className={styles.introBtnImmersive}
            onClick={handleImmersiveMode}
            aria-pressed={localMode === 'immersive'}
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
                {localAudio ? (
                  <IoVolumeHigh size={20} style={{ color: '#00D9A3' }} />
                ) : (
                  <IoVolumeMute size={20} style={{ color: 'rgba(255,255,255,0.4)' }} />
                )}
              </button>
            </div>
          </button>

          <button
            type="button"
            className={styles.introBtnStatic}
            onClick={handleStaticMode}
            aria-pressed={localMode === 'non-immersive'}
          >
            <div className={styles.introBtnStaticText}>
              <span className={styles.introBtnStaticLabel}>{ui.staticLabel}</span>
              <span className={styles.introBtnStaticSub}>
                {ui.staticSub}
              </span>
            </div>
          </button>
        </motion.div>
      </div>

      <motion.div
        className={`${styles.introCorner} ${styles.introCornerTopLeft}`}
        initial={noAnim.initial ?? { opacity: 0 }}
        animate={noAnim.animate ?? { opacity: 1 }}
        transition={noAnim.transition ?? { duration: 1.5, delay: 9.5 }}
        aria-hidden="true"
      />
      <motion.div
        className={`${styles.introCorner} ${styles.introCornerBottomRight}`}
        initial={noAnim.initial ?? { opacity: 0 }}
        animate={noAnim.animate ?? { opacity: 1 }}
        transition={noAnim.transition ?? { duration: 1.5, delay: 9.5 }}
        aria-hidden="true"
      />
    </div>
  )
}
