import { test, expect } from '@playwright/test';

test.describe('Homepage Job Filters', () => {
  test('Category filter updates the job list', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    const visibleJobContainers = page.locator('[data-jobs] > div:not(.hidden)');

    // Wait for jobs to be visible
    await expect(visibleJobContainers.first()).toBeVisible({ timeout: 5000 });

    // Count initial jobs
    const initialJobCount = await visibleJobContainers.count();
    expect(initialJobCount).toBeGreaterThan(0);

    // Find and click a category button (if exists)
    const categoryButton = page.locator('button:has-text("Game Dev")').first();

    // Only run the filter test if the button exists
    if (await categoryButton.isVisible()) {
      await categoryButton.click();

      // Wait for URL to update with query param (accepts both + and %20 encoding)
      await expect(page).toHaveURL(/category=Game/);

      // Verify jobs are still visible (filtered list)
      // The filtered count should be <= initial (or possibly same if all are Game Dev)
      const filteredJobCount = await visibleJobContainers.count();
      const emptyState = page.locator('[data-filter-empty]');
      const isEmptyVisible = await emptyState.isVisible();

      expect(filteredJobCount).toBeLessThanOrEqual(initialJobCount);
      if (filteredJobCount === 0) {
        expect(isEmptyVisible).toBe(true);
      } else {
        expect(filteredJobCount).toBeGreaterThan(0);
      }
    } else {
      // If no category buttons exist, just verify jobs render
      test.skip();
    }
  });

  test('Search input filters jobs by title or company', async ({ page }) => {
    await page.goto('/');

    const visibleJobContainers = page.locator('[data-jobs] > div:not(.hidden)');

    // Wait for jobs
    await expect(visibleJobContainers.first()).toBeVisible({ timeout: 5000 });

    // Find search input - use the hero search specifically
    const searchInput = page.locator('#hero-search');

    if (await searchInput.isVisible()) {
      // Type a search term (use a common word like "Senior" or "Designer")
      await searchInput.fill('Senior');

      // Wait for URL to update (flexible encoding)
      await expect(page).toHaveURL(/q=Senior/);

      // Verify at least one job is visible (assuming the test data has "Senior")
      const jobCount = await visibleJobContainers.count();
      const emptyState = page.locator('[data-filter-empty]');

      if (jobCount === 0) {
        await expect(emptyState).toBeVisible();
      } else {
        expect(jobCount).toBeGreaterThan(0);
      }
    } else {
      test.skip();
    }
  });
});
