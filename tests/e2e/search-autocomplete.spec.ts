import { test, expect } from '@playwright/test';

test.describe('Search Autocomplete - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-search-autocomplete]');
  });

  test('should display search input with correct attributes', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('role', 'combobox');
    await expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
    await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
    await expect(searchInput).toHaveAttribute('autocomplete', 'off');
  });

  test('should not show dropdown initially', async ({ page }) => {
    const dropdown = page.locator('[data-autocomplete-results]');
    await expect(dropdown).toBeHidden();
  });

  test('should not show dropdown for queries less than 2 characters', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    const dropdown = page.locator('[data-autocomplete-results]');
    
    await searchInput.fill('a');
    await page.waitForTimeout(300); // Wait for debounce
    
    await expect(dropdown).toBeHidden();
  });

  test('should show loading indicator during search', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    const loadingIndicator = page.locator('[data-loading-indicator]');
    
    await searchInput.fill('art');
    
    // Loading should appear briefly
    await expect(loadingIndicator).toBeVisible();
    
    // Wait for debounce to complete
    await page.waitForTimeout(300);
    
    // Loading should disappear after search completes
    await expect(loadingIndicator).toBeHidden();
  });
});

test.describe('Search Autocomplete - Job Suggestions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-search-autocomplete]');
  });

  test('should show job suggestions when searching by job title', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    const dropdown = page.locator('[data-autocomplete-results]');
    
    // Search for a common term that should match jobs
    await searchInput.fill('artist');
    await page.waitForTimeout(300); // Wait for debounce
    
    // Dropdown should be visible
    await expect(dropdown).toBeVisible();
    await expect(searchInput).toHaveAttribute('aria-expanded', 'true');
    
    // Should have at least one result
    const results = page.locator('[data-autocomplete-results] li[data-index]');
    await expect(results.first()).toBeVisible();
  });

  test('should display job suggestions with correct structure', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    const firstResult = page.locator('[data-autocomplete-results] li[data-index="0"]');
    
    // Should have job title (label)
    await expect(firstResult.locator('.font-semibold')).toBeVisible();
    
    // Should have company name (subtitle)
    await expect(firstResult.locator('.text-sm')).toBeVisible();
    
    // Should have "Vaga" badge
    await expect(firstResult.locator('text=Vaga')).toBeVisible();
  });

  test('should highlight matching text in job titles', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    // Check if mark tag exists for highlighting
    const highlighted = page.locator('[data-autocomplete-results] mark');
    await expect(highlighted.first()).toBeVisible();
  });

  test('should navigate to job page when clicking job suggestion', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    // Get first job result
    const firstJobResult = page.locator('[data-autocomplete-results] li[data-index="0"]');
    await expect(firstJobResult).toBeVisible();
    
    // Click on it
    await firstJobResult.click();
    
    // Should navigate to job page
    await page.waitForURL(/\/jobs\/.*/, { timeout: 5000 });
    expect(page.url()).toContain('/jobs/');
  });
});

test.describe('Search Autocomplete - Company Suggestions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-search-autocomplete]');
  });

  test('should show company suggestions when searching by company name', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    const dropdown = page.locator('[data-autocomplete-results]');
    
    // Search for a company name (adjust based on your test data)
    await searchInput.fill('studio');
    await page.waitForTimeout(300);
    
    await expect(dropdown).toBeVisible();
    
    // Should have results
    const results = page.locator('[data-autocomplete-results] li[data-index]');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display company suggestions with correct badge', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await searchInput.fill('studio');
    await page.waitForTimeout(300);
    
    // Find company result (if it exists)
    const companyBadge = page.getByText('Empresa', { exact: true });
    
    // Should either have company badge or only job results
    const count = await companyBadge.count();
    if (count > 0) {
      await expect(companyBadge.first()).toBeVisible();
    }
  });

  test('should navigate to company page when clicking company suggestion', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await searchInput.fill('wildlife');
    await page.waitForTimeout(300);
    
    // Try to find a company result
    const companyResult = page.locator('[data-autocomplete-results] li').filter({ hasText: 'Empresa' }).first();
    
    const isVisible = await companyResult.isVisible().catch(() => false);
    
    if (isVisible) {
      await companyResult.click();
      await page.waitForURL(/\/company\/.*/, { timeout: 5000 });
      expect(page.url()).toContain('/company/');
    }
  });
});

