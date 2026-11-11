import { expect, request as pwRequest, type APIRequestContext, type Page } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Each view with a selector that proves fixture content is rendered. */
export const VIEWS = [
  { name: 'kanban', ready: '[data-card-id]' },
  { name: 'backlog', ready: '.epic' },
  { name: 'sprints', ready: '.sprint-item' },
  { name: 'burndown', ready: '.burn-card' },
  { name: 'deps', ready: '.deps-canvas' },
  { name: 'docs', ready: '.tree-item' },
] as const;

export const DESKTOP = { width: 1280, height: 800 };
export const ZOOM400 = { width: 320, height: 256 };

export async function openView(page: Page, name: string) {
  await page.goto(`/#/${name}`);
  const view = VIEWS.find((v) => v.name === name)!;
  await expect(page.locator(view.ready).first()).toBeAttached(); // may be off-screen/collapsed at 320px
}

/**
 * The key that moves the focus to the next control, as a user of the engine presses it. Safari on macOS stops Tab
 * on text fields and pop-up menus only, unless its setting "Press Tab to highlight each item on a webpage" is on;
 * Option+Tab reaches every control (buttons, links, checkboxes). Playwright's WebKit on macOS keeps that default.
 * Every keyboard walk of the specs goes through this key, so a control out of Option+Tab's reach still fails.
 */
export const tabKey = (page: Page, shift = false) => {
  const optionTab = process.platform === 'darwin' && page.context().browser()?.browserType().name() === 'webkit';
  return `${shift ? 'Shift+' : ''}${optionTab ? 'Alt+' : ''}Tab`;
};

/** Press Tab (Option+Tab under WebKit on macOS, see tabKey). */
export const pressTab = (page: Page, shift = false) => page.keyboard.press(tabKey(page, shift));

/** Second server of the harness, started with --readonly (see playwright.config.ts). */
export const READONLY_ORIGIN = 'http://127.0.0.1:3798';

/** The four accents of the Settings panel (text contrast depends on the accent, audit K-30). */
export const ACCENTS = ['lime', 'cyan', 'violet', 'amber'] as const;

/** Persist display settings before the app boots (same storage as the Settings panel). */
export async function setTweaks(page: Page, tweaks: Record<string, string | null>) {
  await page.addInitScript((value) => localStorage.setItem('cc-kanban-tweaks', JSON.stringify(value)), tweaks);
}

/** The settings button, found by position rather than by its (translated) name. */
export const settingsButton = (page: Page) => page.locator('header.topbar button.icon-btn');

/** Open the Move menu of a card with the pointer. */
export async function openMoveMenu(page: Page, id: string) {
  await page.locator(`[data-move-id="${id}"]`).click();
  await expect(page.getByRole('menu')).toBeVisible();
}

/** Click across the dependency canvas until a node is hit and its panel opens (nodes are drawn on a canvas). */
export async function openDepsNode(page: Page) {
  const canvas = page.locator('.deps-canvas');
  await expect(canvas.locator('canvas').first()).toBeAttached();
  await canvas.scrollIntoViewIfNeeded();
  const panel = page.locator('.node-details');
  await expect
    .poll(
      async () => {
        const box = (await canvas.boundingBox())!;
        for (let y = 8; y < box.height && !(await panel.count()); y += 10) {
          for (let x = 8; x < box.width && !(await panel.count()); x += 20) await page.mouse.click(box.x + x, box.y + y);
        }
        return panel.count();
      },
      { message: 'a dependency node is hit on the canvas', timeout: 20_000 },
    )
    .toBeGreaterThan(0);
}

/**
 * A private kanban server on its own copy of the fixture, for a spec that changes shared state for good (closes
 * the active sprint). Same recipe as planning.spec.ts. Call start() in beforeAll and stop() in afterAll.
 */
export function privateServer(port: number, name: string) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const dir = path.join(os.tmpdir(), `cc-kanban-e2e-${name}`);
  const origin = `http://127.0.0.1:${port}`;
  let server: ChildProcess | undefined;
  let api: APIRequestContext | undefined;
  const call = async (method: 'get' | 'post', url: string, data?: object) =>
    (await api![method](`${origin}${url}`, { headers: { Origin: origin }, data })).json();
  return {
    origin,
    call,
    async start() {
      fs.rmSync(dir, { recursive: true, force: true });
      fs.cpSync(path.join(root, 'tests/fixtures/wrandly-anon'), dir, { recursive: true });
      server = spawn('node', ['cli/index.js', 'kanban', dir, `--port=${port}`], { cwd: root, stdio: 'ignore' });
      api = await pwRequest.newContext();
      await expect
        .poll(async () => (await api!.get(`${origin}/api/health`).catch(() => null))?.ok() ?? false, { timeout: 30_000 })
        .toBe(true);
    },
    async stop() {
      await api?.dispose();
      // Wait for the exit: a restarted worker (or --repeat-each) binds the same port right after.
      const s = server;
      if (s && s.exitCode === null) await new Promise((done) => (s.once('exit', done), s.kill()));
    },
  };
}

/**
 * WCAG 2.5.8: the controls of the page smaller than 24 x 24 CSS px (runs in the page). Shared by a11y-review.spec.ts
 * (desktop engines) and touch.spec.ts (phone emulation).
 */
export const SMALL_TARGETS = () =>
  [...document.querySelectorAll('button, a[href], input, select, summary, [role="menuitem"]')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') return false;
      if (el.closest('.sr-only, .md-body, .doc-paper, [inert]')) return false; // links inside prose (inline exception)
      if (el.closest('dialog:not([open])')) return false;
      // A checkbox or radio inside its <label>: the label is the target (it activates the control).
      const label = el.matches('input') ? el.closest('label')?.getBoundingClientRect() : null;
      if (label && label.width >= 24 && label.height >= 24) return false;
      return r.width < 24 || r.height < 24;
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return `${el.tagName.toLowerCase()}.${(el as HTMLElement).className.split(' ')[0]} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`;
    });

/**
 * Wait for the UI at rest: every finite animation and transition has ended (a cancelled one counts as ended); endless
 * ones (the live dot) are left running. Contrast and sizes are measured on the UI at rest. Under WebKit, axe caught a
 * toast half-way through its fade-in, and both contrast and size checks caught elements behind a newly opened modal
 * half-way through a hover transition (WebKit keeps :hover on them while the pointer stays still).
 */
export const settled = (p: Page) =>
  p.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined))
    )
  );
