/**
 * T-006 — prefers-reduced-motion tests for V2
 *
 * Strategy:
 *   Playwright exposes `reducedMotion: 'reduce'` in the browser context,
 *   which sets `prefers-reduced-motion: reduce` at the OS emulation level.
 *   The V2 `useReducedMotion` hook reads this media query and disables Lenis
 *   + GSAP animations when active.
 *
 * What we can verify at E2E level (without visual snapshots):
 *   ✓ Page loads correctly with reduced-motion ON
 *   ✓ Content is fully readable — no h1 disappears behind an animation
 *   ✓ The `data-reduced-motion` attribute (or absence of .lenis-smooth class)
 *     confirms Lenis was NOT initialised
 *   ✓ CTAs still function (scroll still works, just without Lenis easing)
 *   ✓ Chapters are NOT hidden — no `opacity: 0` or `visibility: hidden`
 *     sticking on any chapter section
 *
 * Note: Lenis adds class `lenis lenis-smooth` to <html> when active.
 * With reduced-motion ON, that class must NOT be present.
 */

import { test, expect } from '@playwright/test'

test.describe('prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test.beforeEach(async ({ page }) => {
    await page.goto('')
    await page.waitForSelector('#chapter-intro', { timeout: 15000 })
  })

  test('page loads and h1 is visible with reduced-motion', async ({ page }) => {
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    await expect(h1).toContainText('Jonathan')
  })

  test('Lenis smooth-scroll class is NOT applied when reduced-motion is active', async ({ page }) => {
    // When Lenis initialises it adds `lenis lenis-smooth` to <html>.
    // With reduced-motion ON, useLenis() returns early — no class should appear.
    const html = page.locator('html')

    // Give the app 2 s to fully hydrate, then assert
    await page.waitForTimeout(2000)

    const cls = await html.getAttribute('class') ?? ''
    expect(cls).not.toContain('lenis-smooth')
  })

  test('all chapter sections are visible (not opacity:0 from stale animation)', async ({ page }) => {
    const ids = ['chapter-about', 'chapter-notes', 'chapter-work', 'chapter-contact']
    for (const id of ids) {
      const el = page.locator(`#${id}`)
      await expect(el).toBeAttached()

      const opacity = await el.evaluate((node) =>
        parseFloat(window.getComputedStyle(node).opacity),
      )
      // With reduced-motion, GSAP reveal animations must not leave opacity < 1
      expect(opacity).toBeGreaterThan(0.9)
    }
  })

  test('"View my work" CTA still works without smooth scroll', async ({ page }) => {
    const btn = page.getByRole('button', { name: /view my work/i })
    await expect(btn).toBeVisible()
    await btn.click()

    // Native scrollIntoView should still bring chapter-work into view
    await page.waitForTimeout(500)
    const box = await page.locator('#chapter-work').boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBeLessThan(1200)
  })

  test('"Get in touch" CTA still works without smooth scroll', async ({ page }) => {
    const btn = page.getByRole('button', { name: /get in touch/i })
    await expect(btn).toBeVisible()
    await btn.click()

    await page.waitForTimeout(500)
    const box = await page.locator('#chapter-contact').boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBeLessThan(1200)
  })
})
