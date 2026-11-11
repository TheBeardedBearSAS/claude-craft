import { test, expect } from '@playwright/test';
import { VIEWS, openView } from './helpers';

for (const view of VIEWS) {
  test(`smoke: #/${view.name} renders fixture content without errors`, async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()}`));
    page.on('response', (r) => r.status() >= 400 && problems.push(`${r.status()}: ${r.url()}`));

    await openView(page, view.name);
    await expect(page.locator('main#main')).not.toContainText('Server unreachable');
    await expect(page.locator('h1')).toBeVisible();
    expect(problems).toEqual([]);
  });
}

test('smoke: board shows fixture stories', async ({ page }) => {
  await openView(page, 'kanban');
  await expect(page.locator('[data-card-id="US-200"]')).toBeVisible();
});
