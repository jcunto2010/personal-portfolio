import type { ReactNode } from 'react'
import styles from './ExpandOnHoverIconButton.module.css'

type ExpandOnHoverIconButtonVariant = 'immersive' | 'classic'

export type ExpandOnHoverIconButtonProps = {
  label: string
  icon: ReactNode
  /** Exposed to assistive tech (can match `label` or add context). */
  ariaLabel: string
  onClick: () => void
  variant: ExpandOnHoverIconButtonVariant
  disabled?: boolean
}

export function ExpandOnHoverIconButton({
  label,
  icon,
  ariaLabel,
  onClick,
  variant,
  disabled = false,
}: ExpandOnHoverIconButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${styles[variant]}`}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {/* In-flow flex so width/max-width transitions resolve to real intrinsic size (abs-only children broke collapse/expand). */}
      <span className={styles.inner}>
        <span className={styles.label}>{label}</span>
        <span className={styles.iconWrap} aria-hidden>
          {icon}
        </span>
      </span>
    </button>
  )
}
