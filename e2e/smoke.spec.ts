import { test, expect } from '@playwright/test'

test('smoke: homepage loads with app root and heading', async ({ page }) => {
  // Bypass EntryGate (same flag as V2 E2E suite)
  await page.goto('/?e2e=1')

  await expect(page.locator('.v2-root')).toBeVisible()
  await page.waitForSelector('#chapter-intro', { timeout: 15000 })

  const heading = page.locator('h1').first()
  await expect(heading).toBeVisible()
})
