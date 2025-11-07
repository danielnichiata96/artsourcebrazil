import { test, expect } from '@playwright/test';

test.describe('Legal Pages', () => {
  test('Privacy Policy page loads correctly', async ({ page }) => {
    await page.goto('/privacy');

    // Check title
    await expect(page).toHaveTitle(/Privacy Policy/);

    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Privacy Policy');

    // Check key sections exist
    await expect(page.locator('h2:has-text("Information We Collect")')).toBeVisible();
    await expect(page.locator('h2:has-text("How We Use Your Information")')).toBeVisible();
    await expect(page.locator('h2:has-text("Contact Us")')).toBeVisible();

    // Check effective date is present
    await expect(page.locator('text=/Effective Date:/')).toBeVisible();
  });

  test('Terms of Service page loads correctly', async ({ page }) => {
    await page.goto('/terms');

    // Check title
    await expect(page).toHaveTitle(/Terms of Service/);

    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Terms of Service');

    // Check key sections exist
    await expect(page.locator('h2:has-text("Job Postings")')).toBeVisible();
    await expect(page.locator('h2:has-text("User Conduct")')).toBeVisible();
    await expect(page.locator('h2:has-text("Contact Us")')).toBeVisible();

    // Check link to privacy policy in main content
    const privacyLink = page.locator('main a[href="/privacy"]').first();
    await expect(privacyLink).toBeVisible();
  });

  test('Contact page loads correctly', async ({ page }) => {
    await page.goto('/contact');

    // Check title
    await expect(page).toHaveTitle(/Contact/);

    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Contact Us');

    // Check email link is present (single email for all inquiries)
    await expect(page.locator('main a[href*="mailto:artsourcebrazil@gmail.com"]')).toBeVisible();

    // Check social media section
    await expect(page.locator('h2:has-text("Social Media")')).toBeVisible();
  });

  test('Footer legal links are present and working', async ({ page }) => {
    await page.goto('/');

    // Check footer links exist
    const privacyLink = page.locator('footer a[href="/privacy"]');
    const termsLink = page.locator('footer a[href="/terms"]');
    const contactLink = page.locator('footer a[href="/contact"]');

    await expect(privacyLink).toBeVisible();
    await expect(termsLink).toBeVisible();
    await expect(contactLink).toBeVisible();

    // Test navigation to privacy policy
    await privacyLink.click();
    await expect(page).toHaveURL(/.*\/privacy/);
    await expect(page.locator('h1')).toContainText('Privacy Policy');

    // Go back home
    await page.goto('/');

    // Test navigation to terms
    await termsLink.click();
    await expect(page).toHaveURL(/.*\/terms/);
    await expect(page.locator('h1')).toContainText('Terms of Service');

    // Go back home
    await page.goto('/');

    // Test navigation to contact
    await contactLink.click();
    await expect(page).toHaveURL(/.*\/contact/);
    await expect(page.locator('h1')).toContainText('Contact Us');
  });

  test('Legal pages are linked from each other', async ({ page }) => {
    await page.goto('/privacy');

    // Privacy page should link to terms
    const termsLink = page.locator('text=/Terms of Service|terms/i').first();
    await expect(termsLink).toBeVisible();

    // Check footer links work
    await page.locator('footer a[href="/terms"]').click();
    await expect(page).toHaveURL(/.*\/terms/);

    // Terms should link back to privacy
    await page.locator('a[href="/privacy"]').first().click();
    await expect(page).toHaveURL(/.*\/privacy/);
  });
});
