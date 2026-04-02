/**
 * NonImmersiveHome — Phase 1 scaffold
 *
 * Renders the full editorial HomeV2 content when the user is in
 * Classic (non-immersive) mode.
 *
 * Currently it is a thin pass-through wrapper around the existing HomeV2
 * content. Adds a top-left HUD (aligned with immersive) to return to the
 * Entry Gate via onSwitchMode.
 */

import { ArrowLeft } from 'lucide-react'
import { useLocale } from '../../lib/localeContext'
import { ExpandOnHoverIconButton } from '../ui/ExpandOnHoverIconButton'
import styles from './NonImmersiveHome.module.css'

interface NonImmersiveHomeProps {
  onSwitchMode: () => void
  children: React.ReactNode
}

export function NonImmersiveHome({ onSwitchMode, children }: NonImmersiveHomeProps) {
  const { locale } = useLocale()
  const menuLabel =
    locale === 'es' ? 'Regresar a menú principal' : 'Return to main menu'

  return (
    <div className={styles.root}>
      {children}

      <div className={styles.hudStack}>
        <ExpandOnHoverIconButton
          variant="classic"
          label={menuLabel}
          ariaLabel={menuLabel}
          icon={<ArrowLeft strokeWidth={2} />}
          onClick={onSwitchMode}
        />
      </div>
    </div>
  )
}
