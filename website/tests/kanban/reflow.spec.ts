import { test, expect } from '@playwright/test';
import { VIEWS, ZOOM400, openView } from './helpers';

// WCAG 1.4.10 Reflow : at 320 px wide there is no page-level horizontal scroll and every
// view stays reachable from the navigation.
test.use({ viewport: ZOOM400 });

for (const view of VIEWS) {
  test(`reflow: #/${view.name} has no horizontal page scroll at 320px`, async ({ page }) => {
    await openView(page, view.name);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('reflow: navigation between views stays reachable at 320px', async ({ page }) => {
  await openView(page, 'kanban');
  for (const view of VIEWS.slice(1)) {
    const link = page.getByRole('navigation', { name: 'Views' }).locator(`a[href="#/${view.name}"]`);
    await expect(link).toBeInViewport();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#/${view.name}$`));
  }
});
