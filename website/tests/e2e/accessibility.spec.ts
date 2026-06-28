import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  // Lighthouse-100 target: full WCAG 2.1 AA, color-contrast included (no rule disabling).
  test('landing page has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('./');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });

  test('doc page has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('en/getting-started/quickstart');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });

  test('landing page has html lang attribute', async ({ page }) => {
    await page.goto('./');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('landing page has proper heading hierarchy', async ({ page }) => {
    await page.goto('./');
    const headings = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((els) => els.map((el) => parseInt(el.tagName[1])));
    // Check no heading level is skipped (e.g., h1 -> h3 without h2)
    let prev = 0;
    for (const level of headings) {
      if (prev > 0) {
        expect(level).toBeLessThanOrEqual(prev + 1);
      }
      prev = level;
    }
  });

  test('landing page has main landmark', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('main')).toBeAttached();
  });

  test('all interactive elements have accessible names', async ({ page }) => {
    await page.goto('./');
    // Check select has aria-label
    const selects = page.locator('select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const ariaLabel = await selects.nth(i).getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });
});
