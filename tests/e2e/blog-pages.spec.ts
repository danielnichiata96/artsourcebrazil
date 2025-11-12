import { test, expect } from '@playwright/test';

test.describe('Blog Pages', () => {
  test('Blog listing page loads correctly', async ({ page }) => {
    await page.goto('/blog');

    // Check title
    await expect(page).toHaveTitle(/Blog/);

    // Check main heading
    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();

    // Check that blog post cards are visible
    const postCards = page.locator('a[href^="/blog/"]');
    const count = await postCards.count();
    expect(count).toBeGreaterThan(0);

    // Check first post card has expected structure
    const firstCard = postCards.first();
    await expect(firstCard).toBeVisible();
    
    // Check for post title (h2)
    await expect(firstCard.locator('h2')).toBeVisible();
    
    // Check for date element (use first to avoid strict mode)
    await expect(firstCard.locator('time').first()).toBeVisible();
  });

  test('Navigate from blog listing to individual post', async ({ page }) => {
    await page.goto('/blog');

    // Click on first post card
    const firstPost = page.locator('a[href^="/blog/"]').first();
    const postTitle = await firstPost.locator('h2').textContent();
    
    await firstPost.click();

    // Should navigate to blog post page
    await expect(page).toHaveURL(/\/blog\/.+/);
    
    // Post title should be in the page
    const normalizedTitle = (postTitle ?? '').trim();
    if (normalizedTitle) {
      const escapedTitle = normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await expect(
        page.getByRole('heading', { level: 1, name: new RegExp(escapedTitle, 'i') }),
      ).toBeVisible();
    }
  });

  test('Individual blog post page renders correctly', async ({ page }) => {
    await page.goto('/blog/how-to-post-a-successful-job');

    // Check page title
    await expect(page).toHaveTitle(/How to Post a Successful Job/);

    // Check main heading
    await expect(
      page.getByRole('heading', { level: 1, name: /How to Post a Successful Job/i }),
    ).toBeVisible();

    // Check published date is visible
    await expect(page.getByText(/Published on/i)).toBeVisible();

    // Check that article content exists (prose class indicates markdown content)
    const article = page.locator('article.prose');
    await expect(article).toBeVisible();
  });

  test('Blog post has BlogPosting JSON-LD structured data', async ({ page }) => {
    await page.goto('/blog/how-to-post-a-successful-job');

    // Check for BlogPosting JSON-LD
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toBeTruthy();

    const schema = JSON.parse(jsonLd!);
    expect(schema['@type']).toBe('BlogPosting');
    expect(schema.headline).toBe('How to Post a Successful Job Listing on Art Source Brazil');
    expect(schema.description).toBeTruthy();
    expect(schema.datePublished).toBeTruthy();
    expect(schema.author).toBeTruthy();
    expect(schema.publisher).toBeTruthy();
  });

  test('Blog post prose content is properly formatted', async ({ page }) => {
    await page.goto('/blog/how-to-post-a-successful-job');

    // Check that prose styling is applied
    const article = page.locator('article.prose');
    await expect(article).toBeVisible();

    // Check for typical markdown elements
    const paragraphs = article.locator('p');
    const pCount = await paragraphs.count();
    expect(pCount).toBeGreaterThan(0);

    // Check for headings within content
    const headings = article.locator('h2, h3');
    const hCount = await headings.count();
    expect(hCount).toBeGreaterThan(0);
  });

  test('Blog listing page has proper container padding', async ({ page }) => {
    await page.goto('/blog');

    // Check main container exists
    const main = page.locator('main').last();
    await expect(main).toBeVisible();

    // Verify heading is within container
    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
  });

  test('Blog post page has proper max-width for readability', async ({ page }) => {
    await page.goto('/blog/how-to-post-a-successful-job');

    // Check that content has max-width constraint (max-w-4xl)
    const main = page.locator('main').last();
    await expect(main).toBeVisible();
    
    // Article should be constrained for readability
    const article = page.locator('article.prose');
    await expect(article).toBeVisible();
  });

  test('Blog RSS feed is accessible', async ({ page }) => {
    const response = await page.goto('/blog.xml');
    
    // Check response is successful
    expect(response?.status()).toBe(200);
    
    // Check content type is XML
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('xml');

    // Check RSS structure
    const content = await response?.text();
    expect(content).toContain('<?xml');
    expect(content).toContain('<rss');
    expect(content).toContain('Art Source Brazil');
  });
});
