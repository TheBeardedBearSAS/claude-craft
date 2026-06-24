/**
 * Stryker Mutator config — Claude Craft
 *
 * Phase 2 audit P2-13. Scope initial : cli/ (CLI principal de claude-craft).
 * Run plein  : npx stryker run
 * Run PR     : npx stryker run --incremental (mute uniquement les fichiers
 *              changés depuis la dernière exécution → -90 % temps CI).
 * CI : .github/workflows/mutation.yml (nightly full, on-PR incremental).
 *
 * Seuils 2026-06 (audit 2026-06-24 P2) :
 *   - high  : 70 % (objectif qualité)
 *   - low   : 55 % (warning)
 *   - break : 55 % (échec CI — relevé de 50→55 pour supprimer la marge de dérive;
 *             cible suivante : 60 après un sprint d'amélioration de tests)
 *
 * Scope étendu : scripts/*.mjs ajouté (verify-versions, verify-claude-includes,
 *   generate-references, stryker-score — gates CI critiques). Tests à créer dans
 *   tests/scripts/ avant d'activer le blocage Stryker sur ce scope.
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
    // Audit 2026-06-24 P2: gates CI critiques dans scripts/ ajoutés au scope
    // (verify-versions.mjs, verify-claude-includes.mjs, generate-references.mjs,
    //  stryker-score.mjs). Activer le blocage CI une fois les tests/scripts/
    //  verify-versions.test.mjs et verify-claude-includes.test.mjs créés.
    'scripts/stryker-score.mjs',
    'scripts/verify-versions.mjs',
    'scripts/verify-claude-includes.mjs',
  ],
  coverageAnalysis: 'perTest',
  thresholds: {
    high: 70,
    low: 55,
    break: 55,
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
