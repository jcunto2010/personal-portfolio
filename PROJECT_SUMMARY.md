# Personal Portfolio Project Summary

## Project overview

Personal portfolio for **jonathancuntodiaz.com**, built as a **V2-only** codebase: a single **`index.html`** entry mounts **`src/v2/main.v2.tsx`**. There is no legacy `src/components` tree, `src/main.tsx`, or `index.v2.html` in the current structure.

## What is implemented

### Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS 3
- React Router 7 (`BrowserRouter`)
- Framer Motion, Lenis (smooth scroll where enabled)
- React Three Fiber + Three.js for **immersive** mode
- Playwright E2E (`e2e/`), Vitest available for unit tests

### Experience modes

1. **Editorial (classic)** — long-form home: hero, about, skills sliders, experience timeline, project highlights, contact (`ClassicRebuildPage` via `HomeV2`).
2. **Immersive** — WebGL solar system (`src/v2/solar/SolarScene.tsx`), lazy-loaded.
3. **Entry gate** — first visit: mode, locale (EN/ES), audio preference.

### Content

- **Projects:** Reservo.AI and StartupConnect driven by **`src/v2/data/projects.v2.ts`**; detail pages under **`/projects/:slug`** (`ProjectDetailV2`).
- **Skills / experience / contact:** **`skills.v2.ts`**, **`experience.v2.ts`**, **`contact.v2.ts`**.
- **Contact UI:** mailto + WhatsApp (`Contact.tsx`), not a placeholder “console-only” form.

## Project structure

```
personal_portfolio/
├── index.html                 # Single entry → src/v2/main.v2.tsx
├── src/v2/
│   ├── main.v2.tsx
│   ├── AppV2.tsx
│   ├── router/routes.tsx
│   ├── data/                  # skills.v2.ts, projects.v2.ts, experience.v2.ts, contact.v2.ts
│   ├── components/            # ClassicRebuild, Contact, EntryGate, TableOfContents, …
│   ├── pages/                 # HomeV2, ProjectDetailV2, …
│   └── solar/                 # Immersive 3D
├── public/
│   ├── favicon.ico
│   └── assets/projects/       # Project + hero images (e.g. WebP)
├── vite.config.ts
├── tailwind.config.js
├── vercel.json
├── netlify.toml
├── README.md
├── QUICKSTART.md
├── DEPLOYMENT.md
└── LICENSE
```

## Next steps for you

1. **Copy & data:** Edit **`ClassicRebuildPage.tsx`** (hero/about strings) and **`src/v2/data/*.v2.ts`**.
2. **Images:** Add files under **`public/assets/projects/`**; update **`projects.v2.ts`** and **`ProjectDetailV2.tsx`** screen lists as needed.
3. **SEO:** Adjust **`index.html`** title, meta, OG tags; keep **`/favicon.ico`** for the tab icon.
4. **Deploy:** Vercel / Netlify / GitHub Pages — see **`DEPLOYMENT.md`**.

## Commands

```bash
npm run dev          # Dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run test:e2e     # Playwright (smoke + V2 suite)
npm run lint         # ESLint
npm run bundle:check # Bundle budget (CI)
```

## Documentation

| File | Purpose |
|------|---------|
| `README.md` | Overview, scripts, structure |
| `QUICKSTART.md` | Setup and customization |
| `DEPLOYMENT.md` | Hosting |
| `CUSTOMIZATION_CHECKLIST.md` | Checklist for content updates |
| `SCREENSHOTS_GUIDE.md` | Where to put project images |
| `docs/migration_audit.md` | Historical migration notes |

## Troubleshooting

```bash
# Clean reinstall
rm -rf node_modules dist
npm install
npm run dev
```

If styles break, confirm **`tailwind.config.js`** `content` globs include `src/v2` and `index.html`.

## License

MIT License — see `LICENSE`.

---

Portfolio for: Jonathan Cunto Díaz · Domain: jonathancuntodiaz.com
