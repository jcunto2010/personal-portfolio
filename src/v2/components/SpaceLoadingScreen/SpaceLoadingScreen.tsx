import { useMemo } from 'react'
import { motion } from 'framer-motion'
import styles from './SpaceLoadingScreen.module.css'

export function SpaceLoadingScreen() {
  const stars = useMemo(() => {
    return Array.from({ length: 100 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 0.5}px`,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
      maxOpacity: 0.65 + Math.random() * 0.25,
    }))
  }, [])

  const shootingStars = useMemo(() => {
    return Array.from({ length: 2 }, (_, i) => ({
      key: `shooting-${i}`,
      left: `${20 + i * 40}%`,
      top: `${10 + i * 30}%`,
      delay: i * 6 + 2,
    }))
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        // Must be fully opaque so the 3D scene never bleeds through underneath.
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 99999,
      }}
    >
      {/* Subtle vignette/glow (kept separate so base background stays opaque) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.10) 0%, rgba(13, 133, 112, 0.08) 28%, rgba(0, 0, 0, 1) 72%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle stars - matching the intro */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {stars.map((s, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              backgroundColor: 'white',
              borderRadius: '9999px',
            }}
            animate={{
              opacity: [0.2, s.maxOpacity, 0.2],
            }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              delay: s.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Central loading spinner */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ position: 'relative', width: '10rem', height: '10rem' }}>
          {/* Soft halo behind rings */}
          <div
            style={{
              position: 'absolute',
              inset: -28,
              borderRadius: '9999px',
              background:
                'radial-gradient(circle, rgba(56, 189, 248, 0.14) 0%, rgba(13, 133, 112, 0.10) 35%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none',
            }}
          />

          {/* Outer spinner ring — CSS animation for smooth 60fps */}
          <div
            className={styles.spinnerOuter}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '9999px',
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: 'rgb(31 41 55)',
              borderTopColor: '#0D8570',
              borderRightColor: '#0D8570',
              filter: 'drop-shadow(0 0 10px rgba(13, 133, 112, 0.35))',
            }}
          />

          {/* Inner spinner ring */}
          <div
            className={styles.spinnerInner}
            style={{
              position: 'absolute',
              inset: 24,
              borderRadius: '9999px',
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: 'rgb(17 24 39)',
              borderBottomColor: '#38BDF8',
              borderLeftColor: '#38BDF8',
              filter: 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.45))',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Outer glow */}
            <motion.div
              style={{
                position: 'absolute',
                width: 64,
                height: 64,
                borderRadius: '9999px',
                background:
                  'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(13, 133, 112, 0.26) 35%, transparent 70%)',
                filter: 'blur(6px)',
                willChange: 'transform',
              }}
              animate={{
                scale: [1, 1.18, 1],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Middle glow */}
            <motion.div
              style={{
                position: 'absolute',
                width: 40,
                height: 40,
                borderRadius: '9999px',
                background:
                  'radial-gradient(circle, rgba(56, 189, 248, 0.42) 0%, rgba(13, 133, 112, 0.28) 55%, transparent 80%)',
                filter: 'blur(5px)',
                willChange: 'transform',
              }}
              animate={{
                scale: [1, 1.12, 1],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Inner bright glow */}
            <motion.div
              style={{
                position: 'absolute',
                width: 24,
                height: 24,
                borderRadius: '9999px',
                background:
                  'radial-gradient(circle, rgba(56, 189, 248, 0.85) 0%, rgba(13, 133, 112, 0.55) 55%, transparent 72%)',
                filter: 'blur(3px)',
                willChange: 'transform',
              }}
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Core orb with strong glow */}
            <motion.div
              style={{
                width: 14,
                height: 14,
                borderRadius: '9999px',
                position: 'relative',
                backgroundColor: '#0D8570',
                boxShadow:
                  '0 0 14px rgba(56, 189, 248, 0.75), 0 0 18px rgba(13, 133, 112, 1), 0 0 34px rgba(13, 133, 112, 0.75), 0 0 52px rgba(13, 133, 112, 0.35)',
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.95, 1, 0.95],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>
      </div>

      {/* Occasional shooting star */}
      {shootingStars.map((s) => (
        <motion.div
          key={s.key}
          style={{
            position: 'absolute',
            width: 2,
            height: 2,
            borderRadius: '9999px',
            left: s.left,
            top: s.top,
            backgroundColor: '#0D8570',
            boxShadow:
              '0 0 8px rgba(13, 133, 112, 0.6), -30px 0 20px rgba(13, 133, 112, 0.2)',
          }}
          animate={{
            x: [0, 300],
            y: [0, 300],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeOut',
            repeatDelay: 8,
          }}
        />
      ))}
    </div>
  )
}
