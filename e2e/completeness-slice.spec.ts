import { test, expect } from '@playwright/test';

test.describe('T-2026-224 completeness slice', () => {
  test('login lands on one page with approvals, SSE, and charts', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/slice');
    await expect(page.getByTestId('completeness-slice')).toBeVisible();
    await expect(page.locator('h1')).toContainText('SSE');
    await expect(page.getByTestId('slice-approvals')).toBeVisible();
    await expect(page.getByTestId('slice-audit')).toBeVisible();
    await expect(page.getByTestId('slice-sse')).toBeVisible();
    await expect(page.getByTestId('sse-status')).toContainText('Connected');
    await expect(page.getByTestId('slice-charts')).toBeVisible();
    await expect(page.getByTestId('slice-charts').locator('svg').first()).toBeVisible();
  });
});
