# Audit plan fixes

Documento de seguimiento de correcciones derivadas de las auditorías (rendimiento, markup, accesibilidad).

## EntryGate — botones anidados inválidos (`<button>` dentro de `<button>`)

**Problema:** En `src/v2/components/EntryGate/EntryGate.tsx`, el control de audio era un `<button>` hijo del `<button>` del modo inmersivo. Eso es HTML inválido, genera advertencias de React (riesgo de hidratación) y empeora la accesibilidad.

**Corrección aplicada:**

1. **Markup:** Se envolvió el bloque en un contenedor `div` con clase `introBtnImmersiveWrap`. El botón principal del modo inmersivo solo contiene el barrido decorativo y el texto. El botón del audio pasó a ser **hermano** del principal, no hijo.

2. **CSS (`EntryGate.module.css`):**
   - `introBtnImmersiveWrap`: `position: relative`, `width: 100%`.
   - `introAudioToggle`: `position: absolute`, `top: 50%`, `right: 2.5rem`, `z-index: 2`, `transform: translateY(-50%)` para mantener la posición visual del icono respecto al pill.
   - `introBtnImmersive`: `width: 100%` y `padding-right: 6.25rem` para reservar espacio al texto y evitar solapamiento con el control de audio.
   - Los estados hover/active del pill y el barrido animado usan `.introBtnImmersiveWrap:hover` / `:active` para que el aspecto al pasar el ratón por el icono de volumen coincida con el comportamiento anterior (cuando el audio estaba dentro del botón grande).

3. **Accesibilidad:** Ambos controles siguen siendo `<button>` nativos (focusables). Se añadió `aria-label` al modo inmersivo (`immersiveBtnAria`: «Activar modo inmersivo» / «Activate immersive mode»). Los `aria-label` del audio se unificaron al patrón corto: silenciar / activar sonido (ES) y mute / unmute (EN), según el estado.

4. **Lógica:** Sin cambios en estado ni en los manejadores de `onClick` (incluido `stopPropagation` en el audio).

**Verificación recomendada:** Tras desplegar o en desarrollo, abrir la consola del navegador en la pantalla de entrada V2 y comprobar que no reaparecen advertencias por anidación de botones ni mensajes de hidratación asociados a este markup.

---

## LCP / render delay — pantalla de entrada (modo clásico, H1 intro)

**Contexto:** El LCP en la pantalla de entrada estaba dominado por *render delay* del H1 (`.introH1`), no por TTFB. La cadena de imports hacía que el JS del modo clásico (incl. Three.js en el about) formara parte del grafo del shell y retrasara el primer paint del H1.

**Correcciones aplicadas:**

1. **`HomeV2Shell` (`src/v2/pages/HomeV2/HomeV2Shell.tsx`):** Sustitución del import estático de `HomeV2` por `React.lazy(() => import('./HomeV2'))` + `Suspense` con fallback mínimo (viewport `#070B1A`). El chunk editorial y dependencias pesadas se cargan solo tras `entryPhase === 'ready'` en modo no inmersivo, no en la ruta crítica del `EntryGate`.

2. **`ClassicAbout` (`src/v2/components/ClassicAbout/ClassicAbout.tsx`):** `ClassicAboutShaderBackground` (Three.js + shaders) pasa a carga diferida con `lazy` + `Suspense`; fallback = `div` con `shaderLayer` para conservar capa sin bloquear el árbol del about.

3. **`EntryGate` (`src/v2/components/EntryGate/EntryGate.tsx`):** El H1 deja de animar `opacity: 0 → 1` (retrasaba visibilidad para LCP). Con animación activa: `opacity: 1` desde el inicio y solo transición leve `y` (8px → 0). Respeta `skipAnimations` y `prefers-reduced-motion`.

4. **Fuentes:** En V2 no hay `@font-face` activo ni fuentes remotas en `index.v2.html` (`font-src 'self'`); la pila tipográfica cae en fuentes del sistema sin FOIT adicional. Sin cambios de CSS obligatorios hasta autoalojar fuentes (entonces usar `font-display: swap`).

**Resultado esperado / verificado:**

