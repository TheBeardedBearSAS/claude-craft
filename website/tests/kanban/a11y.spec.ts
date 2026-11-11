import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  VIEWS,
  DESKTOP,
  ZOOM400,
  ACCENTS,
  READONLY_ORIGIN,
  openView,
  setTweaks,
  settingsButton,
  openMoveMenu,
  openDepsNode,
  settled,
} from './helpers';

// axe-core on every view and on every transient state of the UI, at 1280x800 and 320x256 (WCAG 1.4.10 at 400 %).
// Zero tolerance: any violation fails (the audit's baseline of known violations is gone).
// `wcag2aa` already carries `color-contrast`; it is enabled again explicitly so it cannot silently drop out.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const axe = (page: Page) =>
  new AxeBuilder({ page }).options({ rules: { 'color-contrast': { enabled: true } } }).withTags(TAGS);

const US = 'US-200'; // writable in-progress story of the fixture

type Scene = { name: string; open: (p: Page) => Promise<void> };

/** The Move menu's "Blocked" item, found by its shortcut (6) rather than by its translated name. */
const blockedItem = (p: Page) => p.getByRole('menu').locator('[aria-keyshortcuts="6"]');

async function openPrompt(p: Page) {
  await openView(p, 'kanban');
  await openMoveMenu(p, US);
  await blockedItem(p).click();
  await expect(p.locator('dialog.prompt-dialog[open] .dialog-input')).toBeFocused();
}

/** Success toast without writing to the shared server: the PATCH is answered by the test. */
async function showToasts(p: Page) {
  await p.route(`**/api/stories/${US}/status`, async (route) => {
    const { stories } = await (await p.request.get('/api/stories')).json();
    const story = { ...stories.find((s: { id: string }) => s.id === US), status: 'review' };
    await route.fulfill({ json: { story, version: 'test' } });
  });
  await p.goto('/#/kanban?story=US-NOPE-99'); // unknown story -> persistent error toast
  await expect(p.locator('.toast.error')).toBeVisible();
  await openMoveMenu(p, US);
  await p.getByRole('menu').getByRole('menuitem').first().click();
  await expect(p.locator('.toast.success')).toBeVisible();
}


const scenes: Scene[] = [
  ...VIEWS.map((v) => ({ name: v.name, open: (p: Page) => openView(p, v.name) })),
  {
    name: 'story-detail',
    open: async (p) => {
      await openView(p, 'kanban');
      await p.locator('[data-card-id]').first().click();
      await expect(p.locator('dialog.modal[open]')).toBeVisible();
    },
  },
  {
    name: 'tweaks',
    open: async (p) => {
      await openView(p, 'kanban');
      await settingsButton(p).click();
      await expect(p.locator('dialog.tweaks-dialog[open]')).toBeVisible();
    },
  },
  { name: 'move-menu', open: async (p) => (await openView(p, 'kanban'), openMoveMenu(p, US)) },
  { name: 'prompt', open: openPrompt },
  {
    name: 'prompt-error',
    open: async (p) => {
      await openPrompt(p);
      await p.keyboard.press('Enter'); // empty reason -> inline error tied to the field
      await expect(p.locator('dialog.prompt-dialog .dialog-error')).toBeVisible();
    },
  },
  {
    name: 'filter-active',
    open: async (p) => {
      await p.goto('/#/kanban?prio=must,should&sort=priority&dir=desc');
      await expect(p.locator('.fb-chip[aria-pressed="true"]')).toHaveCount(2);
    },
  },
  {
    name: 'backlog-filter-active',
    open: async (p) => {
      await p.goto('/#/backlog?q=US&prio=should');
      await expect(p.locator('.fb-chip[aria-pressed="true"]')).toHaveCount(1);
    },
  },
  {
    name: 'filter-no-results',
    open: async (p) => {
      await p.goto('/#/kanban?q=zzzz-no-such-story');
      await expect(p.locator('.board-empty')).toBeVisible();
    },
  },
  {
    name: 'not-found',
    open: async (p) => {
      await p.goto('/#/nope');
      await expect(p.locator('.not-found')).toBeVisible();
    },
  },
  { name: 'deps-node', open: async (p) => (await openView(p, 'deps'), openDepsNode(p)) },
  {
    name: 'docs-tree-open',
    open: async (p) => {
      await openView(p, 'docs');
      const nav = p.locator('details.docs-nav');
      if ((await nav.getAttribute('open')) === null) await nav.locator('> summary').click();
      for (const group of await p.locator('.group-header').all()) {
        if ((await group.getAttribute('aria-expanded')) === 'false') await group.click();
      }
      await expect(p.locator('.docs-nav a.tree-item').first()).toBeVisible();
    },
  },
  { name: 'toasts', open: showToasts },
  {
    name: 'readonly',
    open: async (p) => {
      await p.goto(`${READONLY_ORIGIN}/#/kanban`);
      await expect(p.locator('.banner-info')).toBeVisible();
      await expect(p.locator('[data-card-id]').first()).toBeAttached();
    },
  },
  ...ACCENTS.flatMap((accent) => [
    {
      name: `board-accent-${accent}`,
      open: async (p: Page) => {
        await setTweaks(p, { accent });
        await p.goto('/#/kanban?prio=must');
        await expect(p.locator('.fb-chip[aria-pressed="true"]')).toHaveCount(1);
      },
    },
    { name: `prompt-accent-${accent}`, open: async (p: Page) => (await setTweaks(p, { accent }), openPrompt(p)) },
  ]),
];

