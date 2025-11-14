import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.describe('Homepage', () => {
    test('should not have any automatically detectable accessibility issues', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no color contrast issues', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['cat.color'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper keyboard navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['cat.keyboard'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Job Details Page', () => {
    test('should not have any automatically detectable accessibility issues', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      // Click on first job card to go to details page
      const firstJobLink = page.locator('[data-testid="job-card"] a').first();
      await firstJobLink.click();

      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('About Page', () => {
    test('should not have any automatically detectable accessibility issues', async ({
      page,
    }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Companies Page', () => {
    test('should not have any automatically detectable accessibility issues', async ({
      page,
    }) => {
      await page.goto('/companies');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Blog Page', () => {
    test('should not have any automatically detectable accessibility issues', async ({
      page,
    }) => {
      await page.goto('/blog');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Category Page', () => {
    test('should not have any automatically detectable accessibility issues', async ({
      page,
    }) => {
      await page.goto('/category/game-dev');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Post a Job Page', () => {
    test('should not have any automatically detectable accessibility issues', async ({
      page,
    }) => {
      await page.goto('/post-a-job');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Legal Pages', () => {
    test('Privacy page should not have accessibility issues', async ({ page }) => {
      await page.goto('/privacy');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Terms page should not have accessibility issues', async ({ page }) => {
      await page.goto('/terms');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Contact page should not have accessibility issues', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Forms Accessibility', () => {
    test('search form should be accessible', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      // Focus on search input
      const searchInput = page.locator('#job-search-sidebar');
      await searchInput.focus();

      // Check if it has proper labels and ARIA attributes
      await expect(searchInput).toHaveAttribute('aria-label');
    });

    test('filter sidebar should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      // Tab through sidebar elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Check that focused element is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['cat.keyboard'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('interactive elements should be keyboard accessible', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      // Test that buttons and links are reachable via keyboard
      await page.keyboard.press('Tab');
      const firstFocusable = page.locator(':focus');
      await expect(firstFocusable).toBeVisible();

      // Tab through multiple elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const currentFocus = page.locator(':focus');
        await expect(currentFocus).toBeVisible();
      }
    });
  });

  test.describe('ARIA Labels and Roles', () => {
    test('navigation should have proper ARIA labels', async ({ page }) => {
      await page.goto('/');

      const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
      await expect(mainNav).toBeVisible();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('nav')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('buttons should have accessible names', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['button-name'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('links should have accessible names', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['link-name'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('images should have alt text', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['image-alt'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Heading Hierarchy', () => {
    test('should have proper heading order', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['heading-order'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Landmark Regions', () => {
    test('should have proper landmark regions', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="job-card"]');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['region'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});
