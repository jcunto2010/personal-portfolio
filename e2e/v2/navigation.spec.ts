/**
 * T-006 — V2 route-level navigation tests
 *
 * Covered:
 *   ✓ /projects  — ProjectsV2 page loads
 *   ✓ /projects/reservo-ai  — ProjectDetailV2 loads with correct title
 *   ✓ /projects/startupconnect  — ProjectDetailV2 loads with correct title
 *   ✓ Back-navigation from a project detail returns to /projects
 *
 * `?e2e=1` on navigations keeps EntryGate bypassed (query can drop on absolute paths).
 */

import { test, expect } from '@playwright/test'

test.describe('V2 navigation', () => {
  // ── /projects ─────────────────────────────────────────────────────────────

  test('/projects loads the projects listing page', async ({ page }) => {
    await page.goto('/projects?e2e=1')

    // Wait for the lazy chunk to arrive
    await page.waitForSelector('h1', { timeout: 15000 })

    // The projects page h1 is "Selected work"; an eyebrow <p> shows "Projects"
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    await expect(heading).toContainText(/selected work/i)
  })

  // ── /projects/reservo-ai ──────────────────────────────────────────────────

  test('/projects/reservo-ai loads the Reservo.AI detail page', async ({ page }) => {
    await page.goto('/projects/reservo-ai?e2e=1')

    await page.waitForSelector('h1, h2', { timeout: 15000 })

    const heading = page
      .locator('h1, h2')
      .filter({ hasText: /reservo/i })
      .first()
    await expect(heading).toBeVisible()
  })

  // ── /projects/startupconnect ──────────────────────────────────────────────

  test('/projects/startupconnect loads the StartupConnect detail page', async ({ page }) => {
    await page.goto('/projects/startupconnect?e2e=1')

    await page.waitForSelector('h1, h2', { timeout: 15000 })

    const heading = page
      .locator('h1, h2')
      .filter({ hasText: /startupconnect/i })
      .first()
    await expect(heading).toBeVisible()
  })

  // ── Back navigation ───────────────────────────────────────────────────────

  test('browser back from project detail returns to /projects', async ({ page }) => {
    // Start at the projects listing
    await page.goto('/projects?e2e=1')
    await page.waitForSelector('h1, h2', { timeout: 15000 })

    await page.goto('/projects/reservo-ai?e2e=1')
    await page.waitForSelector('h1, h2', { timeout: 15000 })

    await page.goBack()
    await page.waitForTimeout(500)

    expect(new URL(page.url()).pathname).toBe('/projects')
  })

  // ── Home link from projects ───────────────────────────────────────────────

  test('navigating to home returns to Home V2', async ({ page }) => {
    await page.goto('/projects?e2e=1')
    await page.waitForSelector('h1, h2', { timeout: 15000 })

    await page.goto('')
    await page.waitForSelector('#chapter-intro', { timeout: 15000 })

    await expect(page.locator('#chapter-intro')).toBeAttached()
  })
})
