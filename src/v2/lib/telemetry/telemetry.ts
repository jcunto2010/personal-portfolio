/**
 * T-008 — Telemetry Orchestrator
 *
 * GA4: si `enableGA4` y `VITE_GA4_MEASUREMENT_ID`, se carga sin comprobar consentimiento
 * (portafolio personal; consentimiento implícito).
 * Sentry sigue desactivado hasta activar flag + consentimiento explícito cuando exista UI.
 */

import { featureFlags } from '../featureFlags'
import { getConsent, onConsentChange } from './consentStore'
import { ga4StubProvider } from './ga4'
import { sentryStubProvider } from './sentry'
import type {
  AnalyticsProvider,
  ErrorTrackingProvider,
  TelemetryStatus,
} from './types'

interface TelemetryHandles {
  analytics: AnalyticsProvider
  errorTracking: ErrorTrackingProvider
  status: TelemetryStatus
}

let _handles: TelemetryHandles = {
  analytics: ga4StubProvider,
  errorTracking: sentryStubProvider,
  status: { ga4Loaded: false, sentryLoaded: false, consentGiven: false },
}

/** Inicializa la capa de telemetría (GA4 según flags/env; Sentry según doc T-008). */
export async function initTelemetry(): Promise<TelemetryHandles> {
  const consent = getConsent()
  const status: TelemetryStatus = {
    ga4Loaded: false,
    sentryLoaded: false,
    consentGiven: consent.hasDecided && (consent.analytics || consent.errorTracking),
  }

  // ── GA4 (sin gate de consentimiento en portafolio personal) ───────────────
  if (featureFlags.enableGA4) {
    const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID
    if (measurementId) {
      const { loadGA4 } = await import('./ga4')
      _handles.analytics = await loadGA4(measurementId)
      status.ga4Loaded = true
    }
  }
  void featureFlags.enableGA4  // referencia para evitar tree-shaking del flag

  // ── Sentry ───────────────────────────────────────────────────────────────
  // Bloqueado por flag. Descomentar y sustituir stub cuando se active.
  //
  // if (featureFlags.enableSentry && consent.errorTracking) {
  //   const dsn = import.meta.env.VITE_SENTRY_DSN
  //   if (dsn) {
  //     const { loadSentry } = await import('./sentry')
  //     _handles.errorTracking = await loadSentry(dsn)
  //     status.sentryLoaded = true
  //   }
  // }
  void featureFlags.enableSentry  // referencia para evitar tree-shaking del flag

  _handles = {
    analytics: _handles.analytics,
    errorTracking: _handles.errorTracking,
    status,
  }

  return _handles
}

/**
 * Devuelve los handles activos (stubs en esta fase).
 * Seguros de usar: sus métodos son NO-OP cuando los proveedores no están cargados.
 */
export function getTelemetry(): TelemetryHandles {
  return _handles
}

/**
 * Registra un listener que re-evalúa los proveedores cuando cambia el consentimiento.
 * Devuelve una función de cleanup.
 *
 * En esta fase no tiene efecto práctico porque los flags están en false.
 * Cuando se activen, permitirá activar/desactivar tracking en caliente.
 */
export function watchConsentForTelemetry(): () => void {
  return onConsentChange(async (_newConsent) => {
    // Re-init solo si hay flags activos (no en esta fase).
    if (featureFlags.enableGA4 || featureFlags.enableSentry) {
      await initTelemetry()
    }
  })
}
