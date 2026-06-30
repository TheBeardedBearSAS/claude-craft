#!/usr/bin/env node
/**
 * verify-versions.mjs — Gate CI de cohérence des versions.
 *
 * Source unique de vérité : config/versions.yaml.
 * Détecte la dérive de versions (cause-racine identifiée par l'audit 2026-06-08) :
 *   1. cli/lib/tech-registry.js : chaque `version` doit égaler `stacks.<key>.registry`.
 *   2. Fichiers vitrine (.claude/CLAUDE.md, README.md) : aucun token obsolète (denylist).
 *
 * Usage : node scripts/verify-versions.mjs   (alias : npm run lint:versions)
 * Exit code 1 en cas de divergence.
 *
 * @module scripts/verify-versions
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';
import { TECH_REGISTRY } from '../cli/lib/tech-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const errors = [];
const versions = yaml.load(fs.readFileSync(path.join(ROOT, 'config', 'versions.yaml'), 'utf8'));

// 1. tech-registry.js ↔ versions.yaml (égalité stricte)
for (const [key, spec] of Object.entries(versions.stacks ?? {})) {
  const entry = TECH_REGISTRY[key];
  if (!entry) {
    errors.push(`versions.yaml déclare le stack "${key}" absent de tech-registry.js`);
    continue;
  }
  if (entry.version !== spec.registry) {
    errors.push(
      `Dérive de version pour "${key}" : tech-registry.js="${entry.version}" ≠ versions.yaml="${spec.registry}"`
    );
  }
}

// 2. Denylist de tokens obsolètes dans les fichiers vitrine
const SHOWCASE_FILES = [
  '.claude/CLAUDE.md',
  'README.md',
  'website/.vitepress/theme/LandingPage.vue',
  'docs/PREREQUISITES.md',
  'docs/AGENT-TEAMS-GUIDE.md',
  // Settings templates distribués dans les 5 langues (TOKEN-001)
  'Dev/i18n/en/Common/templates/settings.json.template',
  'Dev/i18n/fr/Common/templates/settings.json.template',
  'Dev/i18n/es/Common/templates/settings.json.template',
  'Dev/i18n/de/Common/templates/settings.json.template',
  'Dev/i18n/pt/Common/templates/settings.json.template',
];
for (const rel of SHOWCASE_FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const content = fs.readFileSync(abs, 'utf8');
  for (const token of versions.denylist ?? []) {
    if (content.includes(token)) {
      errors.push(`Token obsolète "${token}" trouvé dans ${rel} (mettre à jour vers la version courante)`);
    }
  }
}

if (errors.length > 0) {
  console.error('\n❌ verify-versions : dérive de versions détectée\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n${errors.length} problème(s). Source de vérité : config/versions.yaml\n`);
  process.exit(1);
}

console.log('✅ verify-versions : versions cohérentes (tech-registry.js + fichiers vitrine ↔ config/versions.yaml)');
