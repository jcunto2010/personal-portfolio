# Auditoría de rendimiento — Portafolio V2 (modo clásico / pantalla de entrada)

**Ámbito:** carga con el **diálogo de entrada** visible (H1 de intro, “Portfolio entry”), **sin** activar modo inmersivo en esa navegación: `navigate_page` a `http://localhost:5173/index.v2.html` y mediciones con el gate visible.

**Fecha de medición:** 25 de marzo de 2026. **Entorno:** Vite en desarrollo, localhost, sin throttling de CPU ni red.

---

## Pruebas ejecutadas y metodología

1. **Servidor:** HTTP **200** a `index.v2.html`.
2. **Navegación:** `navigate_page` (nuevo documento).
3. **Comprobación UI:** `take_snapshot` — “Portfolio entry”, H1 “Hi, my name is Jonathan Cunto Diaz”, **“Activate immersive mode”**, **“Unmute sound”**, **“Classic mode…”**.
4. **Consola:** `list_console_messages`.
5. **Red:** `list_network_requests` (`pageSize` 300) → **33** peticiones listadas.
6. **Métricas en página:** `evaluate_script` (`navigation`, `paint`, recursos, `transferSize`, recursos con `.js` en URL, `performance.memory`).
7. **Traza Performance:** `performance_start_trace` con **recarga automática** (LCP/CLS de esa recarga).
8. **Insights:** `performance_analyze_insight` — **`LCPBreakdown`**, **`NetworkDependencyTree`** sobre **`NAVIGATION_0`**.

### Limitaciones

- Caché fuerte (**304** en muchos recursos): la suma **`transferSize` ≈ 6300** bytes en la medición API es coherente con **revalidación mínima**, no con un primer visitante.
- Los tiempos **paint** de la API de rendimiento pueden **diferir** de **LCP** de la traza (p. ej. **1120 ms** frente a **505 ms** en esta sesión) por instante de muestreo, prioridad del hilo o estado de la pestaña; las cifras de **LCP** de la traza instrumentada se documentan aparte.

---

## Análisis — fuentes y componentes (código)

- **`HomeV2Shell.tsx`:** `HomeV2` (editorial) es **`LazyHomeV2`** (`React.lazy`) para no bloquear el **EntryGate** y el H1.
- **Red del gate (esta sesión):** en las **33** peticiones listadas **no** aparecen `HomeV2.tsx`, `ClassicRebuildPage` ni `SolarScene` — alineado con el **lazy** hasta que el usuario avanza de la fase `select`.
- **Cadena crítica de la traza:** el extremo de mayor latencia (**192 ms**) sigue **`SpaceLoadingScreen`** → **`framer-motion.js`** → **`chunk-7HXCKB66.js`**; en esta captura **no** figura `react-icons_io5.js` como hoja de la cadena más larga (el listado de red del gate tampoco incluyó esa dependencia en las 33 filas).

---

## Hallazgos — Consola

- `[vite] connecting…` / `connected`.
- Aviso de **React DevTools** (desarrollo).
- **Sin** otros mensajes en el listado MCP de esa navegación.

---

## Hallazgos — Red (pantalla de entrada)

- **33 peticiones** listadas.
- Incluyen `index.v2.html`, `@vite/client`, `main.v2.tsx`, `AppV2.tsx`, `routes.tsx`, `HomeV2Shell.tsx`, `EntryGate`, `NonImmersiveHome`, `SpaceLoadingScreen`, `useJourneyLoader`, `projects.v2.ts`, `framer-motion`, `LanguageSwitcher`, CSS modulares; **no** rutas bajo `/assets/solar/`.

---

## Hallazgos — Métricas observadas (Performance API, carga del gate)

| Medida | Valor observado |
|--------|------------------|
| `domContentLoaded` − `fetchStart` | ~**106,7 ms** |
| `loadEventEnd` − `fetchStart` | ~**107,5 ms** |
| First Paint / FCP (`startTime`) | ~**1120 ms** |
| Entradas `resource` | **32** |
| Suma aproximada `transferSize` | **6300** |
| Recursos con `.js` en la URL | **11** |
| `usedJSHeapSize` | **94 795 692** |
| `totalJSHeapSize` | **98 333 308** |

---

## Hallazgos — Traza Performance (`NAVIGATION_0`, recarga instrumentada)

| Métrica | Valor |
|---------|--------|
| **LCP** | **505 ms** |
| **CLS** | **0.00** |
| **TTFB** (fase LCP) | **6 ms** (~1,1 % del LCP) |
| **Retraso de render del LCP** | **499 ms** (~98,9 % del LCP) |

- **Elemento LCP:** texto del **H1** (clases reportadas: `_introH1_1qw5m_63` y `_introH1In_1qw5m_63`); no es un recurso de red aparte.
- **Latencia máxima de cadena crítica (informe):** **192 ms**.
- Cadena más larga (extracto): `index.v2.html` → … → `HomeV2Shell.tsx` → **`SpaceLoadingScreen.tsx`** → **`framer-motion.js`** → **`chunk-7HXCKB66.js`** (**192 ms**). Ramas paralelas: `EntryGate.tsx` (con `LanguageSwitcher` y CSS), `useJourneyLoader` / `projects.v2.ts`, `NonImmersiveHome`, `appModeContext`, `useAudioShell`.
- **Preconnect:** ningún origen precargado (localhost mismo origen).
- **Charset (insight):** la herramienta puede marcar aspectos de documento/charset en cabecera HTTP; el HTML del repo incluye `<meta charset="UTF-8" />` en `index.v2.html`.

---

## Resumen ejecutivo (hechos de esta sesión)

Pantalla de entrada: **33 peticiones** sin assets solares, **LCP ~505 ms** en la traza con recarga (**TTFB ~6 ms**, **retraso de render ~499 ms**), **CLS 0**, cadena crítica hasta **~192 ms** centrada en **`SpaceLoadingScreen` + Framer Motion**, **heap ~95–98 MB** en la medición API, **consola** solo Vite y React DevTools en la captura MCP, y **divergencia** entre **FCP ~1120 ms** (API) y **LCP 505 ms** (traza) documentada como limitación de medición.
