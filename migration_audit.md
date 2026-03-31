# Auditoría de migración: exclusión de `.tmp_lhci/`

## Contexto

La carpeta `.tmp_lhci/` había sido versionada por error. Contiene cientos de archivos de caché de compilación de Node (por ejemplo bajo `node-compile-cache/`) que no deben estar en el repositorio.

## Modificaciones realizadas

### 1. `.gitignore`

Se añadió la siguiente entrada al final de la sección `# Lighthouse CI`, inmediatamente después de `.lighthouseci/`:

```gitignore
.tmp_lhci/
```

Con esto, Git ignora la carpeta en el árbol de trabajo y no volverá a proponerla para commit de forma rutinaria.

### 2. Desindexación del historial de seguimiento (sin borrar en disco)

Se ejecutó:

```bash
git rm -r --cached .tmp_lhci/
```

Esto elimina los archivos del índice de Git y de los commits futuros, pero **no** borra los archivos locales en el disco (siguen existiendo si Lighthouse CI u otra herramienta los regenera).

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| Estado tras `git rm --cached` | Los archivos bajo `.tmp_lhci/` aparecieron como **deleted** en el área de staging, listos para commit. |
| Alcance del commit | **1816 archivos** tocados en el commit: eliminación del índice de ~1815 entradas bajo `.tmp_lhci/` más **1 inserción** en `.gitignore`. |
| Código fuente | No se modificó ningún archivo de código fuente; solo `.gitignore` y la desindexación de `.tmp_lhci/`. |

## Commit

