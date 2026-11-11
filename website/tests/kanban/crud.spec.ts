import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { READONLY_ORIGIN, openView } from './helpers';

// Story editing end to end: create, edit (conflicts included), body, task statuses, delete, WIP limits.
// The server is a throw-away copy of the fixture shared by every spec (see playwright.config.ts): each test
// creates its own stories through the API and removes them afterwards, and puts back what it changed.

const PROJECT = path.join(os.tmpdir(), 'cc-kanban-e2e-project');
const SPRINT = 'sprint-9-auth-premium';
const ORIGIN = 'http://127.0.0.1:3799';

const created: string[] = [];

async function api(page: Page, method: string, url: string, data?: object, headers: Record<string, string> = {}) {
  const res = await page.request.fetch(url, { method, data, headers: { Origin: ORIGIN, ...headers } });
  return { status: res.status(), body: await res.json().catch(() => null) };
}

/** A backlog story of the active sprint, created through the API (removed after the test). */
async function makeStory(page: Page, title: string, extra: object = {}) {
  const res = await api(page, 'POST', '/api/stories', { title, story_points: 3, sprint_id: SPRINT, ...extra });
  expect(res.status).toBe(201);
  created.push(res.body.story.id);
  return res.body.story.id as string;
}

test.afterEach(async ({ page }) => {
  for (const id of created.splice(0)) await api(page, 'DELETE', `/api/stories/${id}?force=1`);
  await api(page, 'PUT', '/api/settings/wip', { 'in-progress': null });
});

const dialog = (page: Page, name: string | RegExp) => page.getByRole('dialog', { name });
const detail = (page: Page) => page.locator('dialog.modal[open]').first();
const openStory = (page: Page, id: string) => page.goto(`/#/kanban?story=${id}`);
const yaml = () => fs.readFileSync(path.join(PROJECT, '.bmad/sprint-status.yaml'), 'utf8');
const storyFiles = (id: string) =>
  fs.readdirSync(path.join(PROJECT, 'project-management/backlog/user-stories')).filter((f) => f.startsWith(`${id}-`));

