import { test, expect, request as pwRequest, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSprintStatus } from '../../../cli/kanban/server/services/sprint-cache.js';
import { hasStatusLine } from '../../../cli/kanban/server/services/story-files.js';
import { settingsButton } from './helpers';

// A project manager's day, end to end (audit K-22, objective "usable to manage a project"): create a story,
// estimate / prioritise / assign it, plan a sprint, close the active one carrying its unfinished stories over,
// start the new one, drive the story to done through every gate, block and unblock another story, set a WIP limit,
// read burndown and velocity, filter, search, open a deep link, reload — then check the files on disk.
// The same essentials are replayed in French (language changed in Settings) and at 320 px.
//
// Own server on a private copy of the fixture (port 3796): the flow closes the active sprint. Keyboard first: every
// control is reached with focus() and activated with Enter / Space. KANBAN_SCREENSHOTS=1 saves one capture per step
// in results/ (git-ignored).

const PORT = 3796;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const projectDir = path.join(os.tmpdir(), 'cc-kanban-e2e-journey');
const STATUS_FILE = path.join(projectDir, '.bmad/sprint-status.yaml');
const STORIES_DIR = path.join(projectDir, 'project-management/backlog/user-stories');
const ACTIVE = 'sprint-9-auth-premium';
const SHOTS = process.env.KANBAN_SCREENSHOTS === '1';

let server: ChildProcess;
let api: APIRequestContext;

test.describe.configure({ mode: 'serial' });
test.use({ baseURL: ORIGIN, viewport: { width: 1280, height: 800 } });

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
  // Wait for the exit: with --repeat-each the next beforeAll binds the same port and recopies the project.
  if (server && server.exitCode === null) await new Promise((done) => (server.once('exit', done), server.kill()));
});

const storyOf = async (id: string) =>
  (await (await api.get(`${ORIGIN}/api/stories`)).json()).stories.find((s: { id: string }) => s.id === id);

async function shot(page: Page, name: string) {
  if (!SHOTS) return;
  await page.waitForTimeout(150); // let the last transition settle (captures only, never asserted)
  const narrow = page.viewportSize()!.width < 981 && !(await page.locator('dialog[open]').count());
  await page.screenshot({ path: test.info().outputPath(`${name}.png`), fullPage: narrow });
}

/** Keyboard activation: focus, then Enter (buttons, links) or Space (checkboxes, radios). */
async function press(page: Page, locator: Locator, key = 'Enter') {
  await locator.focus();
  await page.keyboard.press(key);
}

const detail = (page: Page) => page.locator('dialog.modal[open]').first();
const card = (page: Page, id: string) => page.locator(`li.card:has([data-card-id="${id}"])`);
const column = (page: Page, status: string) => page.locator(`section.column:has(#col-${status})`);
const confirmIn = (page: Page, name: string) =>
  page.locator('dialog[open]').getByRole('button', { name, exact: true }).last();
const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

/** Move a card with its "Move" menu, keyboard only. */
async function moveWithMenu(page: Page, id: string, statusLabel: string) {
  await press(page, page.locator(`[data-move-id="${id}"]`));
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  await press(page, menu.getByRole('menuitem', { name: statusLabel }));
}

/** Move from the story detail ("Move to" select + Move button). */
async function moveInDetail(page: Page, status: string, moveLabel = 'Move') {
  await detail(page).locator('#detail-move').selectOption(status);
  await press(page, detail(page).getByRole('button', { name: moveLabel, exact: true }));
}

const ids = { story: '', other: '', sprint: '' };
const TITLE = 'Export CSV du tableau de bord';
const SPRINT_NAME = 'Sprint Export';

