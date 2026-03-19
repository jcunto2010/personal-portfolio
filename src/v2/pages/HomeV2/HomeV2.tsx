import { ClassicRebuildPage } from '../../components/ClassicRebuild/ClassicRebuildPage'

/**
 * Home V2 — Cosmic Editorial
 *
 * Real content migrated from V1 sources:
 *   - Hero: src/components/Hero.tsx
 *   - Skills: src/data/skills.ts
 *   - Experience: src/data/experience.ts
 *   - Contact: src/components/Contact.tsx + Footer.tsx
 *
 * Scroll layer (T-002):
 *   - Lenis provides smooth scroll via `useLenis`.
 *   - GSAP + ScrollTrigger reveal animations via `useChapterReveal`.
 *   - Both are disabled when `prefers-reduced-motion: reduce` is active.
 *
 * WebGL ambient layer wired in T-003.
 *
 * Internal chapter navigation uses programmatic scroll (scrollToChapter)
 * instead of native hash anchors. This avoids conflicts with HashRouter,
 * which interprets every `#` fragment as a route path.
 *
 * To deep-link to a chapter, append ?chapter=<id> to the Home route:
 *   #/?chapter=chapter-notes
 */
export default function HomeV2() {
  return <ClassicRebuildPage />
}
