import { test, expect, request as pwRequest, type APIRequestContext, type Page } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { READONLY_ORIGIN, DESKTOP, settingsButton } from './helpers';

// Sprint planning and lifecycle (audit K-22). The flow closes the active sprint, so it runs on its OWN server
// (a private copy of the fixture, port 3797): the other specs keep their shared server and its fixture state.
// "Keyboard only": every control is reached with focus() and activated with Enter / Space.
const PORT = 3797;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const projectDir = path.join(os.tmpdir(), 'cc-kanban-e2e-planning');
const ACTIVE = 'sprint-9-auth-premium';
const ACTIVE_NAME = 'Auth (finalisation) + Premium web (E4)';
const NEW_NAME = 'Planning E2E';
const STATUS_FILE = path.join(projectDir, '.bmad/sprint-status.yaml');

let server: ChildProcess;
let api: APIRequestContext;

const call = async (method: 'get' | 'post' | 'put', url: string, data?: object) => {
  const res = await api[method](`${ORIGIN}${url}`, { headers: { Origin: ORIGIN }, data });
  return res.json();
};
const makeStory = async (title: string, points: number) =>
  (await call('post', '/api/stories', { title, story_points: points, priority: 'must' })).story.id as string;
const storyOf = async (id: string) => (await call('get', '/api/stories')).stories.find((s: { id: string }) => s.id === id);

/** Keyboard activation: focus, then Enter (buttons, links) or Space (checkboxes). */
async function press(page: Page, locator: ReturnType<Page['locator']>, key = 'Enter') {
  await locator.focus();
  await page.keyboard.press(key);
}
const confirmIn = (page: Page, name: string) => page.locator('dialog[open]').getByRole('button', { name, exact: true });

test.describe.configure({ mode: 'serial' });
test.use({ baseURL: ORIGIN, viewport: DESKTOP });

test.beforeAll(async () => {
  fs.rmSync(projectDir, { recursive: true, force: true });
  fs.cpSync(path.join(repoRoot, 'tests/fixtures/wrandly-anon'), projectDir, { recursive: true });
  server = spawn('node', ['cli/index.js', 'kanban', projectDir, `--port=${PORT}`], { cwd: repoRoot, stdio: 'ignore' });
  api = await pwRequest.newContext();
  await expect
    .poll(async () => (await api.get(`${ORIGIN}/api/health`).catch(() => null))?.ok() ?? false, { timeout: 30_000 })
    .toBe(true);
});

test.afterAll(async () => {
  await api?.dispose();
  server?.kill();
});

const ids: { a: string; b: string; c: string } = { a: '', b: '', c: '' };
let newSprint = '';

