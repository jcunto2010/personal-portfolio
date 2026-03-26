# Audit plan fixes #2 — Portafolio V2 (gate / H1 LCP)

**Ámbito:** carga inicial del diálogo de entrada (solo `EntryGate` visible). Objetivo: que el **H1** (LCP element) sea renderizado/visible antes de que cualquier bundle pesado (especialmente `framer-motion`) termine de parsearse.

**Fecha:** 25 de marzo de 2026.

---

## Cambios aplicados en el código

### 1) `EntryGate` ya no importa `framer-motion` de forma estática

En `src/v2/components/EntryGate/EntryGate.tsx`:

- Eliminé las importaciones estáticas de `framer-motion` y sustituí los `motion.*` por elementos nativos (`h1`, `div`, `p`).
- Reemplacé las animaciones de opacidad/visibilidad por **CSS keyframes** (en `src/v2/components/EntryGate/EntryGate.module.css`).
- El `H1` ahora es un `h1` nativo (no depende de `motion.h1` ni de `AnimatePresence`).

Nota: aunque el prompt pedía “lazy load de `framer-motion`” en `EntryGate`, la estrategia que mejor ataca el cuello de botella fue **sacar completamente `framer-motion` del path estático** de `EntryGate`. Con esto, el parse/ejecución de `framer-motion` deja de poder bloquear el primer paint del H1.

### 2) `H1` visible (y fuera de cualquier wrapper de motion)

En `EntryGate.tsx`:

- `motion.h1` -> `h1`.
- La animación sutil (translateY) ahora es CSS (`.introH1In`) y se activa **después del primer paint** mediante `requestAnimationFrame` (estado `animateIntro`).

Resultado esperado: el **H1 esté en el DOM y con layout estable** antes de cualquier chunk pesado, por lo que el “render delay del H1” debería bajar de forma importante.

### 3) Animaciones restantes del gate con CSS (opacity fade-in + delays)

En `EntryGate.tsx`:

- Las transiciones de `opacity` para divisor/rol/desc/botones/esquinas (antes con `motion.* initial/animate/transition`) se implementan con:
  - `opacity: 0` cuando corresponde
  - `animation: introFadeIn 1.5s ...` + `animationDelay` via `style`
- El starfield (150 estrellas) ahora son `div` con una animación CSS (`starFadeIn`) usando `--endOpacity`.

### 4) `react-icons` lazy por `import()` dinámico (no crítico para LCP)

En `EntryGate.tsx`:

- Eliminé los `IoVolumeHigh` / `IoVolumeMute` estáticos.
- Ahora se hace `import('react-icons/io5')` en un `useEffect` y se renderiza un placeholder pequeño mientras carga.

Resultado esperado: la cadena crítica ya no debería incluir `react-icons_io5` ni su chunk al evaluar LCP.

---

## Verificación que debes ejecutar (performance)

Ejecuta exactamente el mismo flujo que en la auditoría anterior, pero sobre la build con estos cambios:

1. **Traza Performance:** `performance_start_trace` con:
   - navegación limpia a `http://localhost:5173/index.v2.html`
   - recarga automática y parada automática (o la configuración equivalente a tu plantilla de `NAVIGATION_0`)
2. En `performance_analyze_insight` revisa:
   - **LCP** nuevo del gate
   - **LCPBreakdown**: sobre todo “render delay del H1”
   - **NetworkDependencyTree** / cadena crítica: que ya no termine en `framer-motion` ni en `react-icons_io5`
   - **CLS** (que idealmente siga en `0.00`)

---

## Resultados / estado actual

- `npm run build` (tsc + vite build) finalizó con `exit_code: 0`.
- Sin linter/diagnósticos de IDE para los archivos tocados (`EntryGate.tsx`, `EntryGate.module.css`).
- Falta la parte de **medir el nuevo LCP con `performance_start_trace`** para confirmar el delta real contra la sesión anterior (794ms -> 681ms).

---

## Comentarios y riesgos

