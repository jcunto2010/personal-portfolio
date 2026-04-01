# Customization Checklist for Your Portfolio (V2)

Use this checklist while you customize the **V2** codebase (`src/v2/`). Legacy paths such as `src/components/Hero.tsx`, `src/data/projects.ts`, or `src/main.tsx` **do not exist** in this project.

## Content updates

### Personal information & hero

**Primary file: `src/v2/components/ClassicRebuild/ClassicRebuildPage.tsx`**

- [ ] Name, subtitle, intro, hero heading, hero body (`heroMainText`), CTAs, about paragraphs, timeline intro, footer copyright — update the `ui` object (EN and ES strings).
- [ ] Hero image: `ClassicHero` prop `imageSrc` (default `"/assets/projects/johnny_hero.webp"`) — place file under `public/` and adjust path.
- [ ] Social icons in hero: `socialLinks` array (GitHub/LinkedIn read from `contactV2`; change Instagram/X URLs if needed).

**`index.html`**

- [ ] `<title>` and meta description
- [ ] Open Graph / Twitter meta if you change branding
- [ ] Favicon: **`/favicon.ico`** (replace file in `public/` rather than `vite.svg`)

### Contact & social

**`src/v2/data/contact.v2.ts`**

- [ ] `email`, `whatsapp`, `whatsappDisplay`, `location`, `github`, `linkedin`

**`src/v2/components/Contact/Contact.tsx`**

- [ ] Only if you change behavior (e.g. add a third-party form); default uses mailto + WhatsApp helpers from `contact.v2.ts`.

## Professional content

### Skills — `src/v2/data/skills.v2.ts`

- [ ] Add/remove entries; keep `category` (`language` | `framework` | `tool`) and `iconKey` aligned with icons mapped in `ClassicRebuildPage.tsx` (`getSkillIcon`).

### Projects — `src/v2/data/projects.v2.ts`

- [ ] For each project: `slug`, `title`, `tagline`, `description`, `coverImage`, `thumbnails`, URLs, `featured`, optional ES fields.
- [ ] Image paths are served from **`public/`** — e.g. `/assets/projects/reservo/main screen.webp`.

### Project detail / case studies — `src/v2/pages/ProjectDetailV2/ProjectDetailV2.tsx`

- [ ] Long-form copy and `screens[]` image paths per slug (`reservo-ai`, `startupconnect`). Keep paths consistent with files under `public/assets/projects/`.

### Experience — `src/v2/data/experience.v2.ts`

- [ ] Roles, companies, periods, descriptions, `technologies` bullets, optional `descriptionEs`.

## Visual content

### Project images

- [ ] Optimize images (WebP recommended)
- [ ] Store under **`public/assets/projects/<slug>/`**
- [ ] Update **`projects.v2.ts`** and **`ProjectDetailV2.tsx`** references together

### Favicon

- [ ] Replace **`public/favicon.ico`**
- [ ] Confirm `index.html` uses `<link rel="icon" href="/favicon.ico" />`

## Styling (optional)

- [ ] **`tailwind.config.js`** — theme extensions
- [ ] **`src/v2/tokens/tokens.css`** — design tokens / `.v2-root` variables

## Technical (optional)

### Analytics / telemetry

- [ ] `src/v2/lib/telemetry/` — wire only with consent / privacy policy

### Environment variables

- [ ] If you add API keys: copy **`env.example`** → **`.env.local`**, document in hosting, keep secrets out of git

## Pre-deployment

- [ ] `npm run dev` — editorial + immersive flows, locale switcher
- [ ] `npm run build` — clean build
- [ ] `npm run preview` — smoke-test production assets
- [ ] `npm run test:e2e` — optional full Playwright run

## Deployment

- [ ] Follow **`DEPLOYMENT.md`**
- [ ] HTTPS and custom domain on your host (Vercel / Netlify / etc.)

## Notes

```
Date started: ___________

Important notes:
-
-

Date completed: ___________
```

---

**Tip:** See **`QUICKSTART.md`** and **`SCREENSHOTS_GUIDE.md`** for paths and asset conventions.
