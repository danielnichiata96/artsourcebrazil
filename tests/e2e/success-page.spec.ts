import { test, expect } from '@playwright/test';

test.describe('Post-a-Job Success Page', () => {
  test('Success page displays correctly after payment', async ({ page }) => {
    // Navigate to the success page
    await page.goto('/post-a-job/success');

    // Verify the page loaded correctly
    await expect(page.getByRole('heading', { level: 1, name: /Pagamento Confirmado/i })).toBeVisible();
    await expect(page.locator('text=Obrigado! Sua vaga foi enviada')).toBeVisible();

    // Verify progress steps are visible
    await expect(page.locator('text=Preencher')).toBeVisible();
    await expect(page.locator('text=Preview')).toBeVisible();
    await expect(page.locator('text=Publicar')).toBeVisible();

    // Verify action buttons
    const homeButton = page.locator('a:has-text("Voltar para Home")');
    await expect(homeButton).toBeVisible();
    expect(await homeButton.getAttribute('href')).toBe('/');

    const jobsButton = page.locator('a:has-text("Ver Vagas Publicadas")');
    await expect(jobsButton).toBeVisible();
    expect(await jobsButton.getAttribute('href')).toBe('/vagas');

    // Verify "What happens next" section
    await expect(page.locator('text=O que acontece agora?')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Revisão Manual' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Publicação' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Notificação por Email' })).toBeVisible();
  });
});
