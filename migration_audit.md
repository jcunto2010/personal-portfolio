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