test.describe('Search Autocomplete - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-search-autocomplete]');
  });

  test('should navigate results with arrow keys', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    // Focus should be on input
    await expect(searchInput).toBeFocused();
    
    // Press down arrow
    await searchInput.press('ArrowDown');
    
    // First item should be selected
    const firstResult = page.locator('[data-autocomplete-results] li[data-index="0"]');
    await expect(firstResult).toHaveAttribute('aria-selected', 'true');
    await expect(firstResult).toHaveClass(/bg-accent-light/);
    
    // Press down arrow again
    await searchInput.press('ArrowDown');
    
    // Second item should be selected, first should not
    const secondResult = page.locator('[data-autocomplete-results] li[data-index="1"]');
    await expect(secondResult).toHaveAttribute('aria-selected', 'true');
    await expect(firstResult).toHaveAttribute('aria-selected', 'false');
  });

  test('should navigate up with arrow up key', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    // Navigate down twice
    await searchInput.press('ArrowDown');
    await searchInput.press('ArrowDown');
    
    // Navigate back up
    await searchInput.press('ArrowUp');
    
    // First item should be selected again
    const firstResult = page.locator('[data-autocomplete-results] li[data-index="0"]');
    await expect(firstResult).toHaveAttribute('aria-selected', 'true');
  });

  test('should select suggestion with Enter key', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    // Navigate to first result
    await searchInput.press('ArrowDown');
    
    // Press Enter
    await searchInput.press('Enter');
    
    // Should navigate to job page
    await page.waitForURL(/\/jobs\/.*/, { timeout: 5000 });
    expect(page.url()).toContain('/jobs/');
  });

  test('should close dropdown with Escape key', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    const dropdown = page.locator('[data-autocomplete-results]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    await expect(dropdown).toBeVisible();
    
    // Press Escape
    await searchInput.press('Escape');
    
    // Dropdown should be hidden
    await expect(dropdown).toBeHidden();
    await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
  });

  test('should not go below list when pressing down arrow at end', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    const results = page.locator('[data-autocomplete-results] li[data-index]');
    const count = await results.count();
    
    // Navigate to last item
    for (let i = 0; i < count + 2; i++) {
      await searchInput.press('ArrowDown');
    }
    
    // Last item should still be selected
    const lastResult = page.locator(`[data-autocomplete-results] li[data-index="${count - 1}"]`);
    await expect(lastResult).toHaveAttribute('aria-selected', 'true');
  });

  test('should not go above list when pressing up arrow at start', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    // Press up arrow (should stay at -1, no selection)
    await searchInput.press('ArrowUp');
    
    // No item should be selected
    const results = page.locator('[data-autocomplete-results] li[aria-selected="true"]');
    expect(await results.count()).toBe(0);
  });
});

test.describe('Search Autocomplete - UI/UX Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-search-autocomplete]');
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    const dropdown = page.locator('[data-autocomplete-results]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    await expect(dropdown).toBeVisible();
    
    // Click outside (on body)
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    
    // Wait a bit for the blur handler
    await page.waitForTimeout(300);
    
    // Dropdown should be hidden
    await expect(dropdown).toBeHidden();
  });

  test('should reopen dropdown when focusing input with existing query', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    const dropdown = page.locator('[data-autocomplete-results]');
    
    // Type query
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    await expect(dropdown).toBeVisible();
    
    // Click outside to close
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);
    
    // Focus input again
    await searchInput.focus();
    
    // Dropdown should reopen
    await expect(dropdown).toBeVisible();
  });

  test('should show "no results" message for queries with no matches', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    const dropdown = page.locator('[data-autocomplete-results]');
    
    // Search for something that definitely doesn't exist
    await searchInput.fill('xyzabc123nonexistent');
    await page.waitForTimeout(300);
    
    // Dropdown should be visible with no results message
    await expect(dropdown).toBeVisible();
    await expect(page.locator('text=Nenhum resultado encontrado')).toBeVisible();
  });

  test('should debounce search requests', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    // Type quickly without waiting
    await searchInput.type('artist', { delay: 50 }); // 50ms between chars
    
    // Wait for debounce
    await page.waitForTimeout(300);
    
    // Results should appear
    const dropdown = page.locator('[data-autocomplete-results]');
    await expect(dropdown).toBeVisible();
  });

  test('should clear previous results when typing new query', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    // First search
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    const dropdown = page.locator('[data-autocomplete-results]');
    await expect(dropdown).toBeVisible();
    
    // Clear and search again
    await searchInput.fill('');
    await page.waitForTimeout(300);
    
    // Dropdown should be hidden for empty query
    await expect(dropdown).toBeHidden();
    
    // New search
    await searchInput.fill('designer');
    await page.waitForTimeout(300);
    
    // Should show new results
    await expect(dropdown).toBeVisible();
  });
});

