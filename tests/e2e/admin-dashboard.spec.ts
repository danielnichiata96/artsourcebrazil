import { test, expect } from '@playwright/test';

/**
 * E2E tests for Admin Dashboard
 * Tests the job approval/rejection flow
 */

test.describe('Admin Dashboard', () => {
  // We'll skip these tests in CI if ADMIN_TOKEN is not set
  const adminToken = process.env.ADMIN_TOKEN || 'admin123';
  const baseUrl = process.env.BASE_URL || 'http://localhost:4321';

  test.describe('Authentication', () => {
    test('should show login form when not authenticated', async ({ page }) => {
      await page.goto(`${baseUrl}/admin/drafts`);

      // Should see login form
      await expect(page.locator('h1')).toContainText('Admin Login');
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Login');
    });

    test('should login with correct password', async ({ page }) => {
      await page.goto(`${baseUrl}/admin/drafts`);

      // Fill in password
      await page.fill('input[type="password"]', adminToken);
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await page.waitForURL(`${baseUrl}/admin/drafts`);

      // Should see dashboard title
      await expect(page.locator('h1')).toContainText('Aprovação de Vagas');
    });

    test('should reject login with incorrect password', async ({ page }) => {
      await page.goto(`${baseUrl}/admin/drafts`);

      // Fill in wrong password
      await page.fill('input[type="password"]', 'wrongpassword123');
      await page.click('button[type="submit"]');

      // Should stay on login page
      await expect(page.locator('h1')).toContainText('Admin Login');
    });
  });

  test.describe('Dashboard UI', () => {
    test('should display empty state when no drafts', async ({ page, context }) => {
      // Set auth cookie
      await context.addCookies([
        {
          name: 'admin_token',
          value: adminToken,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);

      await page.goto(`${baseUrl}/admin/drafts`);

      // Check for either empty state or draft cards
      const hasEmptyState = await page.locator('text=Nenhuma vaga pendente').isVisible();
      const hasDrafts = await page.locator('.approve-btn').count() > 0;

      // Should have one or the other
      expect(hasEmptyState || hasDrafts).toBe(true);
    });

    test('should display logout button', async ({ page, context }) => {
      await context.addCookies([
        {
          name: 'admin_token',
          value: adminToken,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);

      await page.goto(`${baseUrl}/admin/drafts`);

      // Should see logout button
      await expect(page.locator('button:has-text("Logout")')).toBeVisible();
    });

    test('should show draft count', async ({ page, context }) => {
      await context.addCookies([
        {
          name: 'admin_token',
          value: adminToken,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);

      await page.goto(`${baseUrl}/admin/drafts`);

      // Should display pending count (could be 0)
      const countElement = page.locator('text=Pendentes:').locator('..');
      await expect(countElement).toBeVisible();
    });
  });

  test.describe('Draft Cards', () => {
    test.skip('should display draft information when drafts exist', async ({
      page,
      context,
    }) => {
      // This test is skipped by default as it requires a draft in the database
      // Enable it manually when testing with real data

      await context.addCookies([
        {
          name: 'admin_token',
          value: adminToken,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);

      await page.goto(`${baseUrl}/admin/drafts`);

      // Check if there are any drafts
      const hasDrafts = (await page.locator('.approve-btn').count()) > 0;

      if (hasDrafts) {
        // Should show job title
        await expect(page.locator('.font-display').first()).toBeVisible();

        // Should show approve and reject buttons
        await expect(page.locator('.approve-btn').first()).toBeVisible();
        await expect(page.locator('.reject-btn').first()).toBeVisible();

        // Should show company name
        await expect(page.locator('text=/Pago em/')).toBeVisible();

        // Should show category
        await expect(page.locator('text=Categoria')).toBeVisible();
      }
    });
  });

  test.describe('Actions', () => {
    test.skip('should show confirmation dialog when approving', async ({ page, context }) => {
      // This test is skipped by default as it requires a draft in the database

      await context.addCookies([
        {
          name: 'admin_token',
          value: adminToken,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);

      await page.goto(`${baseUrl}/admin/drafts`);

      const hasDrafts = (await page.locator('.approve-btn').count()) > 0;

      if (hasDrafts) {
        // Set up dialog handler
        page.on('dialog', (dialog) => {
          expect(dialog.message()).toContain('Aprovar');
          dialog.dismiss();
        });

        await page.click('.approve-btn:first-of-type');
      }
    });

    test.skip('should show prompt when rejecting', async ({ page, context }) => {
      // This test is skipped by default as it requires a draft in the database

      await context.addCookies([
        {
          name: 'admin_token',
          value: adminToken,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);

      await page.goto(`${baseUrl}/admin/drafts`);

      const hasDrafts = (await page.locator('.reject-btn').count()) > 0;

      if (hasDrafts) {
        // Set up dialog handler
        page.on('dialog', (dialog) => {
          expect(dialog.message()).toContain('rejeição');
          dialog.dismiss();
        });

        await page.click('.reject-btn:first-of-type');
      }
    });
  });
});

