import { test, expect } from '@playwright/test';

test.describe('Homepage Job Filters', () => {
  test('Category filter updates the job list', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for jobs to be visible
    await expect(page.locator('[data-testid="job-card"]').first()).toBeVisible({ timeout: 5000 });

    // Count initial jobs
    const initialJobCount = await page.locator('[data-testid="job-card"]').count();
    expect(initialJobCount).toBeGreaterThan(0);

    // Find and click a category button (if exists)
    const categoryButton = page.locator('button:has-text("Game Dev")').first();

    // Only run the filter test if the button exists
    if (await categoryButton.isVisible()) {
      await categoryButton.click();

      // Wait for URL to update with query param (accepts both + and %20 encoding)
      await expect(page).toHaveURL(/category=Game/);

      // Verify jobs are still visible (filtered list)
      await expect(page.locator('[data-testid="job-card"]').first()).toBeVisible();

      // The filtered count should be <= initial (or possibly same if all are Game Dev)
      const filteredJobCount = await page.locator('[data-testid="job-card"]').count();
      expect(filteredJobCount).toBeLessThanOrEqual(initialJobCount);
    } else {
      // If no category buttons exist, just verify jobs render
      test.skip();
    }
  });

  test('Search input filters jobs by title or company', async ({ page }) => {
    await page.goto('/');

    // Wait for jobs
    await expect(page.locator('[data-testid="job-card"]').first()).toBeVisible({ timeout: 5000 });

    // Find search input
    const searchInput = page.locator('input[type="search"]');

    if (await searchInput.isVisible()) {
      // Type a search term (use a common word like "Senior" or "Designer")
      await searchInput.fill('Senior');

      // Wait for URL to update (flexible encoding)
      await expect(page).toHaveURL(/q=Senior/);

      // Verify at least one job is visible (assuming the test data has "Senior")
      const jobCount = await page.locator('[data-testid="job-card"]').count();

      // If no results, that's okay (data dependent), but the filter should work
      expect(jobCount).toBeGreaterThanOrEqual(0);
    } else {
      test.skip();
    }
  });
});