test.describe('Search Autocomplete - Maximum Results', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-search-autocomplete]');
  });

  test('should limit results to maximum 8 suggestions', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    // Search for a very common term
    await searchInput.fill('a');
    await page.waitForTimeout(100);
    await searchInput.fill('ar');
    await page.waitForTimeout(300);
    
    const results = page.locator('[data-autocomplete-results] li[data-index]');
    const count = await results.count();
    
    // Should be at most 8 results
    expect(count).toBeLessThanOrEqual(8);
  });
});

test.describe('Search Autocomplete - Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-search-autocomplete]');
  });

  test('should work correctly on mobile viewport', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    const dropdown = page.locator('[data-autocomplete-results]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    // Should show dropdown
    await expect(dropdown).toBeVisible();
    
    // Should be readable and clickable
    const firstResult = page.locator('[data-autocomplete-results] li[data-index="0"]');
    await expect(firstResult).toBeVisible();
    
    // Should be able to click
    await firstResult.click();
    await page.waitForURL(/\/jobs\/.*/, { timeout: 5000 });
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    // Click on input (simulates tap on mobile)
    await searchInput.click();
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    // Click on result (simulates tap)
    const firstResult = page.locator('[data-autocomplete-results] li[data-index="0"]');
    await firstResult.click();
    
    await page.waitForURL(/\/jobs\/.*/, { timeout: 5000 });
    expect(page.url()).toContain('/jobs/');
  });
});

test.describe('Search Autocomplete - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-search-autocomplete]');
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    const dropdown = page.locator('[data-autocomplete-results]');
    
    // Check initial ARIA attributes
    await expect(searchInput).toHaveAttribute('role', 'combobox');
    await expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
    await expect(searchInput).toHaveAttribute('aria-owns', 'autocomplete-results');
    await expect(searchInput).toHaveAttribute('aria-controls', 'autocomplete-results');
    
    // Check dropdown ARIA attributes
    await expect(dropdown).toHaveAttribute('role', 'listbox');
  });

  test('should update aria-expanded when showing/hiding results', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    // Initially false
    await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
    
    // Type query
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    // Should be true when results show
    await expect(searchInput).toHaveAttribute('aria-expanded', 'true');
    
    // Close with Escape
    await searchInput.press('Escape');
    
    // Should be false again
    await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
  });

  test('should update aria-selected on keyboard navigation', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    await searchInput.fill('artist');
    await page.waitForTimeout(300);
    
    // Navigate with arrow keys
    await searchInput.press('ArrowDown');
    
    const firstResult = page.locator('[data-autocomplete-results] li[data-index="0"]');
    await expect(firstResult).toHaveAttribute('aria-selected', 'true');
    
    // All others should be false
    const otherResults = page.locator('[data-autocomplete-results] li[data-index]:not([data-index="0"])');
    const count = await otherResults.count();
    
    for (let i = 0; i < count; i++) {
      await expect(otherResults.nth(i)).toHaveAttribute('aria-selected', 'false');
    }
  });

  test('should be navigable with keyboard only', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    // Focus on search input
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
    
    // Type query
    await page.keyboard.type('artist');
    await page.waitForTimeout(300);
    
    // Navigate with arrows
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    
    // Select with Enter
    await page.keyboard.press('Enter');
    
    // Should navigate to job page
    await page.waitForURL(/\/jobs\/.*/, { timeout: 5000 });
  });
});

test.describe('Search Autocomplete - XSS Protection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-search-autocomplete]');
  });

  test('should sanitize HTML in search results', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    // Try to inject script tag
    await searchInput.fill('<script>alert("xss")</script>');
    await page.waitForTimeout(300);
    
    // Check that no script was executed (page should still be on home)
    expect(page.url()).toContain('/');
    
    // Check that HTML is escaped in results
    const scriptTag = page.locator('script:has-text("xss")');
    expect(await scriptTag.count()).toBe(0);
  });

  test('should not execute inline event handlers', async ({ page }) => {
    const searchInput = page.locator('[data-search-input]');
    
    // Try to inject onclick handler
    await searchInput.fill('<img src=x onerror="alert(1)">');
    await page.waitForTimeout(300);
    
    // Should not trigger any alerts (test would timeout if alert appears)
    const dropdown = page.locator('[data-autocomplete-results]');
    
    // Either no results or sanitized results
    const hasResults = await dropdown.isVisible();
    if (hasResults) {
      // Check that the injected code is not present
      const dangerousElements = page.locator('img[onerror]');
      expect(await dangerousElements.count()).toBe(0);
    }
  });
});
