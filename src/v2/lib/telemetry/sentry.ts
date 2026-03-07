/**
 * T-008 — Sentry Stub Loader
 *
 * ESTADO ACTUAL: COMPLETAMENTE INACTIVO.
 * Este módulo NO inicializa Sentry. NO captura errores remotamente.
 * NO contacta sentry.io ni ningún endpoint externo.
 * No hay DSN, no hay SDK cargado, no hay beacons, no hay fetch a Sentry.
 *
 * ─── CÓMO ACTIVAR SENTRY EN EL FUTURO ───────────────────────────────────────
 *
 * Requisitos previos (checkpoint humano obligatorio):
 *   1. Crear un proyecto en sentry.io y obtener el DSN real.
 *      (formato: https://xxxx@oxxxx.ingest.sentry.io/xxxx)
 *      No inventarlo, no hardcodearlo aquí.
 *   2. Almacenar el DSN como variable de entorno: VITE_SENTRY_DSN
 *   3. Instalar el SDK: npm install @sentry/react
 *   4. Revisar la CSP en netlify.toml / vercel.json:
 *      - Añadir 'https://*.sentry.io' a connect-src
 *   5. Activar el flag en featureFlags.ts: enableSentry: true
 *   6. Desbloquear loadSentry() llamándola desde telemetry.ts
 *      (ver comentario en esa función).
 *   7. Decidir nivel de sampling (tracesSampleRate) apropiado.
 *   8. Verificar en Network tab que solo captura con consentimiento.
 *
 * Consulta docs/t008-observability-activation.md para el proceso completo.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { ErrorTrackingProvider } from './types'

/**
 * Stub que implementa ErrorTrackingProvider pero no hace nada.
 * Es la implementación activa en esta fase.
 */
export const sentryStubProvider: ErrorTrackingProvider = {
  init(_dsn: string): void {
    // NO-OP: Sentry no está activado en esta fase.
  },
  captureError(_error: Error, _context?: Record<string, unknown>): void {
    // NO-OP
  },
  captureMessage(_message: string, _level?: 'info' | 'warning' | 'error'): void {
    // NO-OP
  },
}

/**
 * Carga el SDK de Sentry dinámicamente.
 *
 * ACTUALMENTE BLOQUEADO: esta función existe pero NUNCA se llama.
 * telemetry.ts usa sentryStubProvider en su lugar.
 *
 * Para activar, ver el bloque de comentarios al inicio de este archivo.
 */
export async function loadSentry(dsn: string): Promise<ErrorTrackingProvider> {
  if (!dsn || dsn.trim() === '') {
    console.error('[T-008] loadSentry: DSN vacío. Sentry no se cargará.')
    return sentryStubProvider
  }

  // Aquí iría la inicialización real. Ejemplo (descomentar al activar):
  //
  // const Sentry = await import('@sentry/react')
  // Sentry.init({
  //   dsn,
  //   integrations: [Sentry.browserTracingIntegration()],
  //   tracesSampleRate: 0.1,
  //   environment: import.meta.env.MODE,
  //   release: import.meta.env.VITE_APP_VERSION,
  //   beforeSend(event) {
  //     // filtrar datos PII si es necesario
  //     return event
  //   },
  // })
  //
  // return {
  //   init: (_d) => Sentry.init({ dsn: _d }),
  //   captureError: (err, ctx) => Sentry.captureException(err, { extra: ctx }),
  //   captureMessage: (msg, lvl) => Sentry.captureMessage(msg, lvl),
  // }

  console.error('[T-008] loadSentry: llamada bloqueada. Sentry está desactivado en esta fase.')
  return sentryStubProvider
}
