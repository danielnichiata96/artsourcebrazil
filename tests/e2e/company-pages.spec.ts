import { test, expect } from '@playwright/test';

test.describe('Company Pages', () => {
  test('Companies listing page loads correctly', async ({ page }) => {
    await page.goto('/companies');

    // Check title
    await expect(page).toHaveTitle(/Companies/);

    // Check main heading
    await expect(
      page.getByRole('heading', { level: 1, name: /Companies Hiring in Brazil/i }),
    ).toBeVisible();

    // Check that company cards are visible
    const companyCards = page.locator('a[href^="/company/"]');
    const count = await companyCards.count();
    expect(count).toBeGreaterThan(0);

    // Check first company card has expected structure
    const firstCard = companyCards.first();
    await expect(firstCard).toBeVisible();
    
    // Check for company logo
    await expect(firstCard.locator('img')).toBeVisible();
    
    // Check for job count text
    await expect(firstCard.getByText(/open position/i)).toBeVisible();
  });

  test('Navigate from companies listing to individual company page', async ({ page }) => {
    await page.goto('/companies');

    // Click on first company card
    const firstCompany = page.locator('a[href^="/company/"]').first();
    const companyName = await firstCompany.locator('h2').textContent();
    
    await firstCompany.click();

    // Should navigate to company page
    await expect(page).toHaveURL(/\/company\//);
    
    // Company name should be in the page heading
    const normalizedName = (companyName ?? '').trim();
    if (normalizedName) {
      const escaped = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await expect(
        page.getByRole('heading', { level: 1, name: new RegExp(escaped, 'i') }),
      ).toBeVisible();
    }
  });

  test('Individual company page shows all jobs from that company', async ({ page }) => {
    await page.goto('/company/pixelstorm');

    // Check page title includes company name
    await expect(page).toHaveTitle(/PixelStorm/);

    // Check company header is visible
    await expect(page.getByRole('heading', { level: 1, name: /PixelStorm/ })).toBeVisible();
    
    // Check company logo is visible (use first() to avoid strict mode)
    await expect(page.locator('img[alt*="PixelStorm"]').first()).toBeVisible();

    // Check that jobs are displayed (look for job links)
    const jobLinks = page.locator('section a[href^="/jobs/"]');
    const jobCount = await jobLinks.count();
    expect(jobCount).toBeGreaterThan(0);

    // Check "Open Positions" heading shows count
    await expect(page.getByRole('heading', { name: /Open Positions/i })).toBeVisible();
  });

  test('Company page has breadcrumb navigation', async ({ page }) => {
    await page.goto('/company/pixelstorm');

    // Check breadcrumbs exist
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();

    // Check Home link
    await expect(breadcrumb.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');

    // Check Companies link
    await expect(breadcrumb.getByRole('link', { name: 'Companies' })).toHaveAttribute(
      'href',
      '/companies',
    );

    // Check current page (not a link)
    await expect(breadcrumb.getByText('PixelStorm')).toBeVisible();
  });

  test('Company page displays category badges', async ({ page }) => {
    await page.goto('/company/pixelstorm');

    // Check that category badges are visible
    // PixelStorm should have "Game Dev" category
    await expect(page.getByText('Game Dev').first()).toBeVisible();
  });

  test('Company page has "View all companies" link', async ({ page }) => {
    await page.goto('/company/pixelstorm');

    // Check for back to companies button
    const backButton = page.getByRole('link', { name: /View all companies|Back to companies/i });
    await expect(backButton).toBeVisible();
    await expect(backButton).toHaveAttribute('href', '/companies');
  });

  test('Company page has Organization JSON-LD', async ({ page }) => {
    await page.goto('/company/pixelstorm');

    // Check for Organization JSON-LD
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toBeTruthy();

    const schema = JSON.parse(jsonLd!);
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('PixelStorm');
    expect(schema.url).toBeTruthy();
  });

  test('Jobs on company page link to individual job pages', async ({ page }) => {
    await page.goto('/company/pixelstorm');

    // Find first job card by looking for links to /jobs/
    const jobLinks = page.locator('a[href^="/jobs/"]');
    const linkCount = await jobLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Get href of first job link
    const href = await jobLinks.first().getAttribute('href');

    // Should link to /jobs/[id]-[slug], not external
    expect(href).toMatch(/^\/jobs\//);
  });

  test('Company listing shows job count', async ({ page }) => {
    await page.goto('/companies');

    // First company card should show job count
    const firstCard = page.locator('a[href^="/company/"]').first();
    const jobCountText = await firstCard.getByText(/\d+ open position/i).textContent();
    
    expect(jobCountText).toMatch(/\d+ open position/i);
  });

  test('Company page CTA button navigates to companies listing', async ({ page }) => {
    await page.goto('/company/pixelstorm');

    // Click "View all companies" button
    const ctaButton = page.getByRole('link', { name: /View all companies/i });
    await ctaButton.click();

    // Should navigate to companies listing
    await expect(page).toHaveURL('/companies');
    await expect(page.getByRole('heading', { level: 1, name: /Companies/i })).toBeVisible();
  });
});
