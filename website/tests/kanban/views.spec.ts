import { test, expect, type Page } from '@playwright/test';
import { ZOOM400, openView } from './helpers';

// Backlog, Sprints, Burndown, Deps and Docs views (audit K-15, K-18..K-21, K-23, K-24, K-27..K-29, K-31).

type Doc = { rel: string };

async function docs(page: Page): Promise<Doc[]> {
  return (await (await page.request.get('/api/docs')).json()).docs;
}

/**
 * The fixture's task files do not parse into API tasks (tables, not frontmatter), so no sprint detail carries
 * any. Inject three tasks on the first story of each sprint detail; returns the id of a sprint with stories.
 */
async function sprintWithTasks(page: Page): Promise<string> {
  await page.route(/\/api\/sprints\/[^/?]+$/, async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    if (body.stories?.length) {
      const us_id = body.stories[0].id;
      body.tasks = ['T-1', 'T-2', 'T-3'].map((id) => ({
        id, us_id, type: 'BE', status: 'done', estimation_hours: 1, actual_hours: 1, assigned_to: 'dev',
      }));
    }
    await route.fulfill({ response: res, json: body });
  });
  const { sprints } = await (await page.request.get('/api/sprints')).json();
  return sprints.find((s: { story_count: number }) => s.story_count > 0).id;
}

const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test('docs: a deep link selects the document and opens its folder', async ({ page }) => {
  const nested = (await docs(page)).find((d) => d.rel.includes('/'));
  expect(nested, 'the fixture has a document in a folder').toBeTruthy();
  await page.goto(`/#/docs/${nested!.rel.split('/').map(encodeURIComponent).join('/')}`);
  await expect(page.locator('.doc-path')).toHaveText(nested!.rel);
  await expect(page.locator('.doc-paper')).toBeVisible();
  await expect(page.locator('.tree-item[aria-current="page"]')).toBeVisible();
  // The document's own h1 is demoted: the page keeps a single h1.
  await expect(page.locator('h1')).toHaveCount(1);
});

test('backlog: folding an epic removes its rows from the tab order', async ({ page }) => {
  await openView(page, 'backlog');
  const heads = page.locator('.epic-head');
  const total = await heads.count();
  let checked = false;
  for (let i = 0; i < total && !checked; i++) {
    const epic = page.locator('.epic').nth(i);
    await epic.locator('.epic-head').click();
    if ((await epic.locator('.story-row').count()) === 0) continue;
    await expect(epic.locator('.epic-head')).toHaveAttribute('aria-expanded', 'true');
    await epic.locator('.epic-head').click();
    await expect(epic.locator('.epic-head')).toHaveAttribute('aria-expanded', 'false');
    await expect(epic.locator('.story-row')).toHaveCount(0);
    checked = true;
  }
  expect(checked, 'an epic with stories was found').toBe(true);
});

test('backlog: a story row opens the detail through ?story=', async ({ page }) => {
  await openView(page, 'backlog');
  for (const head of await page.locator('.epic-head').all()) await head.click();
  const row = page.locator('.story-row').first();
  const id = (await row.locator('.s-id').textContent())!.trim();
  await row.click();
  await expect(page).toHaveURL(new RegExp(`story=${id}`));
  await expect(page.locator('dialog.modal[open]')).toBeVisible();
});

test('deps: an equivalent table exists and a story id opens its detail', async ({ page }) => {
  await openView(page, 'deps');
  const table = page.locator('table.deps-table');
  await expect(table).toBeVisible();
  await expect(table.locator('caption')).not.toBeEmpty();
  expect(await table.locator('tbody tr').count()).toBeGreaterThan(0);
  const link = table.locator('tbody th a').first();
  const id = (await link.textContent())!.trim();
  await link.click();
  await expect(page).toHaveURL(new RegExp(`story=${id}`));
  await expect(page.locator('dialog.modal[open]')).toBeVisible();
});

test('sprints: story tasks open and close from the keyboard', async ({ page }) => {
  const id = await sprintWithTasks(page);
  await page.goto(`/#/sprints/${encodeURIComponent(id)}`);
  const toggle = page.locator('button.task-toggle').first();
  await expect(toggle).toBeVisible();
  const box = await toggle.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(24);
  expect(box!.height).toBeGreaterThanOrEqual(24);
  await toggle.focus();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('table.sprint-tasks').first()).toBeVisible();
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('table.sprint-tasks')).toHaveCount(0);
});

test.describe('at 320px', () => {
  test.use({ viewport: ZOOM400 });

  test('backlog, sprints, burndown, deps and docs do not scroll horizontally', async ({ page }) => {
    const sprint = await sprintWithTasks(page);
    const doc = (await docs(page))[0].rel;
    const pages: Array<[string, (p: Page) => Promise<void>]> = [
      ['backlog', async (p) => { for (const h of await p.locator('.epic-head').all()) await h.click(); }],
      ['sprints', async (p) => { await p.goto(`/#/sprints/${encodeURIComponent(sprint)}`); await p.locator('button.task-toggle').first().click(); }],
      ['burndown', async (p) => { await p.locator('.burn-data > summary').click(); }],
      ['deps', async () => {}],
      ['docs', async (p) => { await p.goto(`/#/docs/${doc.split('/').map(encodeURIComponent).join('/')}`); await expect(p.locator('.doc-paper')).toBeVisible(); }],
    ];
    for (const [name, prepare] of pages) {
      await openView(page, name);
      await prepare(page);
      expect(await overflow(page), `#/${name} overflows the page at 320px`).toBeLessThanOrEqual(0);
    }
  });

  test('docs: the tree is reachable and usable from the keyboard', async ({ page }) => {
    await openView(page, 'docs');
    const summary = page.locator('.docs-nav > summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.docs-nav')).toHaveAttribute('open', '');
    await page.keyboard.press('Tab');
    const first = page.locator('.docs-nav a.tree-item').first();
    await expect(first).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/docs\//);
    await expect(page.locator('.doc-paper')).toBeVisible();
    // Picking a document folds the tree on a narrow screen.
    await expect(page.locator('.docs-nav')).not.toHaveAttribute('open', '');
  });
});
