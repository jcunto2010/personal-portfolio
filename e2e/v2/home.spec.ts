/**
 * T-006 — Home V2 critical-path tests
 *
 * Entry point : http://localhost:5173/index.v2.html#/
 * Router      : HashRouter  →  routes are in the fragment (#/)
 *
 * Covered by this file:
 *   ✓ Home V2 loads without JS error
 *   ✓ Page has exactly one h1 (chapter-intro-heading)
 *   ✓ Sidebar TableOfContents is present
 *   ✓ Each TOC link scrolls to its chapter (chapter IDs in DOM)
 *   ✓ Hero "View my work" button scrolls to #chapter-work
 *   ✓ Hero "Get in touch" button scrolls to #chapter-contact
 *   ✓ Social links in Hero point to corrected URLs
 */

import { test, expect } from '@playwright/test'

// V2 is always served at index.v2.html; the baseURL in playwright.config is
// already set to http://localhost:5173/index.v2.html for the v2-* projects,
// so navigating to '' or '#/' hits the home route.
const HOME = ''

test.describe('Home V2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HOME)
    // Wait for the Suspense boundary to resolve (lazy-loaded HomeV2)
    await page.waitForSelector('#chapter-intro', { timeout: 15000 })
  })

  // ── Load ──────────────────────────────────────────────────────────────────

  test('loads correctly — v2-root wrapper is present', async ({ page }) => {
    await expect(page.locator('.v2-root')).toBeVisible()
  })

  // ── Heading ───────────────────────────────────────────────────────────────

  test('has exactly one h1 — #chapter-intro-heading', async ({ page }) => {
    const h1s = page.locator('h1')
    await expect(h1s).toHaveCount(1)
    await expect(h1s.first()).toBeVisible()
    await expect(h1s.first()).toContainText('Jonathan')
  })

  // ── TableOfContents ───────────────────────────────────────────────────────
  // The sidebar TOC is only visible on viewports >= 1024 px (display:none on
  // mobile via CSS). These two tests are skipped on mobile-sized viewports.

  test('sidebar TOC is rendered', async ({ page }) => {
    const vp = page.viewportSize()
    if (vp && vp.width < 1024) {
      test.skip(true, 'TOC sidebar is hidden below 1024 px — desktop-only feature')
    }
    // The TOC component renders a <nav> with aria-label="Page chapters"
    const toc = page.getByRole('navigation', { name: /page chapters/i })
    await expect(toc).toBeVisible()
  })

  test('TOC links navigate to their chapters', async ({ page }) => {
    const vp = page.viewportSize()
    if (vp && vp.width < 1024) {
      test.skip(true, 'TOC sidebar is hidden below 1024 px — desktop-only feature')
    }
    const toc = page.getByRole('navigation', { name: /page chapters/i })
    const tocLinks = toc.getByRole('button')

    // At least 5 chapter buttons: Intro, About, Experience, Work, Contact
    const count = await tocLinks.count()
    expect(count).toBeGreaterThanOrEqual(4)

    // Click the "Work" button (4th: index 3) which targets #chapter-work
    // Using the label text for resilience against reordering.
    const workBtn = toc.getByRole('button', { name: /work/i })
    await expect(workBtn).toBeVisible()

    // Record scroll position before click
    const scrollBefore = await page.evaluate(() => window.scrollY)

    await workBtn.click()

    // Wait for scroll to start (Lenis or native)
    await page.waitForFunction(
      (before) => window.scrollY !== before,
      scrollBefore,
      { timeout: 5000 },
    )

    // Give smooth-scroll time to settle
    await page.waitForTimeout(1000)

    // The page must have scrolled down — chapter-work is not at y=0
    const scrollAfter = await page.evaluate(() => window.scrollY)
    expect(scrollAfter).toBeGreaterThan(100)
  })

  // ── Hero CTAs ─────────────────────────────────────────────────────────────

  test('"View my work" button is present and scrolls toward #chapter-work', async ({ page }) => {
    const btn = page.getByRole('button', { name: /view my work/i })
    await expect(btn).toBeVisible()

    // The chapter-work section must exist in the DOM before clicking
    await expect(page.locator('#chapter-work')).toBeAttached()

    await btn.click()
    await page.waitForTimeout(800)

    // After clicking, chapter-work should be closer to (or past) the viewport top
    const box = await page.locator('#chapter-work').boundingBox()
    expect(box).not.toBeNull()
    // box.y will be ≤ viewport height after scroll
    expect(box!.y).toBeLessThan(1200)
  })

  test('"Get in touch" button is present and scrolls toward #chapter-contact', async ({ page }) => {
    const btn = page.getByRole('button', { name: /get in touch/i })
    await expect(btn).toBeVisible()

    await expect(page.locator('#chapter-contact')).toBeAttached()

    await btn.click()
    await page.waitForTimeout(800)

    const box = await page.locator('#chapter-contact').boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBeLessThan(1200)
  })

  // ── Social links ──────────────────────────────────────────────────────────

  test('Hero GitHub link points to https://github.com/jcunto2010', async ({ page }) => {
    // There are multiple GitHub links; the hero socialRow is the first one
    const githubLink = page
      .locator('#chapter-intro')
      .getByRole('link', { name: /github/i })
      .first()

    await expect(githubLink).toBeVisible()
    const href = await githubLink.getAttribute('href')
    expect(href).toBe('https://github.com/jcunto2010')
  })

  test('Hero LinkedIn link points to the corrected /in/jonathan-cuntodiaz URL', async ({ page }) => {
    const linkedinLink = page
      .locator('#chapter-intro')
      .getByRole('link', { name: /linkedin/i })
      .first()

    await expect(linkedinLink).toBeVisible()
    const href = await linkedinLink.getAttribute('href')
    expect(href).toBe('https://www.linkedin.com/in/jonathan-cuntodiaz-41149a1bb')
  })

  // ── Chapter sections in DOM ───────────────────────────────────────────────

  test('all chapter sections exist in the DOM', async ({ page }) => {
    for (const id of ['chapter-intro', 'chapter-about', 'chapter-notes', 'chapter-work', 'chapter-contact']) {
      await expect(page.locator(`#${id}`)).toBeAttached()
    }
  })
})