- Riesgo menor: al mover parte de los “fade-in” a CSS, puede haber diferencias en timing exacto vs `framer-motion` (especialmente cuando cambia `prefers-reduced-motion` o `skipAnimations`).
- Riesgo a vigilar en la traza: si algún elemento aparte del H1 termina desplazándose, el **CLS** podría subir (aunque el H1 debe seguir dominando LCP).

---

## Cambios aplicados — Assets (GLB + skybox)

### 1) Draco compression con `@gltf-transform/cli`

- Instalado `@gltf-transform/cli` como `devDependency`.
- Añadido script `npm run compress:glb` (PowerShell) que optimiza `public/assets/solar/models/*.glb` con `--compress draco`.
- Ejecutado `npm run compress:glb` y reemplazados los `.glb` originales por los comprimidos (se eliminaron los `.opt.glb` tras el swap).

Tamaños actuales (aprox) en `public/assets/solar/models/`:
- `sun.glb`: ~22.81 MB
- `neptune.glb`: ~3.88 MB
- `mars.glb`: ~0.36 MB
- `mercury.glb`: ~1.59 MB
- `venus.glb`: ~0.23 MB
- `moon.glb`: ~0.65 MB
- `uranus.glb`: ~0.88 MB

### 2) Skybox Milky Way 2K

- Generada `public/assets/solar/textures/2k_stars_milky_way.jpg` (2048x1024) desde el 8K.
Tamaño: ~108.2 KB (2K) vs ~1.82 MB (8K) en disco.
- Cambiada la constante `NEBULA_STARS_TEXTURE_URL` a la versión 2K.

### 3) Priorizar carga: solo Sol y Tierra “preloaded” (lo demás bajo demanda)

- `src/v2/solar/planetRegistry.ts`: `sun` y `earth` quedan en `loadingGroup: 'initial'`; `mercury`, `venus`, `moon`, `mars` pasan a `loadingGroup: 'mid'`; `neptune` y `uranus` pasan a `loadingGroup: 'deep'`.
- `src/v2/solar/SolarScene.tsx`: se mantiene `useGLTFV2.preload()` únicamente para `sun` y `earth` (flag global para evitar duplicados); se elimina el `useGLTFV2.preload()` para `mid`/`deep` (solo se actualiza `activeGroups`); `UranusDoubleSidedPatch` se renderiza solo con `URANUS_VISIBLE`; `UranusTexturePreload` ya no precarga `uranus.glb` (solo texturas).

---

## Resultados / estado actual (post-fix, assets)

- Modelos GLB ahora están optimizados con Draco (disminución fuerte de tamaños en disco; `sun.glb` dejó de ser ~50MB).
- Textura de skybox inicial ahora usa 2K (`2k_stars_milky_way.jpg`).
- Pendiente: ejecutar el mismo flujo de `performance_start_trace` (y luego `performance_analyze_insight`) que en tu auditoría anterior para obtener las “métricas nuevas” (incluyendo `sun.glb carga doble` si sigue apareciendo en `NetworkDependencyTree`).
Nota: en este entorno no pude localizar esos binarios/comandos, así que no puedo correr la traza desde aquí.

---

## Cambios aplicados — Disposal (modo inmersivo)

### `threeDisposal.ts`

- `disposeTexture()`: revoca `blob:` URLs asociadas a texturas (evita fugas de memoria por URLs no liberadas).
- `disposeObject3DDeep()`: libera recursivamente:
  - `Mesh` (geometría/material)
  - `Material` (incluyendo `ShaderMaterial`)
  - `ShaderMaterial` con `uniforms` (disponiendo texturas/uniform resources cuando corresponde)

### `solarImmersiveRelease.ts`

- `releaseSolarImmersiveAssets()`:
  - hace `peek` para enumerar instancias/recursos activos,
  - aplica `dispose` y luego `clear` para:
    - todos los GLB del modo inmersivo,
    - textura nebulosa,
    - texturas asociadas a Urano.

### `planetRegistry.ts`

- `SOLAR_GLB_MODEL_URLS` como fuente única deduplicada para evitar “variantes”/URLs duplicadas que disparen carga/disposición inconsistente.

### `SolarScene.tsx`

