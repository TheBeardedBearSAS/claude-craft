import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4173/claude-craft/',
    headless: true,
    // In CI/Docker, use the system Chromium (CHROME_PATH) so no Playwright browser
    // download is needed; falls back to Playwright's bundled Chromium locally.
    launchOptions: process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] }
      : {},
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 0.0.0.0',
    port: 4173,
    reuseExistingServer: true,
    cwd: '..',
  },
});
