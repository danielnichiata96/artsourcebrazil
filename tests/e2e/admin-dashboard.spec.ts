import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * E2E tests for Admin Dashboard
 * Tests the job approval/rejection flow
 * 
 * Uses authenticated storage state for dashboard tests
 */

const adminToken = process.env.ADMIN_TOKEN || 'admin123';
const baseUrl = 'http://localhost:4321';

test.describe('Admin Dashboard - Unauthenticated', () => {
  // Set shorter timeout for admin tests
  test.setTimeout(15000);

  test('should show login form when not authenticated', async ({ page }) => {
    await page.goto(`${baseUrl}/admin/drafts`, { waitUntil: 'domcontentloaded' });

    // Should see login form - look for specific heading
    const loginHeading = page.locator('h1:has-text("Admin Login")');
    await expect(loginHeading).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input#password[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });

  test('should reject login with incorrect password', async ({ page }) => {
    await page.goto(`${baseUrl}/admin/drafts`, { waitUntil: 'domcontentloaded' });

    // Fill in wrong password
    await page.fill('input#password[type="password"]', 'wrongpassword123');
    await page.locator('button:has-text("Login")').click();

    // Wait a bit for any potential redirect (shouldn't happen)
    await page.waitForTimeout(1000);

    // Should still be on login page
    const loginHeading = page.locator('h1:has-text("Admin Login")');
    await expect(loginHeading).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input#password[type="password"]')).toBeVisible();
  });
});

// Tests that require authentication
test.describe('Admin Dashboard - Authenticated', () => {
  // Use authenticated state for these tests
  test.use({ 
    storageState: path.join(__dirname, '../../playwright/.auth/admin.json') 
  });

  test.setTimeout(15000);

  test('should display dashboard when authenticated', async ({ page }) => {
    await page.goto(`${baseUrl}/admin/drafts`, { waitUntil: 'domcontentloaded' });

    // Should see dashboard (not login form)
    const dashboardHeading = page.locator('h1:has-text("Aprovação de Vagas")');
    await expect(dashboardHeading).toBeVisible({ timeout: 5000 });

    // Should not see login form
    await expect(page.locator('h1:has-text("Admin Login")')).not.toBeVisible();
  });

  test('should show empty state or draft cards', async ({ page }) => {
    await page.goto(`${baseUrl}/admin/drafts`, { waitUntil: 'domcontentloaded' });

    // Check page shows either empty state or draft cards
    const hasEmptyState = await page.locator('text=Nenhuma vaga pendente').isVisible({ timeout: 3000 }).catch(() => false);
    const hasDrafts = (await page.locator('button:has-text("Aprovar")').count()) > 0;

    // Should have one or the other
    expect(hasEmptyState || hasDrafts).toBe(true);
  });

  test('should display logout button', async ({ page }) => {
    await page.goto(`${baseUrl}/admin/drafts`, { waitUntil: 'domcontentloaded' });

    // Should see logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible({ timeout: 5000 });
  });

  test('should display pending drafts count', async ({ page }) => {
    await page.goto(`${baseUrl}/admin/drafts`, { waitUntil: 'domcontentloaded' });

    // Should see "Pendentes:" label with count
    await expect(page.locator('text=/Pendentes:/')).toBeVisible({ timeout: 5000 });
  });
});

  // Skip tests that require database data by default
  // Uncomment and run manually when testing with populated database
  test.describe.skip('Draft Cards (requires DB data)', () => {
    test('should display draft information when drafts exist', async ({
      page,
      context,
    }) => {
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

      await page.goto(`${baseUrl}/admin/drafts`, { waitUntil: 'networkidle', timeout: 10000 });

      // Check if there are any drafts
      const hasDrafts = (await page.locator('.approve-btn').count()) > 0;

      if (hasDrafts) {
        // Should show job title
        await expect(page.locator('.font-display').first()).toBeVisible({ timeout: 5000 });

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

  test.describe.skip('Actions (requires DB data)', () => {
    test('should show confirmation dialog when approving', async ({ page, context }) => {
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

      await page.goto(`${baseUrl}/admin/drafts`, { waitUntil: 'networkidle', timeout: 10000 });

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

    test('should show prompt when rejecting', async ({ page, context }) => {
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

      await page.goto(`${baseUrl}/admin/drafts`, { waitUntil: 'networkidle', timeout: 10000 });

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

