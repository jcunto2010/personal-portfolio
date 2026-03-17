import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { IoVolumeHigh, IoVolumeMute } from 'react-icons/io5'
import { useAppMode, type AppMode } from '../../lib/appModeContext'
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
  const [localMode, setLocalMode] = useState<AppMode>(mode)
  const [localAudio, setLocalAudio] = useState<boolean>(audioEnabled)
  const stars = useStarfield()

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
      aria-label="Portfolio entry"
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

      <div className={styles.introContent}>
        <div className={styles.introTitleBlock}>
          <div className={styles.introTitleInner}>
            <motion.h1
              className={styles.introH1}
              initial={noAnim.initial ?? { opacity: 0 }}
              animate={noAnim.animate ?? { opacity: 1 }}
              transition={noAnim.transition ?? { duration: 1.2 }}
            >
              Hi, I&apos;m <span className={styles.introName}>Jonathan</span>
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
            Frontend Developer & Creative Technologist
          </motion.p>
          <motion.p
            className={styles.introDesc}
            initial={noAnim.initial ?? { opacity: 0 }}
            animate={noAnim.animate ?? { opacity: 1 }}
            transition={noAnim.transition ?? { duration: 1.5, delay: 5.5 }}
          >
            Crafting digital experiences that blend technology with artistry.
            <br />
            Choose your preferred way to explore my work.
          </motion.p>
        </div>

        <motion.div
          className={styles.introButtons}
          initial={noAnim.initial ?? { opacity: 0 }}
          animate={noAnim.animate ?? { opacity: 1 }}
          transition={noAnim.transition ?? { duration: 1.5, delay: 7.5 }}
          role="group"
          aria-label="Select experience mode"
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
                  <span className={styles.introBtnImmersiveLabel}>Immersive Mode</span>
                  <span className={styles.introBtnImmersiveBadge}>Recommended</span>
                </div>
                <span className={styles.introBtnImmersiveSub}>
                  Full screen experience with ambient sound
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
                    ? 'Background audio enabled — click to disable'
                    : 'Background audio disabled — click to enable'
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
              <span className={styles.introBtnStaticLabel}>Static Mode</span>
              <span className={styles.introBtnStaticSub}>
                Minimalist experience with quality content
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
