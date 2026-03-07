/**
 * T-008 — Telemetry Layer — Barrel Export
 *
 * ESTADO ACTUAL: COMPLETAMENTE INACTIVO.
 * Importar desde este módulo es seguro: ninguna importación activa tracking.
 *
 * Uso típico (futuro):
 *   import { initTelemetry, getTelemetry } from '../lib/telemetry'
 *   import { setConsent, getConsent } from '../lib/telemetry'
 */

// Tipos
export type {
  ConsentCategory,
  ConsentState,
  TelemetryEvent,
  AnalyticsProvider,
  ErrorTrackingProvider,
  TelemetryStatus,
} from './types'
export { DEFAULT_CONSENT } from './types'

// Consent store
export { getConsent, setConsent, onConsentChange, resetConsent } from './consentStore'

// Stubs (siempre disponibles, nunca hacen llamadas reales)
export { ga4StubProvider } from './ga4'
export { sentryStubProvider } from './sentry'

// Orchestrator
export { initTelemetry, getTelemetry, watchConsentForTelemetry } from './telemetry'
