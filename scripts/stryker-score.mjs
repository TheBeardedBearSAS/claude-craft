#!/usr/bin/env node
/**
 * stryker-score.mjs — Compute the mutation score from a Stryker v9 JSON report.
 *
 * Stryker v9's JSON report has no top-level `.mutationScore`, so we derive it from
 * mutant statuses: score = detected / valid * 100, where
 *   detected = Killed + Timeout
 *   valid    = detected + Survived + NoCoverage
 *
 * Replaces the inline `node -e` (CommonJS `require`) in mutation.yml which silently
 * degraded to N/A on any error (audit 2026-06-08 P3). ESM + explicit handling.
 *
 * Usage: node scripts/stryker-score.mjs [path/to/mutation.json]
 * Prints the score (e.g. "58.20%") or "N/A" — always exits 0 (reporting only).
 *
 * @module scripts/stryker-score
 */
import { readFileSync } from 'node:fs';

const path = process.argv[2] || 'reports/mutation/mutation.json';

let report;
try {
  report = JSON.parse(readFileSync(path, 'utf8'));
} catch (err) {
  console.log('N/A');
  console.error(`stryker-score: report unreadable (${err.message})`);
  process.exit(0);
}

const mutants = Object.values(report.files || {}).flatMap((f) => f.mutants || []);
const detected = mutants.filter((m) => m.status === 'Killed' || m.status === 'Timeout').length;
const undetected = mutants.filter((m) => m.status === 'Survived' || m.status === 'NoCoverage').length;
const valid = detected + undetected;

console.log(valid ? `${((detected / valid) * 100).toFixed(2)}%` : 'N/A');
