import { test, expect, type Page } from '@playwright/test';
import { VIEWS, openView, setTweaks, settingsButton, openMoveMenu } from './helpers';

// Visual check (not an assertion suite): one capture per view and per transient state, at 1280x800 and
// 320x640, written to results/ (git-ignored). Run with KANBAN_SCREENSHOTS=1 bash website/tests/kanban/run.sh.
test.skip(process.env.KANBAN_SCREENSHOTS !== '1', 'set KANBAN_SCREENSHOTS=1 to capture the screens');

const SIZES = [
  { width: 1280, height: 800 },
  { width: 320, height: 640 },
];

// Full page on a narrow screen, except over a modal dialog (a full-page capture would stretch the viewport under it).
const shot = async (page: Page, name: string) =>
  page.screenshot({
    path: test.info().outputPath(`${name}.png`),
    fullPage: page.viewportSize()!.width < 981 && !(await page.locator('dialog[open]').count()),
  });

const states: Array<[string, (p: Page) => Promise<void>]> = [
  ...VIEWS.map((v): [string, (p: Page) => Promise<void>] => [v.name, (p) => openView(p, v.name)]),
  ['board-fr', async (p) => (await setTweaks(p, { lang: 'fr' }), openView(p, 'kanban'))],
  ['board-de', async (p) => (await setTweaks(p, { lang: 'de' }), openView(p, 'kanban'))],
  ['backlog-de', async (p) => (await setTweaks(p, { lang: 'de' }), openView(p, 'backlog'))],
  [
    'story-detail',
    async (p) => {
      await p.goto('/#/kanban?story=US-200');
      await expect(p.locator('dialog.modal[open]')).toBeVisible();
    },
  ],
  ['move-menu', async (p) => (await openView(p, 'kanban'), openMoveMenu(p, 'US-200'))],
  [
    'settings',
    async (p) => {
      await openView(p, 'kanban');
      await settingsButton(p).click();
      await expect(p.locator('dialog.tweaks-dialog[open]')).toBeVisible();
    },
  ],
  // Native controls drawn by the system (macOS draws them its own way): lists, dates, numbers, text areas.
  [
    'story-create-de',
    async (p) => {
      await setTweaks(p, { lang: 'de' });
      await openView(p, 'kanban');
      await p.locator('[data-new-story]').click();
      await expect(p.locator('dialog[open] #create-title')).toBeFocused();
    },
  ],
  [
    'story-edit',
    async (p) => {
      await p.goto('/#/kanban?story=US-200');
      await p.locator('dialog.modal[open]').getByRole('button', { name: 'Edit', exact: true }).click();
      await expect(p.locator('dialog.modal[open] #edit-title')).toBeFocused();
    },
  ],
  [
    'sprint-form',
    async (p) => {
      await openView(p, 'sprints');
      await p.getByRole('button', { name: 'New sprint' }).click();
      await expect(p.locator('dialog.sprint-form[open]')).toBeVisible();
    },
  ],
  [
    'list-focused',
    async (p) => {
      await openView(p, 'backlog');
      await p.locator('#plan-target').focus();
    },
  ],
  [
    'not-found',
    async (p) => {
      await p.goto('/#/nope');
      await expect(p.locator('.not-found')).toBeVisible();
    },
  ],
];

for (const size of SIZES) {
  for (const [name, open] of states) {
    test(`screenshot: ${name}@${size.width}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize(size);
      await open(page);
      await page.waitForTimeout(400); // fonts, lazy chart/graph
      await shot(page, `${name}-${size.width}`);
    });
  }
}
