/**
 * T-008 — Telemetry Orchestrator
 *
 * ESTADO ACTUAL: COMPLETAMENTE INACTIVO.
 * Este módulo coordina el ciclo de vida de la observabilidad:
 *   1. Lee los feature flags.
 *   2. Verifica el consentimiento del usuario.
 *   3. Solo si ambos están habilitados, carga el proveedor real.
 *
 * En esta fase: featureFlags.enableGA4 = false, featureFlags.enableSentry = false.
 * initTelemetry() retorna inmediatamente con los stubs sin hacer nada.
 *
 * No se llama a loadGA4() ni a loadSentry(). Cero tráfico a terceros.
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

/**
 * Inicializa la capa de telemetría.
 *
 * ACTUALMENTE: retorna stubs inmediatamente porque los flags están en false.
 *
 * Para activar en el futuro:
 *   1. Setear featureFlags.enableGA4 = true y/o featureFlags.enableSentry = true.
 *   2. Asegurarse de que el usuario haya otorgado consentimiento (setConsent).
 *   3. Descomentar las llamadas a loadGA4() / loadSentry() en este módulo.
 *   4. Proporcionar VITE_GA4_MEASUREMENT_ID y/o VITE_SENTRY_DSN como env vars.
 *
 * Ver docs/t008-observability-activation.md.
 */
export async function initTelemetry(): Promise<TelemetryHandles> {
  const consent = getConsent()
  const status: TelemetryStatus = {
    ga4Loaded: false,
    sentryLoaded: false,
    consentGiven: consent.hasDecided && (consent.analytics || consent.errorTracking),
  }

  // ── GA4 ──────────────────────────────────────────────────────────────────
  // Bloqueado por flag. Descomentar y sustituir stub cuando se active.
  //
  // if (featureFlags.enableGA4 && consent.analytics) {
  //   const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID
  //   if (measurementId) {
  //     const { loadGA4 } = await import('./ga4')
  //     _handles.analytics = await loadGA4(measurementId)
  //     status.ga4Loaded = true
  //   }
  // }
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
