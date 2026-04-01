## Completed

- [x] Editorial home (ClassicRebuildPage) — hero, about, skills, timeline, projects, contact
- [x] Immersive mode — solar/WebGL experience (`src/v2/solar/`)
- [x] Entry gate — mode selection, locale, audio preferences
- [x] Projects — Reservo.AI & StartupConnect (data-driven, `src/v2/data/projects.v2.ts`)
- [x] Project detail routes (`/projects/:slug`) with case-study layouts
- [x] Contact — mailto + WhatsApp (`src/v2/data/contact.v2.ts`, `Contact` component)
- [x] Footer / copyright in editorial shell
- [x] Custom domain (www.jonathancuntodiaz.com)
- [x] DNS configuration (Namecheap)
- [x] Favicon (`public/favicon.ico`)
- [x] SEO meta tags (`index.html`)

# Portfolio Checklist

---

## Pending

### High Priority

#### 1. Enable HTTPS

- [ ] Go to GitHub repo → Settings → Pages
- [ ] Click "Check again" on DNS (should pass now)
- [ ] Check "Enforce HTTPS" box
- [ ] Verify site loads with padlock icon

#### 2. Project Screenshots & Assets

Replace or add real assets under `public/assets/projects/` and wire them in data:

**Reservo.AI (`reservo-ai`):**

- [ ] Cover and thumbnails referenced in `src/v2/data/projects.v2.ts` (`coverImage`, `thumbnails[]`)
- [ ] Case-study screen images in `src/v2/pages/ProjectDetailV2/ProjectDetailV2.tsx` (`screens[]` for slug `reservo-ai`)

**StartupConnect (`startupconnect`):**

- [ ] Same pattern: `projects.v2.ts` + `ProjectDetailV2.tsx` (`startupconnect`)

Recommended: **WebP** under `public/assets/projects/<slug>/` (see `SCREENSHOTS_GUIDE.md`).

---

### Medium Priority

#### 3. Social Share Image

- [ ] Create `og-image.png` (1200x630px) if you want a custom Open Graph image
- [ ] Add to `public/` and reference from `index.html` (`og:image` / `twitter:image`)

#### 4. Contact Channel (Optional)

The contact UI uses **mailto** and **WhatsApp** links from `contact.v2.ts`. If you need a hosted form (Formspree, EmailJS, Netlify Forms), integrate it in `src/v2/components/Contact/Contact.tsx` and document env vars.

#### 5. Experience Details

- [ ] Edit `src/v2/data/experience.v2.ts` if roles or dates change

---

### Low Priority / Nice to Have

#### 6. Performance

- [ ] Compress images before adding
- [ ] Test on mobile devices
- [ ] Run Lighthouse (`npm run lhci` when configured)

#### 7. Analytics

- [ ] Telemetry hooks exist under `src/v2/lib/telemetry/` — wire GA4/Sentry per your privacy policy

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Check TypeScript errors
npx tsc --noEmit

# E2E (Playwright)
npm run test:e2e

# Push changes to deploy
git add .
git commit -m "Your message"
git push
```

---

## File Locations (V2)

| What | Where |
|------|-------|
| App entry | `index.html` → `src/v2/main.v2.tsx` → `src/v2/AppV2.tsx` |
| Editorial home content | `src/v2/components/ClassicRebuild/ClassicRebuildPage.tsx` (hero copy, nav, sections) |
| Projects data | `src/v2/data/projects.v2.ts` |
| Skills, experience, contact | `src/v2/data/skills.v2.ts`, `experience.v2.ts`, `contact.v2.ts` |
| Project detail / case study | `src/v2/pages/ProjectDetailV2/ProjectDetailV2.tsx` |
| Routes | `src/v2/router/routes.tsx` |
| Contact UI | `src/v2/components/Contact/Contact.tsx` |
| SEO / meta | `index.html` |
| Screenshots & static assets | `public/assets/projects/` |
| Favicon | `public/favicon.ico` |

---

## Links

- **Live site:** https://www.jonathancuntodiaz.com
- **GitHub repo:** https://github.com/jcunto2010/personal-portfolio
- **GitHub Pages settings:** https://github.com/jcunto2010/personal-portfolio/settings/pages
- **Namecheap DNS:** https://ap.www.namecheap.com/domains/domaincontrolpanel/jonathancuntodiaz.com/advancedns
