/**
 * T-008 — Consent Store
 *
 * ESTADO ACTUAL: COMPLETAMENTE INACTIVO.
 * Este módulo gestiona el estado de consentimiento del usuario en memoria.
 * No escribe cookies, no llama APIs, no activa ningún SDK.
 *
 * Diseño:
 * - El estado vive en memoria durante la sesión.
 * - Cuando se active una UI de consentimiento real, este store será la fuente
 *   de verdad que los proveedores (GA4, Sentry) consultarán antes de iniciar.
 * - La persistencia (localStorage/cookie) se añadirá en la fase de activación.
 *   Ver docs/t008-observability-activation.md.
 */

import type { ConsentCategory, ConsentState } from './types'
import { DEFAULT_CONSENT } from './types'

type ConsentListener = (state: ConsentState) => void

let _state: ConsentState = { ...DEFAULT_CONSENT }
const _listeners = new Set<ConsentListener>()

/** Devuelve una copia inmutable del estado de consentimiento actual. */
export function getConsent(): Readonly<ConsentState> {
  return { ..._state }
}

/**
 * Actualiza el consentimiento para una o más categorías.
 * Notifica a todos los listeners registrados.
 *
 * IMPORTANTE: Esta función solo tendrá efecto observable cuando los proveedores
 * reales (GA4, Sentry) estén activados. En esta fase, llamarla no hace nada
 * salvo actualizar el estado en memoria.
 */
export function setConsent(
  categories: Partial<Record<ConsentCategory, boolean>>,
): void {
  _state = {
    ..._state,
    ...categories,
    decidedAt: new Date().toISOString(),
    hasDecided: true,
  }
  _listeners.forEach((fn) => fn({ ..._state }))
}

/**
 * Registra un callback que se invoca cada vez que el consentimiento cambia.
 * Devuelve una función de cleanup para desregistrar el listener.
 */
export function onConsentChange(listener: ConsentListener): () => void {
  _listeners.add(listener)
  return () => {
    _listeners.delete(listener)
  }
}

/**
 * Resetea el estado de consentimiento (útil para tests y desarrollo).
 */
export function resetConsent(): void {
  _state = { ...DEFAULT_CONSENT }
  _listeners.forEach((fn) => fn({ ..._state }))
}
