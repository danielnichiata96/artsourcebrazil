import { test, expect } from '@playwright/test';

test.describe('Post-a-Job Success Page', () => {
  test('Submit Job Details button opens Tally form in new tab', async ({ page }) => {
    // Navigate to the success page
    await page.goto('/post-a-job/success');

    // Verify the page loaded correctly
    await expect(page.getByRole('heading', { level: 1, name: /Thank You/i })).toBeVisible();
    await expect(page.locator('text=Your payment was successful')).toBeVisible();

    // Find the button
    const button = page.locator('a:has-text("Submit Job Details")');
    await expect(button).toBeVisible();

    // Verify the href attribute points to Tally
    const href = await button.getAttribute('href');
    expect(href).toContain('tally.so');

    // Click and verify it opens in a new tab with target="_blank"
    const target = await button.getAttribute('target');
    expect(target).toBe('_blank');

    // Optional: Verify the link would navigate to Tally (without actually opening)
    // This avoids flaky tests with popup blockers
    expect(href).toMatch(/^https:\/\/tally\.so\/r\//);
  });
});
