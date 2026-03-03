import { test, expect } from '@playwright/test'

test('smoke: homepage loads with app root and heading', async ({ page }) => {
  await page.goto('/')

  // Stable structural anchor — present regardless of copy changes
  await expect(page.getByTestId('app-root')).toBeVisible()

  // h1 is the most stable semantic heading on the page (Hero section)
  const heading = page.locator('h1').first()
  await expect(heading).toBeVisible()
})
