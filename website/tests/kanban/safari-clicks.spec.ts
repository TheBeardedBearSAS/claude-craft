import { test, expect, type Page } from '@playwright/test';
import { openView, settingsButton } from './helpers';

// Safari on macOS gives no focus to a button on click: the focus goes to the nearest focusable ancestor (here
// <main>, focusable by script, or the open <dialog>), as seen under Playwright's WebKit on macOS. Every engine
// reproduces it here: the default action of mousedown on a button is cancelled and that ancestor is focused.
// The focus must still come back to the button that started the action.

const ORIGIN = 'http://127.0.0.1:3799';
const SPRINT = 'sprint-9-auth-premium';
const created: string[] = [];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    document.addEventListener(
      'mousedown',
      (event) => {
        const button = (event.target as Element).closest('button');
        if (!button) return;
        event.preventDefault();
        const holder = button.parentElement?.closest<HTMLElement>('dialog, [tabindex]');
        if (holder?.localName === 'dialog' && !holder.hasAttribute('tabindex')) holder.tabIndex = -1; // as WebKit
        holder?.focus();
      },
      true
    )
  );
});

test.afterEach(async ({ page }) => {
  for (const id of created.splice(0))
    await page.request.delete(`/api/stories/${id}?force=1`, { headers: { Origin: ORIGIN } });
});

async function storyWithTasks(page: Page, title: string, tasks: string[]) {
  const res = await page.request.post('/api/stories', {
    data: { title, story_points: 3, sprint_id: SPRINT },
    headers: { Origin: ORIGIN },
  });
  const id = (await res.json()).story.id as string;
  created.push(id);
  for (const task of tasks)
    await page.request.post(`/api/stories/${id}/tasks`, { data: { title: task }, headers: { Origin: ORIGIN } });
  return id;
}

type Loc = ReturnType<Page['locator']>;
const cancel = (d: Loc) => d.getByRole('button', { name: 'Cancel', exact: true });
const openers: Array<[string, string, (p: Page) => Loc, string, (d: Loc) => Loc]> = [
  ['new sprint', 'sprints', (p) => p.getByRole('button', { name: 'New sprint' }), 'dialog.sprint-form[open]', cancel],
  ['new story', 'kanban', (p) => p.locator('[data-new-story]'), 'dialog[open]:has(#create-title)', cancel],
  ['settings', 'kanban', (p) => settingsButton(p), 'dialog.tweaks-dialog[open]', (d) => d.locator('.icon-btn').first()],
  ['story detail', 'kanban', (p) => p.locator('[data-card-id="US-200"]'), 'dialog.modal[open]', (d) => d.locator('.m-close')],
];
for (const [name, view, button, dialog, closer] of openers) {
  test(`the ${name} dialog, opened and closed with the mouse, gives the focus back to its button`, async ({ page }) => {
    await openView(page, view);
    await button(page).click();
    await expect(page.locator(dialog)).toBeVisible();
    await closer(page.locator(dialog)).click();
    await expect(page.locator(dialog)).toHaveCount(0);
    await expect(button(page)).toBeFocused();
  });
}

test('saving a story edit with the mouse gives the focus back to "Edit"', async ({ page }) => {
  const id = await storyWithTasks(page, 'E2E Safari edit', []);
  await page.goto(`/#/kanban?story=${id}`);
  const detail = page.locator('dialog.modal[open]');
  await detail.getByRole('button', { name: 'Edit', exact: true }).click();
  await detail.getByLabel('Title').fill('E2E Safari edited');
  await detail.getByRole('button', { name: 'Save changes' }).click();
  await expect(detail.getByRole('heading', { name: 'E2E Safari edited' })).toBeVisible();
  await expect(detail.getByRole('button', { name: 'Edit', exact: true })).toBeFocused();
});

test('cancelling a task deletion with the mouse gives the focus back to its "Delete" button', async ({ page }) => {
  const id = await storyWithTasks(page, 'E2E Safari task', ['Alpha', 'Beta']);
  await page.goto(`/#/kanban?story=${id}`);
  const remove = page.locator('dialog.modal[open]').getByRole('button', { name: 'Delete task Beta' });
  await remove.click();
  await page.getByRole('dialog', { name: /Delete the task/ }).getByRole('button', { name: 'Cancel' }).click();
  await expect(remove).toBeFocused();
});