test('a project manager plans a sprint and drives a story to done', async ({ page }) => {
  test.setTimeout(240_000);

  await test.step('open the board', async () => {
    await page.goto('/#/kanban');
    await expect(page.locator('[data-card-id]').first()).toBeAttached();
    await shot(page, '01-board');
  });

  await test.step('create a story', async () => {
    await press(page, page.locator('[data-new-story]'));
    const form = page.getByRole('dialog', { name: 'New story' });
    await expect(form.locator('#create-title')).toBeFocused();
    await page.keyboard.type(TITLE);
    await shot(page, '02-create-form');
    await press(page, form.getByRole('button', { name: 'Create story' }));
    await expect(detail(page).locator('#detail-title')).toHaveText(TITLE);
    ids.story = /story=([^&]+)/.exec(page.url())![1];
    await shot(page, '03-created-detail');
  });

  await test.step('estimate, prioritise and assign it', async () => {
    await press(page, detail(page).getByRole('button', { name: 'Edit', exact: true }));
    await expect(page.locator('#edit-title')).toBeFocused();
    await page.locator('#edit-story_points').selectOption('5');
    await page.locator('#edit-priority').selectOption('must');
    await page.locator('#edit-assigned_to').fill('alice');
    await shot(page, '04-edit-form');
    await press(page, detail(page).getByRole('button', { name: 'Save changes', exact: true }));
    await expect(page.locator('#edit-title')).toHaveCount(0);
    await expect(detail(page).getByRole('button', { name: 'Edit', exact: true })).toBeFocused();
    await expect(detail(page).locator('.fm-grid')).toContainText('alice');
    expect(await storyOf(ids.story)).toMatchObject({ story_points: 5, priority: 'must', assigned_to: 'alice' });
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog.modal[open]')).toHaveCount(0);
    await expect(page.locator('[data-new-story]')).toBeFocused();
  });

  await test.step('create a sprint', async () => {
    await page.goto('/#/sprints');
    await press(page, page.getByRole('button', { name: 'New sprint' }));
    const form = page.locator('dialog.sprint-form[open]');
    await expect(form).toBeVisible();
    await form.locator('#sf-name').fill(SPRINT_NAME);
    await form.locator('#sf-start_date').fill('2026-11-16');
    await form.locator('#sf-end_date').fill('2026-11-27');
    await form.locator('#sf-goal').fill('Exporter les données du tableau de bord.');
    await form.locator('#sf-capacity').fill('13');
    await shot(page, '05-sprint-form');
    await press(page, form.getByRole('button', { name: 'Create sprint' }));
    await expect(form).toBeHidden();
    await expect.poll(() => page.url()).toMatch(/#\/sprints\/sprint-\d+-sprint-export/);
    ids.sprint = /#\/sprints\/([^?]+)/.exec(page.url())![1];
    await expect(page.locator('.sd-title .si-state')).toHaveText('planned');
    await expect(page.locator('.sprint-detail .capacity')).toContainText('of 13 pts');
    await shot(page, '06-sprint-created');
  });

  await test.step('plan the story and another backlog story in the new sprint', async () => {
    const stories = (await (await api.get(`${ORIGIN}/api/stories`)).json()).stories;
    ids.other = stories.find(
      (s: { id: string; sprint_id: string | null; _writable: boolean; _statusSource: string; story_points: number }) =>
        s.id !== ids.story && !s.sprint_id && s._writable && s._statusSource === 'sprint-status'
    )?.id;
    if (!ids.other) {
      const res = await api.post(`${ORIGIN}/api/stories`, {
        headers: { Origin: ORIGIN },
        data: { title: 'Filtre par période', story_points: 3, priority: 'should' },
      });
      ids.other = (await res.json()).story.id;
    }
    await page.goto('/#/backlog');
    await page.locator('#plan-target').selectOption(ids.sprint);
    await page.locator('#plan-scope').selectOption('backlog');
    const box = (id: string) => page.getByRole('checkbox', { name: `Select ${id}` });
    await press(page, box(ids.story), 'Space');
    await press(page, box(ids.other), 'Space');
    await expect(page.locator('.plan-status')).toContainText('2 stories selected');
    await shot(page, '07-backlog-selection');
    await press(page, page.getByRole('button', { name: 'Add 2 stories to the sprint' }));
    await expect.poll(async () => (await storyOf(ids.story)).sprint_id).toBe(ids.sprint);
    await expect.poll(async () => (await storyOf(ids.other)).sprint_id).toBe(ids.sprint);
    await expect(page.locator('.plan-bar .capacity')).toContainText('of 13 pts committed');
    await shot(page, '08-backlog-planned');
  });

  await test.step('close the active sprint, carrying its unfinished stories over to the new one', async () => {
    await page.goto(`/#/sprints/${ACTIVE}`);
    await press(page, page.getByRole('button', { name: 'Close sprint' }));
    const dialog = page.locator('dialog.close-sprint[open]');
    await expect(dialog).toBeVisible();
    await press(page, dialog.getByRole('radio', { name: `Carry them over to ${SPRINT_NAME}` }), 'Space');
    await shot(page, '09-close-dialog');
    await press(page, dialog.getByRole('button', { name: 'Close sprint', exact: true }));
    await expect(page.locator('.sd-result')).toBeFocused();
    await expect(page.locator('.sd-result')).toContainText(`moved to ${SPRINT_NAME}`);
    await expect.poll(async () => (await storyOf('US-E4-03')).sprint_id).toBe(ids.sprint);
    await shot(page, '10-close-result');
  });

  await test.step('start the new sprint', async () => {
    await page.goto(`/#/sprints/${ids.sprint}`);
    await press(page, page.getByRole('button', { name: 'Start sprint' }));
    await press(page, confirmIn(page, 'Start sprint'));
    await expect(page.locator('.sd-title .si-state')).toHaveText('active');
    await shot(page, '11-sprint-started');
  });

  await test.step('drive the story to done through every gate', async () => {
    await page.goto('/#/kanban');
    await expect(card(page, ids.story)).toBeVisible();
    await expect(page.locator('header.topbar .crumb')).toContainText(SPRINT_NAME);
    await moveWithMenu(page, ids.story, 'Ready for dev');
    await expect(column(page, 'ready-for-dev').locator(`[data-card-id="${ids.story}"]`)).toBeVisible();
    await moveWithMenu(page, ids.story, 'In progress');
    await expect(column(page, 'in-progress').locator(`[data-card-id="${ids.story}"]`)).toBeVisible();

    // No task yet: the review gate refuses, and says what to do in the user's words.
    await moveWithMenu(page, ids.story, 'Review');
    const refusal = page.locator('.toast.error').last();
    await expect(refusal).toContainText('the story needs tasks, all of them done');
    await shot(page, '12-gate-refused');
    await refusal.getByRole('button', { name: 'Dismiss' }).click();

    await press(page, page.locator(`[data-card-id="${ids.story}"]`));
    await expect(detail(page)).toBeVisible();
    await expect(detail(page)).toContainText('No tasks yet');
    for (const name of ['Écrire l’export', 'Tester l’export']) {
      await page.locator('#detail-task-new').fill(name);
      await page.keyboard.press('Enter');
      await expect(detail(page).locator('.sd-task-name', { hasText: name })).toBeVisible();
      await expect(page.locator('#detail-task-new')).toBeFocused();
    }
    await shot(page, '13-tasks-added');
    for (const name of ['Écrire l’export', 'Tester l’export']) {
      await detail(page)
        .getByRole('combobox', { name: `Status of task ${name}` })
        .selectOption('done');
    }
    await expect(detail(page).locator('.fm-grid')).toContainText('2/2');
    await moveInDetail(page, 'review');
    await expect(detail(page).locator('.modal-frontmatter')).toContainText('Review');

    // review -> done needs the TDD phase too.
    await press(page, detail(page).getByRole('button', { name: 'Edit', exact: true }));
    await page.locator('#edit-tdd_phase').selectOption('green');
    await press(page, detail(page).getByRole('button', { name: 'Save changes', exact: true }));
    await expect(page.locator('#edit-title')).toHaveCount(0);
    await moveInDetail(page, 'done');
    await expect(detail(page).locator('.modal-frontmatter')).toContainText('Done');
    await shot(page, '14-story-done');
    await page.keyboard.press('Escape');
    await expect(column(page, 'done').locator(`[data-card-id="${ids.story}"]`)).toBeVisible();
    // The board shows the move before the server has written it: wait for the file, not for the card.
    await expect.poll(async () => (await storyOf(ids.story)).status).toBe('done');
  });

  await test.step('block, then unblock another story', async () => {
    await moveWithMenu(page, ids.other, 'Blocked');
    const prompt = page.locator('dialog.prompt-dialog[open]');
    await expect(prompt.locator('.dialog-input')).toBeFocused();
    await page.keyboard.type('En attente du format d’export validé');
    await shot(page, '15-block-prompt');
    await page.keyboard.press('Enter');
    await expect(column(page, 'blocked').locator(`[data-card-id="${ids.other}"]`)).toBeVisible();
    await expect(card(page, ids.other)).toContainText('Blocked');
    await shot(page, '16-blocked');
    await expect.poll(async () => (await storyOf(ids.other)).status).toBe('blocked'); // written, not only shown
    const before = (await storyOf(ids.other)).previous_status;
    await press(page, page.locator(`[data-move-id="${ids.other}"]`));
    const items = page.getByRole('menu').getByRole('menuitem');
    await expect(items).toHaveCount(1); // only the previous status
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await storyOf(ids.other)).status).toBe(before);
  });

  await test.step('set a WIP limit and see the column go over it', async () => {
    await press(page, settingsButton(page));
    await page.locator('#wip-in-progress').fill('1');
    await page.keyboard.press('Enter');
    await expect(page.locator('.wip-status')).toHaveText('Limits saved.');
    await shot(page, '17-wip-settings');
    await page.keyboard.press('Escape');
    const head = column(page, 'in-progress').locator('.col-count');
    await expect(head).toContainText('1/1');
    await moveWithMenu(page, 'US-E4-07a', 'In progress');
    await expect(head).toContainText('2/1');
    await expect(column(page, 'in-progress').locator('.col-wip-note')).toContainText('Over the work-in-progress limit');
    await expect(page.locator('.toast.info', { hasText: 'over its limit' })).toBeVisible();
    await shot(page, '18-wip-over');
  });

  await test.step('read burndown and velocity', async () => {
    await page.goto('/#/burndown');
    await expect(page.locator('.burn-card').first()).toBeVisible();
    const velocity = page.locator('section.velocity');
    await expect(velocity.locator('table tbody tr', { hasText: 'Auth (finalisation)' })).toHaveCount(1);
    await expect(velocity.locator('.vel-average')).toContainText('Average velocity');
    await shot(page, '19-burndown-velocity');
  });

  await test.step('filter and search', async () => {
    await page.goto('/#/kanban');
    await expect(card(page, ids.story)).toBeVisible();
    const search = page.getByRole('textbox', { name: 'Search stories' });
    await search.focus();
    await page.keyboard.type('Export CSV');
    await expect(card(page, ids.story)).toBeVisible();
    await expect(page.locator('li.card')).toHaveCount(1);
    await expect.poll(() => page.url()).toContain('q=Export');
    await shot(page, '20-search');
    await page.getByRole('button', { name: 'Clear search' }).click();
    await press(page, page.getByRole('button', { name: 'Must', exact: true }));
    await expect(card(page, ids.story)).toBeVisible();
    await expect(page.locator('li.card', { hasText: 'US-E4-07b' })).toHaveCount(0);
    await shot(page, '21-filter-must');
  });

  await test.step('open a deep link, reload, and find everything as it was left', async () => {
    await page.goto(`/#/backlog?story=${ids.story}`);
    await expect(detail(page).locator('#detail-title')).toHaveText(TITLE);
    await shot(page, '22-deep-link');
    await page.reload();
    await expect(detail(page).locator('#detail-title')).toHaveText(TITLE);
    const facts = detail(page).locator('.fm-grid');
    await expect(facts).toContainText('alice');
    await expect(facts).toContainText('2/2');
    await expect(detail(page).locator('.modal-frontmatter')).toContainText('Done');
    await expect(detail(page).locator('.modal-frontmatter')).toContainText('Must');
    await page.keyboard.press('Escape');
    await page.goto('/#/kanban');
    await expect(page.locator('header.topbar .crumb')).toContainText(SPRINT_NAME);
    await expect(column(page, 'in-progress').locator('.col-count')).toContainText('2/1');
  });

  await test.step('the files on disk are valid and keep what other tools wrote', async () => {
    const status = await loadSprintStatus(projectDir);
    expect(status?._invalid).toBeUndefined();
    expect(status.metadata.sprint_id).toBe(ids.sprint);
    expect(status.archived_sprints[ACTIVE].closed_date).toBeTruthy();
    expect(status.stories[ids.story]).toMatchObject({
      status: 'done',
      story_points: 5,
      priority: 'must',
      assigned_to: 'alice',
      tdd_phase: 'green',
    });
    expect(status.stories[ids.story].tasks).toMatchObject({ total: 2, completed: 2 });
    const text = fs.readFileSync(STATUS_FILE, 'utf8');
    expect(text).toContain('# BMAD v6 - Sprint Status (ANONYMIZED FIXTURE');
    expect(text).toContain('# Sprints clôturés.');
    expect(text).toContain('# Sprint courant');
    const files = fs.readdirSync(STORIES_DIR).filter((f) => f.startsWith(`${ids.story}-`));
    expect(files).toHaveLength(1);
    const md = fs.readFileSync(path.join(STORIES_DIR, files[0]), 'utf8');
    expect(md).toContain(TITLE);
    expect(hasStatusLine(md)).toBe(false);
  });
});

