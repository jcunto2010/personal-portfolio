/**
 * Classic mode — phone mock video layout (Reservo + StartupConnect).
 * Validates cover + centering; run on mobile and desktop Playwright projects.
 */

import { test, expect, type Page } from '@playwright/test'

test.describe('Classic mode mock video', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/classic-mode')
  })

  async function assertVideoFillsMock(sectionId: string, page: Page) {
    const section = page.locator(sectionId)
    await section.scrollIntoViewIfNeeded()
    const video = section.locator('video').first()
    await expect(video).toBeVisible({ timeout: 25_000 })

    await page.waitForFunction(
      (id) => {
        const v = document.querySelector(`${id} video`) as HTMLVideoElement | null
        return v != null && v.readyState >= 2 && v.videoWidth > 0
      },
      sectionId,
      { timeout: 30_000 },
    )

    const result = await page.evaluate((id) => {
      const v = document.querySelector(`${id} video`) as HTMLVideoElement | null
      if (!v?.parentElement) return null
      const wrap = v.parentElement
      const vr = v.getBoundingClientRect()
      const wr = wrap.getBoundingClientRect()
      const centerXDrift = Math.abs(vr.left + vr.width / 2 - (wr.left + wr.width / 2))
      const centerYDrift = Math.abs(vr.top + vr.height / 2 - (wr.top + wr.height / 2))
      return {
        coversWidth: vr.width >= wr.width * 0.97,
        coversHeight: vr.height >= wr.height * 0.97,
        centerXDrift,
        centerYDrift,
      }
    }, sectionId)

    expect(result).not.toBeNull()
    expect(result!.coversWidth).toBe(true)
    expect(result!.coversHeight).toBe(true)
    expect(result!.centerXDrift).toBeLessThan(12)
    expect(result!.centerYDrift).toBeLessThan(12)
  }

  test('Reservo — video covers inset mock and stays near center', async ({ page }) => {
    await page.waitForSelector('#chapter-reservo', { timeout: 15_000 })
    await assertVideoFillsMock('#chapter-reservo', page)
  })

  test('StartupConnect — video covers inset mock and stays near center', async ({ page }) => {
    await page.waitForSelector('#chapter-startupconnect', { timeout: 15_000 })
    await assertVideoFillsMock('#chapter-startupconnect', page)
  })
})
