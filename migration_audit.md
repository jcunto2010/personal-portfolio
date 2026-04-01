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

---

# Auditoría de migración: eliminación del entry point V1 (`main.tsx`, `App.tsx`, `index.css`)

## Contexto

Con V2 como única entrada (`index.html` → `src/v2/main.v2.tsx`), los archivos raíz de V1 en `src/` dejaron de ser necesarios. Objetivo: eliminarlos del repositorio y conservar la referencia de tipos de Vite en el árbol V2.

## Búsqueda de referencias (fuera de `src/`)

Se buscó en el proyecto referencias a `main.tsx`, `App.tsx`, `index.css` y `vite-env.d.ts` en configuraciones, scripts y tests (extensiones `.ts`, `.tsx`, `.js`, `.mjs`, `.cjs`, `.json`, `.html`).

**Resultado:** ningún archivo **fuera de** `src/` importa o referencia esas rutas como módulos. Las únicas menciones están en documentación (`.md`), por ejemplo `README.md`, `QUICKSTART.md`, `PROJECT_SUMMARY.md`, `DEPLOYMENT.md`, `public/fonts/README.md` y entradas históricas de esta misma auditoría.

- `index.html` ya apunta a `/src/v2/main.v2.tsx` (no a `src/main.tsx`).
- `tsconfig.json` incluye `"src"` en bloque; `src/v2/types/` ya contenía `css-modules.d.ts`.

## Modificaciones realizadas

### 1. Eliminación con `git rm`

```bash
git rm src/main.tsx src/App.tsx src/index.css src/vite-env.d.ts
```

### 2. `src/v2/types/vite-env.d.ts` (nuevo)

