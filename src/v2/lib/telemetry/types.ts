/**
 * T-008 — Observabilidad / Telemetry Layer
 *
 * ESTADO ACTUAL: COMPLETAMENTE INACTIVO.
 * No hay tracking real en esta fase. Cero datos enviados a terceros.
 *
 * Este archivo define los contratos de tipo para la capa de observabilidad.
 * Los proveedores reales (GA4, Sentry) solo se cargarán cuando:
 *   1. El usuario otorgue consentimiento explícito.
 *   2. El flag correspondiente en featureFlags se active manualmente.
 * Consulta docs/t008-observability-activation.md para el path de activación.
 */

// ─── Consentimiento ──────────────────────────────────────────────────────────

export type ConsentCategory = 'analytics' | 'errorTracking'

export interface ConsentState {
  analytics: boolean
  errorTracking: boolean
  /** ISO timestamp del momento en que el usuario tomó la decisión */
  decidedAt: string | null
  /** true si el usuario ya interactuó con el banner; false = sin decisión */
  hasDecided: boolean
}

export const DEFAULT_CONSENT: ConsentState = {
  analytics: false,
  errorTracking: false,
  decidedAt: null,
  hasDecided: false,
}

// ─── Eventos de telemetría ────────────────────────────────────────────────────

export interface TelemetryEvent {
  /** Nombre del evento, e.g. "page_view", "cta_click" */
  name: string
  /** Propiedades adicionales del evento */
  properties?: Record<string, string | number | boolean>
}

// ─── Contratos de proveedores ─────────────────────────────────────────────────

/**
 * Contrato mínimo para un proveedor de analytics (e.g. GA4).
 * Implementar este interfaz al activar cualquier proveedor real.
 */
export interface AnalyticsProvider {
  /** Inicializa el SDK. Solo llamar después de consentimiento. */
  init(measurementId: string): void
  /** Registra un pageview. */
  trackPageView(path: string): void
  /** Registra un evento custom. */
  trackEvent(event: TelemetryEvent): void
}

/**
 * Contrato mínimo para un proveedor de error tracking (e.g. Sentry).
 * Implementar este interfaz al activar cualquier proveedor real.
 */
export interface ErrorTrackingProvider {
  /** Inicializa el SDK. Solo llamar después de consentimiento. */
  init(dsn: string): void
  /** Captura un error. */
  captureError(error: Error, context?: Record<string, unknown>): void
  /** Captura un mensaje informativo. */
  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void
}

// ─── Estado de la capa de telemetría ─────────────────────────────────────────

export interface TelemetryStatus {
  ga4Loaded: boolean
  sentryLoaded: boolean
  consentGiven: boolean
}