| Ámbito | Resultado |
|--------|-----------|
| Bundles (build `vite`) | `HomeV2Shell` y `HomeV2` en **chunks separados**; `ClassicAboutShaderBackground` en chunk propio (p. ej. `ClassicAboutShaderBackground-*.js` ~3–4 kB gzip además del módulo `three`). El H1 de intro **no depende** de parsear/ejecutar ese código en la primera carga del shell. |
| Comportamiento | Misma UX final: modo clásico tras entrar; about con shader cuando el chunk resuelve; animación del H1 perceptiblemente equivalente (visible al inicio, micro-movimiento vertical opcional). |
| Medición LCP | Recomendado repetir en Lighthouse/PageSpeed sobre la URL V2 en frío: el elemento LCP (texto del H1) debería registrar **menos render delay** al desacoplar JS pesado del primer paint. Valores numéricos dependen del entorno (no fijados en CI). |

**Nota:** Los e2e que esperan `#chapter-intro` pueden fallar si ese `id` no existe en el DOM del modo clásico actual (`classic-*`); es independiente de estos fixes.

---

## Vite — chunks (`three-bundle`, `motion`, `vendor`) y carga inicial sin Three.js

**Objetivo:** Que el JS inicial de V2 (`index.v2.html` → `main.v2.tsx` → `AppV2` → `LazyHomeV2` → `HomeV2Shell` → `EntryGate`) **no** descargue ni ejecute el paquete `three` antes del primer render del overlay; que Three.js, R3F, Drei y Framer Motion vivan en chunks nombrados y que el motor 3D cargue en paralelo **después** de la ruta lazy (SolarScene, shader del about, etc.).

**Cambios en `vite.config.ts`:**

1. **`build.rollupOptions.output.manualChunks`** (`vendorManualChunks`):
   - `three`, `@react-three/fiber`, `@react-three/drei` y dependencias satélite que importan `three` (`three-stdlib`, `three-mesh-bvh`, `maath`, `meshline`, `troika-three-text`, `troika-three-utils`, `@monogrid/gainmap-js`) → chunk **`three-bundle`**.
   - `framer-motion` → chunk **`motion`**.
   - El módulo virtual de Vite **`\0vite/preload-helper.js`** (helper `__vitePreload` de imports dinámicos) → chunk **`vendor`**. Sin esto, Rollup suele fusionar ese helper con `@react-three/drei` dentro de `three-bundle`, y el chunk de entrada termina **importando** `three-bundle` y el HTML añade `<link rel="modulepreload" href=".../three-bundle-....js">`, descargando Three.js en frío.
   - Resto de `node_modules` → **`vendor`** (un solo chunk compartido) para mantener React/router junto al helper y evitar que el grafo de entrada vuelva a enlazar `three-bundle`.

2. **Análisis de bundle:** `rollup-plugin-visualizer` (devDependency). Con variable de entorno `ANALYZE=true` y `npm run build`, se genera `dist/stats.html` (treemap, tamaños gzip). Vite no expone `vite build --report` en la CLI actual; el visualizer sustituye esa comprobación.

**Imports dinámicos (sin cambiar lógica de producto):** Ya estaban alineados con el objetivo; no se ha modificado comportamiento, solo se confirma la cadena:

- `src/v2/router/routes.tsx`: `LazyHomeV2` = `lazy(() => import('../pages/HomeV2/HomeV2Shell'))`.
- `HomeV2Shell`: `LazySolarScene` = `lazy(() => import('../../solar/SolarScene').then(...))`.
- `ClassicAbout`: `LazyClassicAboutShaderBackground` con `React.lazy` + `Suspense`.
- `useJourneyLoader`: `await import('../solar/SolarScene')` para precarga opcional del modo inmersivo.

**Verificación realizada (build de producción):**

| Comprobación | Resultado |
|--------------|-----------|
| `dist/index.v2.html` — `modulepreload` | Solo `v2-*.js`, `modulepreload-polyfill`, `vendor-*.js` y CSS. **No** aparece `three-bundle-*.js`. |
| Chunk `v2-*.js` | Imports estáticos: `vendor` (+ polyfill). **No** hay `import ... from "./three-bundle-..."`. `three-bundle` solo figura en el array interno de `__vite__mapDeps` para la ruta lazy `smoke-test` (SmokeTestGLB). |
| Chunks nombrados | `three-bundle-*.js` (~294 KB gzip), `motion-*.js` (~40 KB gzip), `vendor-*.js` (resto de dependencias). |
| `npm run bundle:check` (T-005 ≤ 300 KB gzip inicial) | **Fallo:** el chunk `vendor` unificado suma ~2 MB gzip con los preloads del HTML; el presupuesto T-005 asume un `vendor` mucho menor. La exclusión de Three del grafo inicial se cumple; ajustar el script de presupuesto o el reparto de `vendor` es seguimiento aparte. |

