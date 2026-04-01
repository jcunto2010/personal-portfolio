# Auditoría de rendimiento — Portafolio V2 (modo inmersivo)

**Ámbito:** `http://localhost:5173/index.v2.html` **tras activar el modo inmersivo** y con la escena solar montada (región “Solar system experience — scroll to explore”, canvas WebGL, panel “Sun information”).

**Fecha de medición:** 25 de marzo de 2026. **Entorno:** Vite en desarrollo, localhost, sin throttling de CPU ni red.

---

## Pruebas ejecutadas y metodología

1. **Servidor:** comprobación HTTP **200** (`Invoke-WebRequest` a `index.v2.html`).
2. **Chrome DevTools (MCP):** `navigate_page` → `take_snapshot` → `click` en **“Activate immersive mode”**.
3. **Sincronización:** `evaluate_script` en bucle (intervalo 200 ms, tope 90 s) hasta `<canvas>` con dimensiones > 0 y nodo con `aria-label` que contiene `Solar system`. En esta sesión **`waitedMs: 0`**.
4. **Consola:** `list_console_messages`.
5. **Red:** `list_network_requests` (`pageSize` 500) → **89** peticiones listadas.
6. **Métricas en página:** `evaluate_script` (`navigation`, recursos, suma `transferSize`, entradas `.glb`, `performance.memory`, `WEBGL_debug_renderer_info`).
7. **Traza Performance:** `performance_start_trace` con **recarga desactivada** y parada automática (página ya en estado inmersivo).

### Limitaciones

- Desarrollo Vite y caché del navegador: muchas respuestas **304** y `transferSize` pequeño en entradas GLB dentro de Resource Timing **no** reflejan un primer descarga en frío.
- La traza **sin recarga** no asocia **LCP** a una navegación nueva.

---

## Análisis — fuentes y componentes (código)

- **`HomeV2Shell.tsx`:** `LazySolarScene` importa `solar/SolarScene` con `React.lazy`; el archivo documenta el aislamiento del bundle WebGL frente al modo no inmersivo.
- **Red inmersiva (orden ilustrativo):** `SolarScene.tsx`, `@react-three/fiber`, `three`, `@react-three/drei`, `useGLTFV2.ts`, `PlanetMesh.tsx`, `planetRegistry.ts`, `solarImmersiveRelease.ts`, `gltfLoaderExtensions.ts`, `gltfPbrSpecularGlossinessPlugin.ts`, `three-stdlib`, `suspend-react`, `threeDisposal.ts`, y demás módulos bajo `src/v2/solar/`.
- **Draco (esta sesión):** peticiones **200** a orígenes **mismo sitio:** `http://localhost:5173/draco/draco_wasm_wrapper.js` y `http://localhost:5173/draco/draco_decoder.wasm` (compatibles con `connect-src 'self' blob:` en `index.v2.html`).
- **Componentes (instantánea a11y verbose):** región solar, **“Sun information”**, botón **“Switch to Classic mode”**.

---

## Hallazgos — Consola

- `[vite] connecting…` / `connected` (debug).
- Aviso de **React DevTools** (desarrollo).
- **`[PlanetMesh:debug]`** para **sun** y **earth**, cada uno **dos veces** (coherente con **Strict Mode** en desarrollo).

---

## Hallazgos — Red (modo inmersivo, lista MCP)

- **89 peticiones** en la captura.
- **GLB:** `sun.glb` y `earth.glb` con **304** (revalidación desde caché en esta sesión).
- **Draco:** `draco_wasm_wrapper.js` y `draco_decoder.wasm` con **200** bajo `/draco/`.
- **Textura:** `2k_stars_milky_way.jpg` con **304**.
- **Varias URL `blob:http://localhost:5173/...`** (incluye repeticiones del mismo UUID en el listado MCP).

---

## Hallazgos — Métricas observadas (Performance API, estado inmersivo)

| Medida | Valor observado |
|--------|------------------|
| `domContentLoaded` − `fetchStart` | ~**106,1 ms** |
| `loadEventEnd` − `fetchStart` | ~**107,3 ms** |
| Entradas `resource` | **78** |
| Suma aproximada `transferSize` | **709 077** bytes (~**692 KiB**) |
| `usedJSHeapSize` | **106 983 576** |
| `totalJSHeapSize` | **129 993 656** |
| `jsHeapSizeLimit` | **4 294 967 296** |

**Entradas `.glb` en Resource Timing (esta captura, con `transferSize` 300 cada una — típico de respuesta cacheada/revalidada):**

| Recurso | `duration` (ms) |
|---------|-------------------|
| `models/sun.glb` | ~**498** |
| `models/earth.glb` | ~**108,7** |

**WebGL (debug):** vendor **Google Inc. (AMD)**; renderer **ANGLE (AMD, AMD Radeon(TM) Graphics (0x0000164C) Direct3D11 vs_5_0 ps_5_0, D3D11)**.

---

## Hallazgos — Traza Performance (sin recarga)

- Conjunto: **`NO_NAVIGATION`**.
- **CLS:** **0.00**.
- No se reportaron **LCP** ni **INP** de una nueva navegación en ese intervalo.

---

## Resumen ejecutivo (hechos de esta sesión)

Modo inmersivo con escena activa: **89 peticiones** (incluye Draco **self-hosted** y GLB **304**), **~692 KiB** de suma `transferSize` en Resource Timing en esta medición (sesión con caché), **heap ~107–130 MB**, mensajes **`[PlanetMesh:debug]`** duplicados para sol/tierra, **CLS 0** en traza sin recarga, y **sin errores CSP** hacia `gstatic.com` en la consola capturada (Draco servido desde **`/draco/`**).
