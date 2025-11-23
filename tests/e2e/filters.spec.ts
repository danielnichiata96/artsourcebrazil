import { test, expect } from '@playwright/test';

test.describe('Filter Sidebar - Main Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport to ensure sidebar is visible
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    // Wait for jobs to load
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should display filter sidebar with categories and tags', async ({ page }) => {
    // Check search input
    await expect(page.locator('#search-input')).toBeVisible();

    // Check category filters container
    await expect(page.locator('#category-filters')).toBeVisible();

    // Check tag filters container
    await expect(page.locator('#tag-filters')).toBeVisible();
  });

  test('should show initial job count', async ({ page }) => {
    const countElement = page.locator('#job-count');
    const count = await countElement.textContent();
    expect(parseInt(count || '0')).toBeGreaterThan(0);
  });
});

test.describe('Filter Sidebar - Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should filter jobs by search query', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const initialCount = await page.locator('[data-testid="job-card"]').count();

    // Search for specific term (assuming "Unity" or similar exists in mock data or page)
    // We'll use a term likely to exist or pick one from the first card
    const firstCardTitle = await page.locator('[data-testid="job-card"]').first().getAttribute('data-title');
    const searchTerm = firstCardTitle?.split(' ')[0] || 'Artist';

    await searchInput.fill(searchTerm);
    // Filter happens on input, no enter needed, but wait a bit
    await page.waitForTimeout(500);

    const filteredCount = await page.locator('[data-testid="job-card"]:visible').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should show no results message for non-existent search', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    await searchInput.fill('NonExistentJobTitleXYZ123');
    await page.waitForTimeout(500);

    const emptyState = page.locator('#empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).not.toHaveClass(/hidden/);
  });

  test('should clear search and show all jobs', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const initialCount = await page.locator('[data-testid="job-card"]').count();

    // Apply search
    await searchInput.fill('NonExistentJobTitleXYZ123');
    await page.waitForTimeout(500);

    // Verify empty state
    await expect(page.locator('#empty-state')).toBeVisible();

    // Click Reset button in empty state
    await page.locator('#clear-filters').click();
    await page.waitForTimeout(500);

    // Should show all jobs again
    const visibleJobs = await page.locator('[data-testid="job-card"]:visible').count();
    expect(visibleJobs).toBe(initialCount);
    await expect(searchInput).toHaveValue('');
  });
});

test.describe('Filter Sidebar - Category Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should filter jobs by category', async ({ page }) => {
    // Find a category that is not "All Disciplines"
    // The first radio is "all", let's pick the second one
    const categoryRadio = page.locator('#category-filters input[type="radio"]').nth(1);
    const categoryValue = await categoryRadio.getAttribute('value');

    await categoryRadio.check();
    await page.waitForTimeout(500);

    // Check that visible jobs match the category
    const visibleJobs = page.locator('[data-testid="job-card"]:visible');
    const count = await visibleJobs.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const job = visibleJobs.nth(i);
      const category = await job.getAttribute('data-category');
      expect(category).toBe(categoryValue);
    }
  });
});

test.describe('Filter Sidebar - Tag Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should filter jobs by tag', async ({ page }) => {
    // Click the first tag
    const firstTagBtn = page.locator('.tag-filter').first();
    const tagName = await firstTagBtn.textContent();

    await firstTagBtn.click();
    await page.waitForTimeout(500);

    // Verify tag button style changes (bg-ink text-white)
    await expect(firstTagBtn).toHaveClass(/bg-ink/);
    await expect(firstTagBtn).toHaveClass(/text-white/);

    // Verify filtered jobs contain the tag
    const visibleJobs = page.locator('[data-testid="job-card"]:visible');
    const count = await visibleJobs.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const job = visibleJobs.nth(i);
      const tags = await job.getAttribute('data-tags');
      expect(tags).toContain(tagName?.toLowerCase());
    }
  });

  test('should toggle tag filter off', async ({ page }) => {
    const firstTagBtn = page.locator('.tag-filter').first();

    // Click on
    await firstTagBtn.click();
    await expect(firstTagBtn).toHaveClass(/bg-ink/);

    // Click off
    await firstTagBtn.click();
    await expect(firstTagBtn).not.toHaveClass(/bg-ink/);
    await expect(firstTagBtn).toHaveClass(/bg-white/);
  });
});