**Comando de análisis:** en PowerShell, desde la raíz del repo: `$env:ANALYZE='true'; npm run build` → abrir `dist/stats.html` en el navegador.

---

## Three.js — consola en modo inmersivo (Clock deprecado + extensión GLTF archivada)

**Problema:** En modo inmersivo V2 la consola mostraba:

1. `THREE.Clock` deprecado (Three.js r183 recomienda `THREE.Timer`).
2. `THREE.GLTFLoader: Unknown extension "KHR_materials_pbrSpecularGlossiness"`.

**Causa raíz (1):** No había `new THREE.Clock()` en el código del repo; `@react-three/fiber` instanciaba `new THREE.Clock()` en el estado interno del canvas (`events-*.esm.js`), lo que disparaba el aviso en cada carga.

**Corrección (1) — Timer vía `patch-package`:**

- Parche en `patches/@react-three+fiber+9.5.0.patch`: se añade `createR3FTimeKeeper()` que usa `new THREE.Timer()`, expone `_timer`, y mantiene la superficie que R3F ya esperaba en `state.clock` (`elapsedTime`, `start` / `stop`, `getElapsedTime`, etc.).
- La función interna `update(timestamp, state, frame)` pasa a llamar `state.clock._timer.update(timestamp)` y `getDelta()` / `getElapsed()` en el modo `frameloop === 'always'`; el ramal `frameloop === 'never'` se deja igual (timestamps manuales).
- Tras `npm install`, `postinstall` aplica el parche automáticamente.

**Causa raíz (2):** La extensión `KHR_materials_pbrSpecularGlossiness` está archivada y ya no forma parte del `GLTFLoader` de `three-stdlib`; si un GLB la declara en `extensionsRequired`, el loader advierte si no hay plugin registrado con ese nombre.

**Corrección (2) — registro de plugin en la carga GLB V2:**

- `src/v2/solar/gltfPbrSpecularGlossinessPlugin.ts`: `loader.register(() => ({ name: 'KHR_materials_pbrSpecularGlossiness' }))` (plugin mínimo reconocido por el loader).
- `src/v2/solar/gltfLoaderExtensions.ts` y `src/v2/solar/useGLTFV2.ts`: envuelven `useGLTF` de Drei con `extendGltfLoaderWithV2Extensions` (mismos defaults que antes: Draco + Meshopt activos).
- Sustitución de `useGLTF` por `useGLTFV2` en `PlanetMesh.tsx`, `SolarScene.tsx` (incl. `preload`) y `SmokeTestGLB.tsx`.

**Nota de materiales:** El plugin solo evita la advertencia y el fallo por extensión requerida; el sombreado spec/gloss completo se eliminó del núcleo de Three. Para fidelidad máxima, conviene re-exportar los GLB en metal/rough desde Blender (u otra herramienta) sin esa extensión archivada.

**Resultado esperado / verificación:**

| Comprobación | Resultado |
|--------------|-----------|
| `npm run build` | **OK** (TypeScript + Vite). |
| Consola en modo inmersivo | Recomendado comprobar en local (`npm run dev` → modo inmersivo): no deberían aparecer el aviso de `THREE.Clock` ni el de extensión GLTF desconocida para los GLB actuales. |
| Animación / `useFrame` | Sin cambios de API en componentes: el delta sigue siendo el segundo argumento del callback; `state.clock.elapsedTime` y `clock.getElapsedTime()` siguen siendo coherentes con el bucle actualizado. |

---

## Vite dev server — `Content-Type` HTML con `charset=utf-8`

**Problema:** La auditoria de rendimiento detecto que el servidor de desarrollo de Vite servia respuestas HTML sin el parametro `charset` en la cabecera `Content-Type`, provocando warning en comprobaciones automatizadas.

**Correccion aplicada:**

