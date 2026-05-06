/**
 * Stryker Mutator config — Claude Craft
 *
 * Phase 2 audit P2-13. Scope initial : cli/ (CLI principal de claude-craft).
 * Run plein  : npx stryker run
 * Run PR     : npx stryker run --incremental (mute uniquement les fichiers
 *              changés depuis la dernière exécution → -90 % temps CI).
 * CI : .github/workflows/mutation.yml (nightly full, on-PR incremental).
 *
 * Seuils 2026-05 (audit 2026-05-06 TEST-002) :
 *   - high  : 70 % (objectif qualité)
 *   - low   : 55 % (warning)
 *   - break : 50 % (échec CI sous ce seuil — score actuel ~58 %)
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
    low: 55,
    break: 50,
  },
  // Incremental mode: persist results between runs and mute only files whose
  // content changed since the last green run. Activate via --incremental on
  // the CLI; this config ensures the report file is always written for both
  // modes.
  incremental: false, // CLI flag overrides; default off for the nightly full run
  incrementalFile: 'reports/mutation/stryker-incremental.json',
  timeoutMS: 30_000,
  concurrency: 2,
  disableTypeChecks: 'cli/**/*.js',
  htmlReporter: {
    baseDir: 'reports/mutation',
  },
};
