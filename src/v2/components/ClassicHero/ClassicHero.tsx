import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { DynamicWaveCanvasBackground } from './DynamicWaveCanvasBackground'
import styles from './ClassicHero.module.css'

export interface ClassicHeroLink {
  label: string
  onClick: () => void
}

export interface ClassicHeroSocialLink {
  icon: LucideIcon
  href: string
  label: string
}

interface ClassicHeroProps {
  logoText: string
  navLinks: ClassicHeroLink[]
  heroHeading: string
  mainText: string
  ctaPrimary: { label: string; onClick: () => void }
  ctaSecondary: { label: string; onClick: () => void }
  imageSrc: string
  imageAlt: string
  socialLinks: ClassicHeroSocialLink[]
  locationText: string
}

export function ClassicHero({
  navLinks,
  heroHeading,
  mainText,
  ctaPrimary,
  ctaSecondary,
  imageSrc,
  imageAlt,
  socialLinks,
  locationText,
}: ClassicHeroProps) {
  return (
    <section className={styles.root} aria-label="Classic hero">
      <div className={styles.backgroundLayer} aria-hidden="true">
        <DynamicWaveCanvasBackground />
      </div>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={styles.header}
      >
        <nav className={styles.nav} aria-label="Classic navigation">
          {navLinks.map((link) => (
            <button key={link.label} type="button" onClick={link.onClick} className={styles.navLink}>
              {link.label}
            </button>
          ))}
        </nav>
      </motion.header>

      <div className={styles.mainGrid}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className={styles.leftContent}
        >
          <h1 className={styles.heroHeading}>{heroHeading}</h1>
          <p className={styles.mainText}>{mainText}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.actionPrimary} onClick={ctaPrimary.onClick}>
              {ctaPrimary.label}
            </button>
            <button type="button" className={styles.actionSecondary} onClick={ctaSecondary.onClick}>
              {ctaSecondary.label}
            </button>
          </div>
        </motion.div>

        <div className={styles.imageWrap}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className={styles.circle}
          >
            <motion.img
              src={imageSrc}
              alt={imageAlt}
              className={styles.image}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
              onError={(e) => {
                const target = e.currentTarget
                target.onerror = null
                target.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&h=1200&fit=crop&crop=faces&auto=format&q=80'
              }}
            />
          </motion.div>
        </div>
      </div>

      <footer className={styles.footer}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className={styles.socials}
        >
          {socialLinks.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={link.label}
              >
                <Icon size={20} />
              </a>
            )
          })}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className={styles.location}
        >
          {locationText}
        </motion.div>
      </footer>
      <div className={styles.noiseLayer} aria-hidden="true" />
      <div className={styles.vignetteLayer} aria-hidden="true" />
    </section>
  )
}
