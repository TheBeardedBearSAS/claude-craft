import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

// PM roadmap phase 3 (8.26.0): /sprint:, /workflow:, /qa:, /team:, /common:
// merge around the main path init → plan → design → start → implement →
// review → retro (+ status). team:delivery is kept (user decision 2026-10-26).
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const LANGS = ['en', 'fr', 'es', 'de', 'pt'];
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

const W = (l, f) => `Dev/i18n/${l}/Workflow/commands/${f}.md`;
const Q = (l, f) => `Dev/i18n/${l}/QA/commands/${f}.md`;
const C = (l, f) => `Dev/i18n/${l}/Common/commands/${f}.md`;
const B = (l, f) => `Dev/i18n/base/Common/commands/${f}.md`;
const P = (l, f) => `Project/i18n/${l}/commands/${f}.md`;
const S = (l, f) => `Project/i18n/${l}/Sprint/commands/${f}.md`;

const MERGED = [
  [W, 'implement', ['--epic', '--resume', '--parallel', '--queue', '--story', '/team:delivery', '.bmad/sprint-status.yaml']],
  [W, 'status', ['--board', '--queue', '--standup', '--gates', 'workflow-status.yaml', '.bmad/sprint-status.yaml']],
  [W, 'plan', ['--research', '--only=prd', '--only=backlog', 'project-management/prd.md', 'Implements']],
  [W, 'design', ['--constitution', 'project-management/tech-spec.md']],
  [W, 'start', ['--tasks-only', 'tasks/TASK-', '.bmad/sprint-status.yaml']],
  [W, 'auto-sprint', ['--from-prd', '/workflow:plan', '/team:delivery']],
  [P, 'backlog', ['next story', 'move story', '--auto', 'routing.auto_transitions']],
  [Q, 'status', ['--report']],
  [B, 'init', ['--context']],
];


const read = (rel) => fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8');
const fm = (raw) => yaml.load(FRONTMATTER_RE.exec(raw)[1]);

describe('phase 3 merged commands', () => {
  it.each(LANGS.flatMap((l) => MERGED.map(([file, name, mentions]) => [l, name, file, mentions])))(
    '%s %s documents its absorbed modes',
    (lang, name, file, mentions) => {
      const raw = read(file(lang, name));
      expect(fm(raw).deprecated).not.toBe(true);
      for (const m of mentions) expect(raw, `${lang} ${name} should mention ${m}`).toContain(m);
    }
  );
});


describe('sub-agents-patterns is documentation, not an action', () => {
  it('ships as a skill and is retired as a command', () => {
    expect(fs.existsSync(path.join(PROJECT_ROOT, 'Dev/i18n/base/Common/skills/sub-agents-patterns/SKILL.md'))).toBe(true);
    for (const lang of LANGS) expect(fs.existsSync(path.join(PROJECT_ROOT, C(lang, 'sub-agents-patterns')))).toBe(false);
    expect(read('config/removed-commands.yaml')).toContain('common/sub-agents-patterns.md');
  });
});