- **Hash:** `d3ed899`
- **Mensaje:** `chore: remove .tmp_lhci cache from version control`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`

## Notas

- Los objetivos antiguos de `.tmp_lhci/` pueden seguir existiendo en el historial de Git hasta que se aplique un historial reescrito (no realizado en esta tarea). Para clones nuevos, la carpeta deja de versionarse a partir de este commit.
- Quien clone el repo no recibirá `.tmp_lhci/` en el working tree a partir de ese commit; quien ya la tenga localmente puede conservarla o borrarla manualmente según necesidad.

---

# Auditoría de migración: unificación de imágenes `public/tutorial/`

## Contexto

La carpeta `public/tutorial/` contenía tres PNG idénticos por hash MD5 a los ya presentes en `public/assets/projects/`:

| Archivo en `tutorial/` | Equivalente canónico en `assets/projects/` |
|------------------------|---------------------------------------------|
| `sun-with-card.png` | `sun-with-card.png` |
| `sun-no-card.png` | `sun-no-card.png` |
| `mercury-card.png` | `mercury-card.png` |

Objetivo: dejar de versionar duplicados (~3,2 MB ahorrados en el árbol actual), usar solo `public/assets/projects/` y actualizar referencias en código.

## Búsqueda de referencias

Se buscó en `src/`, archivos `.md`, `.html`, `.ts`, `.tsx` y `.css` cualquier ruta `/tutorial/` o `public/tutorial/`.

**Resultado:** únicamente **`src/components/OnboardingTutorial.tsx`** referenciaba `/tutorial/*.png` (tres constantes y comentarios de cabecera). No hubo coincidencias adicionales en el resto de extensiones buscadas.

## Modificaciones realizadas

### 1. `src/components/OnboardingTutorial.tsx`

- Constantes de imagen actualizadas de `/tutorial/…` a `/assets/projects/…` (rutas públicas equivalentes en Vite).
- Comentario de cabecera alineado con las rutas canónicas bajo `public/assets/projects/`.

### 2. Eliminación de la carpeta duplicada en Git

```bash
git rm -r public/tutorial/
```

Se eliminaron del índice los tres PNG duplicados. **`public/assets/projects/` no se modificó.**

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| Referencias actualizadas | 3 rutas en `OnboardingTutorial.tsx` → `/assets/projects/…` |
| Archivos eliminados del repo | `public/tutorial/mercury-card.png`, `sun-no-card.png`, `sun-with-card.png` |
| Imágenes canónicas | Sin cambios en `public/assets/projects/` |
| Commit | **4 archivos** en el diff: 1 fuente modificado + 3 binarios borrados |

## Commit

- **Hash:** `695fcdc`
- **Mensaje:** `chore: remove duplicate tutorial/ images (~3.2 MB saved)`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`

## Notas

- Los tres PNG pueden seguir existiendo en commits anteriores al de eliminación; el ahorro de tamaño aplica al estado actual del árbol y a clones tras ese commit.
- Cualquier copia local residual de `public/tutorial/` (si existía fuera de Git) puede borrarse a mano; el `.gitignore` no fue alterado para esta tarea porque la carpeta ya no se versiona.

---

# Auditoría de migración: Node.js 24 unificado en CI y despliegues

## Contexto

Había inconsistencia entre entornos:

| Ubicación | Versión anterior |
|-----------|------------------|
| `.github/workflows/ci.yml` | Node **24** (ya alineado) |
| `.github/workflows/deploy.yml` | Node **20** |
| `netlify.toml` (`NODE_VERSION`) | **18** |
| `.nvmrc` | Debe coincidir con la versión usada en CI (**24**) |

## Modificaciones realizadas

### 1. `.github/workflows/deploy.yml`

En el step **Setup Node**, `node-version` pasó de `'20'` a `'24'`, alineado con `ci.yml`.

### 2. `.nvmrc`

Debe reflejar la versión de CI: contenido `24` (una sola línea). En el repositorio **ya era `24`**; no hubo cambio en el índice respecto a esta tarea.

### 3. `netlify.toml`

En `[build.environment]`, `NODE_VERSION` pasó de `"18"` a `"24"`.

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| GitHub Actions CI | Sin cambios (ya en 24 en todos los jobs revisados). |
| GitHub Pages deploy | Build job usa Node 24. |
| Netlify | Builds con Node 24 vía `NODE_VERSION`. |
| Desarrollo local | `nvm use` / lectores de `.nvmrc` apuntan a 24. |

## Commit

- **Mensaje:** `chore: unify Node.js version to 24 across all environments`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Alcance:** 3 archivos — `.github/workflows/deploy.yml` y `netlify.toml` modificados; `migration_audit.md` añadido al repositorio (incluye también las auditorías anteriores de `.tmp_lhci/` y `public/tutorial/`). El hash abreviado del objeto commit puede verse con `git log -1 --oneline` en el clon (puede variar si se usa `git commit --amend`).

### `.nvmrc`

El archivo ya contenía `24` y coincidía con el índice de Git; **no hubo modificación** en el working tree para esta tarea, solo verificación de alineación con CI.

## Notas

- Conviene validar el próximo deploy en GitHub Pages y en Netlify tras el merge; si algún plugin o script dependía de APIs solo en 18/20, fallaría en pipeline.
- Cualquier otra referencia a Node (Docker, documentación externa) queda fuera del alcance de este commit.

---

# Auditoría de migración: `index.v2.html` como `index.html` canónico (único entry point)

## Contexto

El proyecto tenía **dos HTML de entrada** en el código fuente:

| Archivo | Punto de montaje |
|---------|------------------|
| `index.html` | V1 — `src/main.tsx` |
| `index.v2.html` | V2 — `src/v2/main.v2.tsx` |

Objetivo: que **V2 sea el único entry point** también en el árbol fuente (no solo tras post-procesos de build como copiar `index.v2.html` sobre `dist/index.html`). Tras el cambio, **`index.html` monta siempre V2**; `src/main.tsx` y el árbol V1 pueden seguir existiendo en el repo pero **ningún HTML los referencia**.

## Modificaciones realizadas

### 1. `index.html`

Se reemplazó el contenido por el que tenía `index.v2.html`: CSP (meta T-007), metadatos SEO, Open Graph, Twitter Card, canonical, etc. El script de entrada queda:

```html
<script type="module" src="/src/v2/main.v2.tsx"></script>
```

### 2. Eliminación de `index.v2.html` y script de promoción

```bash
git rm index.v2.html scripts/promote-v2-index.mjs
```

- `index.v2.html` deja de existir; la entrada única es `index.html`.
- `scripts/promote-v2-index.mjs` copiaba V2 sobre `dist/index.html` tras el build; al generar ya solo `dist/index.html` con Vite, dejó de ser necesario.

### 3. `vite.config.ts`

En `build.rollupOptions.input` quedó una sola entrada:

```ts
input: {
  main: resolve(__dirname, 'index.html'),
},
```

Se eliminaron la entrada `v2: resolve(__dirname, 'index.v2.html')` y los comentarios que distinguían V1/V2 en ese bloque.

### 4. Build, CI y herramientas alineadas con `dist/index.html`

Con un solo input Rollup llamado `main`, el **chunk de entrada** en producción pasa de `v2-*.js` a **`main-*.js`**. Se actualizó lo dependiente de rutas y del HTML de salida:

| Área | Cambio |
|------|--------|
| `scripts/bundle-check.cjs` | Lee `dist/index.html` (constante `ENTRY_HTML`); mensajes y comentarios referencian `index.html`. |
| `.github/workflows/ci.yml` | Artefacto: `dist/index.html` y `dist/assets/main-*.js` (antes `index.v2.html`, `v2-*.js`, `client-*.js`). |
| `.lighthouserc.cjs` | URL de recolección: `http://localhost/` (servidor estático sobre `dist/`). |
| `playwright.config.ts` | Proyectos V2: `baseURL` `http://localhost:5173/?e2e=1` (antes `.../index.v2.html?e2e=1`). |
| `e2e/v2/home.spec.ts` | Comentarios de entry point y `baseURL` alineados con la raíz. |
| `e2e/smoke.spec.ts` | Navegación a `/?e2e=1`; aserciones sobre V2 (`.v2-root`, `#chapter-intro`, `h1`) en lugar de `data-testid="app-root"` de V1. |
| `package.json` | `build:vercel`: solo `npm run build`. `bundlesize`: patrón `./dist/assets/main-*.js` (se quitó `v2-*.js` y `client-*.js`, este último ya no aparece en el build actual). |
| `netlify.toml` | Comentario CSP: referencia a `index.html` en lugar de `index.v2.html`. |

### 5. Comentarios en código V2 (coherencia documental)

Ajustes menores en: `src/v2/AppV2.tsx`, `src/v2/main.v2.tsx`, `src/v2/solar/useGLTFV2.ts`, `src/v2/tokens/tokens.css`.

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| `npm run build` | Correcto; `dist/index.html` único HTML de salida; sin `dist/index.v2.html`. |
| `npm run bundle:check` | Correcto (T-005 presupuesto gzip inicial + T-005b sin `three-bundle` en `modulepreload`). |
| Playwright | Smoke (`e2e/smoke.spec.ts`, proyecto desktop) y prueba representativa de Home V2 (`loads correctly — v2-root`) pasaron en verificación local. |
| Nombre del chunk de entrada | `main-*.js` en lugar de `v2-*.js` (consecuencia del `input.main` en Rollup). |
| Archivos en el commit | **16 archivos** modificados o eliminados (incluye borrado de `index.v2.html` y `scripts/promote-v2-index.mjs`). |

## Commit

- **Hash:** `7561188`
- **Mensaje:** `feat: promote index.v2.html as canonical index.html (V1 entry removed)`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`

## Notas

- Documentación en `.md` del repo (p. ej. `README.md`, informes de auditoría bajo `docs/`) puede seguir mencionando `index.v2.html` o URLs antiguas; conviene actualizarlas en commits posteriores si se busca consistencia narrativa.
- `src/main.tsx` y componentes V1 no se eliminaron en este cambio; solo dejaron de tener entry HTML. Una limpieza explícita de V1 sería otra tarea.

---

# Auditoría de migración: `HashRouter` → `BrowserRouter` en App V2

## Contexto

Con V1 y V2 coexistiendo en el mismo dominio, V2 usaba **`HashRouter`** para que las rutas vivieran en el fragmento (`/#/projects/...`) y el servidor estático no devolviera 404 en recargas directas.

Tras unificar el entry en `index.html` solo para V2, tiene sentido usar **`BrowserRouter`** con rutas limpias (`/projects/reservo-ai`, etc.). El despliegue debe seguir sirviendo `index.html` para cualquier ruta de aplicación.

## Modificaciones realizadas

### 1. `src/v2/AppV2.tsx`

- Import: `HashRouter` → `BrowserRouter`.
- JSX: `<HashRouter>` / `</HashRouter>` → `<BrowserRouter>` / `</BrowserRouter>`.
- JSDoc: párrafo sobre `HashRouter` sustituido por la descripción de `BrowserRouter` con `basename='/'` y la nota de que el servidor redirige todo a `index.html`, ya configurado en **`vercel.json`** (`rewrites`) y **`netlify.toml`** (`[[redirects]]` `from = "/*"` → `/index.html` con `status = 200`).

### 2. `playwright.config.ts`

Los proyectos `v2-chromium-desktop` y `v2-mobile-chrome` **ya tenían** `baseURL: 'http://localhost:5173/?e2e=1'` tras la migración del index canónico; **no fue necesario cambiar** el valor respecto al enunciado de esta tarea (el antiguo `index.v2.html` ya no aplicaba).

### 3. E2E bajo `e2e/v2/`

| Archivo | Cambio |
|---------|--------|
| `home.spec.ts` | Comentarios de cabecera: entry `/?e2e=1`, router `BrowserRouter` y rutas limpias. |
| `navigation.spec.ts` | `page.goto('#/…')` → `page.goto('/…?e2e=1')` para `/projects`, detalle y flujos de vuelta; aserción de URL tras `goBack` usa `pathname === '/projects'`; nombres de tests y comentarios alineados con rutas sin hash. |
| `axe.spec.ts` | Comentarios de URLs; mismos `goto` con rutas absolutas y `?e2e=1` fuera de home. |

**Motivo de `?e2e=1` en cada `goto` no vacío:** con `baseURL` que incluye query, una navegación a `'/projects'` resuelve a `http://localhost:5173/projects` y **pierde** el flag que desactiva `EntryGate`; añadir `?e2e=1` mantiene el bypass.

### 4. Documentación / tooling menor

- `src/v2/pages/HomeV2/HomeV2.tsx`: comentario de deep-link de `#/?chapter=…` → `/?chapter=…`; texto sobre conflictos con `HashRouter` sustituido por una formulación neutra respecto al path.
- `.lighthouserc.cjs`: comentarios actualizados (V2 con historial, no hash).

### 5. Servidor de desarrollo (Vite)

Sin cambios en `vite.config.ts`: el valor por defecto de Vite **`appType: 'spa'`** aplica *HTML fallback* en dev, coherente con rutas directas como `/projects`.

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| `npm run build` | Correcto (tras verificación local en esta sesión). |
| Playwright `e2e/v2` (proyecto `v2-chromium-desktop`) | **23 tests** pasaron (home, navegación, axe, reduced-motion). |
| Producción estática | Netlify y Vercel ya reescriben a `index.html`; **GitHub Pages** con el flujo actual (`deploy-pages` sobre `dist`) puede seguir sin SPA fallback nativo para paths profundos — queda fuera del alcance de este cambio si el sitio público no usa Pages para rutas compartibles. |

## Commit

- **Mensaje:** `refactor: migrate AppV2 from HashRouter to BrowserRouter`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** obtener con `git log -1 --oneline --grep "BrowserRouter"` (o `git log -1` sobre el commit que introduce esta sección en `migration_audit.md`).

## Notas

- Enlaces internos en la app ya usaban `react-router-dom` con paths tipo `/projects/:slug`; no requirieron cambios.
- Cualquier bookmark o enlace externo antiguo con `/#/…` dejará de coincidir con la app; conviene actualizar enlaces compartidos o añadir redirección client-side solo si hay necesidad explícita.

---

# Auditoría de migración: limpieza de scripts y CI tras retirada de V1 como entry

## Contexto

Con un solo `index.html` y sin `index.v2.html` ni `promote-v2-index.mjs`, quedaban **nombres y scripts heredados** (`build:vercel`, `ci:v2`, `test:e2e:v1` / `test:e2e:v2`, artefactos `main-*.js`, comentarios «V2 ·» en CI, etc.). Objetivo: alinear `package.json`, Vercel y GitHub Actions con el flujo actual sin distinción operativa V1/V2 en tooling.

## Modificaciones realizadas

### 1. `package.json` — `scripts`

| Acción | Detalle |
|--------|---------|
| Eliminado | `build:vercel` (redundante con `npm run build`). |
| Renombrado | `ci:v2` → **`ci`**, valor `npm run build && npm run bundle:check` (no existía otro script `ci`). |
| Eliminado | `test:e2e:v1`. |
| Renombrado | `test:e2e:v2` → **`test:e2e:suite`** (mismos proyectos Playwright `v2-chromium-desktop` y `v2-mobile-chrome`). |

### 2. `package.json` — `bundlesize`

- Entrada única: `./dist/assets/v2-*.js`, `maxSize` 50 kB gzip (se elimina cualquier referencia a `client-*.js` de V1; en el árbol previo solo existía `main-*.js`).

**Nota técnica:** para que el chunk de entrada vuelva a llamarse `v2-*.js` y coincida con `bundlesize` y el artefacto de CI, en **`vite.config.ts`** la clave de `build.rollupOptions.input` pasó de `main` a **`v2`** (mismo `index.html`).

### 3. `vercel.json`

- `buildCommand`: `npm run build:vercel` → **`npm run build`**.

### 4. `.github/workflows/ci.yml`

- Comentarios del bloque T-005: sin «V2-specific»; nombres de job más neutros (`Bundle budget check…`, `Lighthouse CI…`).
- Artefacto bundle: nombre `dist-bundle`; paths `dist/index.html` y **`dist/assets/v2-*.js`** (alineado con Rollup).
- Artefacto Lighthouse: `lighthouse-reports-v2` → **`lighthouse-reports`**.
- No había step que ejecutara `test:e2e:v1`; el job E2E sigue usando `npm run test:e2e` (todos los proyectos Playwright).
- Comentario del step Lighthouse ya refería `index.html` (sin `index.v2.html`).

### 5. `scripts/promote-v2-index.mjs`

- El archivo **ya había sido eliminado** en el commit de index canónico (`git rm` en esa migración). En esta tarea `git rm scripts/promote-v2-index.mjs` **no aplica** (pathspec inexistente en el índice).

### 6. Documentación de despliegue

- **`README.md`** (sección Deployment / Vercel): texto actualizado a un solo entry `index.html` y `npm run build`; eliminado el párrafo obsoleto sobre `build:vercel` + copia de `index.v2.html`.
- **`DEPLOYMENT.md`**: comando de build en Vercel alineado con `npm run build`.

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| `npm run build` | Genera de nuevo el chunk de entrada `dist/assets/v2-*.js` (clave Rollup `v2`). |
| `npm run bundle:check` | Correcto (sigue leyendo `dist/index.html`). |
| `npm run ci` | Equivalente a build + bundle check; ejecutable en local/CI. |
| `git rm scripts/promote-v2-index.mjs` | No requerido — archivo ausente del repo. |

## Commit

- **Mensaje:** `chore: clean up build scripts and CI after V1 removal`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon.

## Notas

- Los **nombres internos** de proyectos Playwright (`v2-chromium-desktop`, etc.) no se renombraron en esta tarea; solo cambió el script npm `test:e2e:suite`.
- La auditoría histórica anterior que menciona `input.main` y `main-*.js` describe el estado **intermedio** entre index canónico y esta limpieza; el estado actual vuelve a usar la clave **`v2`** en Rollup solo como nombre de chunk, no como segundo HTML.

---

# Auditoría de migración: Lighthouse CI — URL en la raíz (sin `index.v2.html`)

## Contexto

Lighthouse CI debe auditar la misma entrada que producción: **`dist/index.html`** en la ruta **`/`** del servidor estático que usa LHCI sobre `staticDistDir: './dist'`. Tras eliminar `index.v2.html`, cualquier `url` que apunte a `http://localhost/index.v2.html` sería inválida.

## Modificaciones realizadas

### 1. `.lighthouserc.cjs`

- **`url`:** en el árbol actual **ya estaba** definido como `['http://localhost/']` (alineado con la migración a `BrowserRouter` y al index canónico). En esta tarea se **reafirma** explícitamente y se evita regresiones documentales.
- **Comentarios:** el bloque de cabecera y el comentario junto a `url` se actualizan para dejar claro que la recolección es la **raíz del sitio** (`/` → `index.html`) y que **no** debe usarse la ruta legada `/index.v2.html`.

No hay otras menciones de `index.v2.html` ni de URLs con `v2` en el archivo.

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| Valor funcional de `url` | `http://localhost/` (sin cambio respecto al estado previo en repo). |
| Coherencia con `dist/` | Solo existe `index.html` en la raíz de `dist/`; LHCI sirve ese documento en `/`. |
| Riesgo de URL rota | Eliminado a nivel de documentación en el propio config (referencia explícita a no usar `index.v2.html`). |

## Commit

- **Mensaje:** `chore: update Lighthouse CI URL from index.v2.html to root`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon.

## Notas

- Si un clon antiguo aún tenía `url: ['http://localhost/index.v2.html']`, este commit lo sustituye de facto por la raíz más los comentarios aclaratorios; en el historial de esta rama el `url` correcto ya figuraba desde antes.