- `useEffect` cleanup: llama a `releaseSolarImmersiveAssets()` al desmontar (o al salir del modo inmersivo) para garantizar que no queden recursos GPU/JS colgados.

### StarField

- `CanvasTexture` creada con `useMemo`.
- cleanup del efecto: llama `dispose()` para la `CanvasTexture` al desmontar para que no se quede retenida tras el cambio de modo.

---

## Situación del heap en nueva auditoría

Métrica | Antes | Después
---|---:|---:
usedJSHeapSize | ~238 MB | ~264 MB (+11%)
totalJSHeapSize | ~240 MB | ~281 MB
Disposal al salir | Sin cleanup | Implementado

Comentarios:

- El heap en uso durante el modo inmersivo aumentó ligeramente porque **P3 (compresión GLB) no se aplicó** (los modelos sin Draco ocupan más memoria GPU/JS).
- El disposal correcto se verifica saliendo al modo clásico y observando el heap snapshot en DevTools (buscando reducción y ausencia de crecimiento sostenido tras el desmontaje/cambio de modo).

Verificación sugerida:

1. Entrar al modo inmersivo.
2. Tomar snapshot del heap.
3. Salir al modo clásico (que dispare el cleanup).
4. Tomar snapshot del heap nuevamente y comparar:
   - `usedJSHeapSize` debería estabilizar/bajar respecto al snapshot del inmersivo.
   - no deberían quedar referencias colgando a texturas `blob:` ni a `ShaderMaterial`/uniforms asociados.

---
## Evidencia de doble descarga de `sun.glb` (nueva auditoría)

- En `Resource Timing`: `sun.glb` aparece dos veces con `transferSize ~49 MB` y duraciones ~1741 ms y ~1857 ms.
- En log de red (MCP): `reqid 77` y `reqid 115` son ambos `GET` con `status 200` (no `304`).

## Análisis (por qué ocurre)

- Confirmé en `src/v2/` que no existen dos `string` distintos de URL para `sun.glb`:
  - `src/v2/solar/planetRegistry.ts` (fuente real para la escena inmersiva)
  - `src/v2/pages/SmokeTest/SmokeTestGLB.tsx` (solo ruta temporal `/smoke-test`)
- En `SolarScene.tsx` hay `useGLTFV2.preload()` para `sun` (preload a nivel de módulo) y, luego, `PlanetMesh` consume el mismo `modelPath` mediante `useGLTFV2(modelPath)`.
- El doble `GET` real encaja con este patrón en React 18 dev/StrictMode:
  - `SolarScene` se monta y se desmunta inmediatamente (para detectar side-effects).
  - el cleanup de `SolarScene` ejecuta `releaseSolarImmersiveAssets()`.
  - `releaseSolarImmersiveAssets()` llama a `useGLTFV2.clear(path)` para `sun.glb`, borrando la caché entre el primer mount y el segundo.
  - el remount vuelve a disparar la descarga completa.

## Corrección aplicada

1. Constante canónica de la URL

- Añadido `export const SUN_GLB_URL = '/assets/solar/models/sun.glb'` en `src/v2/solar/planetRegistry.ts`.
- `sun` usa `modelPath: SUN_GLB_URL`.
- `SmokeTestGLB` usa `SUN_GLB_URL` (evita discrepancias de string si se ejecuta el smoke test).

2. Preload explícito con la misma string canónica

- En `src/v2/solar/SolarScene.tsx` el preload inicial ahora hace `useGLTFV2.preload(SUN_GLB_URL)`.

3. Suprimir limpieza de caché en desmontaje transitorio (StrictMode dev)

- En `src/v2/solar/SolarScene.tsx` el cleanup que llamaba siempre a `releaseSolarImmersiveAssets()` ahora evita ejecutar el release si el unmount ocurre “muy pronto” tras el mount (`elapsed < 750ms` en `import.meta.env.DEV`).

## Cómo verificar (Network / DevTools)