1. **`vite.config.ts` (desarrollo):**
   - Se añadio un plugin liviano `add-charset-header` en `plugins`.
   - En `configureServer`, se inyecta middleware para respuestas de HTML (`req.url?.endsWith('.html')` o `req.url === '/'`) y se fuerza:
     - `Content-Type: text/html; charset=utf-8`
   - No cambia la logica funcional de la app; solo normaliza la cabecera HTTP en entorno dev.

2. **Produccion (documentado para servidor/CDN):**
   - Debe garantizarse el mismo encabezado para HTML en el edge/hosting:
     - `Content-Type: text/html; charset=utf-8`
   - Referencias de configuracion:
     - **Netlify (`netlify.toml`)**
       - `[[headers]]`
       - `for = "/*.html"`
       - `[headers.values]`
       - `Content-Type = "text/html; charset=utf-8"`
     - **Vercel (`vercel.json`)**
       - `"headers": [{ "source": "/(.*).html", "headers": [{ "key": "Content-Type", "value": "text/html; charset=utf-8" }] }]`
   - Si se usa otro servidor (p. ej. Nginx/CDN propio), aplicar regla equivalente en configuracion de cabeceras.

**Resultado esperado / verificacion:**

| Comprobacion | Resultado esperado |
|--------------|--------------------|
| Cabeceras HTTP en dev (`/` y `*.html`) | `Content-Type: text/html; charset=utf-8`. |
| Despliegue en produccion | HTML servido con `charset=utf-8` por configuracion de hosting/CDN. |
| Auditorias automatizadas | Sin warning relacionado con ausencia de `charset` en `Content-Type` para HTML. |

---

## Modo inmersivo V2 — heap JS y ciclo de vida WebGL (Three.js / R3F)

**Problema:** En modo inmersivo el heap rondaba ~238 MB frente a ~30 MB en modo clásico. En Resource Timing aparecían muchas URLs `blob:` coherentes con texturas embebidas en GLB (GLTFLoader usa `URL.createObjectURL` para vistas de buffer) y con recursos GPU no liberados al salir del modo inmersivo.

**Causa raíz principal:** En `@react-three/fiber`, los nodos `<primitive object={…} />` **no se disponen al desmontar** (el comentario en el reconciliador indica que el estado puede vivir fuera de React). Los modelos cargados con `useGLTF` / `useGLTFV2` siguen en la caché global de `useLoader` + `suspend-react` hasta llamar a `useGLTF.clear(path)`. Sin `dispose()` explícito de geometrías, materiales y texturas, la memoria GPU y los `blob:` asociados no vuelven al sistema al volver al modo clásico.

**Correcciones aplicadas:**

1. **`threeDisposal.ts`:** Utilidades `disposeTexture()` (incluye `URL.revokeObjectURL` cuando `image.src` es `blob:`) y `disposeObject3DDeep()` (recorre mallas/líneas/puntos, materiales estándar y `ShaderMaterial` con `uniforms` que contengan texturas).

2. **`solarImmersiveRelease.ts`:** `releaseSolarImmersiveAssets()`:
   - Para cada URL en `SOLAR_GLB_MODEL_URLS` (derivado de `planetRegistry`): `peek([GLTFLoader, path])` (misma clave que `useLoader`), `disposeObject3DDeep(gltf.scene)` y `useGLTFV2.clear(path)`.
   - Texturas de cielo y Urano: `peek` con `TextureLoader` y las mismas claves que `useTexture` (una URL para la vía láctea; array de tres URLs para Urano), `disposeTexture`, luego `useTexture.clear(...)`.
   - Constantes exportadas `NEBULA_STARS_TEXTURE_URL` y `URANUS_DETAIL_TEXTURE_URLS` como única fuente de verdad con `SolarScene`.

3. **`planetRegistry.ts`:** `SOLAR_GLB_MODEL_URLS` — lista única deduplicada de `modelPath` no vacíos (p. ej. `sun.glb` … `uranus.glb`).

4. **`SolarScene.tsx`:**
   - `useEffect(() => () => { releaseSolarImmersiveAssets() }, [])` al desmontar el shell del modo inmersivo (después de que el `<Canvas>` haya desmontado el árbol R3F; la caché de loaders sigue poblada hasta este paso).
   - `StarField`: textura de puntos circulares (`CanvasTexture`) creada con `useMemo` y `dispose()` en el cleanup del efecto (antes era módulo global y nunca se liberaba).

