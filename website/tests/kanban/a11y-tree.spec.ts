import { test, expect, type Page } from '@playwright/test';
import { privateServer, DESKTOP } from './helpers';

// What a screen-reader user is given on the essential journeys, asserted on the accessibility tree: roles, names,
// states (expanded, invalid, disabled, checked), descriptions, focus, and the text of the live regions at the
// moment it is announced. Run under each desktop engine (chromium, firefox, webkit).
//
// Limits, said plainly: no screen reader runs here. The tree is the one Playwright computes in the page (ARIA and
// HTML-AAM rules, toMatchAriaSnapshot / getByRole), the same algorithm in every engine; it does not read the
// platform accessibility API (UIA, AT-SPI, NSAccessibility) nor what NVDA, JAWS, VoiceOver or TalkBack say.
// The journey closes the active sprint, so it runs on its own server (port 3795, private copy of the fixture).

const srv = privateServer(3795, 'a11y-tree');
const ACTIVE = 'sprint-9-auth-premium';
const ACTIVE_NAME = 'Auth (finalisation) + Premium web (E4)';

test.describe.configure({ mode: 'serial' });
test.use({ baseURL: srv.origin, viewport: DESKTOP });
test.beforeAll(() => srv.start());
test.afterAll(() => srv.stop());

/**
 * Records what each live region (role status / alert, or aria-live) holds each time its content changes: that text
 * is what a screen reader announces. Installed before the app boots.
 */
async function recordAnnouncements(page: Page) {
  await page.addInitScript(() => {
    const said: string[] = [];
    (window as unknown as { __said: string[] }).__said = said;
    const live = (n: Node | null) =>
      (n instanceof Element ? n : n?.parentElement)?.closest('[role="status"], [role="alert"], [aria-live]');
    new MutationObserver((records) => {
      const regions = new Set(records.map((r) => live(r.target)).filter(Boolean) as Element[]);
      for (const region of regions) {
        const text = (region.textContent ?? '').replace(/\s+/g, ' ').trim();
        if (text) said.push(`${region.getAttribute('role') ?? 'live'}: ${text}`);
      }
    }).observe(document, { subtree: true, childList: true, characterData: true });
  });
}
const announcements = (page: Page) => page.evaluate(() => (window as unknown as { __said: string[] }).__said.splice(0));

let story = ''; // on the board (active sprint)
let planned = ''; // created in the backlog by the form, planned afterwards

