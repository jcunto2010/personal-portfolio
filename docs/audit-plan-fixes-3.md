# Audit plan fixes #3 — Draco decoder bajo CSP (modo inmersivo)

**Ámbito:** carga y decodificación de GLB comprimidos con Draco en V2. La meta CSP de `index.v2.html` (`connect-src 'self' blob:`) bloqueaba la descarga del decodificador desde `https://www.gstatic.com/...`, por lo que `DRACOLoader` no arrancaba y los modelos fallaban en cadena (promesas rechazadas).

**Fecha:** 25 de marzo de 2026.

---

## Causa raíz (resumen)

- `@react-three/drei` (`core/Gltf.js`) usa por defecto `decoderPath = 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/'`.
- Esa URL no está en `connect-src` → el navegador rechaza `fetch`/Worker para `draco_wasm_wrapper.js` y `draco_decoder.wasm`.
- El GLB llegaba (p. ej. `sun.glb` en Resource Timing) pero **no se descomprimía** Draco → fallos silenciosos / `Uncaught (in promise)` en la cadena de carga.

---

## Solución aplicada: opción A (decoders locales)

1. **Archivos estáticos** en `public/draco/` (servidos como `/draco/` en dev y en `dist/` tras el build):
   - `draco_decoder.js`
   - `draco_decoder.wasm`
   - `draco_wasm_wrapper.js`  
   Origen en el repo: `node_modules/three/examples/jsm/libs/draco/` (versión alineada con la dependencia `three` del proyecto).

2. **Configuración del loader:** Drei acepta el **segundo argumento** de `useGLTF` como *string* = ruta del decodificador (`typeof useDraco === 'string' ? useDraco : decoderPath`). En `src/v2/solar/useGLTFV2.ts` se pasa `'/draco/'` en lugar de `true`, manteniendo Meshopt y `extendGltfLoaderWithV2Extensions` como antes.

   No fue necesario instanciar `DRACOLoader` manualmente en `gltfLoaderExtensions.ts`: Drei ya adjunta su singleton y solo hacía falta desviar la ruta al mismo origen. Se documentó el motivo en comentarios en `gltfLoaderExtensions.ts` y `useGLTFV2.ts`.

3. **CSP:** `connect-src 'self'` permite cargar `/draco/*` desde el mismo origen; **no se modificó** la meta CSP del HTML.

4. **Automatización:** `scripts/copy-draco.mjs` copia los tres archivos; en `package.json`:
   - `"copy:draco": "node scripts/copy-draco.mjs"`
   - `"prebuild": "npm run copy:draco"`  
   Así CI y builds locales refrescan `public/draco` desde la versión de `three` instalada.

5. **API:** se reexpone `useGLTFV2.setDecoderPath = useGLTF.setDecoderPath` por compatibilidad con la API de Drei (p. ej. tests o overrides puntuales).

---

## Verificación en el entorno de desarrollo

1. Abrir el modo inmersivo (`index.v2.html`) con consola abierta.
2. **No** deberían aparecer:
   - `Refused to connect ... gstatic.com ... draco`
   - rechazos de promesa atribuibles a la inicialización de Draco.
3. Los planetas / `sun.glb` deberían mostrarse con los GLB Draco tal como están en `public/assets/solar/models/`.

---

## Métricas esperadas (post-fix)

| Métrica | Expectativa |
|--------|-------------|
| Errores CSP relacionados con Draco | 0 |
| `Uncaught (in promise)` por decodificador Draco | 0 |
| `sun.glb` (Resource Timing) | Transferencia sigue reflejando el tamaño comprimido; el tiempo incluye descarga + descompresión local (sin bloqueo CSP) |
| Heap modo inmersivo | Mantener el rango observado previamente (~40–80 MB según auditorías; no es un objetivo duro de esta tarea) |

**Nota:** Esta sesión no ejecutó Chrome DevTools Performance ni Memory en el navegador del usuario; los valores anteriores son **criterios de aceptación** para validar manualmente tras desplegar o en local.

---

## Verificación de build (repo)

- `npm run build` completó con éxito (`tsc` + `vite build`).
- `prebuild` ejecutó `copy:draco`; la salida de producción incluye `dist/draco/` con los tres archivos del decodificador.

---

## Comentarios y riesgos

- **Versión Draco:** los binarios copiados provienen del paquete `three` instalado. Tras un bump mayor de `three`, conviene ejecutar `npm run copy:draco` y revisar que no haya cambios de API en `DRACOLoader`.
- **`npm run dev`:** no ejecuta `prebuild`; si `public/draco` no existe (clone limpio sin commit de esos archivos), hay que correr `npm run copy:draco` una vez o depender de los archivos versionados en `public/draco/`.
- **Opción B (CSP con gstatic):** sigue siendo posible añadir el host a `connect-src`, pero la opción A evita dependencia de red y cumple la política restrictiva actual.

---

## EntryGate: eliminar `react-icons/io5` del árbol de dependencias de red

**Contexto:** Tras mejorar el LCP, la herramienta de auditoría seguía mostrando **`react-icons_io5`** en la cadena de dependencias de red porque `EntryGate` cargaba `IoVolumeHigh` / `IoVolumeMute` con `import('react-icons/io5')` en un `useEffect` (lazy). Eso generaba un chunk adicional y mantenía el paquete en el grafo de la ruta de entrada V2.

**Cambio aplicado (25 de marzo de 2026):**

- En `src/v2/components/EntryGate/EntryGate.tsx` se eliminaron el estado `volumeIcons`, el `useEffect` con import dinámico y todo uso de `react-icons/io5`.
- Los iconos del toggle de audio son ahora **`VolumeHighIcon` y `VolumeMuteIcon`**, SVG inline con `fill="currentColor"` (mismos paths que los iconos Ionic usados antes).
- El botón usa `aria-label` existente (`audioAriaOn` / `audioAriaOff`); el contenedor del icono lleva `aria-hidden="true"` porque el estado lo comunica el propio botón.
- Color: `muted` → `rgba(255,255,255,0.4)`; no silenciado → `#00D9A3'`, aplicado sobre un `<span>` con `display: inline-flex` para heredar `currentColor` en los SVG.

**Criterio de verificación (NetworkDependencyTree / Performance):**

- En la captura de la **entrada** (`index.v2.html` → `HomeV2Shell` → `EntryGate`), **`react-icons_io5.js` no debe aparecer** como dependencia de red ni en la cadena crítica atribuible a `EntryGate`.
- El paquete `react-icons` sigue en `package.json` por otras rutas del proyecto (p. ej. `Hero`, `ClassicRebuild`, iconos `fa`/`si`); solo se desacopla la **pantalla de entrada V2** de `io5`.

**Nota de build:** Tras `npm run build`, no quedan referencias a `react-icons` en los chunks de `dist/assets/` generados para la rama V2 probada; la comprobación en navegador debe ser la fuente de verdad para el Network Dependency Tree (DevTools Performance).
