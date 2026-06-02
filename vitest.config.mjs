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
        'cli/lib/flattener.js',
        // Browser-only Svelte client : tested via Vitest browser mode in a later milestone.
        'cli/kanban/client/**',
        // Orchestrator with server/watcher side-effects ; covered end-to-end by tests/kanban/e2e-server.test.js.
        'cli/lib/kanban.js',
      ],
      reporter: ['text', 'json-summary'],
      thresholds: {
        // Branch coverage temporarily lowered from 85 to 84 in v8.3.2 release.
        // Sprint 2 (CVE-2025-59536 hardening in doctor.js) and Sprint 4 (deep
        // refactor) added new branches in doctor.js, update.js, path-safety.js.
        // Tests added in hotfixes c871fd67 and 12801341 brought branch coverage
        // from 79.36% (doctor) and 90% (path-safety) up to 87.3% and 100%
        // respectively, but the global stayed at 84.97% because of pre-existing
        // gaps in cli/kanban/server/services/ (frontmatter.js, sprint-cache.js) and
        // cli/index.js. Audit 2026-06-01: real branch coverage is 85.79% — threshold
        // raised 84 → 85. Track tightening to 90 (those 4 files) in a dedicated PR.
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90,
      },
    },
  },
});
