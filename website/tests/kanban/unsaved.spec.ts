import { test, expect, type Page } from '@playwright/test';
import { openView } from './helpers';

// Unsaved input is never lost silently: a change of URL (browser Back, a link to another story or view, a new
// `?story=`) or Escape while a form holds changes asks first; "Keep editing" leaves the form and the URL as they were.
// Shared server (playwright.config.ts): the stories made here are removed after each test.

const ORIGIN = 'http://127.0.0.1:3799';
const SPRINT = 'sprint-9-auth-premium';
const created: string[] = [];

async function makeStory(page: Page, title: string) {
  const res = await page.request.post('/api/stories', {
    data: { title, story_points: 3, sprint_id: SPRINT },
    headers: { Origin: ORIGIN },
  });
  expect(res.status()).toBe(201);
  const id = (await res.json()).story.id as string;
  created.push(id);
  return id;
}

test.afterEach(async ({ page }) => {
  for (const id of created.splice(0)) {
    await page.request.delete(`/api/stories/${id}?force=1`, { headers: { Origin: ORIGIN } });
  }
});

const detail = (page: Page) => page.locator('dialog.modal[open]').first();
const confirmBox = (page: Page) => page.getByRole('dialog', { name: /unsaved changes/ });

async function editTitle(page: Page, id: string, title: string) {
  await page.goto(`/#/kanban?story=${id}`);
  await detail(page).getByRole('button', { name: 'Edit', exact: true }).click();
  await page.locator('#edit-title').fill(title);
}

test('story edit: browser Back asks before discarding; keep editing restores the URL and the input', async ({
  page,
}) => {
  const id = await makeStory(page, 'E2E unsaved back');
  await openView(page, 'backlog');
  await page.goto(`/#/kanban?story=${id}`); // a real history entry, so Back has somewhere to go
  await expect(detail(page)).toBeVisible();
  await detail(page).getByRole('button', { name: 'Edit', exact: true }).click();
  await page.locator('#edit-title').fill('Typed but not saved');

  await page.goBack();
  await expect(confirmBox(page)).toBeVisible();
  await confirmBox(page).getByRole('button', { name: 'Keep editing' }).click();
  await expect(page.locator('#edit-title')).toHaveValue('Typed but not saved');
  await expect.poll(() => page.url()).toContain(`story=${id}`);
  await expect.poll(() => page.url()).toContain('#/kanban');

  await page.goBack();
  await confirmBox(page).getByRole('button', { name: 'Discard changes' }).click();
  await expect(page.locator('dialog.modal[open]')).toHaveCount(0);
  await expect.poll(() => page.url()).toContain('#/backlog');
});

test('story edit: a link to another story asks first, then opens it once discarded', async ({ page }) => {
  const a = await makeStory(page, 'E2E unsaved A');
  const b = await makeStory(page, 'E2E unsaved B');
  await editTitle(page, a, 'Not saved');
  await page.evaluate((id) => (window.location.hash = `#/kanban?story=${id}`), b);
  await expect(confirmBox(page)).toBeVisible();
  await confirmBox(page).getByRole('button', { name: 'Keep editing' }).click();
  await expect(page.locator('#edit-title')).toHaveValue('Not saved');
  await expect(detail(page).locator('#detail-title')).toHaveText('E2E unsaved A');

  await page.evaluate((id) => (window.location.hash = `#/kanban?story=${id}`), b);
  await confirmBox(page).getByRole('button', { name: 'Discard changes' }).click();
  await expect(detail(page).locator('#detail-title')).toHaveText('E2E unsaved B');
  await expect(page.locator('#edit-title')).toHaveCount(0);
});

test('story edit without changes: Back closes the detail at once', async ({ page }) => {
  const id = await makeStory(page, 'E2E clean back');
  await openView(page, 'backlog');
  await page.goto(`/#/kanban?story=${id}`);
  await detail(page).getByRole('button', { name: 'Edit', exact: true }).click();
  await page.goBack();
  await expect(page.locator('dialog.modal[open]')).toHaveCount(0);
  await expect(confirmBox(page)).toHaveCount(0);
});

