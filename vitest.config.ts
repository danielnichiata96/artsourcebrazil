import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude E2E tests from Vitest (they run with Playwright)
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    // Only run unit tests (not E2E)
    include: ['tests/**/*.{test,spec}.ts'],
  },
});
