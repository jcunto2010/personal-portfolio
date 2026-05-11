/**
 * T-008 — Telemetry Layer
 *
 * ESTADO ACTUAL: COMPLETAMENTE INACTIVO salvo `initTelemetry` en bootstrap.
 * Importar `initTelemetry` desde aquí es el único contrato activo en el app shell.
 *
 * Consent / GA4 / Sentry (stubs y stores) viven en módulos colindantes y se pueden
 * reexportar aquí cuando existan consumidores.
 */

export { initTelemetry } from './telemetry'
