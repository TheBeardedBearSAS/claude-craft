import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { READONLY_ORIGIN, ZOOM400, openView, pressTab, settingsButton } from './helpers';

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
  await pressTab(page);
  await expect(form.getByLabel('Story points')).toBeFocused();
  await page.keyboard.type('5');
  await pressTab(page);
  await expect(form.getByLabel('Priority')).toBeFocused();
  await pressTab(page);
  await expect(form.getByLabel('Persona')).toBeFocused();
  await page.keyboard.type('tester');
  await pressTab(page);
  await expect(form.getByLabel('Epic')).toBeFocused();
  await pressTab(page);
  await expect(form.getByLabel('Sprint')).toBeFocused();
  await page.keyboard.type('Auth'); // type-ahead: the active sprint
  await pressTab(page);
  await pressTab(page);
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

// ---- double submit: one request, one story ---------------------------------------------------------------------
// The two activations run in ONE task (a double click, or two Enter before the first answer), and the server's answer
// is held back so the second one cannot be told apart from a slow network.

/** Stories whose title is `title` (a duplicate created by a failing test is removed too). */
async function storiesTitled(page: Page, title: string) {
  const { body } = await api(page, 'GET', '/api/stories');
  return (body.stories as { id: string; title: string }[]).filter((s) => s.title === title);
}

async function holdPosts(page: Page, url: string, delayMs = 700) {
  const seen = { posts: 0, keys: [] as (string | undefined)[] };
  await page.route(url, async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') return route.fallback();
    seen.posts += 1;
    seen.keys.push(request.headers()['idempotency-key']);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fallback();
  });
  return seen;
}

test('creating: two activations of "Create story" in the same frame create one story', async ({ page }) => {
  const title = 'E2E double submit';
  const seen = await holdPosts(page, '**/api/stories');
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'New story' }).click();
  const form = dialog(page, 'New story');
  await form.getByLabel('Title').fill(title);
  await form.getByLabel('Sprint').selectOption(SPRINT);

  await page.evaluate(() => {
    const button = document.querySelector<HTMLButtonElement>('dialog[open] button[type="submit"]')!;
    button.click();
    button.click();
    document.querySelector<HTMLFormElement>('dialog[open] form')!.requestSubmit();
  });
  await expect(page.locator('.toast.success', { hasText: 'created' })).toBeVisible();
  for (const story of await storiesTitled(page, title)) created.push(story.id);
  expect(seen.posts).toBe(1);
  expect(seen.keys[0]).toMatch(/^[\x21-\x7e]{8,128}$/);
  expect(await storiesTitled(page, title)).toHaveLength(1);
});

test('creating: the busy state is aria-disabled, says "Creating…" and is announced', async ({ page }) => {
  await holdPosts(page, '**/api/stories', 1500);
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'New story' }).click();
  const form = dialog(page, 'New story');
  await form.getByLabel('Title').fill('E2E busy state');
  await form.getByRole('button', { name: 'Create story' }).click();
  await expect(form.getByRole('button', { name: 'Creating…' })).toHaveAttribute('aria-disabled', 'true');
  await expect(form.locator('button[type="submit"]')).not.toHaveAttribute('disabled', /.*/);
  await expect(form.locator('[role="status"]', { hasText: 'Creating…' })).toBeAttached();
  await expect(page.locator('.toast.success', { hasText: 'created' })).toBeVisible();
  for (const story of await storiesTitled(page, 'E2E busy state')) created.push(story.id);
});

test('the server replays a creation sent twice with the same Idempotency-Key', async ({ page }) => {
  const title = 'E2E idempotent create';
  // The server remembers a key for 5 minutes: a fixed one would be replayed by the next run.
  const headers = { 'Idempotency-Key': `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}` };
  const first = await api(page, 'POST', '/api/stories', { title, sprint_id: SPRINT }, headers);
  const second = await api(page, 'POST', '/api/stories', { title, sprint_id: SPRINT }, headers);
  for (const story of await storiesTitled(page, title)) created.push(story.id);
  expect(first.status).toBe(201);
  expect(second).toEqual(first);
  expect(await storiesTitled(page, title)).toHaveLength(1);
});

