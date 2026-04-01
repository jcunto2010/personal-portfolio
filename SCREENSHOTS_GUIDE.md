# How to Add Screenshots and Project Images (V2)

The portfolio does **not** use legacy files like `src/components/project-sections/ProjectReservo.tsx`. Images are served from **`public/`** and referenced in:

1. **`src/v2/data/projects.v2.ts`** — listing cards: `coverImage`, optional `thumbnails[]`
2. **`src/v2/pages/ProjectDetailV2/ProjectDetailV2.tsx`** — case-study `screens[]` per project slug

Hero portrait on the editorial home is set in **`ClassicRebuildPage.tsx`** (`ClassicHero` `imageSrc`), typically under **`public/assets/projects/`**.

## Folder layout

Place assets next to the rest of the static files:

```
public/
  assets/
    projects/
      reservo/
        main screen.webp          # example: matches projects.v2.ts coverImage
        home.webp
        calendar.webp
        shop.webp
        book summary.webp         # note: filename matches ProjectDetailV2 screens
      startupconnect/
        feed.webp
        …
    johnny_hero.webp              # example hero image (path in ClassicRebuildPage)
  favicon.ico
```

Paths in code use URLs rooted at the site origin, e.g. **`/assets/projects/reservo/home.webp`**.

## Recommended image sizes

### Hero portrait (editorial)

- Reasonable max width ~1200–1600px
- **WebP** preferred; keep file size moderate for LCP

### Project cover (`coverImage`)

- Wide aspect (e.g. 16:9 or similar) works well in cards
- **WebP**, typically under ~500KB when possible

### Case-study screens (`ProjectDetailV2` `screens`)

- Consistent aspect ratio per row
- **WebP** or optimized PNG/JPG

### Thumbnails (`projects.v2.ts` `thumbnails`)

- Small gallery images; keep dimensions consistent for layout

## How to update the code

### 1. Listing + home project cards

Edit **`src/v2/data/projects.v2.ts`**:

```ts
coverImage: '/assets/projects/reservo/main screen.webp',
thumbnails: [
  { src: '/assets/projects/reservo/home.webp', alt: '…' },
  // …
],
```

After adding files under **`public/assets/projects/...`**, the URL in data must match the path **without** `public/` (Vite serves `public/` at `/`).

### 2. Project detail / case-study screens

Edit **`src/v2/pages/ProjectDetailV2/ProjectDetailV2.tsx`**: find the `caseStudiesEn` / `caseStudiesEs` entry for your slug and update each `screens: [{ name, image }, ...]` `image` path.

### 3. Hero image

In **`src/v2/components/ClassicRebuild/ClassicRebuildPage.tsx`**, set:

```tsx
imageSrc="/assets/projects/your-hero.webp"
imageAlt="…"
```

## Tips

1. **Compress** images (e.g. [Squoosh](https://squoosh.app/), `sharp-cli`) before committing.
2. **Naming:** prefer lowercase; if you use spaces in filenames, reference them exactly in TS (e.g. `'book summary.webp'`).
3. **Test:** `npm run dev` and open `/projects/<slug>` to verify every `image` loads.
4. **Git:** add binary assets with a normal commit.

## Quick workflow

1. Add WebP files under **`public/assets/projects/<slug>/`**
2. Update **`projects.v2.ts`** (and **`ProjectDetailV2.tsx`** for case-study screens)
3. Reload the dev server and check listing + detail pages

For a full customization pass, use **`CUSTOMIZATION_CHECKLIST.md`**.