test('create a story with the keyboard only, then find it on the board and on disk', async ({ page }) => {
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'New story' }).focus();
  await page.keyboard.press('Enter');

  const form = dialog(page, 'New story');
  await expect(form.getByLabel('Title')).toBeFocused();
  await page.keyboard.type('E2E keyboard story');
  await page.keyboard.press('Tab');
  await expect(form.getByLabel('Story points')).toBeFocused();
  await page.keyboard.type('5');
  await page.keyboard.press('Tab');
  await expect(form.getByLabel('Priority')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(form.getByLabel('Persona')).toBeFocused();
  await page.keyboard.type('tester');
  await page.keyboard.press('Tab');
  await expect(form.getByLabel('Epic')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(form.getByLabel('Sprint')).toBeFocused();
  await page.keyboard.type('Auth'); // type-ahead: the active sprint
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(form.getByRole('button', { name: 'Create story' })).toBeFocused();
  await page.keyboard.press('Enter');

  const toast = page.locator('.toast.success', { hasText: 'created' });
  await expect(toast).toBeVisible();
  const id = ((await toast.textContent()) ?? '').match(/(US-[\w-]+) created/)![1];
  created.push(id);

  // The detail of the new story opens by itself.
  await expect(detail(page).locator('#detail-title', { hasText: 'E2E keyboard story' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.modal[open]')).toHaveCount(0);
  await expect(page.locator(`#col-backlog >> xpath=ancestor::section`).locator(`[data-card-id="${id}"]`)).toBeVisible();

  const files = storyFiles(id);
  expect(files).toHaveLength(1);
  expect(yaml()).toMatch(new RegExp(`^  ${id}:`, 'm'));
  expect(yaml()).toContain('E2E keyboard story');
});

test('creating: an empty title focuses the error summary, whose link reaches the field', async ({ page }) => {
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'New story' }).click();
  const form = dialog(page, 'New story');
  await form.getByRole('button', { name: 'Create story' }).click();

  const summary = form.locator('.sf-summary');
  await expect(summary).toBeFocused();
  await expect(summary).toContainText('1 field needs your attention');
  await expect(form.getByLabel('Title')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.getByLabel('Title')).toHaveAttribute('aria-describedby', 'create-title-err');
  await expect(form.locator('#create-title-err')).toContainText('A title is required.');

  await summary.getByRole('link', { name: /Title/ }).click();
  await expect(form.getByLabel('Title')).toBeFocused();
  expect(new URL(page.url()).hash).toBe('#/kanban'); // the anchor did not hijack the hash router
});

test('edit the title, points, assignee and priority; the card follows', async ({ page }) => {
  const id = await makeStory(page, 'E2E edit me');
  await openStory(page, id);
  await detail(page).getByRole('button', { name: 'Edit', exact: true }).click();

  const form = detail(page);
  await expect(form.getByLabel('Title')).toBeFocused();
  await form.getByLabel('Title').fill('E2E edited title');
  await form.getByLabel('Story points').selectOption('8');
  await form.getByLabel('Assignee').fill('bob');
  await form.getByLabel('Priority').selectOption('could');
  await form.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.locator('.toast.success', { hasText: `${id} saved` })).toBeVisible();
  await expect(form.getByRole('heading', { name: 'E2E edited title' })).toBeVisible();
  await expect(form.getByRole('button', { name: 'Edit', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  const card = page.locator(`#card-desc-${id}`);
  await expect(card).toContainText('Priority Could');
  await expect(card).toContainText('8 story points');
  await expect(card).toContainText('Assigned to bob');
  await expect(page.locator(`[data-card-id="${id}"]`)).toHaveText('E2E edited title');
  expect(yaml()).toContain('E2E edited title');
});

test('saving without any change says so instead of sending a request', async ({ page }) => {
  const id = await makeStory(page, 'E2E untouched');
  const patches: string[] = [];
  page.on('request', (r) => r.method() === 'PATCH' && patches.push(r.url()));
  await openStory(page, id);
  await detail(page).getByRole('button', { name: 'Edit', exact: true }).click();
  await detail(page).getByRole('button', { name: 'Save changes' }).click();
  await expect(detail(page).locator('.sf-summary')).toContainText('Nothing to save');
  expect(patches).toEqual([]);
});

test('conflict: another change in between offers to reload or to keep my changes', async ({ page }) => {
  const id = await makeStory(page, 'E2E conflict');
  await openStory(page, id);
  await detail(page).getByRole('button', { name: 'Edit', exact: true }).click();
  await detail(page).getByLabel('Title').fill('Mine');
  await api(page, 'PATCH', `/api/stories/${id}`, { title: 'Theirs', story_points: 13 });

  await detail(page).getByRole('button', { name: 'Save changes' }).click();
  const panel = detail(page).getByRole('group', { name: 'This story was changed elsewhere' });
  await expect(panel).toBeFocused();
  await expect(panel).toContainText('Someone else changed this story');

  // Reload: the form stays open on the new values, nothing is lost silently.
  await panel.getByRole('button', { name: 'Reload the story' }).click();
  await expect(detail(page).getByLabel('Title')).toHaveValue('Theirs');
  await expect(detail(page).getByLabel('Story points')).toHaveValue('13');
  await expect(panel).toHaveCount(0);
});

// The board shows a move at once, before the server answers (slow disk, busy machine): an edit opened in that
// moment must start from the version the move brings back, or its save is refused as a conflict with myself.
test('an edit opened while my own move is still on its way saves without a false conflict', async ({ page }) => {
  const id = await makeStory(page, 'E2E edit during move');
  let release!: () => void;
  const answered = new Promise<void>((resolve) => (release = resolve));
  await page.route(`**/api/stories/${id}/status`, async (route) => {
    await answered; // the server's answer is held until the user has asked to edit
    await route.continue();
  });
  await openStory(page, id);
  await detail(page).locator('#detail-move').selectOption('ready-for-dev');
  await detail(page).getByRole('button', { name: 'Move', exact: true }).click();
  await expect(detail(page).locator('.modal-frontmatter')).toContainText('Ready for dev');
  await detail(page).getByRole('button', { name: 'Edit', exact: true }).click();
  release();

  await detail(page).getByLabel('Title').fill('E2E edited after a move');
  await detail(page).getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('.toast.success', { hasText: `${id} saved` })).toBeVisible();
  await expect(detail(page).getByRole('group', { name: 'This story was changed elsewhere' })).toHaveCount(0);
  const { body } = await api(page, 'GET', `/api/stories/${id}`);
  expect(body.story).toMatchObject({ title: 'E2E edited after a move', status: 'ready-for-dev' });
});

test('conflict: keeping my changes retries on top of the newer version', async ({ page }) => {
  const id = await makeStory(page, 'E2E keep mine');
  await openStory(page, id);
  await detail(page).getByRole('button', { name: 'Edit', exact: true }).click();
  await detail(page).getByLabel('Title').fill('Mine');
  await api(page, 'PATCH', `/api/stories/${id}`, { story_points: 13 });

  await detail(page).getByRole('button', { name: 'Save changes' }).click();
  await detail(page).getByRole('button', { name: 'Keep my changes' }).click();
  await expect(page.locator('.toast.success', { hasText: `${id} saved` })).toBeVisible();

  const { body } = await api(page, 'GET', `/api/stories/${id}`);
  expect(body.story.title).toBe('Mine');
  expect(body.story.story_points).toBe(13); // their change is kept, only my title was sent
});

test('task statuses: a native select per task, the progress follows', async ({ page }) => {
  await page.goto('/#/kanban?story=US-E4-07a');
  const select = detail(page)
    .getByRole('combobox', { name: /^Status of task/ })
    .first();
  await expect(select).toBeVisible();
  try {
    await select.selectOption('done');
    await expect(detail(page).locator('.section-h .n').first()).toHaveText('1/5');
    await expect(page.locator('[role="status"]', { hasText: 'Done' }).first()).toBeAttached();
    const { body } = await api(page, 'GET', '/api/stories/US-E4-07a');
    expect(body.story.tasks.completed).toBe(1);
  } finally {
    await select.selectOption('to-do');
  }
  await expect(detail(page).locator('.section-h .n').first()).toHaveText('0/5');
});

test('content: edit the markdown with a live preview, and a Status line is refused', async ({ page }) => {
  const id = await makeStory(page, 'E2E body');
  await openStory(page, id);
  await detail(page).getByRole('button', { name: 'Edit content' }).click();

  const area = detail(page).getByLabel('Markdown content');
  await expect(area).toBeFocused();
  const original = await area.inputValue();
  await area.fill(`${original}\n\nE2E appended **paragraph**\n\n- **Status**: done\n`);
  await detail(page).getByRole('button', { name: 'Save content' }).click();
  await expect(detail(page).locator('#detail-body-error')).toContainText('cannot contain a Status line');

  await area.fill(`${original}\n\nE2E appended **paragraph**\n`);
  await expect(detail(page).locator('.sd-preview strong', { hasText: 'paragraph' })).toBeVisible();
  await detail(page).getByRole('button', { name: 'Save content' }).click();
  await expect(page.locator('.toast.success', { hasText: `${id} saved` })).toBeVisible();
  await expect(detail(page).locator('.md-body')).toContainText('E2E appended');

  const file = path.join(PROJECT, 'project-management/backlog/user-stories', storyFiles(id)[0]);
  expect(fs.readFileSync(file, 'utf8')).toContain('E2E appended **paragraph**');
});

test('delete: confirmation, forced deletion of an active story, focus lands on New story', async ({ page }) => {
  const id = await makeStory(page, 'E2E delete active');
  await api(page, 'PATCH', `/api/stories/${id}/status`, { status: 'ready-for-dev' });
  await api(page, 'PATCH', `/api/stories/${id}/status`, { status: 'in-progress' });
  await openStory(page, id);
  await detail(page).getByRole('button', { name: 'Delete', exact: true }).click();

  // One question only (WCAG 3.3.4): it says the story is in progress and that the file goes to the trash.
  const confirm = page.getByRole('dialog', {
    name: /is In progress\. Delete it anyway\? Its file is moved to the trash/,
  });
  await expect(confirm).toBeVisible();
  await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await confirm.getByRole('button', { name: 'Delete story' }).click();

  await expect(page.locator('dialog.modal[open]')).toHaveCount(0);
  await expect(page.locator(`[data-card-id="${id}"]`)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'New story' })).toBeFocused();
  expect(yaml()).not.toMatch(new RegExp(`^  ${id}:`, 'm'));
  expect(storyFiles(id)).toEqual([]);
});