test('open a card: its name, its Move button, then the detail dialog and where the focus lands', async ({ page }) => {
  story = (
    await srv.call('post', '/api/stories', { title: 'Tree story', story_points: 3, priority: 'must', sprint_id: ACTIVE })
  ).story.id;
  await page.goto('/#/kanban');
  const card = page.locator('li.card', { has: page.locator(`[data-card-id="${story}"]`) });
  await expect(card).toMatchAriaSnapshot(`
    - listitem:
      - text: ${story} Priority Must
      - 'heading "Open ${story}: Tree story" [level=3]':
        - 'button "Open ${story}: Tree story"': Tree story
      - paragraph: Priority Must. 3 story points. Unassigned
      - text: 3 story points
      - img "Unassigned"
      - button "Move ${story}": Move
  `);

  await card.getByRole('button', { name: `Open ${story}: Tree story` }).click();
  const dialog = page.getByRole('dialog', { name: 'Tree story' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toMatchAriaSnapshot(`
    - dialog "Tree story":
      - button "Close"
      - heading "Tree story" [level=2]
      - button "Edit"
      - button "Delete"
      - combobox "Move to":
        - option "Choose a status" [selected]
        - option "Ready for dev"
      - button "Move" [disabled]
  `);
  // A modal dialog (showModal): the engine makes the rest of the page inert, out of the reading order.
  // (Playwright's role queries do not model that inertness, hence the :modal check.)
  expect(await dialog.evaluate((d) => d.matches(':modal'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(card.getByRole('button', { name: `Open ${story}: Tree story` })).toBeFocused();
});

test('move a card with the Move menu: expanded state, menu items, one announcement, focus back on the card', async ({
  page,
}) => {
  await recordAnnouncements(page);
  await page.goto('/#/kanban');
  const move = page.getByRole('button', { name: `Move ${story}` });
  await expect(move).toHaveAttribute('aria-haspopup', 'menu');
  await expect(move).toHaveAttribute('aria-expanded', 'false');
  await announcements(page); // what the first render put in the regions (filter count) is not part of the move
  await move.click();
  await expect(move).toHaveAttribute('aria-expanded', 'true');
  const menu = page.getByRole('menu', { name: `Move ${story} to:` });
  await expect(menu).toMatchAriaSnapshot(`
    - 'menu "Move ${story} to:"':
      - menuitem "Ready for dev"
  `);
  await expect(menu.getByRole('menuitem', { name: 'Ready for dev' })).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.getByRole('status', { name: 'Notifications' })).toHaveText(`${story} moved to Ready for dev`);
  // The menu item is gone: the focus is on the card, now in its new column.
  await expect(page.getByRole('button', { name: `Open ${story}: Tree story` })).toBeFocused();
  await expect(move).toHaveAttribute('aria-expanded', 'false');
  // Said once, in the polite region, and nothing in the assertive one.
  await expect.poll(() => announcements(page)).toEqual([`status: ${story} moved to Ready for dev`]);
  await expect(page.getByRole('alert', { name: 'Errors' })).toHaveText('');
});

test('a refused move is said in the Errors region, with its reason', async ({ page }) => {
  await recordAnnouncements(page);
  await page.goto('/#/kanban');
  await expect(page.getByRole('button', { name: `Move ${story}` })).toBeVisible();
  await announcements(page);
  // Review needs tasks, all done: the server refuses (the menu offers the step, the gate decides).
  await page.getByRole('button', { name: `Move ${story}` }).click();
  await page.getByRole('menuitem', { name: 'In progress' }).click();
  await expect(page.getByRole('status', { name: 'Notifications' })).toContainText(`${story} moved to In progress`);
  await page.getByRole('button', { name: `Move ${story}` }).click();
  await page.getByRole('menuitem', { name: 'Review' }).click();
  const errors = page.getByRole('alert', { name: 'Errors' });
  await expect(errors).toMatchAriaSnapshot(`
    - alert "Errors":
      - text: "Status change failed: the story needs tasks, all of them done (see Tasks in its detail)"
      - button "Dismiss notification"
  `);
  await expect
    .poll(() => announcements(page))
    .toContain('alert: Status change failed: the story needs tasks, all of them done (see Tasks in its detail)');
});

test('create a story with a validation error: summary focused, field invalid and described by its error', async ({
  page,
}) => {
  await page.goto('/#/kanban');
  await page.getByRole('button', { name: 'New story' }).click();
  const form = page.getByRole('dialog', { name: 'New story' });
  const title = form.getByRole('textbox', { name: 'Title (required)' });
  await expect(title).toBeFocused();
  await expect(title).not.toHaveAttribute('aria-invalid', 'true');

  await form.getByRole('button', { name: 'Create story' }).click();
  await expect(form.locator('.sf-summary')).toBeFocused();
  await expect(form.locator('.sf-summary')).toMatchAriaSnapshot(`
    - group "1 field needs your attention.":
      - paragraph: 1 field needs your attention.
      - list:
        - listitem:
          - 'link "Title: A title is required."'
  `);
  await expect(title).toHaveAttribute('aria-invalid', 'true');
  await expect(title).toHaveAccessibleDescription('A title is required.');

  await form.locator('.sf-summary').getByRole('link', { name: /Title/ }).click();
  await expect(title).toBeFocused();
  await title.fill('Tree story two');
  await form.getByRole('button', { name: 'Create story' }).click();
  const created = page.getByRole('status', { name: 'Notifications' });
  await expect(created).toContainText(/US-[\w-]+ created/);
  planned = /(US-[\w-]+) created/.exec((await created.textContent()) ?? '')![1];
  await expect(page.getByRole('dialog', { name: 'Tree story two' })).toBeVisible();
});

test('plan a story from the backlog: the row button names the sprint, the result is announced', async ({ page }) => {
  await recordAnnouncements(page);
  await page.goto('/#/backlog');
  await page.locator('#plan-target').selectOption(ACTIVE);
  // Epics are disclosures, collapsed by default: the state is exposed, and follows the click.
  const noEpic = page.getByRole('button', { name: /^No epic Stories without an epic/ });
  await expect(noEpic).toHaveAttribute('aria-expanded', 'false');
  await noEpic.click();
  await expect(noEpic).toHaveAttribute('aria-expanded', 'true');
  const row = page.locator('li.story-item', { hasText: planned });
  const add = row.getByRole('button', { name: new RegExp(`^Add to ${escape(ACTIVE_NAME)}`) });
  await expect(add).toBeVisible();
  await announcements(page);
  await add.click();
  await expect.poll(() => announcements(page)).toContain(`status: ${planned} added to ${ACTIVE_NAME}`);
});

test('close the sprint: the choices are radios with their state, the result takes the focus', async ({ page }) => {
  await page.goto(`/#/sprints/${ACTIVE}`);
  await page.getByRole('button', { name: 'Close sprint' }).click();
  const dialog = page.getByRole('dialog', { name: /Close sprint/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('group', { name: 'Unfinished stories' })).toMatchAriaSnapshot(`
    - group "Unfinished stories":
      - radio "Move them back to the backlog" [checked]
  `);
  await dialog.getByRole('button', { name: 'Close sprint', exact: true }).click();
  const result = page.locator('.sd-result');
  await expect(result).toBeFocused();
  await expect(result).toContainText('Sprint closed');
  await expect(result).toContainText('unfinished stories moved to the backlog');
  await expect(page.getByRole('status', { name: 'Notifications' })).toContainText(`Sprint ${ACTIVE_NAME} closed`);
});

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
