import { test, expect, type Page } from '@playwright/test';

// A browser allows six connections per server over HTTP/1.1, and every open board keeps one for live updates. A
// board that stayed connected in the background would use them all up: the seventh tab would wait for its document
// for ever (seen in CI as a `page.goto` that hung for 90 s after quick page changes).

const hide = (page: Page, hidden: boolean) =>
  page.evaluate((value) => {
    Object.defineProperty(document, 'hidden', { value, configurable: true });
    Object.defineProperty(document, 'visibilityState', { value: value ? 'hidden' : 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);

const live = (page: Page) => page.locator('.live.live-on');

test('tabs: an eighth board loads while seven others sit in the background', async ({ context }) => {
  test.setTimeout(60_000);
  const pages: Page[] = [];
  for (let i = 0; i < 8; i++) {
    const page = await context.newPage();
    await page.goto('/#/kanban', { timeout: 15_000 });
    await expect(page.locator('[data-card-id]').first()).toBeAttached();
    await expect(live(page)).toBeVisible();
    await hide(page, true); // the user moves on to the next tab
    pages.push(page);
  }
  await Promise.all(pages.map((page) => page.close()));
});

test('tabs: a board that comes back to the foreground reconnects and catches up', async ({ page, request }) => {
  const origin = new URL(test.info().project.use.baseURL!).origin;
  const created = await request.post('/api/stories', {
    data: { title: 'E2E background tab', story_points: 1, sprint_id: 'sprint-9-auth-premium' },
    headers: { Origin: origin },
  });
  const id = (await created.json()).story.id as string;
  try {
    await page.goto('/#/kanban');
    await expect(page.locator(`[data-card-id="${id}"]`)).toBeVisible();
    await expect(live(page)).toBeVisible();

    await hide(page, true);
    const moved = await request.patch(`/api/stories/${id}/status`, {
      data: { status: 'ready-for-dev' },
      headers: { Origin: origin },
    });
    expect(moved.ok()).toBe(true);

    await hide(page, false);
    await expect(live(page)).toBeVisible();
    await expect(
      page.locator('section.column', { has: page.locator('#col-ready-for-dev') }).locator(`[data-card-id="${id}"]`)
    ).toBeVisible();
  } finally {
    await request.delete(`/api/stories/${id}?force=1`, { headers: { Origin: origin } });
  }
});
