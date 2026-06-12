import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');

// Files that legitimately reference old patterns (migration guides, historical archives)
const EXCLUDED_FILES = ['MIGRATION-v6.md', 'MIGRATION-v7.md', 'CHANGELOG-archive.md'];

// Recursively find all .md files in a directory
function findMdFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findMdFiles(fullPath));
    else if (entry.name.endsWith('.md') && !EXCLUDED_FILES.includes(entry.name)) results.push(fullPath);
  }
  return results;
}

describe('v7.0.0 namespace integrity', () => {
  it('no residual /common: references to moved commands', () => {
    const movedPatterns = [
      /\/common:workflow-/,
      /\/common:sprint-retro/,
      /\/common:sprint-review/,
      /\/common:sprint-start/,
      /\/common:team-/,
      /\/common:recette/,
      /\/common:fix-bug-tdd/,
      /\/common:uiux-/,
      /\/common:a11y-/,
      /\/common:ui-design-tokens/,
      /\/common:ux-user-flow/,
      /\/common:docker-optimize/,
    ];

    const dirs = ['Dev', 'Project', 'Infra', 'docs', '.claude'];
    const violations = [];

    for (const dir of dirs) {
      const fullDir = path.join(PROJECT_ROOT, dir);
      for (const file of findMdFiles(fullDir)) {
        const content = fs.readFileSync(file, 'utf8');
        for (const pattern of movedPatterns) {
          if (pattern.test(content)) {
            violations.push(`${path.relative(PROJECT_ROOT, file)}: ${pattern}`);
          }
        }
      }
    }

    expect(violations, `Found ${violations.length} residual old patterns`).toEqual([]);
  });

  it('no residual /project: references to moved commands', () => {
    const movedPatterns = [/\/project:sprint-/, /\/project:gate-/, /\/project:project-/];

    const dirs = ['Dev', 'Project', 'Infra', 'docs', '.claude'];
    const violations = [];

    for (const dir of dirs) {
      const fullDir = path.join(PROJECT_ROOT, dir);
      for (const file of findMdFiles(fullDir)) {
        const content = fs.readFileSync(file, 'utf8');
        for (const pattern of movedPatterns) {
          if (pattern.test(content)) {
            violations.push(`${path.relative(PROJECT_ROOT, file)}: ${pattern}`);
          }
        }
      }
    }

    expect(violations, `Found ${violations.length} residual old patterns`).toEqual([]);
  });

  it('i18n parity for new Dev namespaces', () => {
    const langs = ['en', 'fr', 'es', 'de', 'pt'];
    const namespaces = ['Workflow', 'Team', 'QA', 'UIUX'];

    for (const ns of namespaces) {
      const enDir = path.join(PROJECT_ROOT, 'Dev/i18n/en', ns, 'commands');
      if (!fs.existsSync(enDir)) {
        expect.fail(`Missing directory: Dev/i18n/en/${ns}/commands`);
        continue;
      }
      const enFiles = fs.readdirSync(enDir).sort();

      for (const lang of langs) {
        if (lang === 'en') continue;
        const langDir = path.join(PROJECT_ROOT, 'Dev/i18n', lang, ns, 'commands');
        expect(fs.existsSync(langDir), `Missing: Dev/i18n/${lang}/${ns}/commands`).toBe(true);
        const langFiles = fs.readdirSync(langDir).sort();
        expect(langFiles, `Parity mismatch: Dev/i18n/${lang}/${ns}/commands`).toEqual(enFiles);
      }
    }
  });

  it('i18n parity for new Project namespaces', () => {
    const langs = ['en', 'fr', 'es', 'de', 'pt'];
    const namespaces = ['Sprint', 'Gate'];

    for (const ns of namespaces) {
      const enDir = path.join(PROJECT_ROOT, 'Project/i18n/en', ns, 'commands');
      if (!fs.existsSync(enDir)) {
        expect.fail(`Missing directory: Project/i18n/en/${ns}/commands`);
        continue;
      }
      const enFiles = fs.readdirSync(enDir).sort();

      for (const lang of langs) {
        if (lang === 'en') continue;
        const langDir = path.join(PROJECT_ROOT, 'Project/i18n', lang, ns, 'commands');
        expect(fs.existsSync(langDir), `Missing: Project/i18n/${lang}/${ns}/commands`).toBe(true);
        const langFiles = fs.readdirSync(langDir).sort();
        expect(langFiles, `Parity mismatch: Project/i18n/${lang}/${ns}/commands`).toEqual(enFiles);
      }
    }
  });

  it('correct command counts per namespace', () => {
    const expected = {
      'Dev/i18n/en/Common/commands': 14,
      'Dev/i18n/en/Workflow/commands': 9,
      'Dev/i18n/en/Team/commands': 4,
      'Dev/i18n/en/QA/commands': 6,
      'Dev/i18n/en/UIUX/commands': 8,
      'Project/i18n/en/commands': 34,
      'Project/i18n/en/Sprint/commands': 5,
      'Project/i18n/en/Gate/commands': 7,
      'Infra/i18n/en/Docker/commands': 5,
    };

    for (const [dir, expectedCount] of Object.entries(expected)) {
      const fullDir = path.join(PROJECT_ROOT, dir);
      const files = fs.readdirSync(fullDir).filter((f) => f.endsWith('.md'));
      expect(files.length, `${dir}: expected ${expectedCount}, got ${files.length}`).toBe(expectedCount);
    }
  });
});