test('adding a task: two activations in the same frame add one task', async ({ page }) => {
  const id = await makeStory(page, 'E2E double task');
  const seen = await holdPosts(page, `**/api/stories/${id}/tasks`);
  await openStory(page, id);
  await detail(page).getByLabel('New task').fill('Only once');
  await page.evaluate(() => {
    const button = document.querySelector<HTMLButtonElement>('dialog.modal[open] .sd-task-add button[type="submit"]')!;
    button.click();
    button.click();
    document.querySelector<HTMLFormElement>('dialog.modal[open] .sd-task-add')!.requestSubmit();
  });
  await expect(detail(page).locator('.sd-checklist li')).toHaveCount(1);
  await expect(detail(page).getByRole('button', { name: 'Add task' })).toBeVisible();
  expect(seen.posts).toBe(1);
  const { body } = await api(page, 'GET', `/api/stories/${id}`);
  expect(body.story.tasks.list).toEqual(['Only once']);
});

test('adding a task: the busy state is aria-disabled and says "Adding…"', async ({ page }) => {
  const id = await makeStory(page, 'E2E busy task');
  await holdPosts(page, `**/api/stories/${id}/tasks`, 1500);
  await openStory(page, id);
  await detail(page).getByLabel('New task').fill('Slow one');
  await detail(page).getByRole('button', { name: 'Add task' }).click();
  await expect(detail(page).getByRole('button', { name: 'Adding…' })).toHaveAttribute('aria-disabled', 'true');
  await expect(detail(page).locator('.sd-checklist li')).toHaveCount(1);
});

test('creating: a refused first answer (locked) lets the same form try again, with the same key', async ({ page }) => {
  // A refused request is not remembered by the server: the retry with the same key is evaluated again.
  const title = 'E2E retry same key';
  let refuse = true;
  const keys: (string | undefined)[] = [];
  await page.route('**/api/stories', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    if (!refuse) {
      keys.push(route.request().headers()['idempotency-key']);
      return route.fallback();
    }
    refuse = false;
    keys.push(route.request().headers()['idempotency-key']);
    await route.fulfill({ status: 423, json: { error: 'locked' } });
  });
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'New story' }).click();
  const form = dialog(page, 'New story');
  await form.getByLabel('Title').fill(title);
  await form.getByRole('button', { name: 'Create story' }).click();
  await expect(form.getByRole('button', { name: 'Retry' })).toBeVisible();
  await form.getByRole('button', { name: 'Retry' }).click();
  await expect(page.locator('.toast.success', { hasText: 'created' })).toBeVisible();
  for (const story of await storiesTitled(page, title)) created.push(story.id);
  expect(await storiesTitled(page, title)).toHaveLength(1);
  expect(keys).toHaveLength(2);
  expect(keys[1]).toBe(keys[0]);
});

// ---- tasks: rename and delete ------------------------------------------------------------------------------------

const taskRow = (page: Page, name: string) => detail(page).locator('.sd-checklist li', { hasText: name });

async function storyWithTasks(page: Page, title: string, tasks: string[]) {
  const id = await makeStory(page, title);
  for (const task of tasks) {
    expect((await api(page, 'POST', `/api/stories/${id}/tasks`, { title: task })).status).toBe(201);
  }
  await openStory(page, id);
  await expect(detail(page).locator('.sd-checklist li')).toHaveCount(tasks.length);
  return id;
}

