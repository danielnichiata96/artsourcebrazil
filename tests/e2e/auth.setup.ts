import 'dotenv/config';
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '../../playwright/.auth/admin.json');

/**
 * Setup authentication for admin tests
 * This runs once before admin tests and saves authenticated state
 */
setup('authenticate as admin', async ({ page }) => {
  const adminToken = process.env.ADMIN_TOKEN || 'admin123';
  const baseUrl = 'http://localhost:4321';

  // Go to login page
  await page.goto(`${baseUrl}/admin/drafts`);

  // Fill in password
  await page.fill('input#password[type="password"]', adminToken);

  // Click login and wait for redirect
  await Promise.all([
    page.waitForURL(`${baseUrl}/admin/drafts`, { timeout: 10000 }),
    page.locator('button:has-text("Login")').click(),
  ]);

  // Verify we're logged in by checking for dashboard heading
  const dashboardHeading = page.locator('h1:has-text("Aprovação de Vagas")');
  await expect(dashboardHeading).toBeVisible({ timeout: 5000 });

  // Save authenticated state
  await page.context().storageState({ path: authFile });

  console.log('✅ Admin authentication state saved to:', authFile);
});