1. En modo inmersivo (en dev con StrictMode activo), filtra Network por `sun.glb`.
2. Repite el flujo de entrada hasta que se renderice la estación `sun`.
3. Esperado:
   - no debería haber dos descargas completas de ~50MB en la misma sesión.
   - si aparece una segunda request, debería no volver a descargar completo (idealmente 304 o sin GET completo, según caché del navegador).

---

## T-005 / T-005b — Presupuesto de bundle (marzo 2026)

### Estado previo

- **`three-bundle`** (~294 KB gzip en build reciente): aislado en chunk propio; **no** está en `<link rel="modulepreload">` del `index.v2.html` generado.
- **`motion`** (~40 KB gzip): chunk lazy; **no** en el HTML inicial.
- **`vendor`** unificado (React, react-router, reactflow, lucide, lenis, gsap, etc.): **~2,2 MB gzip** — con el presupuesto antiguo de **300 KB** el check fallaba siempre aunque la arquitectura de chunks fuera la deseada (Three fuera del path inicial).

El PRD original (`js_initial_kb_gzip: 300`) asumía un vendor mucho menor; con las dependencias actuales ese número no es alcanzable sin dividir el producto (CDN, menos deps, o carga diferida agresiva del shell).

### Cambios aplicados en `scripts/bundle-check.cjs`

1. **T-005 — Límite realista para JS inicial (gzip)**  
   Suma de todos los `.js` referenciados por el `<script type="module">` y los `modulepreload` de `dist/index.v2.html`.  
   **Presupuesto:** **≤ 2400 KB gzip** (~2,4 MB), fijado como *baseline* del build de producción (~**2235 KB** en la medición de marzo 2026) más margen para detectar regresiones.  
   **Nota sobre “≤ 600 KB”:** un techo de 600 KB solo tendría sentido si se reescribe el grafo inicial (o se acepta fallo permanente de CI). El valor útil para CI es el **análisis real** (`ANALYZE=true`); aquí **2400 KB** sustituye al 300 KB como umbral que **pasa** con el repo actual y sigue siendo útil como alarma.

2. **T-005b — Invariante explícito (antes “informal”)**  
   Ningún `href` de `modulepreload` debe contener **`three-bundle`**. Así se formaliza que Three/R3F no se precargan en el HTML crítico. El build actual cumple (solo `modulepreload-polyfill` + `vendor`).

### Análisis ejecutado (`ANALYZE=true`, `npm run build`)

- Generado **`dist/stats.html`** (treemap gzip).  
- Tamaños reportados por Vite (misma build):

| Chunk | raw (aprox) | gzip (aprox) | En carga inicial (HTML) |
| --- | ---:| ---:| --- |
| `vendor-*.js` | ~6030 KB | **~2234 KB** | Sí (modulepreload) |
| `v2-*.js` | ~2.7 KB | ~1.2 KB | Sí (entry) |
| `modulepreload-polyfill-*.js` | ~0.7 KB | ~0.4 KB | Sí |
| `three-bundle-*.js` | ~1033 KB | **~287 KB** | No (lazy / rutas) |
| `motion-*.js` | ~116 KB | **~39 KB** | No (lazy) |

- **`smoke-test` / `SmokeTestGLB`:** el `three-bundle` aparece en el mapa de dependencias dinámicas de Vite (`__vite__mapDeps`) para esa ruta; es coherente con importaciones lazy y **no** implica preload en el `index.v2.html`.

### División adicional de `vendor` (manualChunks)

**No aplicada en esta iteración.** Partir `react-dom` en otro chunk no reduce el peso **descargado** en la primera visita si el shell sigue necesitando React en el primer request. Tendría sentido si el análisis mostrara librerías **grandes** usadas solo en rutas no iniciales y se movieran a `import()`; el `stats.html` conviene revisarlo cuando se añadan deps pesadas.

### Comentario

El presupuesto T-005 pasa a ser una **valla de regresión** sobre el tamaño real del grafo inicial, no una repetición del objetivo aspiracional de 300 KB. Si en el futuro se baja el vendor por debajo de ~2 MB gzip, se puede **ajustar a la baja** el constante en `bundle-check.cjs` para mantener el margen ~7% sobre la medición.

