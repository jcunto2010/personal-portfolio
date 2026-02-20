import React from 'react'
import { motion } from 'framer-motion'

export interface TechStackOrbitItem {
  id: string
  label: string
  color?: string
  icon?: React.ReactNode
}

export interface TechStackOrbitProps {
  items: TechStackOrbitItem[]
  centerLabel?: string
  className?: string
}

const ORBIT_RADIUS = 140
const DURATION = 25

export const TechStackOrbit: React.FC<TechStackOrbitProps> = ({
  items,
  centerLabel = 'App',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center justify-center min-h-[320px] ${className}`}>
      <motion.div
        className="relative w-[320px] h-[320px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="flex items-center justify-center w-24 h-24 rounded-2xl bg-primary-500/20 border border-primary-400/50 backdrop-blur-sm font-heading font-bold text-white text-lg shadow-lg"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {centerLabel}
          </motion.div>
        </div>

        {/* Orbiting items */}
        {items.map((item, index) => {
          const angleOffset = (index / items.length) * 360
          return (
            <motion.div
              key={item.id}
              className="absolute left-1/2 top-1/2 origin-center"
              style={{ x: '-50%', y: '-50%' }}
              animate={{ rotate: 360 }}
              transition={{ duration: DURATION, repeat: Infinity, ease: 'linear' }}
            >
              <motion.div
                className="absolute flex flex-col items-center gap-2"
                style={{
                  width: ORBIT_RADIUS * 2,
                  height: ORBIT_RADIUS * 2,
                  left: -ORBIT_RADIUS,
                  top: -ORBIT_RADIUS,
                  transform: `rotate(${angleOffset}deg) translate(${ORBIT_RADIUS}px)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: -360,
                }}
                transition={{
                  opacity: { delay: 0.1 * index + 0.3, duration: 0.4 },
                  scale: { delay: 0.1 * index + 0.3, duration: 0.4 },
                  rotate: { duration: DURATION, repeat: Infinity, ease: 'linear' },
                }}
              >
                <div
                  className="flex flex-col items-center justify-center w-16 h-16 rounded-xl border backdrop-blur-sm font-body text-sm font-medium text-white shadow-lg"
                  style={{
                    backgroundColor: item.color ? `${item.color}20` : 'rgba(14, 165, 233, 0.2)',
                    borderColor: item.color ? `${item.color}80` : 'rgba(14, 165, 233, 0.5)',
                  }}
                >
                  {item.icon ?? null}
                  <span className="mt-1 text-xs">{item.label}</span>
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
