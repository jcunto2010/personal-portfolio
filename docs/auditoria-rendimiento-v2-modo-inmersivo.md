# Auditoría de rendimiento — Portafolio V2 (modo inmersivo)

**Ámbito:** aplicación en `http://localhost:5173/index.v2.html` **después de activar el modo inmersivo** y con la escena solar operativa (región accesible “Solar system experience — scroll to explore”, canvas WebGL, panel “Sun information”).

**Fecha de medición:** 24 de marzo de 2026. **Entorno:** Vite en desarrollo, localhost, sin throttling de CPU ni red.

---

## Pruebas ejecutadas y metodología

1. **Servidor:** comprobación HTTP 200 con `Invoke-WebRequest` contra `index.v2.html`.
2. **Navegación y entrada inmersiva (Chrome DevTools MCP):** `navigate_page` → `take_snapshot` → `click` en el control “Activate immersive mode” (uid del árbol de accesibilidad).
3. **Sincronización con la escena:** `evaluate_script` en bucle (intervalo 200 ms, tope 90 s) hasta que existan un `<canvas>` con dimensiones > 0 y un nodo con `aria-label` que contiene `Solar system`. En esta sesión la condición se cumplió de inmediato tras el clic.
4. **Consola:** `list_console_messages` sobre la sesión actual (sin acumulado de navegaciones anteriores en esta captura).
5. **Red:** `list_network_requests` con `pageSize` 500 → **149** peticiones devueltas en la lista.
6. **Métricas en página:** `evaluate_script` leyendo `performance` (navegación, recursos, suma de `transferSize`, entradas `.glb`, `performance.memory`, y `WEBGL_debug_renderer_info` en el canvas).
7. **Traza Performance:** `performance_start_trace` con **recarga desactivada** y parada automática, ya en estado inmersivo.

### Limitaciones

- Desarrollo Vite: numerosas peticiones y hashes de dependencias distintos a producción.
- La suma de `transferSize` en Resource Timing **no incluye** necesariamente todas las URL `blob:` como entradas separadas con el mismo criterio que el panel Network; el conteo de recursos “tipo blob” en Performance API puede quedar en **0** aunque DevTools liste muchas peticiones `blob:`.
- La traza **sin recarga** no atribuye LCP a una navegación nueva.

---

## Análisis — fuentes y componentes (código)

- **`HomeV2Shell.tsx`:** el modo inmersivo monta `LazySolarScene` (`React.lazy` → `solar/SolarScene`) tras la fase de entrada; el comentario del archivo describe el contrato de aislamiento del bundle WebGL respecto al modo no inmersivo.
- **Carga inmersiva observada en red:** además de `SolarScene.tsx`, aparecen módulos de soporte como `useGLTFV2.ts`, `planetRegistry.ts`, `PlanetMesh.tsx`, `gltfLoaderExtensions.ts`, `gltfPbrSpecularGlossinessPlugin.ts`, `solarImmersiveRelease.ts`, `threeDisposal.ts`, y dependencias preempaquetadas (`three`, `@react-three/fiber`, `@react-three/drei`, `three-stdlib`, `suspend-react`, entre otras).
- **UI en accesibilidad (instantánea verbose):** región solar, panel complementario “Sun information”, botón “Switch to Classic mode”.

---

## Hallazgos — Consola

- Mensajes `[vite] connecting` / `connected` y aviso de React DevTools (desarrollo).
- Mensajes **`[PlanetMesh:debug]`** para mercurio, venus, luna, tierra, marte, neptuno y sol; en esta captura el listado MCP los clasifica como **`debug`**, no como error.
- **Duplicación** de líneas por cuerpo (p. ej. mercurio/venus/luna repetidos): coherente con **montaje doble en React 18 Strict Mode** en desarrollo.
- **No aparecieron** en esta sesión el aviso de `THREE.Clock` deprecado ni el de extensión GLTF `KHR_materials_pbrSpecularGlossiness` que figuraban en auditorías anteriores (puede depender de versión de dependencias o de rutas de carga).

---

## Hallazgos — Red (tras modo inmersivo)

- **149 peticiones** listadas.
- **GLB** bajo `/assets/solar/models/` (p. ej. `sun.glb`, `mercury.glb`, `venus.glb`, `earth.glb`, `moon.glb`, `mars.glb`, `neptune.glb`, `uranus.glb`); varias respuestas **304** en peticiones subsiguientes.
- **Segunda solicitud GET 200** a `sun.glb` en la misma sesión (reqid 115), además de una anterior (reqid 77), visible en el log de red.
- **Decenas de peticiones `blob:http://localhost:5173/...`** (objetos generados al procesar GLTF/GLB).
- **`8k_stars_milky_way.jpg`** (304 en esta lista).

---

## Hallazgos — Métricas observadas (Performance API, estado inmersivo)

| Medida | Valor observado |
|--------|------------------|
| `domContentLoaded` − `fetchStart` | ~**212,9 ms** |
| `loadEventEnd` − `fetchStart` | ~**216,1 ms** |
| Entradas `resource` | **92** |
| Suma aproximada `transferSize` | **113 277 902** bytes (~**108,1 MB**) |
| Heap JS `usedJSHeapSize` | **263 856 004** |
| Heap JS `totalJSHeapSize` | **281 409 260** |
| `jsHeapSizeLimit` | **4 294 967 296** |

**Entradas `.glb` en Resource Timing (muestra):** varias filas por archivo; `sun.glb` figura **dos veces** con `transferSize` **49 965 748** y duraciones ~**1741 ms** y ~**1857 ms**; otras filas muestran `transferSize` **300** (típico de respuesta cacheada/revalidada según el navegador). **Neptuno** alcanza ~**1342 ms** de duración en una entrada; **marte** ~**836 ms** en otra.

**WebGL (UNMASKED_VENDOR_WEBGL / RENDERER):** vendor **Google Inc. (AMD)**; renderer **ANGLE (AMD, AMD Radeon(TM) Graphics (0x0000164C) Direct3D11 vs_5_0 ps_5_0, D3D11)**.

---

## Hallazgos — Traza Performance (sin recarga)

- Conjunto de insights: **`NO_NAVIGATION`**.
- **CLS:** **0.00**.
- No se reportaron **LCP** ni **INP** de una nueva navegación en ese intervalo.

---

## Resumen ejecutivo (hechos de esta sesión)

Con la escena inmersiva activa, se midió **heap JS elevado (~264–281 MB en la captura)**, **suma grande de `transferSize` en recursos (~113 MB)** con **peso dominante de `sun.glb`** en las entradas GLB detalladas, **149 peticiones de red** incluyendo **muchos blobs** y **carga duplicada de `sun.glb` visible en el log**, **mensajes `[PlanetMesh:debug]` duplicados** en consola, y traza post-carga con **CLS 0** y sin métricas de navegación nueva.