// Failure diagnostics for the French journey (it failed twice in ~40 runs, at different steps, under Chromium and
// WebKit, without a known cause): on failure, what the page looked like is attached to the report.
const FRENCH = 'the essentials in French, the language being changed in Settings';
const frenchDiag = { chunk: 'not requested', console: [] as string[] };
test.afterEach(async ({ page }, info) => {
  if (info.title !== FRENCH || info.status === info.expectedStatus) return;
  const state = await page
    .evaluate(() => {
      const describe = (el: Element | null) =>
        el ? `<${el.tagName.toLowerCase()} ${[...el.attributes].map((a) => `${a.name}="${a.value}"`).join(' ')}>` : 'none';
      return {
        lang: document.documentElement.lang,
        focused: describe(document.activeElement),
        focusHistory: (window as unknown as { __focusHistory?: string[] }).__focusHistory ?? [],
        openDialogs: [...document.querySelectorAll('dialog[open]')].map(describe),
        menus: [...document.querySelectorAll('[role="menu"]')].map((m) => m.getAttribute('aria-label')),
        toasts: [...document.querySelectorAll('.toast')].map((t) => t.textContent?.trim()),
      };
    })
    .catch((e: Error) => ({ error: e.message }));
  await info.attach('french-journey-state.json', {
    body: JSON.stringify({ ...state, localeChunk: frenchDiag.chunk, console: frenchDiag.console.slice(-30) }, null, 2),
    contentType: 'application/json',
  });
});

