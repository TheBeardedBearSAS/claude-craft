import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4173/claude-craft/',
    headless: true,
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
})
