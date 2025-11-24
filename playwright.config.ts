import { defineConfig, devices } from '@playwright/test';

// Disable Astro dev toolbar during automated tests to avoid extra DOM nodes
process.env.ASTRO_DEV_TOOLBAR_ENABLED = 'false';

/**
 * Playwright config for smoke tests.
 * Runs against the Astro preview server (npm run preview).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run tests sequentially to avoid issues
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid race conditions
  reporter: 'list', // More concise output
  timeout: 30000, // 30s timeout per test
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    actionTimeout: 10000, // 10s timeout for actions
    navigationTimeout: 15000, // 15s timeout for navigation
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: true, // Always reuse existing server
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
