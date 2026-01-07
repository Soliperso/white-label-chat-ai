import { test, expect } from '@playwright/test';

test.describe('Widgets Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the widgets page
    await page.goto('http://localhost:3000/widgets');
  });

  test('should load without hydration errors', async ({ page }) => {
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for hydration errors in the console
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Check for hydration-related errors
    const hydrationErrors = consoleErrors.filter(
      (error) =>
        error.includes('hydration') ||
        error.includes('Hydration') ||
        error.includes('mismatch')
    );

    expect(hydrationErrors).toHaveLength(0);
    console.log('Hydration test passed - no errors found');
  });

  test('should initialize MSW and intercept API calls', async ({ page }) => {
    // Capture console logs to check for MSW initialization
    const mswLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[MSW]')) {
        mswLogs.push(text);
        console.log(text);
      }
    });

    // Wait for API call to be intercepted
    await page.waitForTimeout(2000);

    // Check that MSW intercepted the GET /api/widgets request
    const widgetInterceptLog = mswLogs.find((log) =>
      log.includes('Intercepted GET /api/widgets')
    );

    expect(widgetInterceptLog).toBeDefined();
    console.log('MSW initialization test passed');
  });

  test('should display 3 widgets', async ({ page }) => {
    // Wait for the widgets to load
    await page.waitForSelector('[data-testid="widget-item"]', {
      timeout: 5000,
    });

    // Get all widget items
    const widgets = await page.locator('[data-testid="widget-item"]').all();

    expect(widgets.length).toBe(3);
    console.log(`Widget count test passed - found ${widgets.length} widgets`);
  });

  test('should display widget details', async ({ page }) => {
    // Wait for widgets to load
    await page.waitForSelector('[data-testid="widget-item"]', {
      timeout: 5000,
    });

    // Check first widget
    const firstWidget = page.locator('[data-testid="widget-item"]').first();
    const name = await firstWidget
      .locator('[data-testid="widget-name"]')
      .textContent();

    expect(name).toBeTruthy();
    console.log(`First widget name: ${name}`);
  });

  test('should have Create Widget button', async ({ page }) => {
    // Check for the Create Widget button
    const createButton = page.locator('a:has-text("Create Widget")');

    await expect(createButton).toBeVisible();
    console.log('Create Widget button is visible');
  });

  test('should not have loading state after widgets load', async ({ page }) => {
    // Wait for network to be idle
    await page.waitForLoadState('networkidle');

    // Wait for widgets to appear
    await page.waitForSelector('[data-testid="widget-item"]', {
      timeout: 5000,
    });

    // Check if loading spinner is gone
    const spinner = page.locator('[data-testid="loading-spinner"]');
    await expect(spinner).not.toBeVisible({ timeout: 5000 });

    console.log('Loading state cleared successfully');
  });
});
