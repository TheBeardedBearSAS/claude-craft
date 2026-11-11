import { test, expect, type Page } from '@playwright/test';
import { VIEWS, SMALL_TARGETS, privateServer, openView, openMoveMenu, settingsButton, settled } from './helpers';

// Touch use on a phone (projects mobile-chrome = Pixel 7 on Chromium, mobile-safari = iPhone 15 on WebKit: phone
// viewport, hasTouch, isMobile). Everything is done with taps, never with a drag. This is an emulation: no real
// device, no real on-screen keyboard, no real pinch.
// The journey closes the active sprint, so it runs on its own server (port 3794, private copy of the fixture).

const srv = privateServer(3794, 'touch');
const ACTIVE = 'sprint-9-auth-premium';
const ACTIVE_NAME = 'Auth (finalisation) + Premium web (E4)';

test.describe.configure({ mode: 'serial' });
test.use({ baseURL: srv.origin });
test.beforeAll(() => srv.start());
test.afterAll(() => srv.stop());

const sidewaysScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test('pinch zoom is not blocked by the viewport meta', async ({ page }) => {
  await openView(page, 'kanban');
  const meta = await page.locator('meta[name="viewport"]').getAttribute('content');
  expect(meta).toContain('width=device-width');
  expect(meta).not.toMatch(/user-scalable\s*=\s*(no|0)|maximum-scale/);
});

test('every view: no sideways scroll, and every control is at least 24 x 24 px', async ({ page }) => {
  const small: string[] = [];
  for (const v of VIEWS) {
    await openView(page, v.name);
    expect(await sidewaysScroll(page), `sideways scroll on ${v.name}`).toBeLessThanOrEqual(0);
    await settled(page);
    small.push(...(await page.evaluate(SMALL_TARGETS)).map((s) => `${v.name}: ${s}`));
  }
  await openView(page, 'kanban');
  await openMoveMenu(page, 'US-200');
  await settled(page);
  small.push(...(await page.evaluate(SMALL_TARGETS)).map((s) => `move-menu: ${s}`));
  await page.keyboard.press('Escape');
  await page.goto('/#/kanban?story=US-200');
  await expect(page.locator('dialog.modal[open]')).toBeVisible();
  await settled(page);
  small.push(...(await page.evaluate(SMALL_TARGETS)).map((s) => `detail: ${s}`));
  await page.keyboard.press('Escape');
  await settingsButton(page).tap();
  await settled(page);
  small.push(...(await page.evaluate(SMALL_TARGETS)).map((s) => `settings: ${s}`));
  expect(small).toEqual([]);
});

test('no control is revealed only on hover (there is no hover on a touch screen)', async ({ page }) => {
  const hoverOnly: string[] = [];
  for (const v of VIEWS) {
    await openView(page, v.name);
    // Every :hover rule that changes whether something is shown or reachable, and whose elements are hidden or
    // unreachable at rest: those would only appear under a mouse.
    const found = await page.evaluate(() => {
      const out: string[] = [];
      const hidden = (el: Element) => {
        const cs = getComputedStyle(el);
        return cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0 || cs.pointerEvents === 'none';
      };
      const walk = (rules: CSSRuleList) => {
        for (const rule of rules) {
          if (!(rule instanceof CSSStyleRule)) {
            if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules);
            continue;
          }
          if (!rule.selectorText.includes(':hover')) continue;
          const st = rule.style;
          if (!(st.display || st.visibility || st.opacity || st.pointerEvents)) continue;
          const atRest = rule.selectorText.replace(/:hover/g, '');
          if ([...document.querySelectorAll(atRest)].some(hidden)) out.push(rule.cssText);
        }
      };
      for (const sheet of document.styleSheets) walk(sheet.cssRules);
      return out;
    });
    hoverOnly.push(...found.map((r) => `${v.name}: ${r}`));
  }
  expect(hoverOnly).toEqual([]);
});

