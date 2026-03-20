'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import useMeasure from 'react-use-measure'

type InfiniteSliderProps = {
  children: ReactNode
  gap?: number
  /** pixels per second */
  speed?: number
  /** pixels per second (when hovered) */
  speedOnHover?: number
  direction?: 'horizontal' | 'vertical'
  reverse?: boolean
  className?: string
}

export function InfiniteSlider({
  children,
  gap = 16,
  speed = 50,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const isHorizontal = direction === 'horizontal'
  const [currentSpeed, setCurrentSpeed] = useState(speed)
  const translation = useMotionValue(0)

  // Medimos SOLO una copia (no el contenedor duplicado) para que el boundary sea seamless.
  const [copyMeasureRef, { width, height }] = useMeasure()
  const measuredSize = isHorizontal ? width : height

  // Preload/stabilization: no arrancar hasta que el tamaño no esté cambiando.
  const [stableSize, setStableSize] = useState(0)
  useEffect(() => {
    if (!measuredSize) return
    const t = window.setTimeout(() => setStableSize(measuredSize), 180)
    return () => window.clearTimeout(t)
  }, [measuredSize])

  const boundaryGap = gap
  const distance = useMemo(() => {
    if (!stableSize) return 0
    return stableSize + boundaryGap
  }, [stableSize, boundaryGap])

  useEffect(() => {
    if (!distance) return

    const from = reverse ? -distance : 0
    const to = reverse ? 0 : -distance
    translation.set(from)

    const controls = animate(translation, [from, to], {
      ease: 'linear',
      duration: distance / Math.max(currentSpeed, 0.01),
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 0,
    })

    return () => controls.stop()
  }, [translation, distance, currentSpeed, reverse])

  const hoverProps =
    speedOnHover != null
      ? {
          onHoverStart: () => setCurrentSpeed(speedOnHover),
          onHoverEnd: () => setCurrentSpeed(speed),
        }
      : {}

  return (
    <div className={className} style={{ overflow: 'hidden' }}>
      <motion.div
        style={{
          ...(isHorizontal ? { x: translation } : { y: translation }),
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          flexWrap: 'nowrap',
          alignItems: 'center',
          willChange: 'transform',
          gap: 0,
        }}
        {...hoverProps}
      >
        <div
          ref={copyMeasureRef}
          style={{
            display: 'flex',
            flexDirection: isHorizontal ? 'row' : 'column',
            flexWrap: 'nowrap',
            gap: `${gap}px`,
            ...(isHorizontal ? { marginRight: `${gap}px` } : { marginBottom: `${gap}px` }),
          }}
        >
          {children}
        </div>

        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            flexDirection: isHorizontal ? 'row' : 'column',
            flexWrap: 'nowrap',
            gap: `${gap}px`,
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  )
}

