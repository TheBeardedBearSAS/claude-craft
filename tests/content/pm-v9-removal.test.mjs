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
  'project/add-epic': '/bear-project:backlog add epic',
  'project/add-story': '/bear-project:backlog add story',
  'project/add-task': '/bear-project:backlog add task',
  'project/list-epics': '/bear-project:backlog list epic',
  'project/list-stories': '/bear-project:backlog list story',
  'project/list-tasks': '/bear-project:backlog list task',
  'project/update-epic': '/bear-project:backlog edit epic',
  'project/update-story': '/bear-project:backlog edit story',
  'project/move-task': '/bear-project:backlog move task',
  'project/scan': '/bear-project:reverse scan',
  'project/reverse-prd': '/bear-project:reverse prd',
  'project/reverse-stories': '/bear-project:reverse stories',
  'project/gap-analysis': '/bear-project:reverse gaps',
  'project/coverage-map': '/bear-project:trace --gaps',
  'project/burndown': '/bear-project:report burndown',
  'project/metrics': '/bear-project:report metrics',
  'project/dependencies': '/bear-project:report deps',
  'project/critical-path': '/bear-project:report deps --critical',
  'project/analyze-backlog': '/bear-project:migrate --analyze',
  'project/migrate-backlog': '/bear-project:migrate',
  'project/update-stories': '/bear-project:migrate --stories',
  'project/sync-backlog': '/bear-project:migrate --resync',
  'project/checkpoint': '/bear-gate:check --phase=<phase>',
  'project/run-sprint': '/bear-workflow:implement',
  'project/run-epic': '/bear-workflow:implement --epic',
  'project/run-queue': '/bear-workflow:implement --queue',
  'project/board': '/bear-workflow:status --board',
  'project/batch-status': '/bear-workflow:status --queue',
  'project/generate-prd': '/bear-workflow:plan --only=prd',
  'project/generate-backlog': '/bear-workflow:plan --only=backlog',
  'project/generate-tech-spec': '/bear-workflow:design',
  'project/generate-constitution': '/bear-workflow:design --constitution',
  'project/decompose-tasks': '/bear-workflow:start',
  'gate/validate-prd': '/bear-gate:check prd',
  'gate/validate-techspec': '/bear-gate:check spec',
  'gate/validate-backlog': '/bear-gate:check backlog',
  'gate/validate-sprint': '/bear-gate:check sprint',
  'gate/validate-story': '/bear-gate:check story',
  'gate/validate-alignment': '/bear-gate:check alignment',
  'gate/report': '/bear-gate:check all',
  'sprint/dev': '/bear-workflow:implement',
  'sprint/status': '/bear-workflow:status',
  'sprint/next-story': '/bear-project:backlog next story',
  'sprint/transition': '/bear-project:backlog move story',
  'sprint/auto-route': '/bear-project:backlog move story --auto',
  'workflow/analyze': '/bear-workflow:plan --research',
  'qa/report': '/bear-qa:status --report',
  'common/pre-commit-check': '/bear-gate:check commit',
  'common/pre-merge-check': '/bear-gate:check merge',
  'common/release-checklist': '/bear-gate:check release',
  'common/daily-standup': '/bear-workflow:status --standup',
  'common/setup-project-context': '/bear-common:init --context',
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

  it('no command file is still marked deprecated, except the stubs scheduled for a later release', () => {
    const scheduled = yaml.load(read('config/removed-commands.yaml')).scheduled ?? {};
    const files = ['Dev', 'Infra', 'Project', '.claude/commands'].flatMap((d) => walk(path.join(PROJECT_ROOT, d)));
    const deprecated = files.filter((f) => /^---\n[\s\S]*?\ndeprecated: true\n/.test(fs.readFileSync(f, 'utf8')));
    const unscheduled = deprecated.filter((f) => {
      // <Ns>/commands/<name>.md (i18n sources) or .claude/commands/<ns>/<name>.md
      const parts = path.relative(PROJECT_ROOT, f).split(path.sep);
      const ns = parts.at(-2) === 'commands' ? parts.at(-3) : parts.at(-2);
      return !(`${ns.toLowerCase().replace(/^bear-/, '')}/${parts.at(-1)}` in scheduled);
    });
    expect(unscheduled.map((f) => path.relative(PROJECT_ROOT, f))).toEqual([]);
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
      // MIGRATION-v9.md is history: it documents the pre-10.0 (unprefixed) command names.
      const legacyInv = inv.replace(/\/bear-/g, '/');
      expect(doc, `/${ns}:${name}`).toContain(`\`/${ns}:${name}\``);
      expect(doc, legacyInv).toContain(`\`${legacyInv}\``);
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