5. **`BlackholeShaderMesh.tsx`:** Sin cambios de cleanup adicionales: `<shaderMaterial>` bajo `<mesh>` no es `<primitive>`; R3F dispone geometría y material al desmontar el mesh.

**Notas de comportamiento:**

- Geometrías y materiales declarativos en JSX (`<sphereGeometry>`, `<meshStandardMaterial>`, `<shaderMaterial>`, etc.) siguen confiando en el reconciliador de R3F para `dispose` al desmontar; el foco extra está en **primitivas GLTF** (`<primitive object={scene} />`), **caché de loaders** y **blob URLs**.
- React 18 Strict Mode en desarrollo monta/desmonta efectos dos veces: el cleanup de texturas y `releaseSolarImmersiveAssets` evita duplicar referencias vivas entre ciclos.

**Resultado esperado / verificación manual:**

| Comprobación | Resultado esperado |
|--------------|-------------------|
| Chrome DevTools → Memory → Heap snapshot | Tras salir del modo inmersivo al clásico, el heap debería acercarse al orden del modo clásico (no cifras fijas: depende de máquina y GC). |
| Resource Timing / pestaña Network (blob) | Menos entradas `blob:` activas tras abandonar el inmersivo y tras varios ciclos clásico ↔ inmersivo. |
| Navegación repetida | Sin crecimiento lineal de memoria solo por alternar modos (si el GC corre, la tendencia debería estabilizarse). |

**Archivos tocados:** `src/v2/solar/threeDisposal.ts` (nuevo), `src/v2/solar/solarImmersiveRelease.ts` (nuevo), `src/v2/solar/planetRegistry.ts`, `src/v2/solar/SolarScene.tsx`. Dependencia explícita: `suspend-react` (misma clave de caché que `useLoader` / `peek`).

---

## Modo inmersivo V2 — logs `[PlanetMesh:debug]` en consola

**Problema:** En modo inmersivo V2 aparecían mensajes de depuración por planeta con prefijo `[PlanetMesh:debug]` y nivel de error en consola (`console.error`), lo que generaba ruido y falsa señal de fallo.

**Causa raíz:** En `src/v2/solar/PlanetMesh.tsx`, dentro del `useEffect` de carga del GLB, el mensaje de depuración se emitía con `console.error(...)`.

**Corrección aplicada:**

1. **Nivel de log corregido:** `console.error(...)` -> `console.debug(...)` para que el mensaje refleje su naturaleza de depuración y no aparezca como error.
2. **Guardia de entorno explícita:** Se mantiene y explicita el condicional de desarrollo con `const isDev = import.meta.env.DEV` y `if (isDev) { ... }`.
3. **Alcance del cambio:** El fix se aplica al bloque que imprime `[PlanetMesh:debug]` durante la carga de cada GLB planetario (`planetId`, `radiusApprox`, `normScale`, `size`, `artisticScale`).

**Notas sobre duplicados (React 18 Strict Mode):**

- En desarrollo, React 18 Strict Mode puede ejecutar efectos dos veces (mount -> cleanup -> mount), por lo que logs de `useEffect` pueden verse duplicados. Es comportamiento esperado de dev.
- En producción no hay doble ejecución de Strict Mode y, además, el guard `import.meta.env.DEV` evita por completo estos logs.

**Resultado esperado / verificación:**

| Comprobación | Resultado |
|--------------|-----------|
| `npm run dev` (modo inmersivo) | Los mensajes `[PlanetMesh:debug]` se mantienen disponibles para depuración y aparecen con nivel **debug** (no error). |
| Consola de producción (`npm run build` + preview/deploy) | **0 logs** `[PlanetMesh:debug]` en consola. |
| Severidad de consola | Sin entradas de error atribuibles a este logger de planetas. |

**Archivo tocado:** `src/v2/solar/PlanetMesh.tsx`.

---

*Última actualización: EntryGate (markup) + LCP / render delay + Vite manualChunks + cabecera HTML `charset=utf-8` (dev/prod) + Three.js (Timer / GLTF KHR pbrSpecularGlossiness) + parche R3F + ciclo de vida WebGL modo inmersivo (dispose + clear loaders + blob) + logs `[PlanetMesh:debug]` (solo DEV, nivel debug).*
