import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  type Variants,
} from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpRight,
  Copy,
  Github,
  Linkedin,
  Mail,
  Phone,
} from 'lucide-react'
import {
  buildContactMailtoHref,
  buildContactWhatsAppHref,
  contactV2,
} from '../../data/contact.v2'
import { useLocale } from '../../lib/localeContext'
import styles from './Contact.module.css'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

type Phase = 'idle' | 'transitioning' | 'contact'
type TransitionDirection = 'to-contact' | 'to-idle'

const fadeSlideVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
}

const mainBlockVariants: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
  exitForward: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.5, ease: EASE },
  },
}

const contactPanelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.5, ease: EASE },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
  exitBack: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.5, ease: EASE },
  },
}

const contactListContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const contactRowVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
}

const labelVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay: 0.1 },
  },
}

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay: 0.2 },
  },
}

const subtextVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay: 0.45 },
  },
}

const Contact: React.FC = () => {
  const { locale } = useLocale()
  const isEs = locale === 'es'

  const mailtoDraftHref = useMemo(() => buildContactMailtoHref(locale), [locale])
  const whatsappDraftHref = useMemo(() => buildContactWhatsAppHref(locale), [locale])

  const copy = useMemo(
    () =>
      isEs
        ? {
            panelEyebrow: 'Perfecto',
            panelTitle: 'Hablemos',
            back: 'Volver',
            idleLine1: 'Trabajemos',
            idleLine2: 'juntos',
            blurb:
              '¿Tienes un proyecto en mente? Me encantaría conocerlo. Creemos algo excepcional juntos.',
            ariaMail: 'Abrir borrador de correo para contactar',
            ariaWhatsApp: 'Abrir WhatsApp con mensaje prellenado',
            copyEmailAria: 'Copiar dirección de correo al portapapeles',
            copiedFeedback: 'Copiado',
          }
        : {
            panelEyebrow: 'Sounds good',
            panelTitle: "Let's talk",
            back: 'Back',
            idleLine1: "Let's work",
            idleLine2: 'together',
            blurb:
              "Have a project in mind? I'd love to hear about it. Let's create something exceptional together.",
            ariaMail: 'Open email draft to get in touch',
            ariaWhatsApp: 'Open WhatsApp with a prefilled message',
            copyEmailAria: 'Copy email address to clipboard',
            copiedFeedback: 'Copied',
          },
    [isEs]
  )

  const [emailCopied, setEmailCopied] = useState(false)
  const copyEmailTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopyEmail = useCallback((e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    const text = contactV2.email
    void (async () => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('aria-hidden', 'true')
        document.body.appendChild(ta)
        ta.select()
        try {
          document.execCommand('copy')
        } finally {
          document.body.removeChild(ta)
        }
      }
      if (copyEmailTimeoutRef.current) clearTimeout(copyEmailTimeoutRef.current)
      setEmailCopied(true)
      copyEmailTimeoutRef.current = setTimeout(() => {
        setEmailCopied(false)
        copyEmailTimeoutRef.current = null
      }, 2200)
    })()
  }, [])

  useEffect(() => {
    return () => {
      if (copyEmailTimeoutRef.current) clearTimeout(copyEmailTimeoutRef.current)
    }
  }, [])

  const [phase, setPhase] = useState<Phase>('idle')
  const [direction, setDirection] = useState<TransitionDirection>('to-contact')
  const [isHovered, setIsHovered] = useState<boolean>(false)

  useEffect(() => {
    if (phase !== 'transitioning') return
    const id = window.setTimeout(() => {
      setPhase((prev) => {
        if (prev !== 'transitioning') return prev
        return direction === 'to-contact' ? 'contact' : 'idle'
      })
    }, 500)
    return () => window.clearTimeout(id)
  }, [phase, direction])

  const handleMainCTA = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      e.preventDefault()
      setDirection('to-contact')
      setPhase('transitioning')
    },
    []
  )

  const handleBack = useCallback((): void => {
    setDirection('to-idle')
    setPhase('transitioning')
  }, [])

  const showIdleLayer: boolean = phase === 'idle' || (phase === 'transitioning' && direction === 'to-contact')
  const showContactLayer: boolean = phase === 'contact' || (phase === 'transitioning' && direction === 'to-idle')

  const idleContentVisible: boolean =
    phase === 'idle' || (phase === 'transitioning' && direction === 'to-contact')

  const mainAnimate: 'visible' | 'exitForward' =
    phase === 'transitioning' && direction === 'to-contact' ? 'exitForward' : 'visible'

  const contactAnimate: 'hidden' | 'visible' | 'exitBack' =
    phase === 'transitioning' && direction === 'to-idle'
      ? 'exitBack'
      : phase === 'contact'
        ? 'visible'
        : 'hidden'

  return (
    <div className={styles.root}>
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.inner}>
        <AnimatePresence mode="sync">
          {showContactLayer && (
            <motion.div
              key="contact-panel"
              className={styles.contactLayer}
              variants={contactPanelVariants}
              initial="hidden"
              animate={contactAnimate}
              exit="exitBack"
            >
              <div className={styles.contactStack}>
                <div className={styles.panelHeader}>
                  <motion.div
                    className={styles.panelEyebrow}
                    variants={labelVariants}
                    initial="hidden"
                    animate={phase === 'contact' ? 'visible' : 'hidden'}
                  >
                    {copy.panelEyebrow}
                  </motion.div>
                  <motion.div
                    className={styles.heroTitle}
                    variants={titleVariants}
                    initial="hidden"
                    animate={phase === 'contact' ? 'visible' : 'hidden'}
                  >
                    {copy.panelTitle}
                  </motion.div>
                </div>

                <motion.div
                  className={styles.rows}
                  variants={contactListContainerVariants}
                  initial="hidden"
                  animate={phase === 'contact' ? 'visible' : 'hidden'}
                >
                  <motion.div variants={contactRowVariants} className={styles.rowWrap}>
                    <div className={styles.emailRow}>
                      <motion.a
                        href={mailtoDraftHref}
                        className={`${styles.row} ${styles.emailRowMain}`}
                        aria-label={copy.ariaMail}
                      >
                        <Mail className={styles.rowIcon} strokeWidth={1.5} aria-hidden />
                        <span className={styles.rowLabel}>{contactV2.email}</span>
                      </motion.a>
                      <button
                        type="button"
                        className={`${styles.copyEmailBtn}${emailCopied ? ` ${styles.copyEmailBtnDone}` : ''}`}
                        onClick={handleCopyEmail}
                        aria-label={emailCopied ? copy.copiedFeedback : copy.copyEmailAria}
                      >
                        <Copy className={styles.copyEmailIcon} strokeWidth={1.5} aria-hidden />
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={contactRowVariants} className={styles.rowWrap}>
                    <motion.a
                      href={whatsappDraftHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.row}
                      aria-label={copy.ariaWhatsApp}
                    >
                      <Phone className={styles.rowIcon} strokeWidth={1.5} aria-hidden />
                      <span className={styles.rowLabel}>{contactV2.whatsappDisplay}</span>
                    </motion.a>
                  </motion.div>

                  <motion.div variants={contactRowVariants} className={styles.socialRow}>
                    <motion.a
                      href={contactV2.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.row} ${styles.rowSocial}`}
                    >
                      <Linkedin className={styles.rowIcon} strokeWidth={1.5} aria-hidden />
                      <span className={styles.rowLabel}>LinkedIn</span>
                      <ArrowUpRight className={styles.rowChevron} strokeWidth={1.5} aria-hidden />
                    </motion.a>
                    <motion.a
                      href={contactV2.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.row} ${styles.rowSocial}`}
                    >
                      <Github className={styles.rowIcon} strokeWidth={1.5} aria-hidden />
                      <span className={styles.rowLabel}>GitHub</span>
                      <ArrowUpRight className={styles.rowChevron} strokeWidth={1.5} aria-hidden />
                    </motion.a>
                  </motion.div>
                </motion.div>

                <motion.div
                  className={styles.panelMeta}
                  variants={subtextVariants}
                  initial="hidden"
                  animate={phase === 'contact' ? 'visible' : 'hidden'}
                >
                  {contactV2.location}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={phase === 'contact' ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: EASE }}
                >
                  <button type="button" onClick={handleBack} className={styles.backBtn}>
                    <ArrowLeft className={styles.backIcon} strokeWidth={1.5} aria-hidden />
                    {copy.back}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showIdleLayer && (
          <motion.div
            key="idle-layer"
            className={styles.idleLayer}
            variants={mainBlockVariants}
            initial="visible"
            animate={mainAnimate}
          >
            <div
              className={styles.ctaCluster}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleMainCTA}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleMainCTA(e as unknown as React.MouseEvent<HTMLDivElement>)
                }
              }}
              style={{
                pointerEvents: phase !== 'idle' ? 'none' : 'auto',
              }}
            >
              <div className={styles.ctaInner}>
                <div
                  className={styles.heroTitle}
                  role="heading"
                  aria-level={2}
                >
                  <span className={styles.heroLine}>
                    <motion.span
                      className={styles.heroLineInner}
                      animate={{
                        y: isHovered && phase === 'idle' ? '-8%' : '0%',
                      }}
                      transition={{ duration: 0.7, ease: EASE }}
                    >
                      {copy.idleLine1}
                    </motion.span>
                  </span>
                  <span className={styles.heroLine}>
                    <motion.span
                      className={styles.heroLineInner}
                      animate={{
                        y: isHovered && phase === 'idle' ? '-8%' : '0%',
                      }}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
                    >
                      <span className={styles.heroLineMuted}>{copy.idleLine2}</span>
                    </motion.span>
                  </span>
                </div>

                <div className={styles.arrowBlock}>
                  <motion.div
                    className={styles.decorLine}
                    animate={{
                      scaleX: phase !== 'idle' ? 0 : isHovered ? 1.5 : 1,
                      x: phase !== 'idle' ? -20 : 0,
                      opacity: phase !== 'idle' ? 0 : isHovered ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                  <div className={styles.arrowRow}>
                    <motion.div
                      className={styles.arrowCircle}
                      animate={{
                        scale: phase !== 'idle' ? 3 : isHovered ? 1.1 : 1,
                        opacity: phase !== 'idle' ? 0 : 1,
                      }}
                      transition={{
                        duration: phase !== 'idle' ? 0.7 : 0.5,
                        ease: EASE,
                      }}
                      style={{
                        borderColor: phase !== 'idle'
                          ? 'transparent'
                          : isHovered
                            ? 'var(--v2-color-base-text)'
                            : undefined,
                        backgroundColor:
                          phase !== 'idle'
                            ? 'transparent'
                            : isHovered
                              ? 'var(--v2-color-base-text)'
                              : 'transparent',
                      }}
                    />
                    <motion.div
                      className={styles.arrowIcon}
                      animate={{
                        x: phase !== 'idle' ? 100 : isHovered ? 2 : 0,
                        y: phase !== 'idle' ? -100 : isHovered ? -2 : 0,
                        scale: phase !== 'idle' ? 0.5 : 1,
                        opacity: phase !== 'idle' ? 0 : 1,
                      }}
                      transition={{
                        duration: phase !== 'idle' ? 0.6 : 0.5,
                        ease: EASE,
                      }}
                      style={{
                        color:
                          isHovered && phase === 'idle'
                            ? 'var(--v2-color-base-bg)'
                            : 'var(--v2-color-base-text)',
                      }}
                    >
                      <ArrowUpRight className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.5} aria-hidden />
                    </motion.div>
                  </div>
                  <motion.div
                    className={styles.decorLine}
                    animate={{
                      scaleX: phase !== 'idle' ? 0 : isHovered ? 1.5 : 1,
                      x: phase !== 'idle' ? 20 : 0,
                      opacity: phase !== 'idle' ? 0 : isHovered ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                </div>
              </div>
            </div>

            <motion.div
              className={styles.footnote}
              variants={fadeSlideVariants}
              initial="hidden"
              animate={idleContentVisible ? 'visible' : 'hidden'}
            >
              <div className={styles.blurb} role="paragraph">
                {copy.blurb}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Contact
