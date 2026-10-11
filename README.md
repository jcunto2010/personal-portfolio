# Jonathan Cunto-Diaz — Portfolio V2

Portafolio personal construido con React 19, Vite 7 y TypeScript. Presenta dos modos de experiencia:

- **Modo inmersivo**: sistema solar interactivo 3D con React Three Fiber (WebGL progresivo)
- **Modo editorial**: lectura clásica con animaciones CSS/Framer Motion

## Stack técnico

- React 19 + TypeScript + Vite 7
- React Three Fiber + Three.js 0.183 (modo inmersivo)
- Framer Motion + Lenis (scroll suave)
- CSS Modules + Tailwind CSS 3
- React Router v7 (BrowserRouter)

## Comandos principales

```bash
npm install          # instala dependencias
npm run dev          # servidor de desarrollo en localhost:5173
npm run build        # build de producción
npm run test:e2e     # tests E2E con Playwright
npm run bundle:check # verifica presupuesto de bundle (T-005)
npm run lhci         # Lighthouse CI
```

## Deploy

- **Producción:** Vercel (`vercel.json`)
- El CI (`.github/workflows/ci.yml`) ejecuta lint, build, E2E y Lighthouse en cada PR.

## Estructura del proyecto

```
src/v2/
├── components/     # Componentes de la UI
├── data/           # Datos de proyectos, experiencia, skills y contacto
├── hooks/          # Hooks reutilizables (p. ej. Lenis, reveal)
├── lib/            # Contextos y utilidades
├── pages/          # Páginas lazy-loaded
├── solar/          # Sistema solar 3D (WebGL / R3F)
├── tokens/         # Design tokens CSS
└── router/         # Configuración de rutas
```

---

## Requisitos

- Node.js `>=24` (ver [`.nvmrc`](.nvmrc))
- npm `>=10`

La aplicación se monta desde [`index.html`](index.html) → [`src/v2/main.v2.tsx`](src/v2/main.v2.tsx).

---

## Convenciones y licencia

- Estándares de código: [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md)
- Licencia: [MIT](LICENSE)

**Jonathan Cunto-Diaz** — [jonathancuntodiaz.com](https://www.jonathancuntodiaz.com) · GitHub [@jcunto2010](https://github.com/jcunto2010)
