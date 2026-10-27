import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

// PM roadmap phase 2 (8.25.0): /project: 34 + /gate: 7 + 3 /common checks
// merge into 5 /project: commands + /gate:check. Old commands stay as
// redirect stubs until 9.0.
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const LANGS = ['en', 'fr', 'es', 'de', 'pt'];
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

const P = (lang, f) => `Project/i18n/${lang}/commands/${f}.md`;
const G = (lang, f) => `Project/i18n/${lang}/Gate/commands/${f}.md`;
const C = (lang, f) => `Dev/i18n/${lang}/Common/commands/${f}.md`;

// new command -> { file, subcommands it must document }
const MERGED = {
  '/project:backlog': { file: P, name: 'backlog', mentions: ['add', 'list', 'edit', 'move', 'epic', 'story', 'task', '.bmad/sprint-status.yaml'] },
  '/project:reverse': { file: P, name: 'reverse', mentions: ['scan', 'prd', 'stories', 'gaps', 'all'] },
  '/project:trace': { file: P, name: 'trace', mentions: ['--gaps', '--by-priority'] },
  '/project:report': { file: P, name: 'report', mentions: ['burndown', 'metrics', 'deps', '--critical'] },
  '/project:migrate': { file: P, name: 'migrate', mentions: ['--analyze', '--dry-run', '--resync', '--stories'] },
  '/gate:check': {
    file: G,
    name: 'check',
    mentions: ['prd', 'spec', 'backlog', 'sprint', 'story', 'alignment', 'commit', 'merge', 'release', 'all', '--phase', 'project-management/prd.md'],
  },
};

// old command file -> [replaced-by, invocation the stub must run]
const STUBS = [
  [P, 'add-epic', '/project:backlog', '/project:backlog add epic'],
  [P, 'add-story', '/project:backlog', '/project:backlog add story'],
  [P, 'add-task', '/project:backlog', '/project:backlog add task'],
  [P, 'list-epics', '/project:backlog', '/project:backlog list epic'],
  [P, 'list-stories', '/project:backlog', '/project:backlog list story'],
  [P, 'list-tasks', '/project:backlog', '/project:backlog list task'],
  [P, 'update-epic', '/project:backlog', '/project:backlog edit epic'],
  [P, 'update-story', '/project:backlog', '/project:backlog edit story'],
  [P, 'move-task', '/project:backlog', '/project:backlog move task'],
  [P, 'scan', '/project:reverse', '/project:reverse scan'],
  [P, 'reverse-prd', '/project:reverse', '/project:reverse prd'],
  [P, 'reverse-stories', '/project:reverse', '/project:reverse stories'],
  [P, 'gap-analysis', '/project:reverse', '/project:reverse gaps'],
  [P, 'coverage-map', '/project:trace', '/project:trace --gaps'],
  [P, 'burndown', '/project:report', '/project:report burndown'],
  [P, 'metrics', '/project:report', '/project:report metrics'],
  [P, 'dependencies', '/project:report', '/project:report deps'],
  [P, 'critical-path', '/project:report', '/project:report deps --critical'],
  [P, 'analyze-backlog', '/project:migrate', '/project:migrate --analyze'],
  [P, 'migrate-backlog', '/project:migrate', '/project:migrate'],
  [P, 'update-stories', '/project:migrate', '/project:migrate --stories'],
  [P, 'sync-backlog', '/project:migrate', '/project:migrate --resync'],
  [P, 'checkpoint', '/gate:check', '/gate:check --phase='],
  [G, 'validate-prd', '/gate:check', '/gate:check prd'],
  [G, 'validate-techspec', '/gate:check', '/gate:check spec'],
  [G, 'validate-backlog', '/gate:check', '/gate:check backlog'],
  [G, 'validate-sprint', '/gate:check', '/gate:check sprint'],
  [G, 'validate-story', '/gate:check', '/gate:check story'],
  [G, 'validate-alignment', '/gate:check', '/gate:check alignment'],
  [G, 'report', '/gate:check', '/gate:check all'],
  [C, 'pre-commit-check', '/gate:check', '/gate:check commit'],
  [C, 'pre-merge-check', '/gate:check', '/gate:check merge'],
  [C, 'release-checklist', '/gate:check', '/gate:check release'],
];

const read = (rel) => fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8');
const fm = (raw) => yaml.load(FRONTMATTER_RE.exec(raw)[1]);

describe('phase 2 merged commands', () => {
  it.each(LANGS.flatMap((l) => Object.keys(MERGED).map((c) => [l, c])))('%s %s exists and documents its subcommands', (lang, cmd) => {
    const { file, name, mentions } = MERGED[cmd];
    const raw = read(file(lang, name));
    expect(fm(raw).deprecated).not.toBe(true);
    for (const m of mentions) expect(raw, `${lang} ${cmd} should mention ${m}`).toContain(m);
  });
});

describe('phase 2 redirect stubs', () => {
  it.each(LANGS.flatMap((l) => STUBS.map(([file, ...rest]) => [l, ...rest, file])))('%s %s -> %s', (lang, name, replacedBy, invocation, file) => {
    const raw = read(file(lang, name));
    const data = fm(raw);
    expect(data.deprecated).toBe(true);
    expect(data['replaced-by']).toBe(replacedBy);
    expect(raw).toContain(invocation);
    expect(raw).toContain('$ARGUMENTS');
  });
});