test('delete: refused while other stories depend on it, with links to them', async ({ page }) => {
  const parent = await makeStory(page, 'E2E parent');
  const child = await makeStory(page, 'E2E child');
  expect((await api(page, 'PATCH', `/api/stories/${child}`, { dependencies: [parent] })).status).toBe(200);
  await openStory(page, parent);
  await detail(page).getByRole('button', { name: 'Delete', exact: true }).click();
  await page
    .getByRole('dialog', { name: /Delete .* Its file is moved to the trash/ })
    .getByRole('button', { name: 'Delete story' })
    .click();

  const alert = detail(page).locator('.sd-alert');
  await expect(alert).toContainText(`${parent} cannot be deleted`);
  await alert.getByRole('link', { name: child }).click();
  await expect(detail(page).locator('#detail-title', { hasText: 'E2E child' })).toBeVisible();
  await expect(page.locator(`[data-card-id="${parent}"]`)).toBeAttached();
});

test('WIP: a column over its limit shows n/limit with an icon and a text', async ({ page }) => {
  expect((await api(page, 'PUT', '/api/settings/wip', { 'in-progress': 1 })).status).toBe(200);
  await openView(page, 'kanban');
  const column = page.locator('section.column', { has: page.locator('#col-in-progress') });
  await expect(column.locator('.col-count')).toContainText(/\d+\/1/);
  await expect(column.locator('.col-wip-note')).toContainText('Over the work-in-progress limit');
  await expect(column.locator('.col-wip-note svg')).toBeAttached();
  await expect(column.locator('.col-count .sr-only')).toContainText(
    '(work-in-progress limit). Over the work-in-progress limit'
  );
  // A column without limit keeps its plain counter.
  const review = page.locator('section.column', { has: page.locator('#col-review') });
  await expect(review.locator('.col-wip-note')).toHaveCount(0);
});

