import { defineConfig } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// Kanban browser harness (audit K-12). Serves cli/kanban/client/dist (built by
// `npm run kanban:build`) from a throw-away COPY of a fixture project, so the
// specs may write into it (move a card) without touching tests/fixtures.
const PORT = 3799;
const READONLY_PORT = 3798; // second server started with --readonly (read-only banner, no write controls)
const repoRoot = path.resolve(here, '../../..');
const fixture = path.join(repoRoot, 'tests/fixtures/wrandly-anon');
const workDir = path.join(os.tmpdir(), 'cc-kanban-e2e-project');
const readonlyDir = path.join(os.tmpdir(), 'cc-kanban-e2e-readonly');

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  timeout: 30_000,
  retries: 0,
  workers: 1, // a single shared server copy (specs move cards and put them back)
  reporter: [['list'], ['html', { outputFolder: path.join(here, 'report'), open: 'never' }]],
  outputDir: path.join(here, 'results'),
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    headless: true,
    trace: 'retain-on-failure',
    // CI installs Playwright Chromium; the Docker harness uses system Chromium (CHROME_PATH).
    launchOptions: process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] }
      : {},
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: [
    {
      command: `rm -rf "${workDir}" && cp -r "${fixture}" "${workDir}" && node cli/index.js kanban "${workDir}" --port=${PORT}`,
      cwd: repoRoot,
      url: `http://127.0.0.1:${PORT}/api/stories`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `rm -rf "${readonlyDir}" && cp -r "${fixture}" "${readonlyDir}" && node cli/index.js kanban "${readonlyDir}" --port=${READONLY_PORT} --readonly`,
      cwd: repoRoot,
      url: `http://127.0.0.1:${READONLY_PORT}/api/stories`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
