/**
 * NonImmersiveHome — Phase 1 scaffold
 *
 * Renders the full editorial HomeV2 content when the user is in
 * Classic (non-immersive) mode.
 *
 * Currently it is a thin pass-through wrapper around the existing HomeV2
 * content. In future phases this component may include:
 *   - Reduced-motion variants of chapter transitions
 *   - A simplified ambient background (CSS-only, no WebGL)
 *   - Mode-switch affordance (persistent floating pill)
 *
 * The onSwitchMode prop wires the mode-switch pill to the parent
 * HomeV2 state, allowing the user to jump back to the Entry Gate
 * or directly to immersive mode without reloading.
 *
 * [NV] Phase 2: replace placeholder pill with a persistent HUD that
 *       includes audio controls and mode toggle.
 */

import styles from './NonImmersiveHome.module.css'

interface NonImmersiveHomeProps {
  onSwitchMode: () => void
  children: React.ReactNode
}

export function NonImmersiveHome({ onSwitchMode, children }: NonImmersiveHomeProps) {
  return (
    <div className={styles.root}>
      {children}

      {/* Mode-switch pill — lets user re-open the Entry Gate */}
      <button
        type="button"
        className={styles.modeSwitcher}
        onClick={onSwitchMode}
        aria-label="Switch experience mode"
        title="Switch to immersive mode or change preferences"
      >
        <span aria-hidden="true">⚙</span>
        Switch mode
      </button>
    </div>
  )
}
