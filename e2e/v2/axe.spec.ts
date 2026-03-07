/**
 * T-006 — Axe accessibility audit for V2 pages
 *
 * Uses @axe-core/playwright to run automated accessibility checks.
 * Only `critical` and `serious` violations block the suite.
 * `moderate` and `minor` violations are reported but do NOT fail the build —
 * they are surfaced as console warnings with [AXE-WARN] prefix.
 *
 * Pages audited:
 *   - Home V2   (#/)
 *   - Projects  (#/projects)
 *   - Reservo.AI detail  (#/projects/reservo-ai)
 *   - StartupConnect detail  (#/projects/startupconnect)
 *
 * Known intentional exclusions (axe `exclude`):
 *   - `.v2-webgl-layer` — canvas element is aria-hidden; axe has a false-positive
 *     on canvas colour-contrast for browsers without a WebGL context.
 *   - `[data-axe-exclude]` — individual components may opt-out with this attr.
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/** Impact levels that block CI. */
const BLOCKING_IMPACTS = ['critical', 'serious'] as const

/**
 * Run an Axe audit on the current page and assert zero critical/serious
 * violations. Returns the full results for optional further assertions.
 */
async function auditPage(page: Parameters<typeof AxeBuilder>[0]) {
  const results = await new AxeBuilder({ page })
    .exclude('[aria-hidden="true"]')   // skip decorative elements
    .exclude('canvas')                  // skip WebGL canvas
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze()

  const blocking = results.violations.filter((v) =>
    BLOCKING_IMPACTS.includes(v.impact as typeof BLOCKING_IMPACTS[number]),
  )

  const nonBlocking = results.violations.filter(
    (v) => !BLOCKING_IMPACTS.includes(v.impact as typeof BLOCKING_IMPACTS[number]),
  )

  if (nonBlocking.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      '[AXE-WARN] Non-blocking violations found (moderate/minor):',
      nonBlocking.map((v) => `${v.id} (${v.impact}) — ${v.description}`),
    )
  }

  return { blocking, nonBlocking, results }
}

/** Format blocking violations into a readable error string. */
function formatViolations(violations: Awaited<ReturnType<typeof auditPage>>['blocking']) {
  return violations
    .map(
      (v) =>
        `\n  [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n` +
        v.nodes
          .slice(0, 3)
          .map((n) => `    → ${n.target.join(', ')}`)
          .join('\n'),
    )
    .join('\n')
}

test.describe('Axe accessibility audit — V2', () => {
  // ── Home V2 ───────────────────────────────────────────────────────────────

  test('Home V2 — zero critical/serious Axe violations', async ({ page }) => {
    await page.goto('')
    await page.waitForSelector('#chapter-intro', { timeout: 15000 })

    // Let animations settle so Axe doesn't flag transitional opacity states
    await page.waitForTimeout(1500)

    const { blocking } = await auditPage(page)

    expect(
      blocking,
      `Critical/serious violations on Home V2:${formatViolations(blocking)}`,
    ).toHaveLength(0)
  })

  // ── Projects listing ──────────────────────────────────────────────────────

  test('Projects page — zero critical/serious Axe violations', async ({ page }) => {
    await page.goto('#/projects')
    await page.waitForSelector('h1, h2', { timeout: 15000 })
    await page.waitForTimeout(1000)

    const { blocking } = await auditPage(page)

    expect(
      blocking,
      `Critical/serious violations on /projects:${formatViolations(blocking)}`,
    ).toHaveLength(0)
  })

  // ── Reservo.AI detail ─────────────────────────────────────────────────────

  test('Reservo.AI detail — zero critical/serious Axe violations', async ({ page }) => {
    await page.goto('#/projects/reservo-ai')
    await page.waitForSelector('h1, h2', { timeout: 15000 })
    await page.waitForTimeout(1000)

    const { blocking } = await auditPage(page)

    expect(
      blocking,
      `Critical/serious violations on /projects/reservo-ai:${formatViolations(blocking)}`,
    ).toHaveLength(0)
  })

  // ── StartupConnect detail ─────────────────────────────────────────────────

  test('StartupConnect detail — zero critical/serious Axe violations', async ({ page }) => {
    await page.goto('#/projects/startupconnect')
    await page.waitForSelector('h1, h2', { timeout: 15000 })
    await page.waitForTimeout(1000)

    const { blocking } = await auditPage(page)

    expect(
      blocking,
      `Critical/serious violations on /projects/startupconnect:${formatViolations(blocking)}`,
    ).toHaveLength(0)
  })
})
