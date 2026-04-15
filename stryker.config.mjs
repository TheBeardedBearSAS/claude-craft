/**
 * Stryker Mutator config — Claude Craft
 *
 * Phase 2 audit P2-13. Scope initial : cli/ (CLI principal de claude-craft).
 * Lance : npx stryker run
 * CI : .github/workflows/mutation.yml (nightly, non-bloquant)
 */
export default {
  packageManager: 'npm',
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.config.mjs',
  },
  reporters: ['progress', 'clear-text', 'html', 'json'],
  mutate: [
    'cli/**/*.js',
    '!cli/flattener.js',
    '!cli/kanban/client/**',
    '!cli/lib/kanban.js',
    '!cli/**/*.test.{js,mjs}',
  ],
  coverageAnalysis: 'perTest',
  thresholds: {
    high: 70,
    low: 50,
    break: null,
  },
  timeoutMS: 30_000,
  concurrency: 2,
  disableTypeChecks: 'cli/**/*.js',
  htmlReporter: {
    baseDir: 'reports/mutation',
  },
};