test(FRENCH, async ({ page }) => {
  test.setTimeout(120_000);
  page.on('console', (m) => frenchDiag.console.push(`${m.type()}: ${m.text()}`));
  const chunk = (r: { url: () => string }) => /\/assets\/fr-[\w-]+\.js$/.test(r.url());
  page.on('request', (r) => chunk(r) && (frenchDiag.chunk = 'requested'));
  page.on('requestfinished', (r) => chunk(r) && (frenchDiag.chunk = 'loaded'));
  page.on('requestfailed', (r) => chunk(r) && (frenchDiag.chunk = `failed: ${r.failure()?.errorText}`));
  await page.addInitScript(() => {
    const history: string[] = [];
    (window as unknown as { __focusHistory: string[] }).__focusHistory = history;
    document.addEventListener(
      'focusin',
      (e) => {
        const el = e.target as HTMLElement;
        history.push(`${Math.round(performance.now())} ${el.tagName.toLowerCase()}.${el.className} ${el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 30)}`);
        if (history.length > 20) history.shift();
      },
      true
    );
  });
  await page.goto('/#/kanban');
  await expect(page.locator('[data-card-id]').first()).toBeAttached();
  await press(page, settingsButton(page));
  await page.locator('#tw-lang').selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await shot(page, 'fr-01-settings');
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);

  await press(page, page.getByRole('button', { name: 'Nouvelle story' }));
  const form = page.getByRole('dialog', { name: 'Nouvelle story' });
  await page.keyboard.type('Story en français');
  await form.locator('#create-story_points').selectOption('3');
  // The active sprint: the one the first test started, or the fixture's when this test runs alone (-g, --repeat-each).
  await form.locator('#create-sprint_id').selectOption(ids.sprint || ACTIVE);
  await shot(page, 'fr-02-create');
  await press(page, form.getByRole('button', { name: 'Créer la story' }));
  await expect(detail(page).locator('#detail-title')).toHaveText('Story en français');
  const id = /story=([^&]+)/.exec(page.url())![1];
  await page.locator('#detail-task-new').fill('Une tâche');
  await press(page, detail(page).getByRole('button', { name: 'Ajouter la tâche' }));
  await expect(detail(page).getByRole('combobox', { name: 'Statut de la tâche Une tâche' })).toBeVisible();
  await shot(page, 'fr-03-detail');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-new-story]')).toBeFocused(); // the detail is closed, the focus has landed

  await moveWithMenu(page, id, 'Prête pour le dev');
  await expect(column(page, 'ready-for-dev').locator(`[data-card-id="${id}"]`)).toBeVisible();
  await moveWithMenu(page, id, 'En cours');
  await expect(column(page, 'in-progress').locator(`[data-card-id="${id}"]`)).toBeVisible();
  await moveWithMenu(page, id, 'En revue');
  await expect(page.locator('.toast.error').last()).toContainText('toutes terminées');
  await shot(page, 'fr-04-gate');
  // A toast follows a change of language: back to English, the same toast reads in English.
  await press(page, settingsButton(page));
  await page.locator('#tw-lang').selectOption('en');
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(page.locator('.toast.error').last()).toContainText('all of them done');
  await press(page, settingsButton(page));
  await page.locator('#tw-lang').selectOption('fr');
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);

  await page.goto('/#/sprints');
  await press(page, page.getByRole('button', { name: 'Nouveau sprint' }));
  await shot(page, 'fr-05-sprint-form');
  await page.keyboard.press('Escape');
  await page.goto('/#/backlog');
  await expect(page.locator('.plan-bar')).toBeVisible();
  await shot(page, 'fr-06-backlog');
});

