import { test, expect } from '@playwright/test';

test.describe('Filter Sidebar - Main Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport to ensure sidebar is visible
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    // Wait for jobs to load
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should display filter sidebar with all filter sections', async ({ page }) => {
    const sidebar = page.locator('#filters-sidebar');
    await expect(sidebar).toBeVisible();

    // Check search input (use first() to avoid strict mode violation)
    await expect(page.locator('#job-search-sidebar').first()).toBeVisible();

    // Check filter summary (use first() to get desktop version)
    await expect(page.locator('[data-sidebar-results-count]').first()).toBeVisible();
    await expect(page.locator('[data-sidebar-clear]').first()).toBeVisible();

    // Check category filters
    await expect(page.locator('.category-btn-sidebar').first()).toBeVisible();

    // Check dropdown filters (collapsed by default)
    await expect(page.getByRole('button', { name: /ferramentas/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /nível/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /localização/i }).first()).toBeVisible();
  });

  test('should show initial job count', async ({ page }) => {
    const countElement = page.locator('#filters-sidebar [data-sidebar-results-count]');
    const count = await countElement.textContent();
    expect(parseInt(count || '0')).toBeGreaterThan(0);
  });

  test('should have clear button disabled when no filters applied', async ({ page }) => {
    const clearBtn = page.locator('#filters-sidebar [data-sidebar-clear]');
    await expect(clearBtn).toBeDisabled();
  });
});

test.describe('Filter Sidebar - Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should filter jobs by search query', async ({ page }) => {
    const searchInput = page.locator('#job-search-sidebar');
    const initialCount = await page.locator('[data-testid="job-card"]').count();

    // Search for specific term
    await searchInput.fill('Unity');
    await searchInput.press('Enter');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    const filteredCount = await page.locator('[data-testid="job-card"]:visible').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should show no results message for non-existent search', async ({ page }) => {
    const searchInput = page.locator('#job-search-sidebar');

    await searchInput.fill('NonExistentJobTitleXYZ123');
    await searchInput.press('Enter');
    await page.waitForTimeout(500);

    const emptyMessage = page.locator('[data-empty-message]');
    await expect(emptyMessage).toBeVisible();
  });

  test('should clear search and show all jobs', async ({ page }) => {
    const searchInput = page.locator('#job-search-sidebar');

    // Apply search
    await searchInput.fill('Designer');
    await searchInput.press('Enter');
    await page.waitForTimeout(500);

    // Clear search
    await searchInput.clear();
    await searchInput.press('Enter');
    await page.waitForTimeout(500);

    // Should show all jobs again
    const visibleJobs = await page.locator('[data-testid="job-card"]:visible').count();
    expect(visibleJobs).toBeGreaterThan(0);
  });
});

test.describe('Filter Sidebar - Category Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should filter jobs by category', async ({ page }) => {
    const categoryBtn = page.locator('.category-btn-sidebar').filter({ hasText: 'Game Dev' });
    await categoryBtn.click();
    
    // Apply filters
    await page.locator('#apply-filters-sidebar').click();
    await page.waitForTimeout(500);

    // Check that only Game Dev jobs are visible
    const visibleJobs = page.locator('[data-testid="job-card"]:visible');
    const count = await visibleJobs.count();
    expect(count).toBeGreaterThan(0);

    // Verify all visible jobs have Game Dev category
    for (let i = 0; i < count; i++) {
      const job = visibleJobs.nth(i);
      const category = await job.getAttribute('data-category');
      expect(category).toBe('Game Dev');
    }
  });

  test('should toggle category active state', async ({ page }) => {
    const allBtn = page.locator('[data-category="all"]');
    const gameDevBtn = page.locator('.category-btn-sidebar').filter({ hasText: 'Game Dev' });

    // Initially "all" should be active
    await expect(allBtn).toHaveClass(/category-btn-active/);

    // Click Game Dev
    await gameDevBtn.click();
    await expect(gameDevBtn).toHaveClass(/category-btn-active/);
    await expect(allBtn).not.toHaveClass(/category-btn-active/);

    // Click all again
    await allBtn.click();
    await expect(allBtn).toHaveClass(/category-btn-active/);
    await expect(gameDevBtn).not.toHaveClass(/category-btn-active/);
  });
});

