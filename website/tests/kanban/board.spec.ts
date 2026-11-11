import { test, expect, type Page } from '@playwright/test';
import { openView } from './helpers';

const column = (page: Page, status: string) => page.locator('section.column', { has: page.locator(`#col-${status}`) });

/** The shared fixture server keeps state between specs: put US-200 back where it started. */
test.afterEach(async ({ page }) => {
  const origin = new URL(test.info().project.use.baseURL!).origin;
  await page.request.patch('/api/stories/US-200/status', { data: { status: 'in-progress' }, headers: { Origin: origin } });
});

test('board: columns are headed lists and cards are native buttons', async ({ page }) => {
  await openView(page, 'kanban');
  const col = column(page, 'in-progress');
  await expect(col.getByRole('heading', { level: 2 })).toHaveText('In progress');
  await expect(col.getByRole('list').getByRole('listitem').first()).toBeVisible();
  await expect(col.getByRole('button', { name: /^Open US-200:/ })).toBeVisible();
  // Alternative to dragging: every writable card has a Move button.
  await expect(col.getByRole('button', { name: 'Move US-200' })).toHaveAttribute('aria-haspopup', 'menu');
});

test('board: the Move menu lists only allowed targets, moving a card to Blocked leaves a single way back', async ({
  page,
}) => {
  await openView(page, 'kanban');
  const moveButton = page.getByRole('button', { name: 'Move US-200' });
  await moveButton.click();
  await expect(moveButton).toHaveAttribute('aria-expanded', 'true');
  const menu = page.getByRole('menu', { name: 'Move US-200 to:' });
  await expect(menu.getByRole('menuitem')).toHaveText([/Review/, /Blocked/]);

  await menu.getByRole('menuitem', { name: /Blocked/ }).click();
  await page.getByRole('dialog', { name: 'Why is US-200 blocked?' }).getByRole('textbox').fill('waiting for API');
  await page.keyboard.press('Enter');
  await expect(column(page, 'blocked').locator('[data-card-id="US-200"]')).toBeVisible();

  // A blocked card can only return to where it came from.
  await page.getByRole('button', { name: 'Move US-200' }).click();
  const back = page.getByRole('menu', { name: 'Move US-200 to:' }).getByRole('menuitem');
  await expect(back).toHaveText([/In progress/]);
  await back.first().click();
  await expect(column(page, 'in-progress').locator('[data-card-id="US-200"]')).toBeVisible();
});

test('board: a menu closes on Escape and on an outside click', async ({ page }) => {
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'Move US-200' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await page.getByRole('button', { name: 'Move US-200' }).click();
  await page.locator('.board-toolbar').click({ position: { x: 4, y: 4 } });
  await expect(page.getByRole('menu')).toHaveCount(0);
});

test('board: dropping a card on a column that is not an allowed target sends nothing', async ({ page }) => {
  const patches: string[] = [];
  page.on('request', (r) => r.method() === 'PATCH' && patches.push(r.url()));
  await openView(page, 'kanban');
  const card = page.locator('li.card', { has: page.locator('[data-card-id="US-200"]') });
  await card.dragTo(column(page, 'backlog'));
  expect(patches).toEqual([]);
  await expect(column(page, 'in-progress').locator('[data-card-id="US-200"]')).toBeVisible();
});

test('board: ?q= filters the cards and the column counts say so', async ({ page }) => {
  await page.goto('/#/kanban?q=US-200');
  await expect(page.locator('[data-card-id]')).toHaveCount(1);
  await expect(page.locator('[data-card-id="US-200"]')).toBeVisible();
  await expect(page.locator('.board-notes')).toContainText('Column counts reflect the active filters.');
  const holder = page.locator('section.column', { has: page.locator('[data-card-id="US-200"]') });
  await expect(holder.locator('.col-count')).toContainText('1/');
});

test('board: a search without result shows a distinct state with a reset button', async ({ page }) => {
  await page.goto('/#/kanban?q=zzzz-no-such-story');
  const empty = page.locator('.board-empty');
  await expect(empty).toContainText('No stories match the current filters.');
  await empty.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('[data-card-id="US-200"]')).toBeVisible();
});

test('board: ?story= deep link opens the detail from any view and closing removes it', async ({ page }) => {
  await page.goto('/#/backlog?story=US-200');
  const dialog = page.locator('dialog.modal[open]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { level: 2 })).toContainText('Story legacy markdown');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page).not.toHaveURL(/story=/);
});

test('board: an unknown ?story= shows an error and drops the parameter', async ({ page }) => {
  await page.goto('/#/kanban?story=US-NOPE-99');
  await expect(page.locator('dialog.modal[open]')).toHaveCount(0);
  await expect(page).not.toHaveURL(/story=/);
});

test('board: changing the language in Settings translates the board without reloading', async ({ page }) => {
  await openView(page, 'kanban');
  const heading = column(page, 'in-progress').getByRole('heading', { level: 2 });
  await expect(heading).toHaveText('In progress');
  await page.getByRole('button', { name: /Display settings|Réglages d'affichage/ }).click();
  await page.locator('#tw-lang').selectOption('fr');
  await expect(heading).not.toHaveText('In progress');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});
