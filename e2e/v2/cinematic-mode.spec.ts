/**
 * `/cinematic-mode` — same HomeV2Shell as `/`, but skips the Entry Gate and enters
 * immersive SolarScene directly (audio off). Use for automated tests that need WebGL.
 *
 * baseURL for v2-* projects is `http://localhost:5173/?e2e=1`; a plain
 * `page.goto('/cinematic-mode')` resolves to `/cinematic-mode` without the query,
 * which is fine (cinematic route does not rely on `?e2e=1`).
 */

import { test, expect } from '@playwright/test'

test.describe('Cinematic mode (immersive)', () => {
  test('loads Solar region and canvas without Entry Gate', async ({ page }) => {
    await page.goto('/cinematic-mode')

    await expect(page.locator('.v2-root')).toBeVisible()

    const solarRegion = page.getByRole('region', {
      name: /Solar system experience|Experiencia solar/i,
    })
    await expect(solarRegion).toBeVisible({ timeout: 30000 })

    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30000 })

    await expect(
      page.getByRole('dialog', { name: /portfolio entry|entrada al portafolio/i }),
    ).toHaveCount(0)
  })
})
