import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { VIEWS, openView } from './helpers';

// App shell: landmarks, title, focus management, search, settings, toasts (audit K-14, K-17, K-26, K-29).

test('shell: one h1 and one main, the navigation is not inside an aside', async ({ page }) => {
  await openView(page, 'kanban');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('aside nav')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Views' })).toBeVisible();
});

for (const view of VIEWS) {
  test(`shell: #/${view.name} sets a per-view document title`, async ({ page }) => {
    await openView(page, view.name);
    await expect(page).toHaveTitle(/ · claude-craft kanban$/);
    const h1 = (await page.locator('h1').innerText()).trim();
    expect(await page.title()).toContain(h1);
  });
}

test('shell: focus moves to <main> on a view change but not on the first load', async ({ page }) => {
  await openView(page, 'kanban');
  await expect(page.locator('main#main')).not.toBeFocused();
  await page.getByRole('navigation', { name: 'Views' }).locator('a[href="#/backlog"]').click();
  await expect(page.locator('main#main')).toBeFocused();
});

test('shell: the skip link focuses <main> without breaking the hash route', async ({ page }) => {
  await openView(page, 'kanban');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
  await expect(page).toHaveURL(/#\/kanban$/);
});

test('shell: an unknown route renders the not-found page with a way back', async ({ page }) => {
  await page.goto('/#/nope');
  await expect(page.getByRole('heading', { name: 'Page not found', level: 2 })).toBeVisible();
  await page.getByRole('link', { name: 'Back to the board' }).click();
  await expect(page).toHaveURL(/#\/kanban$/);
});

test('shell: Ctrl+K and "/" focus the search; typing on the board writes ?q=', async ({ page }) => {
  await openView(page, 'kanban');
  const search = page.getByRole('textbox', { name: 'Search stories' });
  await page.keyboard.press('Control+k');
  await expect(search).toBeFocused();
  await page.locator('main').focus();
  await page.keyboard.press('/');
  await expect(search).toBeFocused();
  await search.fill('auth');
  await expect(page).toHaveURL(/#\/kanban\?q=auth$/);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(search).toHaveValue('');
  await expect(page).toHaveURL(/#\/kanban$/);
});

test('shell: on a view without live filtering, Enter sends the search to the backlog', async ({ page }) => {
  await openView(page, 'sprints');
  await page.getByRole('textbox', { name: 'Search stories' }).fill('auth');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/backlog\?q=auth$/);
});

test('shell: the live indicator is not a chatty live region', async ({ page }) => {
  await openView(page, 'kanban');
  await expect(page.locator('.live')).toContainText('Live');
  await expect(page.locator('.live[aria-live], .live [aria-live]')).toHaveCount(0);
});

test('shell: toast regions are siblings (status + alert), never nested', async ({ page }) => {
  await openView(page, 'kanban');
  await expect(page.locator('.toast-region > [role="status"]')).toHaveCount(1);
  await expect(page.locator('.toast-region > [role="alert"]')).toHaveCount(1);
  await expect(page.locator('[role="status"] [role="alert"], [role="alert"] [role="status"]')).toHaveCount(0);
});

test('shell: settings offer automatic + 5 languages, each named in its own language', async ({ page }) => {
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'Display settings' }).click();
  const options = page.locator('#tw-lang option');
  await expect(options).toHaveCount(6);
  const labels = await options.allInnerTexts();
  expect(labels.slice(1)).toEqual(['English', 'Français', 'Español', 'Deutsch', 'Português']);
});

test('shell: the settings dialog has no axe violation', async ({ page }) => {
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'Display settings' }).click();
  await expect(page.locator('dialog.tweaks-dialog[open]')).toBeVisible();
  const { violations } = await new AxeBuilder({ page })
    .include('dialog.tweaks-dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});
