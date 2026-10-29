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
    // '' = flat Project/i18n/<lang>/commands/ (/project: namespace)
    const namespaces = ['', 'Gate']; // 9.0: /sprint: removed

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
      // 8.24.0: add-technology, audit-* are maintainer-only (repo .claude/commands/common/)
      // 9.0: pre-commit/pre-merge/release → /gate:check, daily-standup → /workflow:status, setup-project-context → /common:init
      'Dev/i18n/en/Common/commands': 6, // 9.0: research-context7 removed
      'Dev/i18n/base/Common/commands': 4,
      'Dev/i18n/en/Workflow/commands': 9,
      'Dev/i18n/en/Team/commands': 4,
      'Dev/i18n/en/QA/commands': 5,
      'Dev/i18n/en/UIUX/commands': 7, // 9.0: orchestrator removed
      // 9.0: backlog, reverse, trace, report, migrate
      'Project/i18n/en/commands': 5,
      'Project/i18n/en/Gate/commands': 1,
      'Infra/i18n/en/Docker/commands': 5,
    };

    for (const [dir, expectedCount] of Object.entries(expected)) {
      const fullDir = path.join(PROJECT_ROOT, dir);
      const files = fs.readdirSync(fullDir).filter((f) => f.endsWith('.md'));
      expect(files.length, `${dir}: expected ${expectedCount}, got ${files.length}`).toBe(expectedCount);
    }
  });

  // Lot 7 (9.0): one /<tech>:check <axis> per stack, team:sprint folded into team:delivery.
  const TECH = {
    angular: 'Angular', csharp: 'CSharp', flutter: 'Flutter', laravel: 'Laravel', paperclip: 'Paperclip',
    php: 'PHP', python: 'Python', react: 'React', reactnative: 'ReactNative', symfony: 'Symfony',
    vercel: 'Vercel', vite: 'Vite', vuejs: 'VueJS',
  };

  it.each(Object.entries(TECH))('%s exposes /<tech>:check in .claude and the 5 languages', (ns, dir) => {
    const files = ['en', 'fr', 'es', 'de', 'pt'].map((l) => `Dev/i18n/${l}/${dir}/commands/check.md`);
    if (ns !== 'paperclip') files.push(`.claude/commands/${ns}/check.md`);
    expect(files.filter((f) => !fs.existsSync(path.join(PROJECT_ROOT, f)))).toEqual([]);
  });

  // Stacks whose axis checklists live in the language-neutral base/ layer also ship an
  // English /<tech>:check router and aggregate there; the 5 languages override them.
  it.each(['Angular', 'CSharp', 'Laravel', 'PHP', 'Vercel', 'Vite', 'VueJS'])(
    '%s exposes /<tech>:check in Dev/i18n/base',
    (dir) => {
      const files = [`commands/check.md`, 'checks/all.md', 'checks/architecture.md'].map(
        (f) => `Dev/i18n/base/${dir}/${f}`
      );
      expect(files.filter((f) => !fs.existsSync(path.join(PROJECT_ROOT, f)))).toEqual([]);
    }
  );

  it('no reference to the 9.0 tech check-* stubs or /team:sprint outside the stubs and migration notes', () => {
    const banned = new RegExp(
      `/(?:${Object.keys(TECH).join('|')}):check-(?:architecture|code-quality|security|testing|compliance)(?![\\w-])|/team:sprint(?![\\w-])`
    );
    // Generated index of every command file (stubs included) and historical documents.
    const SKIP = /MIGRATION-v\d|CHANGELOG|COMMANDS-FULL-REFERENCE|\/internal\/|\/training\/|\/marketing\/|\/docs\/audit\//;
    // A migration note may name the old command next to its replacement.
    const NAMES_REPLACEMENT = /:check (?:architecture|code-quality|security|testing|all)\b|:check <|\/team:delivery/;
    const files = ['Dev', 'Project', 'Infra', 'Tools', 'docs', '.claude']
      .flatMap((d) => findMdFiles(path.join(PROJECT_ROOT, d)))
      .filter((f) => !SKIP.test(f));
    files.push(path.join(PROJECT_ROOT, 'README.md'));
    const hits = [];
    for (const f of files) {
      const raw = fs.readFileSync(f, 'utf8');
      if (/^deprecated: true$/m.test(raw)) continue;
      let heading = '';
      raw.split('\n').forEach((line, i) => {
        if (line.startsWith('## ')) heading = line;
        // README release notes of 8.x keep the command names of their time.
        if (/What's New in v[0-8]\./.test(heading)) return;
        const m = banned.exec(line);
        if (m && !NAMES_REPLACEMENT.test(line)) hits.push(`${path.relative(PROJECT_ROOT, f)}:${i + 1} ${m[0]}`);
      });
    }
    expect(hits, `${hits.length} references to retired commands`).toEqual([]);
  });
});
