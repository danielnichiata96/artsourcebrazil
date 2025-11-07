import { test, expect } from '@playwright/test';

test.describe('Individual Job Pages', () => {
  test('should load individual job page with correct structure', async ({ page }) => {
    await page.goto('/jobs/a1b2c3d4-e5f6-7890-1234-567890abcdef-senior-game-developer');

    // Check page loaded
    await expect(page).toHaveTitle(/Senior Game Developer/);

    // Check job title is visible
    await expect(page.locator('h1')).toContainText('Senior Game Developer');

    // Check company name (use first() to avoid strict mode violation)
    await expect(page.getByText('PixelStorm').first()).toBeVisible();

    // Check apply button exists
    const applyButton = page.getByRole('link', { name: /Apply for this position/i });
    await expect(applyButton).toBeVisible();
    await expect(applyButton).toHaveAttribute('href', /^http/); // External link
  });

  test('should have breadcrumb navigation', async ({ page }) => {
    await page.goto('/jobs/a1b2c3d4-e5f6-7890-1234-567890abcdef-senior-game-developer');

    // Check breadcrumbs exist
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();

    // Check Home link
    await expect(breadcrumb.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');

    // Check Category link
    const categoryLink = breadcrumb.getByRole('link', { name: /Game Dev/i });
    await expect(categoryLink).toBeVisible();
    await expect(categoryLink).toHaveAttribute('href', '/category/game-dev');

    // Check current page (not a link)
    await expect(breadcrumb.getByText('Senior Game Developer')).toBeVisible();
  });

  test('should show related jobs in same category', async ({ page }) => {
    await page.goto('/jobs/a1b2c3d4-e5f6-7890-1234-567890abcdef-senior-game-developer');

    // Check related jobs section exists
    await expect(page.getByText(/More Game Dev opportunities/i)).toBeVisible();

    // Check that related job cards are present
    const relatedJobCards = page.locator('[data-testid="related-job-card"]');
    const count = await relatedJobCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(3); // Max 3 related jobs
  });

  test('should link from homepage JobCard to individual job page', async ({ page }) => {
    await page.goto('/');

    // Click on a job title from JobCard
    const jobLink = page.getByRole('link', { name: 'Senior Game Developer' }).first();
    await expect(jobLink).toBeVisible();

    // Should link to individual page, not external apply link
    await expect(jobLink).toHaveAttribute('href', /^\/jobs\//);
    await jobLink.click();

    // Should navigate to individual job page
    await expect(page).toHaveURL(
      /\/jobs\/a1b2c3d4-e5f6-7890-1234-567890abcdef-senior-game-developer/,
    );
    await expect(page.locator('h1')).toContainText('Senior Game Developer');
  });

  test('should have JobPosting JSON-LD structured data', async ({ page }) => {
    await page.goto('/jobs/a1b2c3d4-e5f6-7890-1234-567890abcdef-senior-game-developer');

    // Check for JobPosting JSON-LD
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toBeTruthy();

    const schema = JSON.parse(jsonLd!);
    expect(schema['@type']).toBe('JobPosting');
    expect(schema.title).toBe('Senior Game Developer');
    expect(schema.hiringOrganization.name).toBe('PixelStorm');
    expect(schema.jobLocationType).toBe('TELECOMMUTE');
    expect(schema.employmentType).toBe('CONTRACTOR');
    expect(schema.validThrough).toBeTruthy(); // Should have expiration date
  });

  test('should have BreadcrumbList JSON-LD structured data', async ({ page }) => {
    await page.goto('/jobs/a1b2c3d4-e5f6-7890-1234-567890abcdef-senior-game-developer');

    // Check for BreadcrumbList JSON-LD
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    const jsonLdContents = await Promise.all(jsonLdScripts.map((script) => script.textContent()));

    const breadcrumbSchema = jsonLdContents
      .map((content) => (content ? JSON.parse(content) : null))
      .find((schema) => schema?.['@type'] === 'BreadcrumbList');

    expect(breadcrumbSchema).toBeTruthy();
    expect(breadcrumbSchema!.itemListElement).toHaveLength(3);
    expect(breadcrumbSchema!.itemListElement[0].name).toBe('Home');
    expect(breadcrumbSchema!.itemListElement[1].name).toBe('Game Dev');
    expect(breadcrumbSchema!.itemListElement[2].name).toBe('Senior Game Developer');
  });

  test('should show job tags and meta information', async ({ page }) => {
    await page.goto('/jobs/a1b2c3d4-e5f6-7890-1234-567890abcdef-senior-game-developer');

    // Check tags are visible (use first() to avoid strict mode violation)
    await expect(page.getByText('Unity').first()).toBeVisible();
    await expect(page.getByText('C#').first()).toBeVisible();

    // Check meta info
    await expect(page.getByText(/Remote \(Brazil\)/i)).toBeVisible();
    await expect(page.getByText(/Posted/i).first()).toBeVisible();
    await expect(page.getByText('Game Dev').first()).toBeVisible();
  });

  test('should have multiple apply CTAs', async ({ page }) => {
    await page.goto('/jobs/a1b2c3d4-e5f6-7890-1234-567890abcdef-senior-game-developer');

    // Should have at least 2 apply buttons (header + bottom CTA)
    const applyButtons = page.getByRole('link', { name: /Apply/i });
    const count = await applyButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // All apply buttons should link externally
    const allButtons = await applyButtons.all();
    for (const button of allButtons) {
      const href = await button.getAttribute('href');
      expect(href).toMatch(/^http/);
    }
  });
});