test.describe('Filter Sidebar - Multiselect Dropdowns', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should open and close Tools dropdown', async ({ page }) => {
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    
    // Initially closed
    await expect(toolsDropdown).toHaveAttribute('aria-expanded', 'false');
    
    // Open dropdown
    await toolsDropdown.click();
    await expect(toolsDropdown).toHaveAttribute('aria-expanded', 'true');
    
    // Should show checkboxes
    const unityCheckbox = page.locator('input[name="tools"][value="Unity"]');
    await expect(unityCheckbox).toBeVisible();
    
    // Close by clicking button again
    await toolsDropdown.click();
    await expect(toolsDropdown).toHaveAttribute('aria-expanded', 'false');
  });

  test('should select multiple tools and show count', async ({ page }) => {
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    
    // Open dropdown
    await toolsDropdown.click();
    
    // Select multiple tools
    await page.locator('input[name="tools"][value="Unity"]').check();
    await page.locator('input[name="tools"][value="C#"]').check();
    await page.locator('input[name="tools"][value="Figma"]').check();
    
    // Check count display
    const countSpan = toolsDropdown.locator('[data-count]');
    await expect(countSpan).toContainText('3 selecionadas');
  });

  test('should filter jobs by selected tools', async ({ page }) => {
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    
    // Open and select Unity
    await toolsDropdown.click();
    await page.locator('input[name="tools"][value="Unity"]').check();
    
    // Close dropdown by clicking outside
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    
    // Apply filters
    await page.locator('#apply-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    // Verify filtered jobs contain "Unity" tag
    const visibleJobs = page.locator('[data-testid="job-card"]:visible');
    const count = await visibleJobs.count();
    expect(count).toBeGreaterThan(0);
    
    // Check that at least one job has Unity in tags
    const firstJob = visibleJobs.first();
    const tags = await firstJob.getAttribute('data-tags');
    expect(tags).toContain('Unity');
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    
    // Open dropdown
    await toolsDropdown.click();
    await expect(toolsDropdown).toHaveAttribute('aria-expanded', 'true');
    
    // Click outside (on sidebar background)
    await page.locator('#filters-sidebar').click({ position: { x: 10, y: 10 } });
    
    // Should close
    await expect(toolsDropdown).toHaveAttribute('aria-expanded', 'false');
  });

  test('should filter by Level (Senior)', async ({ page }) => {
    const levelDropdown = page.getByRole('button', { name: /nível/i });
    
    await levelDropdown.click();
    await page.locator('input[name="level"][value="Senior"]').check();
    
    // Check count
    const countSpan = levelDropdown.locator('[data-count]');
    await expect(countSpan).toContainText('1 selecionada');
    
    // Apply and verify
    await page.locator('#apply-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    const visibleJobs = await page.locator('[data-testid="job-card"]:visible').count();
    expect(visibleJobs).toBeGreaterThan(0);
  });

  test('should filter by Location (Remoto • Brasil)', async ({ page }) => {
    const locationDropdown = page.getByRole('button', { name: /localização/i });
    
    await locationDropdown.click();
    await page.locator('input[name="location"][value="remote-brazil"]').check();
    
    // Apply filters
    await page.locator('#apply-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    const visibleJobs = await page.locator('[data-testid="job-card"]:visible').count();
    expect(visibleJobs).toBeGreaterThan(0);
  });
});

test.describe('Filter Sidebar - Combined Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should combine category + tools filters', async ({ page }) => {
    // Select category
    const gameDevBtn = page.locator('.category-btn-sidebar').filter({ hasText: 'Game Dev' });
    await gameDevBtn.click();
    
    // Select tool
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    await toolsDropdown.click();
    await page.locator('input[name="tools"][value="Unity"]').check();
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    
    // Apply
    await page.locator('#apply-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    // Verify results match both filters
    const visibleJobs = page.locator('[data-testid="job-card"]:visible');
    const count = await visibleJobs.count();
    
    if (count > 0) {
      const firstJob = visibleJobs.first();
      const category = await firstJob.getAttribute('data-category');
      const tags = await firstJob.getAttribute('data-tags');
      
      expect(category).toBe('Game Dev');
      expect(tags).toContain('Unity');
    }
  });

  test('should combine search + category + tools', async ({ page }) => {
    // Search
    await page.locator('#job-search-sidebar').fill('3D');
    
    // Category
    await page.locator('.category-btn-sidebar').filter({ hasText: '3D & Animation' }).click();
    
    // Tool
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    await toolsDropdown.click();
    await page.locator('input[name="tools"][value="Blender"]').check();
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    
    // Apply
    await page.locator('#apply-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    // Should show filtered results or empty message
    const visibleJobs = await page.locator('[data-testid="job-card"]:visible').count();
    const emptyMessage = page.locator('[data-empty-message]');
    
    const isEmptyVisible = await emptyMessage.isVisible();
    if (isEmptyVisible) {
      expect(visibleJobs).toBe(0);
    } else {
      expect(visibleJobs).toBeGreaterThan(0);
    }
  });
});

test.describe('Filter Sidebar - Clear Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should enable clear button when filters are applied', async ({ page }) => {
    const clearBtn = page.locator('[data-sidebar-clear]');
    
    // Initially disabled
    await expect(clearBtn).toBeDisabled();
    
    // Apply a filter
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    await toolsDropdown.click();
    await page.locator('input[name="tools"][value="Unity"]').check();
    await page.locator('#apply-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    // Should be enabled now
    await expect(clearBtn).toBeEnabled();
  });

  test('should clear all filters when clicking clear button', async ({ page }) => {
    // Apply multiple filters
    await page.locator('#job-search-sidebar').fill('Game');
    
    const gameDevBtn = page.locator('.category-btn-sidebar').filter({ hasText: 'Game Dev' });
    await gameDevBtn.click();
    
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    await toolsDropdown.click();
    await page.locator('input[name="tools"][value="Unity"]').check();
    await page.locator('input[name="tools"][value="C#"]').check();
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    
    await page.locator('#apply-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    // Clear all
    await page.locator('#clear-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    // Verify everything is reset
    const searchInput = page.locator('#job-search-sidebar');
    await expect(searchInput).toHaveValue('');
    
    const allBtn = page.locator('[data-category="all"]');
    await expect(allBtn).toHaveClass(/category-btn-active/);
    
    // Checkboxes should be unchecked
    await toolsDropdown.click();
    const unityCheckbox = page.locator('input[name="tools"][value="Unity"]');
    await expect(unityCheckbox).not.toBeChecked();
  });

  test('should show all jobs after clearing filters', async ({ page }) => {
    const initialCount = await page.locator('[data-testid="job-card"]').count();
    
    // Apply restrictive filter
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    await toolsDropdown.click();
    await page.locator('input[name="tools"][value="Houdini"]').check();
    await page.locator('#apply-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    // Clear
    await page.locator('#clear-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    // Should show all jobs again
    const finalCount = await page.locator('[data-testid="job-card"]:visible').count();
    expect(finalCount).toBe(initialCount);
  });
});

test.describe('Filter Sidebar - Results Count', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should update results count when filtering', async ({ page }) => {
    const countElement = page.locator('[data-sidebar-results-count]');
    const initialCount = await countElement.textContent();
    
    // Apply filter
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    await toolsDropdown.click();
    await page.locator('input[name="tools"][value="Unity"]').check();
    await page.locator('#apply-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    const filteredCount = await countElement.textContent();
    
    // Count should change (or stay same if all jobs have Unity)
    expect(filteredCount).toBeTruthy();
    expect(parseInt(filteredCount || '0')).toBeGreaterThan(0);
  });

  test('should show 0 results for impossible filter combination', async ({ page }) => {
    // Apply very specific search that won't match
    await page.locator('#job-search-sidebar').fill('XYZ123NonExistent');
    
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    await toolsDropdown.click();
    await page.locator('input[name="tools"][value="Houdini"]').check();
    
    await page.locator('#apply-filters-sidebar').click();
    await page.waitForTimeout(500);
    
    const countElement = page.locator('[data-sidebar-results-count]');
    const count = await countElement.textContent();
    expect(count).toBe('0');
    
    // Empty message should be visible
    const emptyMessage = page.locator('[data-empty-message]');
    await expect(emptyMessage).toBeVisible();
  });
});

test.describe('Filter Sidebar - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="job-card"]');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    const sidebar = page.locator('#filters-sidebar');
    await expect(sidebar).toHaveAttribute('aria-label');
    
    const searchInput = page.locator('#job-search-sidebar');
    await expect(searchInput).toHaveAttribute('aria-label');
    
    const toolsDropdown = page.getByRole('button', { name: /ferramentas/i });
    await expect(toolsDropdown).toHaveAttribute('aria-expanded');
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab to search input
    await page.keyboard.press('Tab');
    const searchInput = page.locator('#job-search-sidebar');
    await expect(searchInput).toBeFocused();
    
    // Can type in search
    await page.keyboard.type('Unity');
    await expect(searchInput).toHaveValue('Unity');
  });
});