test('create a sprint from the Sprints view', async ({ page }) => {
  [ids.a, ids.b, ids.c] = [await makeStory('E2E plan A', 3), await makeStory('E2E plan B', 5), await makeStory('E2E plan C', 2)];
  await page.goto('/#/sprints');
  await expect(page.locator('.sprint-item').first()).toBeAttached();
  await press(page, page.getByRole('button', { name: 'New sprint' }));
  const form = page.locator('dialog.sprint-form[open]');
  await expect(form).toBeVisible();

  // Empty submit: errors are text tied to their fields, the summary takes the focus.
  await press(page, form.getByRole('button', { name: 'Create sprint' }));
  await expect(form.locator('.sf-summary')).toBeFocused();
  await expect(form.locator('#sf-name')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.locator('#sf-name')).toHaveAttribute('aria-describedby', 'sf-name-error');
  await expect(form.locator('#sf-name-error')).toHaveText('Enter a name for the sprint.');

  await form.locator('#sf-name').fill(NEW_NAME);
  await form.locator('#sf-start_date').fill('2027-01-04');
  await form.locator('#sf-end_date').fill('2027-01-01'); // before the start
  await form.locator('#sf-capacity').fill('8');
  await page.keyboard.press('Enter'); // implicit submission
  await expect(form.locator('#sf-end_date-error')).toBeVisible();
  await form.locator('#sf-end_date').fill('2027-01-15');
  await page.keyboard.press('Enter');
  await expect(form).toBeHidden();

  await expect.poll(() => page.url()).toMatch(/#\/sprints\/sprint-\d+-planning-e2e/);
  newSprint = /#\/sprints\/([^?]+)/.exec(page.url())![1];
  await expect(page.locator('.sd-title .si-state')).toHaveText('planned');
  await expect(page.getByRole('button', { name: 'New sprint' })).toBeFocused();
  await expect(page.locator('.sprint-detail .capacity')).toHaveAttribute('data-state', 'under');
});

test('plan two backlog stories by multiple selection, then one by one', async ({ page }) => {
  await page.goto('/#/backlog');
  await expect(page.locator('.plan-bar')).toBeVisible();
  await page.locator('#plan-target').selectOption(newSprint);
  await page.locator('#plan-scope').selectOption('backlog');
  const box = (id: string) => page.getByRole('checkbox', { name: `Select ${id}` });
  await expect(box(ids.a)).toBeVisible();

  await press(page, box(ids.a), 'Space');
  await press(page, box(ids.b), 'Space');
  await expect(box(ids.a)).toBeChecked();
  await expect(page.locator('.plan-status')).toHaveText('2 stories selected · 8 pts selected');

  await press(page, page.getByRole('button', { name: 'Add 2 stories to the sprint' }));
  const capacity = page.locator('.plan-bar .capacity');
  await expect(capacity).toHaveAttribute('data-state', 'at');
  await expect(capacity).toContainText('8 of 8 pts committed');
  await expect(capacity).toContainText('At capacity'); // said in text, not only by colour
  await expect(page.locator('.plan-status')).toHaveText('');
  // The action bar and the moved rows are gone: the focus moves to a control that still exists (WCAG 2.4.3).
  await expect(page.locator('#plan-target')).toBeFocused();
  await expect.poll(async () => (await storyOf(ids.a)).sprint_id).toBe(newSprint);
  await expect.poll(async () => (await storyOf(ids.b)).sprint_id).toBe(newSprint);

  // One more story with the row button: over capacity, then back to the backlog — asked before the server has
  // answered the first move (its answer is held here, as on a slow machine): the second click is not dropped.
  let release!: () => void;
  const answered = new Promise<void>((resolve) => (release = resolve));
  await page.route(`**/api/stories/${ids.c}`, async (route) => {
    await answered;
    await route.continue();
  });
  const rowC = page.locator('li.story-item', { hasText: ids.c });
  await press(page, rowC.getByRole('button', { name: /^Add to/ }));
  await expect(capacity).toHaveAttribute('data-state', 'over');
  await expect(capacity).toContainText('Over capacity');
  // A change made elsewhere meanwhile reloads the stories: the move shown, still unanswered, is not undone.
  const reloaded = page.waitForResponse((r) => r.url().endsWith('/api/stories') && r.request().method() === 'GET');
  await makeStory('E2E plan elsewhere', 1);
  await reloaded;
  await expect(capacity).toHaveAttribute('data-state', 'over');
  await page.locator('#plan-scope').selectOption('sprint');
  await press(page, rowC.getByRole('button', { name: /^Move back to the backlog/ }));
  release();
  await expect(capacity).toHaveAttribute('data-state', 'at');
  await expect.poll(async () => (await storyOf(ids.c)).sprint_id ?? null).toBeNull();
});

test('starting a second sprint is refused while one is active', async ({ page }) => {
  await page.goto(`/#/sprints/${newSprint}`);
  await press(page, page.getByRole('button', { name: 'Start sprint' }));
  await press(page, confirmIn(page, 'Start sprint'));
  const alert = page.locator('.sd-alert');
  await expect(alert).toContainText(ACTIVE_NAME);
  await expect(alert).toBeFocused();
  await expect(alert.getByRole('link')).toHaveAttribute('href', `#/sprints/${ACTIVE}`);
  await expect(page.locator('.sd-title .si-state')).toHaveText('planned');
});

test('close the active sprint carrying the unfinished stories over, then start the new one', async ({ page }) => {
  await page.goto(`/#/sprints/${ACTIVE}`);
  await press(page, page.getByRole('button', { name: 'Close sprint' }));
  const dialog = page.locator('dialog.close-sprint[open]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('radio', { name: 'Move them back to the backlog' })).toBeChecked();
  await dialog.getByRole('radio', { name: `Carry them over to ${NEW_NAME}` }).check();
  await press(page, dialog.getByRole('button', { name: 'Close sprint', exact: true }));

  const result = page.locator('.sd-result');
  await expect(result).toBeFocused();
  await expect(result).toContainText('Sprint closed');
  await expect(result).toContainText('done story archived');
  await expect(result).toContainText(`moved to ${NEW_NAME}`);
  await expect(page.locator('.sd-title .si-state')).toHaveText('closed');
  await expect.poll(async () => (await storyOf('US-E4-03')).sprint_id).toBe(newSprint);

  await page.goto(`/#/sprints/${newSprint}`);
  await press(page, page.getByRole('button', { name: 'Start sprint' }));
  await press(page, confirmIn(page, 'Start sprint'));
  await expect(page.locator('.sd-title .si-state')).toHaveText('active');
  await expect(page.locator('.sd-title h3')).toBeFocused();
});

test('the board shows the new sprint and the velocity lists the closed one', async ({ page }) => {
  await page.goto('/#/kanban');
  await expect(page.locator(`[data-card-id="${ids.a}"]`)).toBeAttached();
  await expect(page.locator(`[data-card-id="${ids.b}"]`)).toBeAttached();

  await page.goto('/#/burndown');
  const velocity = page.locator('section.velocity');
  await expect(velocity.locator('table tbody tr', { hasText: ACTIVE_NAME })).toHaveCount(1);
  await expect(velocity.locator('.vel-average')).toContainText('Average velocity');
  await expect(velocity.locator('[role="img"]')).toBeVisible();
});

test('the status file keeps its comments and gains the archived sprint', async () => {
  const text = fs.readFileSync(STATUS_FILE, 'utf8');
  expect(text).toContain('# BMAD v6 - Sprint Status (ANONYMIZED FIXTURE');
  expect(text).toContain('# Sprints clôturés.');
  expect(text).toMatch(/archived_sprints:[\s\S]*\n {2}sprint-9-auth-premium:\n[\s\S]*points_committed:/);
  expect(text).toMatch(new RegExp(`sprint_id: "?${newSprint}"?`));
});

test('a WIP limit is saved and shows in /api/health; a wrong value is explained', async ({ page }) => {
  await page.goto('/#/kanban');
  await expect(page.locator('[data-card-id]').first()).toBeAttached();
  await press(page, settingsButton(page));
  const field = page.locator('#wip-in-progress');
  await field.fill('100');
  await page.keyboard.press('Enter');
  await expect(page.locator('#wip-in-progress-error')).toBeVisible();
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('.wip-summary')).toBeFocused();

  await field.fill('2');
  await page.keyboard.press('Enter');
  await expect(page.locator('.wip-status')).toHaveText('Limits saved.');
  await expect.poll(async () => (await call('get', '/api/health')).wip_limits['in-progress']).toBe(2);
  expect(fs.readFileSync(path.join(projectDir, '.bmad/kanban.yaml'), 'utf8')).toContain('in-progress: 2');

  await field.fill('');
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await call('get', '/api/health')).wip_limits['in-progress']).toBeUndefined();
});

test('read-only server: no planning, sprint or limit control', async ({ page }) => {
  await page.goto(`${READONLY_ORIGIN}/#/backlog`);
  await expect(page.locator('.epic').first()).toBeAttached();
  await expect(page.locator('.plan-bar, .row-select, .row-plan')).toHaveCount(0);
  await page.goto(`${READONLY_ORIGIN}/#/sprints`);
  await expect(page.locator('.sprint-item').first()).toBeAttached();
  await page.locator('.sprint-item').first().click();
  await expect(page.getByRole('button', { name: /New sprint|Start sprint|Close sprint/ })).toHaveCount(0);
  await press(page, settingsButton(page));
  await expect(page.locator('#wip-in-progress')).toHaveAttribute('readonly', '');
  await expect(page.locator('.wip').getByRole('button', { name: 'Save limits' })).toHaveCount(0);
  await expect(page.locator('.wip-readonly')).toBeVisible();
});