test('move a card with taps only, through the Move menu', async ({ page }) => {
  await openView(page, 'kanban');
  const id = (
    await srv.call('post', '/api/stories', {
      title: 'Touch story',
      story_points: 2,
      priority: 'must',
      sprint_id: ACTIVE,
    })
  ).story.id as string;
  const column = (status: string) => page.locator('section.column', { has: page.locator(`#col-${status}`) });
  await expect(column('backlog').locator(`[data-card-id="${id}"]`)).toBeAttached();
  const move = page.getByRole('button', { name: `Move ${id}` });
  await move.scrollIntoViewIfNeeded();
  await move.tap();
  await page.getByRole('menu').getByRole('menuitem', { name: 'Ready for dev' }).tap();
  await expect(page.getByRole('status', { name: 'Notifications' })).toContainText(`${id} moved to Ready for dev`);
  await expect(column('ready-for-dev').locator(`[data-card-id="${id}"]`)).toBeAttached();
  await expect
    .poll(async () => (await srv.call('get', '/api/stories')).stories.find((s: { id: string }) => s.id === id).status)
    .toBe('ready-for-dev');
});

test('plan a backlog story with taps only', async ({ page }) => {
  const id = (await srv.call('post', '/api/stories', { title: 'Touch plan', story_points: 1, priority: 'must' })).story
    .id as string;
  await openView(page, 'backlog');
  await page.locator('#plan-target').selectOption(ACTIVE);
  await page.locator('#plan-scope').selectOption('backlog');
  const add = page.locator('li.story-item', { hasText: id }).getByRole('button', { name: /^Add to/ });
  await add.scrollIntoViewIfNeeded();
  await add.tap();
  await expect(page.getByRole('status', { name: 'Notifications' })).toContainText(`${id} added to ${ACTIVE_NAME}`);
  await expect
    .poll(
      async () => (await srv.call('get', '/api/stories')).stories.find((s: { id: string }) => s.id === id).sprint_id
    )
    .toBe(ACTIVE);
});

test('a form dialog fits the phone screen and keeps the focused field visible above an on-screen keyboard', async ({
  page,
}) => {
  await openView(page, 'kanban');
  const newStory = page.getByRole('button', { name: 'New story' });
  await newStory.scrollIntoViewIfNeeded();
  await newStory.tap();
  const form = page.getByRole('dialog', { name: 'New story' });
  await expect(form).toBeVisible();
  const screen = page.viewportSize()!;
  const box = (await form.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(screen.width);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(screen.height);

  // Approximation of an on-screen keyboard: the screen loses ~40 % of its height (as with
  // interactive-widget=resizes-content). The field being typed into stays in view, and so do the dialog's actions
  // once scrolled to.
  await page.setViewportSize({ width: screen.width, height: Math.round(screen.height * 0.6) });
  const title = form.getByRole('textbox', { name: 'Title (required)' });
  await title.tap();
  await expect(title).toBeFocused();
  await expect(title).toBeInViewport();
  const create = form.getByRole('button', { name: 'Create story' });
  await create.scrollIntoViewIfNeeded();
  await expect(create).toBeInViewport();
  expect(await sidewaysScroll(page)).toBeLessThanOrEqual(0);
  await page.keyboard.press('Escape');
});

test('close the active sprint with taps only', async ({ page }) => {
  await page.goto(`/#/sprints/${ACTIVE}`);
  const close = page.getByRole('button', { name: 'Close sprint' });
  await close.scrollIntoViewIfNeeded();
  await close.tap();
  const dialog = page.locator('dialog.close-sprint[open]');
  await expect(dialog).toBeVisible();
  expect(await sidewaysScroll(page)).toBeLessThanOrEqual(0);
  const confirm = dialog.getByRole('button', { name: 'Close sprint', exact: true });
  await confirm.scrollIntoViewIfNeeded();
  await expect(confirm).toBeInViewport();
  await confirm.tap();
  await expect(page.locator('.sd-result')).toContainText('Sprint closed');
  await expect(page.locator('.sd-title .si-state')).toHaveText('closed');
});