No existía `vite-env.d.ts` bajo `src/v2/types/`. Se añadió el mismo contenido que tenía `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

Así los tipos de Vite (`import.meta.env`, assets, etc.) siguen aplicando a todo `src/` vía `include: ["src"]`.

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| Imports rotos en código (TS/JS fuera de `src/`) | Ninguno detectado en la búsqueda global indicada. |
| `npm run build` | Correcto (`tsc && vite build`) tras los cambios. |
| Tipos Vite | Conservados en `src/v2/types/vite-env.d.ts`. |

## Commit

- **Mensaje:** `chore(v1-removal): remove V1 entry point files (main.tsx, App.tsx, index.css)`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon (mensaje arriba).

## Notas

- La documentación en varios `.md` sigue mencionando `src/main.tsx` o `src/index.css` como referencia histórica o guía; no bloquea el build. Actualizar esos documentos sería una tarea opcional aparte.
- El resto del árbol V1 bajo `src/` (componentes, páginas legadas, etc.) **no** forma parte de este commit; solo se retiraron el entry y estilos globales V1 listados arriba.

---

# Auditoría de migración: eliminación de `src/components/` (V1)

## Contexto

La carpeta `src/components/` contenía únicamente la UI legada V1. V2 vive en `src/v2/components/`. Objetivo: eliminar por completo `src/components/` con `git rm -r`, preservando cualquier módulo que V2 (u otro código activo) importara desde rutas bajo ese árbol.

## Búsqueda global previa

| Módulo | Hallazgo |
|--------|----------|
| `OnboardingTutorial`, `RotatePrompt` | Importados en `src/v2/solar/SolarScene.tsx` vía `../../components/…` (resolvía a `src/components/`, no a `src/v2/components/`). |
| `NeuralBackground` | Importado en `src/v2/components/ClassicRebuild/ClassicRebuildPage.tsx` desde `src/components/NeuralBackground`. |
| `FlowStepper` | Importado en `src/features/case-studies/pages/ReservoCaseStudy.tsx` desde `src/components/shared/FlowStepper`. |

No hubo otros imports TypeScript desde `src/components/` fuera de los anteriores (las rutas `../../components/…` en `src/v2/pages/HomeV2/` apuntan a `src/v2/components/`).

## Modificaciones realizadas

### 1. Reubicación antes del borrado

- **`OnboardingTutorial.tsx`**, **`RotatePrompt.tsx`**, **`NeuralBackground.tsx`** → `src/v2/components/` (imports internos ajustados: `../lib/localeContext` en lugar de `../v2/lib/…`).
- **`FlowStepper.tsx`** → `src/features/case-studies/components/FlowStepper.tsx` (único consumidor activo fuera del árbol solar / ClassicRebuild).

### 2. Imports actualizados

- `SolarScene.tsx`: `../components/OnboardingTutorial` y `../components/RotatePrompt`.
- `ClassicRebuildPage.tsx`: `../NeuralBackground`.
- `ReservoCaseStudy.tsx`: `../components/FlowStepper`.

### 3. Comentarios de documentación

- `HomeV2.tsx`, `contact.v2.ts`, `ProjectDetailV2.tsx`: comentarios alineados con la desaparición de rutas `src/components/…`.

### 4. Eliminación del árbol V1

```bash
git rm -r src/components/
```

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| `npm run build` | Correcto (`tsc && vite build`) tras reubicación y `git rm -r`. |
| `PhoneMockup.tsx` | Eliminado con la carpeta; solo lo usaban componentes V1 ya borrados (`ProjectReservo`, `ProjectStartupFlow`). |
| Historial Git | Git puede registrar `FlowStepper`, `NeuralBackground`, `OnboardingTutorial` y `RotatePrompt` como renombres desde `src/components/` hacia las nuevas rutas. |

## Commit

- **Mensaje:** `chore(v1-removal): remove all V1 component files`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon (mensaje arriba).

## Notas

- Documentación del repo (`CHECKLIST.md`, `SCREENSHOTS_GUIDE.md`, secciones antiguas de esta auditoría que citan `OnboardingTutorial` bajo `src/components/`) puede quedar desactualizada; no afecta al build.
- El módulo `src/features/case-studies/` se eliminó en un commit posterior (ver sección «eliminación de `src/features/`» al final de este documento).

---

# Auditoría de migración: eliminación de `src/data/` (V1)

## Contexto

Los datos de portafolio V1 vivían en `src/data/` (`skills.ts`, `projects.ts`, `experience.ts`). La fuente canónica es `src/v2/data/` (`*.v2.ts` y módulos asociados).

## Verificación de imports cruzados en `src/v2/`

Se buscó `from '../data/'` y `from '../../data/'` (y variantes con más niveles) dentro de `src/v2/`.

**Resultado:** todas las coincidencias importan archivos **`*.v2.ts`** (por ejemplo `projects.v2`, `contact.v2`). Por resolución de rutas relativas, esos paths apuntan a **`src/v2/data/`**, no a `src/data/`.

No se encontraron imports en `src/v2/` hacia `skills.ts`, `projects.ts` ni `experience.ts` sin sufijo `.v2`.

Se comprobó además que ningún otro `.ts`/`.tsx` bajo `src/` importe módulos V1 en `src/data/`; solo quedan menciones en comentarios y en documentación del repo (`.md`).

## Modificaciones realizadas

### 1. Comentario en `src/v2/pages/HomeV2/HomeV2.tsx`

Las líneas de cabecera que aún citaban `src/data/skills.ts` y `src/data/experience.ts` se actualizaron a `src/v2/data/skills.v2.ts` y `src/v2/data/experience.v2.ts`.

### 2. Eliminación del árbol V1

```bash
git rm -r src/data/
```

Archivos eliminados del índice: `experience.ts`, `projects.ts`, `skills.ts`.

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| Imports cruzados V2 → `src/data/` | Ninguno. |
| `npm run build` | Correcto tras `git rm -r src/data/`. |

## Commit

- **Mensaje:** `chore(v1-removal): remove V1 data files (migrated to src/v2/data/)`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon (mensaje arriba).

## Notas

- Varios `.md` (`README.md`, `QUICKSTART.md`, `PROJECT_SUMMARY.md`, etc.) y cabeceras históricas en `src/v2/data/*.v2.ts` pueden seguir mencionando `src/data/…` como origen de la migración; no impiden el build.

---

# Auditoría de migración: eliminación de `src/features/` (case studies V1)

## Contexto

`src/features/case-studies/` contenía la experiencia V1 de case study (p. ej. `ReservoCaseStudy`, `CaseStudyLayout`, `DeveloperModeContext`, `FlowStepper` y componentes auxiliares). V2 expone los case studies en `src/v2/pages/ProjectDetailV2/` y datos en `src/v2/data/`.

## Verificación de imports cruzados

Dentro de **`src/v2/`** se buscó:

- `features/case-studies`
- `from '…/features/…'` (rutas relativas que apunten al árbol `features`)

**Resultado:** ninguna coincidencia; V2 no importa el módulo.

Se revisó además todo **`src/*.ts` / `src/*.tsx`**: los únicos usos de `case-studies`, `ReservoCaseStudy`, `DeveloperModeContext` y `CaseStudyLayout` estaban **dentro** de `src/features/` (imports internos). Ningún otro archivo del árbol fuente enlazaba ese módulo.

## Modificaciones realizadas

```bash
git rm -r src/features/
```

**Archivos eliminados (8):** `CodeShowcase.tsx`, `FlowStepper.tsx`, `ImpactMetrics.tsx`, `TechStackOrbit.tsx`, `DeveloperModeContext.tsx`, `index.ts`, `CaseStudyLayout.tsx`, `ReservoCaseStudy.tsx` (todos bajo `case-studies/`).

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| Imports V2 → `src/features/` | Ninguno. |
| `npm run build` | Correcto tras `git rm -r src/features/`. |

## Commit

- **Mensaje:** `chore(v1-removal): remove V1 features/case-studies module`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon (mensaje arriba).

## Notas

- Documentación del repo que citaba `src/features/case-studies/` o imports desde `Header` V1 puede quedar obsoleta; no afecta al build.
- La nota bajo la auditoría de eliminación de `src/components/` se actualizó para remitir a esta sección en lugar de afirmar que el módulo seguía presente.

---

# Auditoría de migración: utilidades V1 (`shared/assert`, `test/setup`, `lib/utils`)

## Contexto

Restos de infraestructura V1: helper `assert`, su test, setup de Vitest con `@testing-library/jest-dom`, y `cn()` en `src/lib/utils.ts` (equivalente ligero a clsx, sin uso en el árbol actual).

## 1. `src/lib/utils.ts` y V2

Búsqueda en **`src/v2/`** de `from '../lib/utils'`, `from '../../lib/utils'` y patrones similares hacia `lib/utils`.

**Resultado:** ningún import. No existe `src/v2/lib/utils.ts`. Búsqueda de **`cn(`** en `src/`: solo la definición en `utils.ts` (código no referenciado).

**Decisión:** eliminar `src/lib/utils.ts` sin moverlo a V2.

## 2. Archivos eliminados (`git rm`)

```bash
git rm src/shared/assert.ts src/shared/assert.test.ts src/test/setup.ts src/lib/utils.ts
```

## 3. `vitest.config.ts`

- Se quitó `setupFiles: ['src/test/setup.ts']` (el archivo dejaba de existir).
- Tras borrar el único `*.test.ts` bajo `src/`, `vitest run` fallaba con «No test files found». Se añadió **`passWithNoTests: true`** para que `npm run test:unit` siga siendo usable en CI hasta que haya tests unitarios bajo `src/`.

## 4. Carpetas vacías

Git no versiona directorios vacíos; tras eliminar los archivos, **`git rm -r src/shared/`**, **`src/test/`** y **`src/lib/`** no aplican como pathspec (no hay árbol que borrar). Las carpetas vacías en disco pueden borrarse manualmente si aparecen; no forman parte del índice.

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| V2 → `src/lib/utils` | Sin uso. |
| `npm run build` | Correcto. |
| `npm run test:unit` | Correcto con `passWithNoTests: true` (0 archivos de test). |

## Commit

- **Mensaje:** `chore(v1-removal): remove V1 test utilities and shared lib`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon (mensaje arriba).

## Notas

- Si se añaden tests V2, conviene un setup bajo `src/v2/test/setup.ts` (p. ej. `jest-dom`) y referenciarlo en `setupFiles` de nuevo.

---

# Auditoría de migración: eliminación de `loadingscreen/` (app huérfana)

## Contexto

En la raíz del repo existía la carpeta **`loadingscreen/`**: mini-aplicación React con muchos componentes **shadcn/ui** (accordion, calendar, chart, carousel, etc.) y un `SpaceLoadingScreen` duplicado frente al canónico en **`src/v2/components/SpaceLoadingScreen/`**. No formaba parte del build principal (`index.html` → V2).

## Verificación de referencias

| Ámbito | Comprobación |
|--------|----------------|
| `vite.config.ts` | Sin menciones de `loadingscreen`; `build.rollupOptions.input` solo `index.html`. |
| `package.json` (`scripts`) | Sin scripts ni rutas hacia `loadingscreen/`. |
| `.github/workflows/` | `ci.yml`, `deploy.yml`, `dependabot.yml` sin referencias a `loadingscreen`. |
| Búsqueda en repo | Cadena literal `loadingscreen` solo en archivos bajo esa carpeta (antes del borrado). |

## Modificaciones realizadas

```bash
git rm -r loadingscreen/
```

**Alcance:** 55 archivos eliminados del índice (app, `styles/`, kit `ui/`, etc.).

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| `npm run build` | Correcto tras eliminar `loadingscreen/`. |
| UI de carga en producción | Sigue usando `src/v2/components/SpaceLoadingScreen/`. |

## Commit

- **Mensaje:** `chore: remove orphaned loadingscreen/ directory`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon (mensaje arriba).

## Notas

- Cualquier documentación o notas locales que describieran `loadingscreen/` como playground de diseño pueden ignorarse o actualizarse aparte; no bloquean el build.

---

# Auditoría de migración: eliminación de `/smoke-test` (`SmokeTestGLB`)

## Contexto

La ruta **`/smoke-test`** y el componente **`SmokeTestGLB`** se añadieron en la Fase 0 para validar assets GLB (y audio). Estaban marcados como temporales y no debían exponerse en producción.

## Modificaciones realizadas

### 1. `src/v2/router/routes.tsx`

- Eliminado `LazySmokeTest` y su comentario de Fase 0.
- Eliminada la entrada `path: 'smoke-test'` del array `v2Routes`.

### 2. `src/v2/AppV2.tsx`

- Eliminado el import de `LazySmokeTest`.
- Eliminado el `<Route path="smoke-test" …>` y el comentario asociado.

### 3. Código fuente del smoke test

```bash
git rm -r src/v2/pages/SmokeTest/
```

(Único archivo: `SmokeTestGLB.tsx`.)

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| `npm run build` | Correcto; el bundle ya no genera chunk lazy `SmokeTestGLB-*.js`. |
| Rutas V2 activas | `/`, `/projects`, `/projects/:slug`. |

## Commit

- **Mensaje:** `chore: remove smoke-test route and SmokeTestGLB component (phase 0 cleanup)`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon (mensaje arriba).

## Notas

- Documentos en `docs/audit-plan-fixes.md` y `docs/audit-plan-fixes-2.md` pueden seguir mencionando `SmokeTestGLB` o `/smoke-test` en contexto histórico de auditoría; no afectan al build.

---

# Auditoría de migración: URL de audio externa (`VITE_AUDIO_URL`)

## Contexto

El archivo `public/assets/audio/shona-theme.mp3` (~12,8 MB) infla el repositorio, los clones y el deploy. Se prepara el código para que la fuente del audio sea configurable vía variable de entorno, con fallback al asset local bajo `/public`, hasta que el MP3 se suba a un CDN (Cloudflare R2, Cloudinary, etc.) y se defina la URL definitiva.

## Búsqueda de referencias

| Criterio | Resultado |
|----------|-----------|
| `shona-theme.mp3` / `audio/` en código | La ruta canónica estaba solo en **`src/v2/lib/useAudioShell.ts`** como constante `AUDIO_SRC`. Comentarios en `HomeV2Shell.tsx` mencionan el nombre del tema sin ruta de archivo. |

## Modificaciones realizadas

### 1. `src/v2/lib/useAudioShell.ts`

- Sustituida la constante por `AUDIO_URL = import.meta.env.VITE_AUDIO_URL ?? '/assets/audio/shona-theme.mp3'`.
- `audio.src` usa `AUDIO_URL` (misma semántica de carga diferida que antes).

### 2. `src/v2/types/vite-env.d.ts`

- Añadida la propiedad opcional `VITE_AUDIO_URL` en `ImportMetaEnv` para tipado explícito.

### 3. `env.example`

- Contenido reemplazado por la plantilla acordada: bloque **Audio** (`VITE_AUDIO_URL`), **Analytics** (`VITE_GA4_MEASUREMENT_ID`), **Error tracking** (`VITE_SENTRY_DSN`), **App version** (`VITE_APP_VERSION`), con referencias a `docs/t008-observability-activation.md` donde aplica.

### 4. `.gitignore`

- **Sin cambios:** el patrón `*.local` ya ignora `.env.local` (y con ello un archivo local con `VITE_AUDIO_URL`). También se ignoran `.env`, `.env.production.local`, etc.

### 5. Asset MP3

- **No eliminado** en esta tarea; el commit incluye nota en el cuerpo del mensaje para quitarlo del repo cuando el CDN esté listo.

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| `npm run build` | Correcto (`tsc && vite build`). |
| Comportamiento sin `VITE_AUDIO_URL` | Sigue sirviendo `/assets/audio/shona-theme.mp3` desde `public/`. |
| Producción futura | Basta definir `VITE_AUDIO_URL` en el entorno de build (p. ej. CI) apuntando al CDN. |

## Commit

- **Mensaje:** `refactor: externalize audio URL via VITE_AUDIO_URL env var (CDN-ready)`
- **Cuerpo (nota):** el MP3 en `public/` no se elimina en este commit; retirarlo del historial/versionado cuando la URL del CDN esté operativa.
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon (mensaje arriba).

---

# Auditoría de migración: imágenes de proyecto en WebP

## Contexto

Varios PNG bajo `public/assets/projects/` y `public/og-image.png` sumaban más de ~3 MB de peso descargable en el primer render. Se convirtieron los assets de proyecto a **WebP** (calidad **82**) con **`npx sharp-cli`**, se actualizaron las referencias en código y se retiraron del índice los PNG sustituidos, **excepto** `public/og-image.png`, reservado para `og:image` y `twitter:image` en `index.html` (compatibilidad con crawlers).

## Herramienta

- `npx sharp-cli -i <entrada.png> -o <directorio> -f webp -q 82` por cada archivo.
- No se versionó `og-image.webp`: la vista previa social sigue usando solo `og-image.png`; el WebP generado se eliminó para no duplicar el asset.

## Archivos convertidos y referencias actualizadas

| Ámbito | Archivos / cambios |
|--------|---------------------|
| Hero | `johnny_hero.webp` ← `ClassicRebuildPage.tsx` |
| Tutorial solar | `sun-no-card.webp`, `sun-with-card.webp`, `mercury-card.webp` ← `OnboardingTutorial.tsx` |
| Datos de proyectos | `projects.v2.ts` — `coverImage`, `thumbnails` (Reservo + StartupConnect) |
| Detalle de proyecto | `ProjectDetailV2.tsx` — galerías EN/ES |
| Reservo (5) | `book summary`, `calendar`, `home`, `main screen`, `shop` |
| StartupConnect (7) | `chats`, `community rooms`, `create post`, `dashboard`, `feed`, `login`, `matching` |

`index.html`: sin cambios en URLs absolutas a `https://www.jonathancuntodiaz.com/og-image.png`.

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| PNG eliminados del tree (git rm) | 16 archivos bajo `assets/projects/` (no `og-image.png`). |
| WebP añadidos | 16 archivos; tamaño agregado aproximado **~0,54 MB** (medido en el clon). |
| `npm run build` | Correcto (`tsc && vite build`). |

## Commit

- **Mensaje:** `perf: convert project images to WebP format`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon (mensaje arriba).

## Notas

- `SCREENSHOTS_GUIDE.md` puede seguir mostrando ejemplos con `.png`; son ilustrativos, no rutas activas del build actual.
- Iconos y favicons bajo `public/assets/projects/` (p. ej. `favicon-16x16.png`) no formaron parte de esta conversión.

---

# Auditoría de migración: eliminación de dependencia `reactflow`

## Contexto

El paquete **`reactflow`** (~350 KB minificado) permanecía en `dependencies` tras el retiro de los case studies de V1. No se usaba en el código actual.

## Búsqueda

| Ámbito | Comando / resultado |
|--------|---------------------|
| `src/v2/` | `grep` (patrones `reactflow`, `ReactFlow`, `react-flow`) — **sin coincidencias** |
| `src/` completo | Misma búsqueda — **sin coincidencias** |

## Modificaciones realizadas

- `npm uninstall reactflow` (también eliminó ~55 paquetes transitivos del árbol de dependencias).
- `package.json` y `package-lock.json` actualizados por npm.

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| `npm run build` | Correcto (`tsc && vite build`). |

## Commit

- **Mensaje:** `chore: remove unused reactflow dependency (saves ~350KB)`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon (mensaje arriba).

---

# Auditoría de migración: eliminación de `public/vite.svg` (placeholder de Vite)

## Contexto

`public/vite.svg` es el logo SVG que `npm create vite` deja en `public/`. El sitio usa `<link rel="icon" href="/favicon.ico" />` en `index.html`; no había referencias en código ni en assets servidos al mismo nivel que el proyecto.

## Búsqueda

| Ámbito | Comando / resultado |
|--------|---------------------|
| `src/`, `public/`, `index.html` | Equivalente a `grep -r "vite.svg" src/ public/ index.html` — **sin coincidencias** (en Windows PowerShell no se dispuso de `grep` en PATH; la verificación se hizo con búsqueda en el repo sobre esas rutas). |

**Nota:** `QUICKSTART.md` y `CUSTOMIZATION_CHECKLIST.md` mencionan sustituir `/vite.svg` o `public/vite.svg` como guía para nuevos proyectos; no son referencias de runtime en el build.

## Modificaciones realizadas

- `git rm public/vite.svg`

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| `npm run build` | Correcto (`tsc && vite build`). |

## Commit

- **Mensaje:** `chore: remove default Vite placeholder favicon`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `a323aea`

---

# Auditoría de migración: roadmap de seguridad (CSP `unsafe-eval`)

## Contexto

La CSP actual incluye `'unsafe-eval'` en `script-src` por la compilación en runtime de shaders GLSL (Three.js / R3F). El comentario en `index.html` ya apunta a retirarlo cuando los shaders estén pre-compilados. Esta tarea solo documenta el camino; **no** se modificó código de aplicación ni cabeceras desplegadas.

## Modificaciones realizadas

- Nuevo archivo `docs/security-roadmap.md`: estado pendiente, prioridad alta, motivación técnica, pasos numerados (pre-compilación GLSL, offscreen worker, revisión Three.js 0.170+, eliminación en `index.html`, `netlify.toml`, `vercel.json`, validación Lighthouse) y enlaces de referencia (three.js#23723, web.dev/csp).

## Resultados obtenidos

| Aspecto | Resultado |
|--------|-----------|
| Cambios en CSP / build | Ninguno (solo documentación). |
| `npm run build` | No requerido para esta tarea; el roadmap no afecta el pipeline. |

## Commit

- **Mensaje:** `docs: add security roadmap for CSP unsafe-eval removal`
- **Rama al momento de la auditoría:** `v2/cosmic-editorial`
- **Hash abreviado:** `git log -1 --oneline` tras el commit en el clon (mensaje arriba).
