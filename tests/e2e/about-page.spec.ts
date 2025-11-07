import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test('About page loads correctly', async ({ page }) => {
    await page.goto('/about');

    // Check title
    await expect(page).toHaveTitle(/About/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('About ArtSource Brazil');

    // Check that key sections exist
    await expect(page.locator('h2:has-text("Our Focus")')).toBeVisible();
    await expect(page.locator('h2:has-text("For Companies")')).toBeVisible();
    await expect(page.locator('h2:has-text("For Creative Professionals")')).toBeVisible();
    await expect(page.locator('h2:has-text("Join Our Community")')).toBeVisible();
    await expect(page.locator('h2:has-text("Our Commitment")')).toBeVisible();

    // Check that content is visible
    const paragraphs = page.locator('main p');
    const count = await paragraphs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('About page has proper structure and content', async ({ page }) => {
    await page.goto('/about');

    // Check for mission statement
    await expect(
      page.getByText(/premier job board/i),
    ).toBeVisible();

    // Check for community info
    await expect(page.getByText(/Join Our Community/i)).toBeVisible();
  });

  test('About page CTA button is visible', async ({ page }) => {
    await page.goto('/about');

    // Check for Discord CTA button
    const ctaButton = page.getByRole('link', { name: /Join our Discord/i });
    await expect(ctaButton).toBeVisible();
  });

  test('About page is accessible from footer', async ({ page }) => {
    await page.goto('/');

    // Find about link in footer
    const aboutLink = page.locator('footer a[href="/about"]');
    await expect(aboutLink).toBeVisible();

    // Click and navigate
    await aboutLink.click();
    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1')).toContainText('About');
  });

  test('About page has proper container and spacing', async ({ page }) => {
    await page.goto('/about');

    // Check main container exists
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check prose container exists
    const prose = page.locator('.prose');
    await expect(prose).toBeVisible();
  });
});
