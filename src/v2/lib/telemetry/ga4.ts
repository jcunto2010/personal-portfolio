/**
 * T-008 — GA4 loader
 *
 * Carga gtag.js solo cuando `loadGA4()` es invocado desde telemetry (flag + consentimiento).
 * Ver docs/t008-observability-activation.md.
 */

import type { AnalyticsProvider, TelemetryEvent } from './types'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Stub que implementa AnalyticsProvider pero no hace nada.
 */
export const ga4StubProvider: AnalyticsProvider = {
  init(_measurementId: string): void {},
  trackPageView(_path: string): void {},
  trackEvent(_event: TelemetryEvent): void {},
}

function ensureGtagQueue(): (...args: unknown[]) => void {
  window.dataLayer = window.dataLayer ?? []
  const push = (...args: unknown[]) => {
    window.dataLayer!.push(args)
  }
  window.gtag = push
  return push
}

/**
 * Carga el SDK de GA4 dinámicamente y devuelve un proveedor real.
 */
export async function loadGA4(measurementId: string): Promise<AnalyticsProvider> {
  if (!measurementId || measurementId.trim() === '') {
    console.error('[T-008] loadGA4: measurementId vacío. GA4 no se cargará.')
    return ga4StubProvider
  }

  const id = measurementId.trim()
  const gtag = ensureGtagQueue()

  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  script.async = true

  await new Promise<void>((resolve, reject) => {
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('[T-008] No se pudo cargar gtag.js'))
    document.head.appendChild(script)
  })

  gtag('js', new Date())
  gtag('config', id, { send_page_view: false })

  const runGtag = (...args: unknown[]) => {
    const fn = window.gtag ?? gtag
    fn(...args)
  }

  const provider: AnalyticsProvider = {
    init(mid: string): void {
      if (!mid?.trim()) return
      runGtag('config', mid.trim(), { send_page_view: false })
    },
    trackPageView(path: string): void {
      runGtag('event', 'page_view', { page_path: path })
    },
    trackEvent(event: TelemetryEvent): void {
      const params: Record<string, string | number | boolean> = { ...(event.properties ?? {}) }
      runGtag('event', event.name, params)
    },
  }

  return provider
}