// Story editing screens (none of them writes to the shared server: the 409 is played by the test).
const openCreate = async (p: Page) => {
  await openView(p, 'kanban');
  await p.getByRole('button', { name: 'New story' }).click();
  await expect(p.getByRole('dialog', { name: 'New story' })).toBeVisible();
};
const openEdit = async (p: Page) => {
  await p.goto(`/#/kanban?story=${US}`);
  await p.locator('dialog.modal[open]').getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(p.locator('dialog.modal[open] #edit-title')).toBeFocused();
};

scenes.push(
  { name: 'create-form', open: openCreate },
  {
    name: 'create-form-errors',
    open: async (p) => {
      await openCreate(p);
      await p.getByRole('button', { name: 'Create story' }).click();
      await expect(p.locator('.sf-summary')).toBeFocused();
    },
  },
  { name: 'story-edit', open: openEdit },
  {
    name: 'story-edit-errors',
    open: async (p) => {
      await openEdit(p);
      await p.locator('#edit-title').fill('');
      await p.getByRole('button', { name: 'Save changes' }).click();
      await expect(p.locator('dialog.modal[open] .sf-summary')).toBeFocused();
    },
  },
  {
    name: 'story-delete-confirm',
    open: async (p) => {
      await p.goto(`/#/kanban?story=${US}`);
      await p.locator('dialog.modal[open]').getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(p.getByRole('dialog', { name: /Delete .* Its file is moved to the trash/ })).toBeVisible();
    },
  },
  {
    name: 'story-conflict',
    open: async (p) => {
      await p.route(`**/api/stories/${US}`, async (route) => {
        if (route.request().method() !== 'PATCH') return route.fallback();
        await route.fulfill({ status: 409, json: { error: 'conflict', reason: 'stale', current: {} } });
      });
      await openEdit(p);
      await p.locator('#edit-title').fill('A different title');
      await p.getByRole('button', { name: 'Save changes' }).click();
      await expect(p.getByRole('group', { name: 'This story was changed elsewhere' })).toBeFocused();
    },
  }
);

for (const vp of [DESKTOP, ZOOM400]) {
  for (const scene of scenes) {
    const key = `${scene.name}@${vp.width}x${vp.height}`;
    test(`axe: ${key}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await scene.open(page);
      await settled(page);
      const { violations } = await axe(page).analyze();
      const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(summary, `axe violations in ${key}`).toEqual([]);
    });
  }
}

// ---- Planning, sprint lifecycle, WIP limits, velocity (audit K-22). Read-only scenes: nothing is written to the shared server.
const planningScenes: Scene[] = [
  {
    name: 'backlog-plan-selection',
    open: async (p) => {
      await openView(p, 'backlog');
      await p.locator('#plan-scope').selectOption('backlog');
      const box = p.locator('li.story-item .row-select input').first();
      await expect(box).toBeVisible();
      await box.check();
      await expect(p.locator('.plan-actions')).toBeVisible();
      await expect(p.locator('.plan-status')).not.toHaveText('');
    },
  },
  {
    name: 'sprint-form',
    open: async (p) => {
      await openView(p, 'sprints');
      await p.locator('.sprint-list-actions button').click();
      await expect(p.locator('dialog.sprint-form[open]')).toBeVisible();
    },
  },
  {
    name: 'sprint-form-errors',
    open: async (p) => {
      await openView(p, 'sprints');
      await p.locator('.sprint-list-actions button').click();
      await p.locator('dialog.sprint-form[open] button[type="submit"]').click();
      await expect(p.locator('dialog.sprint-form .sf-summary')).toBeFocused();
      await expect(p.locator('#sf-name-error')).toBeVisible();
    },
  },
  {
    name: 'close-sprint-dialog',
    open: async (p) => {
      await p.goto('/#/sprints/sprint-9-auth-premium');
      await p.locator('.sd-actions button').click();
      await expect(p.locator('dialog.close-sprint[open] fieldset')).toBeVisible();
    },
  },
  {
    name: 'wip-settings',
    open: async (p) => {
      await openView(p, 'kanban');
      await settingsButton(p).click();
      await expect(p.locator('dialog.tweaks-dialog[open] #wip-in-progress')).toBeVisible();
    },
  },
  {
    name: 'wip-settings-errors',
    open: async (p) => {
      await openView(p, 'kanban');
      await settingsButton(p).click();
      await p.locator('#wip-in-progress').fill('100');
      await p.locator('#wip-in-progress').press('Enter');
      await expect(p.locator('#wip-in-progress-error')).toBeVisible();
    },
  },
  {
    name: 'wip-settings-readonly',
    open: async (p) => {
      await p.goto(`${READONLY_ORIGIN}/#/kanban`);
      await expect(p.locator('[data-card-id]').first()).toBeAttached();
      await settingsButton(p).click();
      await expect(p.locator('.wip-readonly')).toBeVisible();
    },
  },
  {
    name: 'velocity-data',
    open: async (p) => {
      await openView(p, 'burndown');
      await expect(p.locator('section.velocity table tbody tr').first()).toBeVisible();
      await expect(p.locator('section.velocity [role="img"] canvas')).toBeAttached();
    },
  },
  {
    name: 'velocity-empty',
    open: async (p) => {
      await p.route('**/api/velocity', (route) => route.fulfill({ json: { sprints: [], average: null } }));
      await openView(p, 'burndown');
      await expect(p.locator('section.velocity .empty-note')).toBeVisible();
    },
  },
];

for (const vp of [DESKTOP, ZOOM400]) {
  for (const scene of planningScenes) {
    const key = `${scene.name}@${vp.width}x${vp.height}`;
    test(`axe: ${key}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await scene.open(page);
      await settled(page);
      const { violations } = await axe(page).analyze();
      const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(summary, `axe violations in ${key}`).toEqual([]);
    });
  }
}
