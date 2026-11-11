import { expect, type Page } from '@playwright/test';

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
