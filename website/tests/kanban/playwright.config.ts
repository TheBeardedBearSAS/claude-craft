import { defineConfig } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// Kanban browser harness (audit K-12). Serves cli/kanban/client/dist (built by
// `npm run kanban:build`) from a throw-away COPY of a fixture project, so the
// specs may write into it (move a card) without touching tests/fixtures.
const PORT = 3799;
const repoRoot = path.resolve(here, '../../..');
const fixture = path.join(repoRoot, 'tests/fixtures/wrandly-anon');
const workDir = path.join(os.tmpdir(), 'cc-kanban-e2e-project');

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  timeout: 30_000,
  retries: 0,
  workers: 1, // known-violations capture + a single shared server copy
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
  webServer: {
    command: `rm -rf "${workDir}" && cp -r "${fixture}" "${workDir}" && node cli/index.js kanban "${workDir}" --port=${PORT}`,
    cwd: repoRoot,
    url: `http://127.0.0.1:${PORT}/api/stories`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
