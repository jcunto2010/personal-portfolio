# Jonathan Cunto Diaz — Personal Portfolio

A modern, responsive personal portfolio website built with React, TypeScript, and Tailwind CSS.

## Features

- Built with Vite for lightning-fast development
- React 19 with TypeScript for type safety
- Styled with Tailwind CSS for modern, responsive design
- Fully responsive across all devices
- Accessible with semantic HTML and ARIA labels
- Smooth animations and transitions
- Contact form with validation
- Social media integration

---

## Setup

### Requirements

- Node.js `>=24` (see [`.nvmrc`](.nvmrc))
- npm `>=10`

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Opens at `http://localhost:5173` with hot module replacement.

### Build for production

```bash
npm run build
```

Output goes to `dist/`. Runs `tsc` type-check followed by `vite build`.

### Preview production build

```bash
npm run preview
```

Serves the `dist/` folder at `http://localhost:4173`. Run `npm run build` first.

---

## Project Structure

```
personal_portfolio/
├── public/
│   └── assets/
│       └── projects/        # Project screenshots
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Skills.tsx
│   │   ├── Projects.tsx
│   │   ├── Experience.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   ├── data/
│   │   ├── projects.ts
│   │   ├── skills.ts
│   │   └── experience.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── docs/
│   └── CONVENTIONS.md       # Project standards and coding conventions
├── .editorconfig
├── .nvmrc
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## Technologies

- **React** — UI library
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **Framer Motion** — Animations
- **React Icons** — Icon library
- **Three.js / R3F** — 3D rendering

---

## Deployment

### Vercel (recommended)

The repo ships [vercel.json](vercel.json) (Vite build, `dist`, SPA rewrites). **Production branch** is set in the Vercel UI (**Settings → Environments → Production → Branch Tracking**), not in that file.

**Root URL is V2** — the build command runs `build:vercel`, which builds both entries then copies [index.v2.html](index.v2.html) over `dist/index.html`. Otherwise Vercel would serve V1 at `/` (static `index.html` wins over rewrites).

**Optional: keep v1 on its own URL** — add a **second** Vercel project with **Production Branch** = `main` and override **Build Command** to `npm run build` (no `build:vercel`) so `/` stays V1. Custom domains: **Settings → Domains** on each project.

The v1 line on `main` is anchored with tag **`v1.0.0`** on GitHub (`git show v1.0.0`).

CLI (optional):

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### GitHub Pages

Update `vite.config.ts` with your repo base, then:

```bash
npm install -D gh-pages
# add "predeploy": "npm run build", "deploy": "gh-pages -d dist" to package.json scripts
npm run deploy
```

---

## Customization

| What to change | File |
|---|---|
| Hero text & links | `src/components/Hero.tsx` |
| Skills list | `src/data/skills.ts` |
| Projects | `src/data/projects.ts` + `public/assets/projects/` |
| Experience | `src/data/experience.ts` |
| Contact info | `src/components/Contact.tsx`, `src/components/Footer.tsx` |
| Color scheme | `tailwind.config.js` → `theme.extend.colors` |

---

## Contributing

See [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) for coding standards, folder structure, accessibility rules, and security guidelines.

---

## License

[MIT](LICENSE)

---

## Author

**Jonathan Cunto Diaz**

- Website: [jonathancuntodiaz.com](https://jonathancuntodiaz.com)
- GitHub: [@jcunto2010](https://github.com/jcunto2010)
