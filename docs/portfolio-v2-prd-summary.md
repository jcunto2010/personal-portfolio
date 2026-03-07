# Resumen operativo del PRD — Portafolio V2

Este archivo resume el PRD en formato ejecutable para trabajar dentro de Cursor sin depender del PDF.

## Objetivo

Construir la versión 2 del portafolio con una experiencia **cosmic editorial**: narrativa por scroll, contenido accesible e indexable, capa visual WebGL ambiental, y una arquitectura preparada para calidad, performance y despliegue.

## Principios no negociables

- El contenido debe vivir en **DOM** y seguir siendo indexable.
- WebGL debe ser **progresivo, opcional y prescindible**.
- La experiencia no debe sentirse como videojuego.
- La accesibilidad y `prefers-reduced-motion` no son opcionales.
- No activar service worker PWA en esta fase.
- El contenido actual de la V1 debe preservarse salvo mejoras consensuadas.

## Fuente de verdad del contenido

La fuente principal es la V1 en la rama `main` del repo:

- `src/data/projects.ts`
- `src/data/skills.ts`
- `src/data/experience.ts`
- `src/components/Hero.tsx`
- `src/components/Header.tsx`
- `src/components/Contact.tsx`
- `src/components/Footer.tsx`
- `public/assets/projects/`

## Fases recomendadas

### Sprint 0 — Inventario de V1

Antes de construir la V2, hacer inventario de:

- páginas y secciones actuales
- proyectos y slugs
- copy obligatorio
- CTAs y enlaces
- imágenes y assets
- metadatos SEO
- vacíos o ambigüedades

### T-001 — Scaffold V2

Objetivo:

- crear base V2 sin romper la V1
- mantener React + TypeScript + Vite
- definir rutas y capítulos
- dejar contenido principal en DOM

Entregables:

- Home V2 con capítulos semánticos
- rutas para Home / Projects / Project Detail
- IDs estables de capítulos
- TOC o índice base
- estructura limpia de carpetas

### T-004 — Migración de contenido + SEO/A11y

Objetivo:

- migrar contenido esencial manualmente desde V1
- no inventar copy faltante
- preparar páginas editoriales de proyectos

Entregables:

- hero, experiencia, skills, proyectos, contacto
- metadatos base
- estructura accesible
- checklist de validación humana

### T-002 — Scroll narrativo

Objetivo:

- integrar Lenis + GSAP + ScrollTrigger
- respetar `prefers-reduced-motion`
- no secuestrar navegación ni foco

Entregables:

- módulo central de scroll
- capítulos sincronizados
- animaciones sobrias
- fallback correcto con reduced motion

### T-003 — WebGL ambiental

Objetivo:

- añadir capa WebGL sobria con R3F
- mantener el contenido perfectamente legible
- ofrecer fallback si falla o se desactiva

Entregables:

- `WebGLLayer`
- fondo cósmico ambiental
- lazy loading si aplica
- flag para activar/desactivar

### T-005 — CI/CD + performance

Objetivo:

- preparar build, preview y quality gates

Entregables:

- GitHub Actions
- preview deploy
- Lighthouse CI
- bundle checks

KPIs objetivo:

- LCP <= 2.5s
- CLS <= 0.1
- INP <= 200ms
- Lighthouse móvil: Performance >= 85, Accessibility >= 95, SEO >= 95

### T-006 — QA automatizado

Objetivo:

- cubrir Home, capítulos, navegación, reduced motion y accesibilidad

Entregables:

- Playwright
- Axe
- política anti-flake

### T-007 — Security/compliance

Objetivo:

- endurecer cabeceras, dependencias y secretos

Entregables:

- CSP base
- revisión de dependencias
- escaneo de secretos
- checklist de privacidad

### T-008 — Observabilidad

Objetivo:

- dejar preparado Sentry/GA4 con consentimiento

Nota:

- en esta fase se mantiene apagado salvo validación humana

## Design tokens aprobados

```js
{
  mood: "cosmic editorial",
  fonts: {
    display: "Proxima Nova Semibold",
    body: "Proxima Nova Light",
    fallback_display: "Inter, Arial, sans-serif",
    fallback_body: "Inter, Arial, sans-serif"
  },
  colors: {
    baseBg: "#070B1A",
    surfaceBg: "#0D1326",
    baseText: "#F5F7FF",
    mutedText: "#B8C0D9",
    navy: "#0B1F3A",
    deepBlue: "#1D4ED8",
    violet: "#7C3AED",
    purple: "#9333EA",
    magenta: "#C026D3",
    cyan: "#06B6D4",
    borderSoft: "rgba(255,255,255,0.12)"
  },
  radius: { sm: "8px", md: "16px", lg: "24px" },
  style_rules: [
    "alto contraste",
    "capítulos editoriales",
    "WebGL solo como capa ambiental",
    "texto siempre legible sobre el fondo"
  ]
}
```

## Orden real de ejecución recomendado en Cursor

1. Sprint 0 inventario de V1
2. Orquestador en Plan Mode
3. T-001 Scaffold
4. T-004 Migración de contenido
5. T-002 Lenis + GSAP
6. T-003 WebGL ambiental
7. T-005 CI/CD + LHCI
8. T-006 QA automatizado
9. T-007 Security/compliance
10. T-008 Observabilidad con consentimiento

## Regla de control para todos los agentes

Añadir al final de cada prompt:

```txt
Antes de afirmar que la tarea está completa, proporciona:
1) comando ejecutado
2) fragmento de output
3) lista exacta de archivos modificados
4) cómo reproducir
Si no ejecutaste, marca [NV] y detén la tarea.
```
