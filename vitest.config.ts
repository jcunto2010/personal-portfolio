import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    /** V1 unit tests removed; allow `vitest run` in CI until V2 adds tests under `src/`. */
    passWithNoTests: true,
  },
})
