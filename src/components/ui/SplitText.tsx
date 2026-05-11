import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP)

type SplitTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
type SplitType = 'chars' | 'words' | 'lines' | 'words, chars'

const EMPTY_GRADIENT_WORDS: string[] = []

interface SplitTextProps {
  tag?: SplitTag
  text: string
  className?: string
  gradientWords?: string[]
  delay?: number
  duration?: number
  ease?: string
  splitType?: SplitType
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  threshold?: number
  rootMargin?: string
  end?: string
  scrub?: boolean | number
  textAlign?: React.CSSProperties['textAlign']
  onLetterAnimationComplete?: () => void
}

export default function SplitText({
  text,
  className = '',
  gradientWords = EMPTY_GRADIENT_WORDS,
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  end = 'bottom 65%',
  scrub = false,
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null)
  const splitInstanceRef = useRef<GSAPSplitText | null>(null)
  const animationCompletedRef = useRef(false)
  const onCompleteRef = useRef(onLetterAnimationComplete)

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete
  }, [onLetterAnimationComplete])

  useGSAP(
    () => {
      if (!ref.current || !text) return

      let cancelled = false

      const runSetup = () => {
        if (cancelled || !ref.current || !text) return
        if (animationCompletedRef.current && !scrub) return

        const el = ref.current

        if (splitInstanceRef.current) {
          try {
            splitInstanceRef.current.revert()
          } catch {
            // noop
          }
          splitInstanceRef.current = null
        }

        const startPct = (1 - threshold) * 100
        const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin)
        const marginValue = marginMatch ? Number.parseFloat(marginMatch[1]) : 0
        const marginUnit = marginMatch ? (marginMatch[2] ?? 'px') : 'px'
        const sign =
          marginValue === 0
            ? ''
            : marginValue < 0
              ? `-=${Math.abs(marginValue)}${marginUnit}`
              : `+=${marginValue}${marginUnit}`
        const start = `top ${startPct}%${sign}`
        const normalizedGradientWords = new Set(
          gradientWords.map((word) =>
            word
              .toLowerCase()
              .normalize('NFD')
              .replace(/\p{Diacritic}/gu, '')
              .replace(/[^a-z0-9]+/gi, ''),
          ),
        )

        let targets: Element[] = []
        const assignTargets = (self: GSAPSplitText) => {
          if (splitType.includes('chars') && self.chars.length) targets = self.chars
          if (!targets.length && splitType.includes('words') && self.words.length) targets = self.words
          if (!targets.length && splitType.includes('lines') && self.lines.length) targets = self.lines
          if (!targets.length) targets = self.chars ?? self.words ?? self.lines ?? []
        }

        const applyGradientToKeywords = (words: Element[]) => {
          if (!normalizedGradientWords.size) return
          words.forEach((wordEl) => {
            const token = (wordEl.textContent ?? '')
              .toLowerCase()
              .normalize('NFD')
              .replace(/\p{Diacritic}/gu, '')
              .replace(/[^a-z0-9]+/gi, '')
            if (normalizedGradientWords.has(token)) {
              wordEl.classList.add('split-gradient-keyword')
            }
          })
        }

        const splitInstance = new GSAPSplitText(el, {
          type: splitType,
          smartWrap: true,
          autoSplit: splitType === 'lines',
          linesClass: 'split-line',
          wordsClass: 'split-word',
          charsClass: 'split-char',
          reduceWhiteSpace: false,
          onSplit: (self) => {
            assignTargets(self)
            applyGradientToKeywords(self.words)
            return gsap.fromTo(
              targets,
              { ...from },
              {
                ...to,
                duration,
                ease,
                stagger: delay / 1000,
                scrollTrigger: {
                  trigger: el,
                  start,
                  end,
                  scrub,
                  once: !scrub,
                  fastScrollEnd: scrub ? false : true,
                  anticipatePin: 0.4,
                },
                onComplete: () => {
                  if (!scrub) animationCompletedRef.current = true
                  onCompleteRef.current?.()
                },
                willChange: 'transform, opacity',
                force3D: true,
              },
            )
          },
        })

        splitInstanceRef.current = splitInstance
      }

      const schedule = () => {
        if (document.fonts.status === 'loaded') {
          runSetup()
        } else {
          void document.fonts.ready.then(() => {
            if (!cancelled) runSetup()
          })
        }
      }

      schedule()

      return () => {
        cancelled = true
        const el = ref.current
        if (el) {
          ScrollTrigger.getAll().forEach((st) => {
            if (st.trigger === el) st.kill()
          })
        }
        try {
          splitInstanceRef.current?.revert()
        } catch {
          // noop
        }
        splitInstanceRef.current = null
      }
    },
    {
      dependencies: [
        text,
        JSON.stringify(gradientWords),
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        end,
        scrub,
      ],
      scope: ref,
    },
  )

  const style: React.CSSProperties = {
    textAlign,
    overflow: 'visible',
    display: 'block',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    willChange: 'transform, opacity',
  }

  const classes = `split-parent ${className}`.trim()

  if (tag === 'h1') return <h1 ref={ref as React.RefObject<HTMLHeadingElement>} style={style} className={classes}>{text}</h1>
  if (tag === 'h2') return <h2 ref={ref as React.RefObject<HTMLHeadingElement>} style={style} className={classes}>{text}</h2>
  if (tag === 'h3') return <h3 ref={ref as React.RefObject<HTMLHeadingElement>} style={style} className={classes}>{text}</h3>
  if (tag === 'h4') return <h4 ref={ref as React.RefObject<HTMLHeadingElement>} style={style} className={classes}>{text}</h4>
  if (tag === 'h5') return <h5 ref={ref as React.RefObject<HTMLHeadingElement>} style={style} className={classes}>{text}</h5>
  if (tag === 'h6') return <h6 ref={ref as React.RefObject<HTMLHeadingElement>} style={style} className={classes}>{text}</h6>
  return <p ref={ref as React.RefObject<HTMLParagraphElement>} style={style} className={classes}>{text}</p>
}