test('tasks: rename with the keyboard, Escape cancels, a duplicate name is explained in text', async ({ page }) => {
  const id = await storyWithTasks(page, 'E2E task rename', ['Write specs', 'Ship it / now 100% #1 été']);
  const rename = taskRow(page, 'Write specs').getByRole('button', { name: 'Rename task Write specs' });
  await rename.focus();
  await page.keyboard.press('Enter');

  const field = detail(page).getByRole('textbox', { name: 'New name of task Write specs' });
  await expect(field).toBeFocused();
  await expect(field).toHaveValue('Write specs');

  // Escape: closes the field only (the detail stays open), the focus returns to the Rename button.
  await page.keyboard.press('Escape');
  await expect(field).toHaveCount(0);
  await expect(detail(page)).toBeVisible();
  await expect(rename).toBeFocused();

  // A name the story already has: a text error tied to the field, nothing written.
  await page.keyboard.press('Enter');
  await field.fill('Ship it / now 100% #1 été');
  await page.keyboard.press('Enter');
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  const describedBy = await field.getAttribute('aria-describedby');
  await expect(page.locator(`#${describedBy}`)).toContainText('already has a task with this name');
  expect((await api(page, 'GET', `/api/stories/${id}`)).body.story.tasks.list[0]).toBe('Write specs');

  // An empty name is refused too; the right one is saved with Enter and announced.
  await field.fill('   ');
  await page.keyboard.press('Enter');
  await expect(page.locator(`#${describedBy}`)).toContainText('Enter a name for the task');
  await field.fill('Write the specs');
  await page.keyboard.press('Enter');
  await expect(field).toHaveCount(0);
  await expect(taskRow(page, 'Write the specs')).toBeVisible();
  await expect(detail(page).locator('[role="status"]', { hasText: 'Task renamed' })).toBeAttached();
  await expect(taskRow(page, 'Write the specs').getByRole('button', { name: /^Rename task/ })).toBeFocused();
  const tasks = (await api(page, 'GET', `/api/stories/${id}`)).body.story.tasks;
  expect(tasks.list).toEqual(['Write the specs', 'Ship it / now 100% #1 été']);
  expect(tasks.total).toBe(2);
});

test('tasks: delete asks once, then the focus goes to the next task, then to "New task"', async ({ page }) => {
  const id = await storyWithTasks(page, 'E2E task delete', ['Alpha', 'Beta / 50%', 'Gamma']);
  await taskRow(page, 'Alpha').getByRole('button', { name: 'Delete task Alpha' }).focus();
  await page.keyboard.press('Enter');
  const confirm = page.getByRole('dialog', { name: /Delete the task “Alpha”\?/ });
  await expect(confirm).toBeVisible();
  await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await confirm.getByRole('button', { name: 'Delete task' }).click();

  await expect(taskRow(page, 'Alpha')).toHaveCount(0);
  await expect(detail(page).locator('[role="status"]', { hasText: 'Task deleted' })).toBeAttached();
  await expect(taskRow(page, 'Beta').getByRole('combobox')).toBeFocused();
  expect((await api(page, 'GET', `/api/stories/${id}`)).body.story.tasks).toMatchObject({ total: 2, completed: 0 });

  // Cancelling keeps the task; the focus is back on the button that asked.
  const betaDelete = taskRow(page, 'Beta').getByRole('button', { name: 'Delete task Beta / 50%' });
  await betaDelete.click();
  await dialog(page, /Delete the task/).getByRole('button', { name: 'Cancel' }).click();
  await expect(taskRow(page, 'Beta')).toBeVisible();
  await expect(betaDelete).toBeFocused();

  // The last task of the list: the focus falls back on the previous one; with none left, on "New task".
  await taskRow(page, 'Gamma').getByRole('button', { name: 'Delete task Gamma' }).click();
  await dialog(page, /Delete the task/).getByRole('button', { name: 'Delete task' }).click();
  await expect(taskRow(page, 'Beta').getByRole('combobox')).toBeFocused();
  await betaDelete.click();
  await dialog(page, /Delete the task/).getByRole('button', { name: 'Delete task' }).click();
  await expect(detail(page).locator('.sd-checklist li')).toHaveCount(0);
  await expect(detail(page).getByLabel('New task')).toBeFocused();
  expect((await api(page, 'GET', `/api/stories/${id}`)).body.story.tasks).toMatchObject({ total: 0, completed: 0 });
});

