import { test, expect, type Page } from '@playwright/test';
import { openView } from './helpers';

/** Tab until a board card has focus (keyboard only). */
async function tabToCard(page: Page, id?: string) {
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab');
    const cardId = await page.evaluate(() => document.activeElement?.getAttribute('data-card-id') ?? null);
    if (cardId && (!id || cardId === id)) return cardId;
  }
  throw new Error('no board card reachable with Tab');
}

test('keyboard: open a card detail, Escape closes it and focus returns to the card', async ({ page }) => {
  await openView(page, 'kanban');
  const id = await tabToCard(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('dialog.modal[open]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.modal[open]')).toHaveCount(0);
  await expect(page.locator(`[data-card-id="${id}"]`)).toBeFocused();
});

test('keyboard: Alt+M opens the move menu and a number key moves the card', async ({ page }) => {
  await openView(page, 'kanban');
  // US-200 is a writable markdown story (in-progress) in the fixture.
  await tabToCard(page, 'US-200');
  await page.keyboard.press('Alt+m');
  await expect(page.locator('dialog.move-menu-dialog[open]')).toBeVisible();
  // Blocked is gate-free (review/done are gated on tasks + TDD) and exercises the reason prompt.
  await page.keyboard.press('6');
  await expect(page.getByRole('dialog', { name: 'Blocked reason?' })).toBeVisible();
  await page.keyboard.type('waiting for e2e');
  await page.keyboard.press('Enter');
  const blocked = page.locator('section.column', { has: page.locator('#col-blocked') });
  await expect(blocked.locator('[data-card-id="US-200"]')).toBeVisible();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});