test('story creation: Back keeps the dialog and its input until the user discards', async ({ page }) => {
  await openView(page, 'backlog');
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'New story' }).click();
  await page.locator('#create-title').fill('Draft title');
  await page.goBack();
  await expect(confirmBox(page)).toBeVisible();
  await confirmBox(page).getByRole('button', { name: 'Keep editing' }).click();
  await expect(page.locator('#create-title')).toHaveValue('Draft title');
  await expect.poll(() => page.url()).toContain('#/kanban');
});

test('sprint form: Escape and Back ask before discarding a filled form', async ({ page }) => {
  await openView(page, 'kanban');
  await openView(page, 'sprints');
  await page.getByRole('button', { name: 'New sprint' }).click();
  const form = page.locator('dialog.sprint-form[open]');
  await form.locator('#sf-name').fill('Half typed');

  await page.keyboard.press('Escape');
  await expect(confirmBox(page)).toBeVisible();
  await confirmBox(page).getByRole('button', { name: 'Keep editing' }).click();
  await expect(form.locator('#sf-name')).toHaveValue('Half typed');

  await page.goBack();
  await expect(confirmBox(page)).toBeVisible();
  await confirmBox(page).getByRole('button', { name: 'Keep editing' }).click();
  await expect(form.locator('#sf-name')).toHaveValue('Half typed');
  await expect.poll(() => page.url()).toContain('#/sprints');

  await page.keyboard.press('Escape');
  await confirmBox(page).getByRole('button', { name: 'Discard changes' }).click();
  await expect(page.locator('dialog.sprint-form[open]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'New sprint' })).toBeFocused();
});

// Keyboard only, so no user activation between the presses: Chrome/Edge honour preventDefault() on a dialog's
// `cancel` only once per activation (close-watcher rule) and would then close the form with its input.
test('sprint form: Escape keeps asking, however many times the user presses it', async ({ page }) => {
  await openView(page, 'sprints');
  await page.getByRole('button', { name: 'New sprint' }).click();
  await page.locator('#sf-name').pressSequentially('Half typed');
  const form = page.locator('dialog.sprint-form[open]');
  for (let round = 0; round < 3; round++) {
    await page.keyboard.press('Escape');
    await expect(confirmBox(page)).toBeVisible();
    await page.keyboard.press('Escape'); // Escape on the question = keep editing
    await expect(confirmBox(page)).toHaveCount(0);
    await expect(form.locator('#sf-name')).toHaveValue('Half typed');
  }
});

test('story edit: Escape keeps asking, however many times the user presses it', async ({ page }) => {
  const id = await makeStory(page, 'E2E unsaved escape');
  await editTitle(page, id, 'Typed but not saved');
  for (let round = 0; round < 3; round++) {
    await page.keyboard.press('Escape');
    await expect(confirmBox(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(confirmBox(page)).toHaveCount(0);
    await expect(page.locator('#edit-title')).toHaveValue('Typed but not saved');
  }
});

// The answer is taken when it is given, not when the dialog's `close` event comes (with the next rendered frame):
// both actions run in one task here, so the second question is asked before that event, as on a busy machine.
test('a question asked right after "Keep editing" waits for its own answer', async ({ page }) => {
  await openView(page, 'sprints');
  await page.getByRole('button', { name: 'New sprint' }).click();
  const form = page.locator('dialog.sprint-form[open]');
  await form.locator('#sf-name').fill('Half typed');
  await page.keyboard.press('Escape');
  await expect(confirmBox(page)).toBeVisible();
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    buttons.find((b) => b.textContent?.trim() === 'Keep editing' && b.closest('dialog[open]'))!.click();
    document.querySelector<HTMLButtonElement>('dialog.sprint-form .sf-actions .btn:not(.btn-primary)')!.click();
  });
  await expect(confirmBox(page)).toBeVisible();
  await confirmBox(page).getByRole('button', { name: 'Discard changes' }).click();
  await expect(page.locator('dialog.sprint-form[open]')).toHaveCount(0);
});

test('sprint form: an untouched form closes on Escape without a question', async ({ page }) => {
  await openView(page, 'sprints');
  await page.getByRole('button', { name: 'New sprint' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.sprint-form[open]')).toHaveCount(0);
  await expect(confirmBox(page)).toHaveCount(0);
});
