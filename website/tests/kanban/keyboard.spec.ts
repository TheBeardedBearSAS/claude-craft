import { test, expect, type Page } from '@playwright/test';
import { openView, settingsButton } from './helpers';

/** Tab until a board card button has focus (keyboard only). */
async function tabToCard(page: Page, id?: string) {
  for (let i = 0; i < 150; i++) {
    await page.keyboard.press('Tab');
    const cardId = await page.evaluate(() => document.activeElement?.getAttribute('data-card-id') ?? null);
    if (cardId && (!id || cardId === id)) return cardId;
  }
  throw new Error('no board card reachable with Tab');
}

/** The shared fixture server keeps state between specs: put US-200 back where it started. */
test.afterEach(async ({ page }) => {
  const origin = new URL(test.info().project.use.baseURL!).origin;
  await page.request.patch('/api/stories/US-200/status', { data: { status: 'in-progress' }, headers: { Origin: origin } });
});

test('keyboard: open a card detail, Escape closes it and focus returns to the card', async ({ page }) => {
  await openView(page, 'kanban');
  const id = await tabToCard(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('dialog.modal[open]')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`story=${id}`));
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.modal[open]')).toHaveCount(0);
  await expect(page).not.toHaveURL(/story=/);
  await expect(page.locator(`[data-card-id="${id}"]`)).toBeFocused();
});

test('keyboard: arrow keys move between cards of a column', async ({ page }) => {
  await openView(page, 'kanban');
  const first = await tabToCard(page);
  await page.keyboard.press('ArrowRight');
  const afterRight = await page.evaluate(() => document.activeElement?.getAttribute('data-card-id'));
  expect(afterRight).not.toBe(first);
});

test('keyboard: Alt+M opens the move menu, only allowed targets, a digit moves the card', async ({ page }) => {
  await openView(page, 'kanban');
  // US-200 is a writable markdown story (in-progress) in the fixture.
  await tabToCard(page, 'US-200');
  await page.keyboard.press('Alt+m');
  const menu = page.getByRole('menu', { name: 'Move US-200 to:' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem')).toHaveText([/Review/, /Blocked/]);
  // Blocked is gate-free (review/done are gated on tasks + TDD) and exercises the reason prompt.
  await page.keyboard.press('6');
  const prompt = page.getByRole('dialog', { name: 'Why is US-200 blocked?' });
  await expect(prompt).toBeVisible();
  await page.keyboard.type('waiting for e2e');
  await page.keyboard.press('Enter');
  const blocked = page.locator('section.column', { has: page.locator('#col-blocked') });
  await expect(blocked.locator('[data-card-id="US-200"]')).toBeVisible();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  // Announced once, by the notifications region (a11y-review.spec.ts checks there is no second announcement).
  await expect(page.getByRole('status', { name: 'Notifications' })).toContainText('US-200 moved to Blocked');
  await expect(page.locator('[data-card-id="US-200"]')).toBeFocused();
});

test('keyboard: digits do nothing while the menu is closed, Escape closes the menu and refocuses its button', async ({
  page,
}) => {
  await openView(page, 'kanban');
  await tabToCard(page, 'US-200');
  await page.keyboard.press('6');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.press('Alt+m');
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Move US-200' })).toBeFocused();
});

test('keyboard: cancelling the blocked-reason prompt moves nothing', async ({ page }) => {
  await openView(page, 'kanban');
  await tabToCard(page, 'US-200');
  await page.keyboard.press('Alt+m');
  await page.keyboard.press('6');
  await expect(page.getByRole('dialog', { name: 'Why is US-200 blocked?' })).toBeVisible();
  await page.keyboard.press('Enter'); // empty answer: refused with an inline error
  await expect(page.locator('dialog.prompt-dialog .dialog-error')).toContainText('Enter a reason');
  await page.keyboard.press('Escape');
  const inProgress = page.locator('section.column', { has: page.locator('#col-in-progress') });
  await expect(inProgress.locator('[data-card-id="US-200"]')).toBeVisible();
});

// The settings panel gives the focus back to its button on `close`, an event that comes with the next rendered
// frame: a control reached meanwhile keeps the focus (here both happen in one task, as on a busy machine).
test('keyboard: closing the settings never takes the focus from a control reached meanwhile', async ({ page }) => {
  await openView(page, 'kanban');
  await settingsButton(page).click();
  await expect(page.locator('dialog.tweaks-dialog[open]')).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const panel = document.querySelector('dialog.tweaks-dialog') as HTMLDialogElement;
        panel.addEventListener('close', () => resolve(), { once: true });
        panel.close();
        document.querySelector<HTMLButtonElement>('[data-new-story]')!.focus();
      })
  );
  await expect(page.locator('[data-new-story]')).toBeFocused();
});

// Same for the story detail: its `close` handler gives the focus back to the card unless the user has moved on.
test('keyboard: closing a story detail never takes the focus from a control reached meanwhile', async ({ page }) => {
  await openView(page, 'kanban');
  const id = await tabToCard(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('dialog.modal[open]')).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const detail = document.querySelector('dialog.modal[open]') as HTMLDialogElement;
        detail.addEventListener('close', () => requestAnimationFrame(() => resolve()), { once: true });
        detail.close();
        document.querySelector<HTMLButtonElement>('[data-new-story]')!.focus();
      })
  );
  await expect(page.locator('dialog.modal[open]')).toHaveCount(0);
  await expect(page.locator('[data-new-story]')).toBeFocused();
  expect(id).toBeTruthy();
});

// Seen as a rare failure of the French journey: the server's order of the stories changes with its writes, so a
// real-time reload can reorder a column; the keyed list then moves the card's element and the browser drops the focus
// it held (a keyboard user's next Enter went to the page).
test('keyboard: a real-time reload that reorders a column keeps the focus where it was', async ({ page }) => {
  const origin = new URL(test.info().project.use.baseURL!).origin;
  await openView(page, 'kanban');
  const column = page.locator('section.column:has(#col-in-progress)');
  const ids = await column.locator('[data-card-id]').evaluateAll((all) => all.map((b) => b.getAttribute('data-card-id')!));
  expect(ids.length).toBeGreaterThanOrEqual(2);
  await page.route('**/api/stories', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    await route.fulfill({ response, json: { ...body, stories: [...body.stories].reverse() } });
  });
  const move = page.locator(`[data-move-id="${ids[0]}"]`);
  await move.focus();
  // Any write makes the server announce a change: the page reloads the stories (here in reverse order).
  await page.request.put('/api/settings/wip', { data: { 'in-progress': null }, headers: { Origin: origin } });
  await expect(column.locator('[data-card-id]').first()).toHaveAttribute('data-card-id', ids[ids.length - 1]);
  await expect(move).toBeFocused();
});
