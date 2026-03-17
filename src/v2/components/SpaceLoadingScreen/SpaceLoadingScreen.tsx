import { motion } from 'framer-motion'
import styles from './SpaceLoadingScreen.module.css'

export function SpaceLoadingScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 99999,
      }}
    >
      {/* Subtle stars - matching the intro */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              backgroundColor: 'white',
              borderRadius: '9999px',
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Central loading spinner */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ position: 'relative', width: '10rem', height: '10rem' }}>
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
              borderBottomColor: '#0D8570',
              borderLeftColor: '#0D8570',
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
                  'radial-gradient(circle, rgba(13, 133, 112, 0.5) 0%, rgba(13, 133, 112, 0.2) 40%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
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
                  'radial-gradient(circle, rgba(13, 133, 112, 0.7) 0%, rgba(13, 133, 112, 0.3) 50%, transparent 80%)',
                filter: 'blur(4px)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.5,
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
                  'radial-gradient(circle, rgba(13, 133, 112, 0.95) 0%, rgba(13, 133, 112, 0.6) 50%, transparent 70%)',
                filter: 'blur(2px)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 1,
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
                  '0 0 12px rgba(13, 133, 112, 1), 0 0 24px rgba(13, 133, 112, 0.7), 0 0 40px rgba(13, 133, 112, 0.4)',
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
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={`shooting-${i}`}
          style={{
            position: 'absolute',
            width: 2,
            height: 2,
            borderRadius: '9999px',
            left: `${20 + i * 40}%`,
            top: `${10 + i * 30}%`,
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
            delay: i * 6 + 2,
            ease: 'easeOut',
            repeatDelay: 8,
          }}
        />
      ))}
    </div>
  )
}
