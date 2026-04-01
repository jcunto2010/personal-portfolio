/**
 * T-008 — GA4 Stub Loader
 *
 * ESTADO ACTUAL: COMPLETAMENTE INACTIVO.
 * Este módulo NO carga Google Analytics. NO envía datos. NO contacta servidores externos.
 * No hay gtag.js, no hay script tag, no hay píxeles, no hay beacons.
 *
 * ─── CÓMO ACTIVAR GA4 EN EL FUTURO ──────────────────────────────────────────
 *
 * Requisitos previos (checkpoint humano obligatorio):
 *   1. Obtener un Measurement ID real desde Google Analytics 4
 *      (formato: G-XXXXXXXXXX). No inventarlo, no hardcodearlo aquí.
 *   2. Almacenar el ID como variable de entorno: VITE_GA4_MEASUREMENT_ID
 *   3. Revisar y ajustar la CSP en netlify.toml / vercel.json:
 *      - Añadir 'https://www.googletagmanager.com' a script-src
 *      - Añadir 'https://www.google-analytics.com' a connect-src
 *      - Añadir 'https://www.googletagmanager.com' a img-src
 *   4. Activar el flag en featureFlags.ts: enableGA4: true
 *   5. Desbloquear loadGA4() llamándola desde telemetry.ts
 *      (ver comentario en esa función).
 *   6. Verificar en Network tab que solo se carga con consentimiento.
 *
 * Consulta docs/t008-observability-activation.md para el proceso completo.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { AnalyticsProvider, TelemetryEvent } from './types'

/**
 * Stub que implementa AnalyticsProvider pero no hace nada.
 * Es la implementación activa en esta fase.
 */
export const ga4StubProvider: AnalyticsProvider = {
  init(_measurementId: string): void {
    // NO-OP: GA4 no está activado en esta fase.
  },
  trackPageView(_path: string): void {
    // NO-OP
  },
  trackEvent(_event: TelemetryEvent): void {
    // NO-OP
  },
}

/**
 * Carga el SDK de GA4 dinámicamente.
 *
 * ACTUALMENTE BLOQUEADO: esta función existe pero NUNCA se llama.
 * telemetry.ts usa ga4StubProvider en su lugar.
 *
 * Para activar, ver el bloque de comentarios al inicio de este archivo.
 */
export async function loadGA4(measurementId: string): Promise<AnalyticsProvider> {
  // Guardia doble: verificar flag en tiempo de ejecución.
  // Esta comprobación se mantiene aunque la función sea llamada por error.
  if (!measurementId || measurementId.trim() === '') {
    console.error('[T-008] loadGA4: measurementId vacío. GA4 no se cargará.')
    return ga4StubProvider
  }

  // Aquí iría la carga dinámica real. Ejemplo (descomentar al activar):
  //
  // const script = document.createElement('script')
  // script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  // script.async = true
  // document.head.appendChild(script)
  //
  // window.dataLayer = window.dataLayer ?? []
  // function gtag(...args: unknown[]) { window.dataLayer.push(args) }
  // gtag('js', new Date())
  // gtag('config', measurementId, { send_page_view: false })
  //
  // return { init, trackPageView, trackEvent }  // implementación real

  console.error('[T-008] loadGA4: llamada bloqueada. GA4 está desactivado en esta fase.')
  return ga4StubProvider
}
