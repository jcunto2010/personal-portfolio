/**
 * T-006 — V2 route-level navigation tests
 *
 * Covered:
 *   ✓ /classic-mode — editorial page loads with project sections in-page
 *   ✓ Home V2 from classic-mode
 *
 * `?e2e=1` on navigations keeps EntryGate bypassed (query can drop on absolute paths).
 */

import { test, expect } from '@playwright/test'

test.describe('V2 navigation', () => {
  test('/classic-mode loads Reservo and StartupConnect sections', async ({ page }) => {
    await page.goto('/classic-mode?e2e=1')

    await page.waitForSelector('#chapter-reservo', { timeout: 15000 })
    await page.waitForSelector('#chapter-startupconnect', { timeout: 15000 })

    await expect(page.locator('#chapter-reservo')).toBeVisible()
    await expect(page.locator('#chapter-startupconnect')).toBeVisible()
  })

  test('navigating to home returns to Home V2', async ({ page }) => {
    await page.goto('/classic-mode?e2e=1')
    await page.waitForSelector('#chapter-reservo', { timeout: 15000 })

    await page.goto('')
    await page.waitForSelector('#chapter-intro', { timeout: 15000 })

    await expect(page.locator('#chapter-intro')).toBeAttached()
  })
})
