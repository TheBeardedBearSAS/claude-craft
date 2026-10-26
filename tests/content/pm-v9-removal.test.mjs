import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

// PM roadmap phase 4 (9.0.0): the redirect stubs of 8.25/8.26 are removed,
// with the /sprint: namespace. Users get docs/MIGRATION-v9.md, and the
// installers prune the files listed in config/removed-commands.yaml.
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const LANGS = ['en', 'fr', 'es', 'de', 'pt'];

// <ns>/<command> -> new invocation (also the MIGRATION-v9 table)
export const REMOVED_IN_V9 = {
  'project/add-epic': '/project:backlog add epic',
  'project/add-story': '/project:backlog add story',
  'project/add-task': '/project:backlog add task',
  'project/list-epics': '/project:backlog list epic',
  'project/list-stories': '/project:backlog list story',
  'project/list-tasks': '/project:backlog list task',
  'project/update-epic': '/project:backlog edit epic',
  'project/update-story': '/project:backlog edit story',
  'project/move-task': '/project:backlog move task',
  'project/scan': '/project:reverse scan',
  'project/reverse-prd': '/project:reverse prd',
  'project/reverse-stories': '/project:reverse stories',
  'project/gap-analysis': '/project:reverse gaps',
  'project/coverage-map': '/project:trace --gaps',
  'project/burndown': '/project:report burndown',
  'project/metrics': '/project:report metrics',
  'project/dependencies': '/project:report deps',
  'project/critical-path': '/project:report deps --critical',
  'project/analyze-backlog': '/project:migrate --analyze',
  'project/migrate-backlog': '/project:migrate',
  'project/update-stories': '/project:migrate --stories',
  'project/sync-backlog': '/project:migrate --resync',
  'project/checkpoint': '/gate:check --phase=<phase>',
  'project/run-sprint': '/workflow:implement',
  'project/run-epic': '/workflow:implement --epic',
  'project/run-queue': '/workflow:implement --queue',
  'project/board': '/workflow:status --board',
  'project/batch-status': '/workflow:status --queue',
  'project/generate-prd': '/workflow:plan --only=prd',
  'project/generate-backlog': '/workflow:plan --only=backlog',
  'project/generate-tech-spec': '/workflow:design',
  'project/generate-constitution': '/workflow:design --constitution',
  'project/decompose-tasks': '/workflow:start',
  'gate/validate-prd': '/gate:check prd',
  'gate/validate-techspec': '/gate:check spec',
  'gate/validate-backlog': '/gate:check backlog',
  'gate/validate-sprint': '/gate:check sprint',
  'gate/validate-story': '/gate:check story',
  'gate/validate-alignment': '/gate:check alignment',
  'gate/report': '/gate:check all',
  'sprint/dev': '/workflow:implement',
  'sprint/status': '/workflow:status',
  'sprint/next-story': '/project:backlog next story',
  'sprint/transition': '/project:backlog move story',
  'sprint/auto-route': '/project:backlog move story --auto',
  'workflow/analyze': '/workflow:plan --research',
  'qa/report': '/qa:status --report',
  'common/pre-commit-check': '/gate:check commit',
  'common/pre-merge-check': '/gate:check merge',
  'common/release-checklist': '/gate:check release',
  'common/daily-standup': '/workflow:status --standup',
  'common/setup-project-context': '/common:init --context',
};

const SOURCE_DIR = {
  project: (l) => `Project/i18n/${l}/commands`,
  gate: (l) => `Project/i18n/${l}/Gate/commands`,
  sprint: (l) => `Project/i18n/${l}/Sprint/commands`,
  workflow: (l) => `Dev/i18n/${l}/Workflow/commands`,
  qa: (l) => `Dev/i18n/${l}/QA/commands`,
  common: (l) => `Dev/i18n/${l}/Common/commands`,
};

const exists = (rel) => fs.existsSync(path.join(PROJECT_ROOT, rel));
const read = (rel) => fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return e.name.endsWith('.md') ? [full] : [];
  });
}

describe('9.0: deprecated stubs are gone', () => {
  it('lists the 52 commands retired by the PM simplification', () => {
    expect(Object.keys(REMOVED_IN_V9)).toHaveLength(52);
  });

  it.each(LANGS)('no stub file is distributed any more (lang=%s)', (lang) => {
    const left = Object.keys(REMOVED_IN_V9)
      .map((k) => {
        const [ns, name] = k.split('/');
        return `${SOURCE_DIR[ns](lang)}/${name}.md`;
      })
      .filter(exists);
    expect(left).toEqual([]);
    expect(exists(`Project/i18n/${lang}/Sprint`)).toBe(false);
  });

  it('no command file is still marked deprecated', () => {
    const files = ['Dev', 'Infra', 'Project', '.claude/commands'].flatMap((d) => walk(path.join(PROJECT_ROOT, d)));
    const deprecated = files.filter((f) => /^---\n[\s\S]*?\ndeprecated: true\n/.test(fs.readFileSync(f, 'utf8')));
    expect(deprecated.map((f) => path.relative(PROJECT_ROOT, f))).toEqual([]);
  });

  it('the removal manifest prunes every retired command at upgrade', () => {
    const removed = yaml.load(read('config/removed-commands.yaml')).removed;
    for (const k of Object.keys(REMOVED_IN_V9)) expect(removed).toContain(`${k}.md`);
  });
});

describe('docs/MIGRATION-v9.md', () => {
  it('maps every retired command to its replacement', () => {
    const doc = read('docs/MIGRATION-v9.md');
    for (const [k, inv] of Object.entries(REMOVED_IN_V9)) {
      const [ns, name] = k.split('/');
      expect(doc, `/${ns}:${name}`).toContain(`\`/${ns}:${name}\``);
      expect(doc, inv).toContain(`\`${inv}\``);
    }
  });
});

describe('9.0: no reference to a removed command', () => {
  // Historical documents (migration guides, changelogs, README "What's New", audits) legitimately name the old commands.
  const SKIP = /MIGRATION-v\d|CHANGELOG|\/internal\/|\/training\/|\/marketing\/|\/docs\/audit\//;
  const names = Object.keys(REMOVED_IN_V9).map((k) => {
    const [ns, name] = k.split('/');
    return `/${ns}:${name}`;
  });
  const banned = new RegExp(`(${names.map((n) => n.replace(/[/:-]/g, '\\$&')).join('|')})(?![\\w-])|/sprint:`);

  it('distributed sources, docs and README only use the 9.0 commands', () => {
    const files = [
      ...['Dev', 'Infra', 'Project', 'Tools', 'docs'].flatMap((d) => walk(path.join(PROJECT_ROOT, d))),
    ].filter((f) => !SKIP.test(f));
    const hits = [];
    for (const f of files) {
      fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        const m = banned.exec(line);
        if (m) hits.push(`${path.relative(PROJECT_ROOT, f)}:${i + 1} ${m[0]}`);
      });
    }
    expect(hits).toEqual([]);
  });
});
