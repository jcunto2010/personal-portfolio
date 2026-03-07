/** V2 Feature Flags
 *
 *  - enable_webgl:  show the ambient WebGL layer (T-003)
 *  - enable_pwa:    register service worker          → OFF in this phase
 *  - enable_ga4:    load GA4 analytics               → OFF in this phase
 *  - enable_sentry: load Sentry error tracking       → OFF in this phase
 *
 *  Override at runtime via the URL:
 *    ?webgl=1   → forces WebGL on
 *    ?webgl=0   → forces WebGL off
 */

function queryFlag(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback
  const params = new URLSearchParams(window.location.search)
  const val = params.get(key)
  if (val === '1' || val === 'true') return true
  if (val === '0' || val === 'false') return false
  return fallback
}

export const featureFlags = {
  enableWebGL:  queryFlag('webgl', true), // T-003: WebGL on by default; ?webgl=0 disables
  enablePWA:    false,
  enableGA4:    false,
  enableSentry: false,
} as const

export type FeatureFlags = typeof featureFlags
