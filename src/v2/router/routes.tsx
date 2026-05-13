import { lazy } from 'react'

/**
 * Lazy-loaded page components.
 * Separated into their own exports to satisfy react-refresh.
 */
/** HomeV2Shell wires AppModeProvider, EntryGate, and the audio shell. */
export const LazyHomeV2 = lazy(() => import('../pages/HomeV2/HomeV2Shell'))
export const LazyClassicModePage = lazy(
  () => import('../pages/EditorialGlowup/EditorialGlowupPage'),
)

export function PageFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070B1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#B8C0D9',
        fontFamily: "var(--v2-font-body, 'Proxima Nova', 'Inter', 'Arial', sans-serif)",
        fontStyle: 'italic',
        fontSize: '0.875rem',
        letterSpacing: '0.08em',
      }}
    >
      Loading…
    </div>
  )
}
