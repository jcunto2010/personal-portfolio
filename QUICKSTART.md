# Quick Start Guide

Get your portfolio website up and running in minutes.

## Prerequisites

- **Node.js 24+** (see [`.nvmrc`](.nvmrc))
- npm `>=10`
- Git (optional, for version control)

## Installation

1. Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:5173`

The app mounts from **`index.html`** → **`src/v2/main.v2.tsx`** (single V2 entry; there is no `main.tsx` or `index.v2.html` in the current tree).

## Customization Checklist

Before deploying, update the following with your personal information.

### 1. Personal Information & Hero

**File: `src/v2/components/ClassicRebuild/ClassicRebuildPage.tsx`**

- The `ui` object holds localized strings (EN/ES): name, subtitle, intro, hero heading, hero main text, CTAs, about copy, footer text.
- **Hero portrait:** `ClassicHero` `imageSrc` (default `"/assets/projects/johnny_hero.webp"`) — place your image under `public/` and update the path.
- **Social links:** passed into `ClassicHero` (`socialLinks`); defaults use `contactV2` for GitHub/LinkedIn — adjust Instagram/X URLs there if needed.

### 2. Contact

**File: `src/v2/data/contact.v2.ts`**

- Email, WhatsApp link, display phone, location, GitHub, LinkedIn.

**File: `src/v2/components/Contact/Contact.tsx`**

- UI for mailto, WhatsApp, and copy actions; uses `contactV2` and locale-aware drafts.

### 3. Skills

**File: `src/v2/data/skills.v2.ts`**

- Add/remove skills; `iconKey` values map to icons in `ClassicRebuildPage` (`getSkillIcon`).

### 4. Projects

**File: `src/v2/data/projects.v2.ts`**

- Each project: `slug`, `title`, `coverImage`, `thumbnails`, URLs, `featured`, localized `descriptionEs` / `highlightsEs` as needed.
- Put images under **`public/assets/projects/<slug>/`** and reference paths like `/assets/projects/reservo/*.webp`.

**Case-study pages:** narrative and extra screens live in **`src/v2/pages/ProjectDetailV2/ProjectDetailV2.tsx`** (per-slug content).

### 5. Experience

**File: `src/v2/data/experience.v2.ts`**

- Roles, companies, periods, descriptions, technologies.

### 6. Meta Tags & SEO

**File: `index.html`**

- Page title, meta description, Open Graph, Twitter cards.
- Favicon: **`/favicon.ico`** (not `/vite.svg`).

### 7. Domain & Docs

**Files: `README.md`, `DEPLOYMENT.md`**

- Update domain references and deployment notes if you fork the repo.

## Build for Production

```bash
npm run build
```

Preview locally:

```bash
npm run preview
```

## Deploy

Choose your preferred hosting platform.

### Quick Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Quick Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure (V2)

```
src/v2/
├── main.v2.tsx          # Entry (imported from index.html)
├── AppV2.tsx            # Router shell
├── router/routes.tsx    # Routes (home, projects, etc.)
├── data/                # skills.v2.ts, projects.v2.ts, experience.v2.ts, contact.v2.ts
├── components/          # ClassicRebuild, Contact, EntryGate, Hero, etc.
├── pages/               # HomeV2, ProjectDetailV2, …
├── solar/               # Immersive 3D scene (lazy-loaded)
└── tokens/              # Design tokens
```

## Tips for Customization

### Changing Colors

Edit **`tailwind.config.js`** and/or **`src/v2/tokens/tokens.css`** to match your palette.

### Adding Icons

Editorial skills use **`react-icons`** (`Si*` exports) via `ClassicRebuildPage`. Other UI may use **`lucide-react`**.

### Contact

Default flow is **mailto + WhatsApp** (no backend). For hosted forms, see [DEPLOYMENT.md](DEPLOYMENT.md) and extend `Contact.tsx`.

## Troubleshooting

### Port already in use

Vite will try the next available port if `5173` is taken.

### Build errors

- Clear install: remove `node_modules` and `dist`, then `npm install`
- Node: `node --version` (should be 24+)
- TypeScript: `npx tsc --noEmit`

### Tailwind classes not working

- Restart dev server
- `tailwind.config.js` content paths must include `./src/**/*.{ts,tsx}` and `./index.html`

## Next Steps

1. Customize data files and `ClassicRebuildPage` copy
2. Add or replace images under `public/assets/projects/`
3. Test contact links (mailto / WhatsApp)
4. Test on mobile and in both editorial and immersive modes
5. `npm run build` and `npm run preview`
6. Deploy and configure DNS / HTTPS

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
