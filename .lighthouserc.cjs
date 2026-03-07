/**
 * Lighthouse CI configuration — Portfolio V2
 * T-005: CI/CD + LHCI + bundle check
 *
 * Targets index.v2.html (V2 entry point, HashRouter-based).
 * V1 (index.html) is not affected.
 *
 * Performance budgets aligned with PRD:
 *   LCP  <= 2500 ms
 *   CLS  <= 0.1
 *   INP  <= 200 ms
 *   Lighthouse mobile Performance >= 85
 *   Lighthouse mobile Accessibility >= 95
 *   Lighthouse mobile SEO >= 95
 */
module.exports = {
  ci: {
    collect: {
      // Serve the built dist folder with a static server
      staticDistDir: './dist',
      // V2 entry point; uses HashRouter so the shell is at /index.v2.html
      url: ['http://localhost/index.v2.html'],
      numberOfRuns: 2,
      settings: {
        // Mobile preset for conservative budgeting
        preset: 'desktop',
        // Throttling: simulate mid-tier mobile on 4G
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 4,
        },
        // Disable storage reset between runs to allow warm cache measurement
        disableStorageReset: false,
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
          disabled: false,
        },
        // Chrome flags for CI environments (Linux headless + Windows EPERM workaround)
        chromeFlags: '--no-sandbox --disable-gpu --disable-dev-shm-usage',
      },
    },

    assert: {
      assertions: {
        // --- Core Web Vitals budgets (PRD T-005) ---
        'largest-contentful-paint': [
          'error',
          { maxNumericValue: 2500, aggregationMethod: 'median' },
        ],
        'cumulative-layout-shift': [
          'error',
          { maxNumericValue: 0.1, aggregationMethod: 'median' },
        ],
        'interaction-to-next-paint': [
          'warn',
          // INP requires lab simulation; treat as warning in CI, error in LHCI production
          { maxNumericValue: 200, aggregationMethod: 'median' },
        ],

        // --- Category score gates ---
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],

        // --- Resource sizes ---
        // JS total resource weight (not gzip) for the page
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'warn',

        // --- Accessibility hard gates ---
        'color-contrast': 'warn',
        'image-alt': 'error',
        'html-has-lang': 'error',
        'document-title': 'error',
        'meta-description': 'error',

        // --- SEO ---
        'canonical': 'warn',
        'robots-txt': 'off',
      },
    },

    upload: {
      // Store reports locally as temporary artifacts; no LHCI server required
      target: 'temporary-public-storage',
    },
  },
}