test('the essentials at 320 px: every form fits, nothing scrolls sideways', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 320, height: 640 });
  for (const lang of ['de', 'en']) {
    await page.goto('/#/kanban');
    await page.evaluate((l) => localStorage.setItem('cc-kanban-tweaks', JSON.stringify({ lang: l })), lang);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('[data-card-id]').first()).toBeAttached();
    expect(await noHorizontalScroll(page)).toBe(true);
    await shot(page, `320-${lang}-01-board`);

    await press(page, page.locator('[data-new-story]'));
    await expect(page.locator('#create-title')).toBeFocused();
    await shot(page, `320-${lang}-02-create`);
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);

    await page.goto(`/#/kanban?story=${ids.story}`);
    await expect(detail(page)).toBeVisible();
    await shot(page, `320-${lang}-03-detail`);
    await press(page, detail(page).locator('.sd-toolbar .btn').first());
    await expect(page.locator('#edit-title')).toBeFocused();
    await shot(page, `320-${lang}-04-edit`);
    await page.keyboard.press('Escape');

    await page.goto('/#/backlog');
    await expect(page.locator('.plan-bar')).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
    await shot(page, `320-${lang}-05-backlog`);

    await page.goto(`/#/sprints/${ids.sprint}`);
    await expect(page.locator('.sd-title')).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
    await shot(page, `320-${lang}-06-sprint`);
    await press(page, page.getByRole('button', { name: lang === 'de' ? 'Neuer Sprint' : 'New sprint' }));
    await expect(page.locator('dialog.sprint-form[open]')).toBeVisible();
    await shot(page, `320-${lang}-07-sprint-form`);
    await page.keyboard.press('Escape');
  }
});
