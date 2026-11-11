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
