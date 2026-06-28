import { test, expect } from '@playwright/test';

// Goal: zero console errors on every screen type × locale sample.
// Covers landing (shared LandingPage.vue) and doc pages (shared VitePress theme).
const PAGES = [
  './',
  'fr/',
  'es/',
  'de/',
  'pt/',
  'en/faq',
  'fr/faq',
  'en/getting-started/quickstart',
  'en/reference/commands',
  'en/guides/01-getting-started',
];

for (const path of PAGES) {
  test(`no console errors on ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('requestfailed', (req) => {
      const url = req.url();
      const reason = req.failure()?.errorText ?? '';
      // ERR_ABORTED = VitePress prefetch of linked pages cancelled when the test ends —
      // a cancellation, not a real resource failure. Ignore it (and favicon noise);
      // flag genuine failures (404, connection refused, etc.).
      if (reason.includes('ERR_ABORTED')) return;
      if (url.endsWith('favicon.ico')) return;
      errors.push(`requestfailed: ${url} (${reason})`);
    });

    await page.goto(path, { waitUntil: 'networkidle' });
    expect(errors, errors.join('\n')).toEqual([]);
  });
}
