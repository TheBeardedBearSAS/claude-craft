import { test } from '@playwright/test';
import { openView } from './helpers';
// Temporary diagnostics for WebKit on macOS (removed before the end of the PR).
test('probe: focus around a click that opens and closes a dialog', async ({ page }) => {
  await page.addInitScript(() => {
    const d = (el: Element | null) => (el ? `${el.tagName}.${(el as HTMLElement).className}`.slice(0, 50) : 'null');
    (window as any).__log = [];
    for (const type of ['pointerdown', 'mousedown', 'focusin', 'focusout', 'mouseup', 'click'])
      document.addEventListener(type, (e) => (window as any).__log.push(`${type} target=${d(e.target as Element)} active=${d(document.activeElement)}`), true);
  });
  await openView(page, 'kanban');
  await page.getByRole('button', { name: 'New story' }).click();
  await page.locator('dialog[open] #create-title').waitFor();
  console.log('AFTER OPEN active', await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80)));
  await page.locator('dialog[open]').getByRole('button', { name: 'Cancel' }).click();
  await page.locator('dialog[open]').waitFor({ state: 'detached' });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  console.log('AFTER CLOSE active', await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80)));
  console.log('LOG\n' + (await page.evaluate(() => (window as any).__log.join('\n'))));
  console.log('UA', await page.evaluate(() => navigator.userAgent));
});
