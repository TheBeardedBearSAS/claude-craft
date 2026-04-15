import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '.',
    exclude: ['website/**', 'video/**', 'node_modules/**'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    coverage: {
      provider: 'v8',
      include: ['cli/**/*.js'],
      exclude: [
        'cli/flattener.js',
        // Browser-only Svelte client : tested via Vitest browser mode in a later milestone.
        'cli/kanban/client/**',
        // Orchestrator with server/watcher side-effects ; covered end-to-end by tests/kanban/e2e-server.test.js.
        'cli/lib/kanban.js',
      ],
      reporter: ['text', 'json-summary'],
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90,
      },
    },
  },
});
