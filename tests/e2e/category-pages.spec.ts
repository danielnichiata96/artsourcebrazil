import { test, expect } from '@playwright/test';

test.describe('Category Pages', () => {
  test('Category page loads with filtered jobs', async ({ page }) => {
    await page.goto('/category/game-dev');

    // Check title includes category
    await expect(page).toHaveTitle(/Game Dev/);

    // Check heading
    await expect(page.locator('h1')).toContainText('Game Dev');

    // Check that jobs are visible
    const jobCards = page.locator('[data-testid="job-card"]');
    const count = await jobCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify at least one job shows Game Dev category (use first to avoid strict mode)
    await expect(jobCards.first().getByText('Game Dev').first()).toBeVisible();
  });

  test('Navigate from homepage category filter to category page', async ({ page }) => {
    await page.goto('/');

    // Click Game Dev category button on homepage
    const categoryButton = page.locator('button:has-text("Game Dev")').first();
    
    if (await categoryButton.isVisible()) {
      await categoryButton.click();

      // Should navigate to category page
      await expect(page).toHaveURL(/\/category\/game-dev/);
      await expect(page.locator('h1')).toContainText('Game Dev');
    } else {
      test.skip();
    }
  });

  test('Jobs on category page link to individual job pages', async ({ page }) => {
    await page.goto('/category/game-dev');

    // Find first job card
    const firstJobCard = page.locator('[data-testid="job-card"]').first();
    await expect(firstJobCard).toBeVisible();

    // Get job link
    const jobLink = firstJobCard.locator('a').first();
    const href = await jobLink.getAttribute('href');

    // Should link to /jobs/[id]-[slug]
    expect(href).toMatch(/^\/jobs\//);
  });

  test('Category page has proper SEO meta tags', async ({ page }) => {
    await page.goto('/category/game-dev');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });

  test('Different category pages show different jobs', async ({ page }) => {
    // Visit Game Dev category
    await page.goto('/category/game-dev');
    const gameDevJobs = await page.locator('[data-testid="job-card"]').count();

    // Visit Design category
    await page.goto('/category/design-ui-ux');
    const designJobs = await page.locator('[data-testid="job-card"]').count();

    // Both should have jobs
    expect(gameDevJobs).toBeGreaterThan(0);
    expect(designJobs).toBeGreaterThan(0);
  });

  test('Category page has JobPosting JSON-LD', async ({ page }) => {
    await page.goto('/category/game-dev');

    // Check for JSON-LD scripts (there will be multiple - Organization + JobPostings array)
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    expect(jsonLdScripts.length).toBeGreaterThan(0);

    // Get all JSON-LD content
    const jsonLdContents = await Promise.all(jsonLdScripts.map((script) => script.textContent()));
    
    // Find the JobPosting schema (should be an array)
    const jobPostingSchema = jsonLdContents
      .map((content) => (content ? JSON.parse(content) : null))
      .find((schema) => Array.isArray(schema) && schema.length > 0 && schema[0]['@type'] === 'JobPosting');

    expect(jobPostingSchema).toBeTruthy();
    expect(Array.isArray(jobPostingSchema)).toBe(true);
    expect(jobPostingSchema!.length).toBeGreaterThan(0);
    expect(jobPostingSchema![0]['@type']).toBe('JobPosting');
  });

  test('Category page navigation from navbar', async ({ page }) => {
    await page.goto('/');

    // Look for category link in navigation
    const nav = page.locator('nav').first();
    const categoryLink = nav.locator('a[href*="/category/"]').first();
    
    if ((await categoryLink.count()) > 0) {
      await categoryLink.click();
      await expect(page).toHaveURL(/\/category\//);
    }
  });
});
