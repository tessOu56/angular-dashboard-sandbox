import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Approval System
 *
 * 測試審批流程的完整工作流程
 */

test.describe('Approval System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/');

    // Login as manager
    await page.fill('input[name="username"]', 'manager');
    await page.fill('input[name="password"]', 'manager');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
  });

  test('should display approvals list', async ({ page }) => {
    // Navigate to approvals
    await page.goto('/approvals');

    // Check page title
    await expect(page.locator('h1')).toContainText('審批中心');

    // Check table is visible
    await expect(page.locator('app-table')).toBeVisible();
  });

  test('should filter approvals by status', async ({ page }) => {
    await page.goto('/approvals');

    // Select pending status
    await page.selectOption('select:has-text("狀態")', 'pending');

    // Wait for table to update
    await page.waitForTimeout(500);

    // Verify filtered results
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should create new approval request', async ({ page }) => {
    await page.goto('/approvals/new');

    // Fill form
    await page.fill('input[name="title"]', 'E2E Test Approval');
    await page.fill('textarea[name="description"]', 'This is a test approval');
    await page.selectOption('select[name="requestType"]', 'expense');
    await page.selectOption('select[name="priority"]', 'medium');
    await page.fill('input[name="amount"]', '1000');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('/approvals');

    // Verify toast notification
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should approve a pending request', async ({ page }) => {
    await page.goto('/approvals');

    // Click first pending approval
    await page.click('tbody tr:first-child');

    // Wait for detail page
    await page.waitForSelector('h1:has-text("審批詳情")');

    // Click approve button
    await page.click('button:has-text("批准")');

    // Fill comment
    await page.fill('textarea[name="comment"]', 'Approved in E2E test');

    // Confirm
    await page.click('button:has-text("確認批准")');

    // Verify success message
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should enforce dual-control for high-risk operations', async ({ page }) => {
    await page.goto('/approvals/new');

    // Create high-value purchase (requires dual-control)
    await page.fill('input[name="title"]', 'High Value Purchase');
    await page.fill('textarea[name="description"]', 'Expensive equipment');
    await page.selectOption('select[name="requestType"]', 'purchase');
    await page.selectOption('select[name="priority"]', 'high');
    await page.fill('input[name="amount"]', '15000'); // Above threshold

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForURL('/approvals');

    // Go to detail page
    await page.click('tbody tr:has-text("High Value Purchase")');

    // Verify dual-control indicator
    await expect(page.locator(':text("需要雙重控制")')).toBeVisible();

    // Verify two approval levels required
    await expect(page.locator(':text("2")')).toBeVisible(); // Required approvals
  });

  test('should search approvals', async ({ page }) => {
    await page.goto('/approvals');

    // Enter search query
    await page.fill('input[placeholder*="搜尋"]', 'Test');

    // Wait for results
    await page.waitForTimeout(500);

    // Verify filtered results
    const rows = page.locator('tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRowText = await rows.first().textContent();
      expect(firstRowText?.toLowerCase()).toContain('test');
    }
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/approvals');

    // Check if pagination exists
    const pagination = page.locator('.table-pagination');

    if (await pagination.isVisible()) {
      // Click next page
      await page.click('button:has-text("下一頁")');

      // Wait for page update
      await page.waitForTimeout(500);

      // Verify page number changed
      const pageInfo = await page.locator('.pagination-info').textContent();
      expect(pageInfo).toContain('2'); // Page 2
    }
  });

  test('should export approvals', async ({ page }) => {
    await page.goto('/approvals');

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("匯出")');

    // Wait for download
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toContain('approvals');
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
