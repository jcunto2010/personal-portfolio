# T-008 — Guía de activación de observabilidad

**Estado actual: INACTIVO — Cero tracking en esta fase.**

Ningún dato se envía a terceros. No hay scripts externos cargados.
Esta guía documenta los pasos exactos para activar cada proveedor cuando se requiera,
previa validación humana y obtención de consentimiento del usuario.

---

## Arquitectura de la capa de telemetría

```
featureFlags.ts
  └── enableGA4 / enableSentry (ambos false)
        │
        ▼
src/v2/lib/telemetry/
  ├── types.ts          — interfaces y contratos
  ├── consentStore.ts   — estado de consentimiento en memoria
  ├── ga4.ts            — stub + loader bloqueado
  ├── sentry.ts         — stub + loader bloqueado
  ├── telemetry.ts      — orquestador (lee flags + consent antes de cargar)
  └── index.ts          — barrel export
```

El orquestador (`telemetry.ts`) es el único punto de activación.
Los stubs (`ga4StubProvider`, `sentryStubProvider`) son NO-OP y siempre seguros.

---

## Activar GA4

### Requisitos previos

- [ ] Checkpoint humano: decisión de activar analytics
- [ ] Cuenta Google Analytics 4 con propiedad configurada
- [ ] Measurement ID real obtenido (formato `G-XXXXXXXXXX`)
- [ ] Revisión legal/privacidad de política de cookies completada
- [ ] Banner de consentimiento con opciones accept/reject implementado en UI

### Pasos

1. **Variable de entorno**

   Añadir en `.env.production` (nunca commitear este archivo):
   ```
   VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   Añadir en Netlify/Vercel como variable de entorno de build.

2. **Activar el flag**

   En `src/v2/lib/featureFlags.ts`:
   ```ts
   enableGA4: true,
   ```

3. **Desbloquear el loader en telemetry.ts**

   En `src/v2/lib/telemetry/telemetry.ts`, descomentar el bloque GA4:
   ```ts
   if (featureFlags.enableGA4 && consent.analytics) {
     const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID
     if (measurementId) {
       const { loadGA4 } = await import('./ga4')
       _handles.analytics = await loadGA4(measurementId)
       status.ga4Loaded = true
     }
   }
   ```

4. **Desbloquear el loader en ga4.ts**

   En `src/v2/lib/telemetry/ga4.ts`, descomentar la implementación real
   dentro de `loadGA4()` y eliminar el `console.warn` de bloqueo.

5. **Actualizar la CSP**

   En `netlify.toml` y `vercel.json`, ampliar los headers:
   ```
   script-src: añadir https://www.googletagmanager.com
   connect-src: añadir https://www.google-analytics.com https://analytics.google.com
   img-src:     añadir https://www.google-analytics.com https://www.googletagmanager.com
   ```

6. **UI de consentimiento**

   El banner debe llamar a `setConsent({ analytics: true })` solo si el usuario acepta.
   GA4 no se cargará sin este consentimiento explícito.

7. **Verificación**

   - Network tab: confirmar que `gtag/js` solo se carga tras aceptación.
   - GA4 Realtime report: confirmar eventos entrando.
   - Playwright: añadir test que verifica ausencia de gtag.js sin consentimiento.

---

## Activar Sentry

### Requisitos previos

- [ ] Checkpoint humano: decisión de activar error tracking
- [ ] Proyecto creado en sentry.io
- [ ] DSN real obtenido
- [ ] Revisión de qué datos PII pueden enviarse

### Pasos

1. **Instalar el SDK**
   ```bash
   npm install @sentry/react
   ```

2. **Variable de entorno**

   Añadir en `.env.production`:
   ```
   VITE_SENTRY_DSN=https://xxxx@oXXXX.ingest.sentry.io/XXXX
   ```
   Añadir en Netlify/Vercel como variable de entorno de build.

3. **Activar el flag**

   En `src/v2/lib/featureFlags.ts`:
   ```ts
   enableSentry: true,
   ```

4. **Desbloquear el loader en telemetry.ts**

   En `src/v2/lib/telemetry/telemetry.ts`, descomentar el bloque Sentry:
   ```ts
   if (featureFlags.enableSentry && consent.errorTracking) {
     const dsn = import.meta.env.VITE_SENTRY_DSN
     if (dsn) {
       const { loadSentry } = await import('./sentry')
       _handles.errorTracking = await loadSentry(dsn)
       status.sentryLoaded = true
     }
   }
   ```

5. **Desbloquear el loader en sentry.ts**

   En `src/v2/lib/telemetry/sentry.ts`, descomentar la implementación real
   dentro de `loadSentry()` y eliminar el `console.warn` de bloqueo.
   Decidir `tracesSampleRate` apropiado (recomendado: `0.05` en producción).

6. **Actualizar la CSP**

   En `netlify.toml` y `vercel.json`:
   ```
   connect-src: añadir https://*.sentry.io
   ```

7. **Consentimiento**

   El banner debe llamar a `setConsent({ errorTracking: true })` si el usuario acepta.
   Error tracking no se activará sin este consentimiento.

8. **Verificación**

   - Network tab: confirmar que no hay fetch a `*.sentry.io` sin consentimiento.
   - Sentry dashboard: confirmar eventos de prueba entrando.
   - `tracesSampleRate` revisado para no impactar performance.

---

## Flujo de consentimiento recomendado

```
Usuario llega a la página
        │
        ▼
¿Ya tomó decisión antes? (consentStore.hasDecided)
  SÍ → usar decisión almacenada y llamar a initTelemetry()
  NO → mostrar banner de consentimiento
          │
          ├─ Acepta todo → setConsent({ analytics: true, errorTracking: true })
          │                → llamar a initTelemetry()
          │
          ├─ Solo funcional → setConsent({ analytics: false, errorTracking: false })
          │
          └─ Rechaza todo  → setConsent({ analytics: false, errorTracking: false })
```

**Pendiente para activación real**: persistir la decisión en `localStorage`
o cookie first-party. El `consentStore.ts` actual es solo memoria de sesión.
Añadir persistencia antes de activar cualquier proveedor real.

---

## Variables de entorno requeridas

| Variable                    | Proveedor | Formato de ejemplo                              | ¿Se commitea? |
|-----------------------------|-----------|------------------------------------------------|---------------|
| `VITE_GA4_MEASUREMENT_ID`   | GA4       | `G-XXXXXXXXXX`                                  | NO            |
| `VITE_SENTRY_DSN`           | Sentry    | `https://xxxx@oXXXX.ingest.sentry.io/XXXX`     | NO            |

Ambas deben configurarse como secrets en Netlify/Vercel.
El `.env.production` local no debe commitearse (verificar `.gitignore`).

---

## Items [NV] — pendientes de validación humana

- [NV] Decisión de activar GA4: requiere aprobación humana + política de cookies.
- [NV] Decisión de activar Sentry: requiere aprobación humana + revisión de PII.
- [NV] Diseño y copy del banner de consentimiento (UI no incluida en T-008).
- [NV] Persistencia de consentimiento en localStorage/cookie (no implementada).
- [NV] Obtención de Measurement ID real y DSN real (no se pueden generar aquí).
- [NV] Revisión legal de política de privacidad antes del primer deploy con tracking.

---

*Generado por Agente8 — T-008 — Portfolio V2 Cosmic Editorial*