test('read-only: no write button anywhere', async ({ page }) => {
  await page.goto(`${READONLY_ORIGIN}/#/kanban`);
  await expect(page.locator('[data-card-id]').first()).toBeAttached();
  await expect(page.getByRole('button', { name: 'New story' })).toHaveCount(0);
  await page.locator('[data-card-id]').first().click();
  await expect(detail(page)).toBeVisible();
  for (const name of ['Edit', 'Delete', 'Edit content']) {
    await expect(detail(page).getByRole('button', { name, exact: true })).toHaveCount(0);
  }
  await expect(detail(page).getByRole('combobox')).toHaveCount(0);
});

test('a board reload that started before a change never brings back the older story (no false conflict)', async ({
  page,
}) => {
  const id = await makeStory(page, 'E2E stale reload');
  // Every reload of the board is slow: one started by an earlier event finishes after the next change.
  // The first reload (started by an event) lands after the move; the following ones land later still, so that the
  // board shows what the late first reload brought for a while.
  let reloads = 0;
  let armed = false;
  await page.route('**/api/stories', async (route) => {
    if (route.request().method() !== 'GET' || !armed) return route.continue();
    const delay = reloads++ === 0 ? 700 : 4000;
    const response = await route.fetch(); // read now, delivered late
    await new Promise((r) => setTimeout(r, delay));
    await route.fulfill({ response });
  });
  await openStory(page, id);
  await expect(detail(page)).toBeVisible();
  armed = true;
  // A change made elsewhere starts a (slow) reload through the live events…
  await api(page, 'PATCH', `/api/stories/${id}`, { assigned_to: 'carol' });
  await page.waitForTimeout(250); // the event arrived, its reload is in flight
  // …then the user moves the story while that reload is still running.
  await detail(page).locator('#detail-move').selectOption('ready-for-dev');
  await detail(page).getByRole('button', { name: 'Move', exact: true }).click();
  await expect(detail(page).locator('.modal-frontmatter')).toContainText('Ready for dev');
  await page.waitForTimeout(900); // the late first reload has landed, the next one has not
  await detail(page).getByRole('button', { name: 'Edit', exact: true }).click();
  await page.locator('#edit-title').fill('E2E stale reload, renamed');
  await detail(page).getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('#edit-title')).toHaveCount(0);
  await expect(detail(page).locator('.sd-conflict')).toHaveCount(0);
});
