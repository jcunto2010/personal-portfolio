# Auditoría de rendimiento — Portafolio V2 (modo clásico / pantalla de entrada)

**Ámbito:** primera pintura con el **diálogo de entrada** visible (H1 de intro, “Portfolio entry”), **sin** haber entrado al modo inmersivo en esa carga: `navigate_page` completo a `http://localhost:5173/index.v2.html` y capturas tomadas **antes** de cualquier clic en modo clásico o inmersivo.

**Fecha de medición:** 24 de marzo de 2026. **Entorno:** Vite en desarrollo, localhost, sin throttling de CPU ni red.

---

## Pruebas ejecutadas y metodología

1. **Servidor:** comprobación HTTP 200 con `Invoke-WebRequest` contra `index.v2.html`.
2. **Navegación limpia:** `navigate_page` a la URL (recarga completa del documento; el estado React de fase de entrada vuelve a `select`).
3. **Comprobación visual lógica:** `take_snapshot` — diálogo “Portfolio entry”, heading nivel 1 “Hi, my name is Jonathan Cunto Diaz”, botones “Activate immersive mode”, “Unmute sound”, “Classic mode…”.
4. **Consola:** `list_console_messages` desde esa navegación.
5. **Red:** `list_network_requests` con `pageSize` 300 → **35** peticiones en la lista de esa carga.
6. **Métricas en página:** `evaluate_script` con `navigation`, `paint`, recursos (`resourceCount`, suma `transferSize`, conteo de URLs con `.js`), `performance.memory`.
7. **Traza Performance:** `performance_start_trace` con **recarga automática** y parada automática (segunda carga del documento; métricas LCP/CLS de esa recarga).
8. **Insights:** `performance_analyze_insight` para **`LCPBreakdown`** y **`NetworkDependencyTree`** sobre el conjunto **`NAVIGATION_0`** de esa traza.

### Limitaciones

- Tras varias cargas en la misma sesión de navegador, muchas respuestas fueron **304** (caché); la suma de `transferSize` en Resource Timing de la primera medición (**~6300** bytes) refleja sobre todo **revalidaciones ligeras**, no un cold cache representativo.
- La traza con recarga corresponde a una **carga posterior** a la medición puntual de API; valores de LCP son de esa recarga instrumentada.

---

## Análisis — fuentes y componentes (código)

- **`HomeV2Shell.tsx`:** `HomeV2` (página editorial con `ClassicRebuildPage`, shaders, Three en rutas hijas) se importa como **`LazyHomeV2`** mediante `React.lazy(() => import('./HomeV2'))`, con comentario explícito de que el objetivo es no bloquear el **EntryGate** y el H1 con ese JS.
- En la fase **`entryPhase === 'select'`** el árbol incluye `EntryGate`, `NonImmersiveHome` (import estático), `SpaceLoadingScreen`, `useJourneyLoader`, etc.; **no** se observó en la red de esta sesión la petición de `HomeV2.tsx` ni de `ClassicRebuildPage.tsx` mientras solo se mostraba el gate — coherente con el **lazy load** hasta que el usuario entra al flujo que monta `LazyHomeV2`.
- **Cadena crítica de la traza (ver abajo)** termina en dependencias del **EntryGate** (p. ej. `framer-motion`, `react-icons`, chunks asociados), **no** en `three.js` ni en el árbol clásico completo.

---

## Hallazgos — Consola

- Solo **`[vite]`** (connecting / connected) y el aviso informativo de **React DevTools**.
- **No** se registraron en esta sesión errores de hidratación ni mensajes de HTML inválido en el listado capturado (la UI del gate expone “Activate immersive mode” y “Unmute sound” como controles separados en el árbol de accesibilidad).

---

## Hallazgos — Red (pantalla de entrada, lista MCP)

- **35 peticiones** desde el inicio de esa navegación hasta el momento de la captura.
- Rutas representativas: `index.v2.html`, `@vite/client`, `main.v2.tsx`, `AppV2.tsx`, `routes.tsx`, `HomeV2Shell.tsx`, `EntryGate`, `NonImmersiveHome`, `SpaceLoadingScreen`, `useJourneyLoader`, `projects.v2.ts`, `framer-motion`, `react-icons_io5`, `LanguageSwitcher`, CSS modulares; **ausencia** de `HomeV2.tsx`, `ClassicRebuildPage`, `three.js` en esta lista.
- Mezcla de **200** y **304** según recurso.

---

## Hallazgos — Métricas observadas (Performance API, primera carga del gate)

| Medida | Valor observado |
|--------|------------------|
| `domContentLoaded` − `fetchStart` | ~**130,9 ms** |
| `loadEventEnd` − `fetchStart` | ~**132 ms** |
| First Paint / FCP (`startTime`) | ~**176 ms** |
| Entradas `resource` | **34** |
| Suma aproximada `transferSize` | **6300** |
| Recursos con `.js` en la URL | **13** |
| `usedJSHeapSize` | **19 741 391** |
| `totalJSHeapSize` | **37 341 823** |

---

## Hallazgos — Traza Performance (navegación con recarga, `NAVIGATION_0`)

| Métrica | Valor |
|---------|--------|
| **LCP** | **681 ms** |
| **CLS** | **0.00** |
| **TTFB** (fase LCP) | **8 ms** (~1,2 % del LCP) |
| **Retraso de render del LCP** | **674 ms** (~98,8 % del LCP) |

- **Elemento LCP:** texto del **H1** de la intro (clase reportada por la herramienta: `_introH1_1v60c_57`); no es un recurso de red independiente.
- **Árbol de dependencias — latencia máxima de cadena crítica:** **228 ms**.
- Cadena más larga (resumen): `index.v2.html` → `main.v2.tsx` → `AppV2.tsx` → `routes.tsx` → `HomeV2Shell.tsx` → `EntryGate.tsx` → entre otros, **`framer-motion.js`** → **`chunk-7HXCKB66.js`** (extremo de cadena a **228 ms**); ramas paralelas con **`react-icons_io5`** y **`chunk-JCFP4JZ3.js`** (~**228 ms**), más módulos CSS y `LanguageSwitcher`, `SpaceLoadingScreen`, `useJourneyLoader` / `projects.v2.ts`, `NonImmersiveHome`, `appModeContext`, `useAudioShell`.
- **Preconnect:** ningún origen precargado (esperable en mismo origen localhost).
- **Document latency / Charset:** el pipeline de insights volvió a señalar detalles de documento y charset en la cabecera HTTP según su heurística (complementario a la presencia de `<meta charset="UTF-8" />` en el HTML fuente del repo).

---

## Resumen ejecutivo (hechos de esta sesión)

La **entrada clásica** (solo gate) mostró **pocas peticiones de red (35)** y **sin descarga del chunk lazy de `HomeV2`/ClassicRebuild/Three** en esa fase, **LCP ~681 ms** dominado por **retraso de render** del H1 con **TTFB ~8 ms**, **CLS 0**, cadena crítica hasta **~228 ms** centrada en **shell + EntryGate + Framer Motion / iconos**, **heap JS ~19–37 MB** en la medición API, y **consola limpia** de errores en la captura MCP.