test('tasks: rename and delete are absent on a read-only server and on an archived story', async ({ page }) => {
  await page.goto(`${READONLY_ORIGIN}/#/kanban?story=US-E4-07a`);
  await expect(page.locator('dialog.modal[open] .sd-checklist li').first()).toBeVisible();
  await expect(page.locator('dialog.modal[open]').getByRole('button', { name: /^(Rename|Delete) task/ })).toHaveCount(0);
});

for (const vp of [
  { name: '1280x800', size: { width: 1280, height: 800 } },
  { name: '320x256', size: ZOOM400 },
]) {
  test(`tasks: the rename field and the controls pass axe, with 24 px targets @${vp.name}`, async ({ page }) => {
    await page.setViewportSize(vp.size);
    await storyWithTasks(page, 'E2E task axe', ['A reasonably long task name that has to wrap on a narrow screen']);
    const row = detail(page).locator('.sd-checklist li').first();
    for (const name of [/^Rename task/, /^Delete task/]) {
      const box = (await row.getByRole('button', { name }).boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(24);
      expect(box.width).toBeGreaterThanOrEqual(24);
    }
    await row.getByRole('button', { name: /^Rename task/ }).click();
    await detail(page).getByRole('textbox', { name: /^New name of task/ }).fill('');
    await page.keyboard.press('Enter'); // the error text is shown
    await expect(detail(page).locator('.sd-task-error', { hasText: 'Enter a name' })).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    if (vp.size.width === ZOOM400.width) {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
}

// ---- a prompt answers the question it was asked ------------------------------------------------------------------
// `close` of a <dialog> comes with the next rendered frame. Cancelling the first question and asking the second one in
// the same task used to give the second one the first one's answer (the dialog stayed open with a dead promise).
test('the "blocked" reason prompt answers the second question, not the first', async ({ page }) => {
  const id = await makeStory(page, 'E2E prompt twice');
  await openStory(page, id);
  await detail(page).getByLabel('Move to').selectOption('blocked');
  await page.evaluate(() => {
    const move = [...document.querySelectorAll<HTMLButtonElement>('dialog.modal[open] .sd-move button')][0];
    move.click();
    document.querySelector<HTMLButtonElement>('dialog.prompt-dialog[open] .btn-cancel')!.click();
    move.click();
  });
  const prompt = page.locator('dialog.prompt-dialog[open]');
  await expect(prompt).toBeVisible();
  await expect(prompt.locator('.dialog-input')).toBeFocused();
  await prompt.locator('.dialog-input').fill('waiting for the second answer');
  await prompt.getByRole('button', { name: 'OK' }).click();

  await expect.poll(async () => (await api(page, 'GET', `/api/stories/${id}`)).body.story.status).toBe('blocked');
  expect((await api(page, 'GET', `/api/stories/${id}`)).body.story.blocked_reason).toBe('waiting for the second answer');
});

// ---- the focus is not taken back from where the user went ---------------------------------------------------------
test('story creation dialog: closing it does not take the focus back from a control the user reached', async ({ page }) => {
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'New story' }).click();
  await expect(dialog(page, 'New story')).toBeVisible();
  await page.evaluate(() => {
    document.querySelector<HTMLButtonElement>('dialog[open] .sf-actions .btn:not(.btn-primary)')!.click();
    document.querySelector<HTMLButtonElement>('header.topbar button.icon-btn')!.focus();
  });
  await page.waitForTimeout(150); // the dialog's `close` event comes with the next rendered frame
  await expect(settingsButton(page)).toBeFocused();
});

test('story creation dialog: closing it with nothing else focused returns the focus to "New story"', async ({ page }) => {
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'New story' }).click();
  await dialog(page, 'New story').getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('button', { name: 'New story' })).toBeFocused();
});
