import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration — V1 smoke + V2 E2E suite.
 *
 * FLAKINESS POLICY (T-006):
 *  - `retries: 1` in local mode, `retries: 2` in CI.
 *  - If a test fails on its first retry it is reported explicitly with [FLAKY].
 *  - Flaky tests MUST NOT be silently skipped or marked `.fixme` without a
 *    linked issue. Use `test.skip(true, 'reason + issue-url')` if temporarily
 *    disabled, so the skip is visible in the report.
 *  - Intermittent failures in V2 animation/WebGL assertions are expected on
 *    low-powered CI runners; those tests carry a higher timeout (20 s) and
 *    rely on `data-testid` anchors rather than visual snapshots.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // Retry once locally; twice in CI so transient network issues don't block.
  retries: process.env.CI ? 2 : 1,

  workers: process.env.CI ? 1 : undefined,

  // HTML reporter gives a shareable artifact; list gives live console output.
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : 'list',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    // Screenshot on failure helps diagnose flakes in CI.
    screenshot: 'only-on-failure',
  },

  projects: [
    // ── V1 smoke tests ────────────────────────────────────────────────────
    {
      name: 'v1-chromium-desktop',
      testMatch: 'e2e/smoke.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'v1-mobile-chrome',
      testMatch: 'e2e/smoke.spec.ts',
      use: { ...devices['Pixel 5'] },
    },

    // ── V2 E2E tests ──────────────────────────────────────────────────────
    {
      name: 'v2-chromium-desktop',
      testMatch: 'e2e/v2/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // V2 is served at index.v2.html
        baseURL: 'http://localhost:5173/index.v2.html',
      },
    },
    {
      name: 'v2-mobile-chrome',
      testMatch: 'e2e/v2/**/*.spec.ts',
      use: {
        ...devices['Pixel 5'],
        baseURL: 'http://localhost:5173/index.v2.html',
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
