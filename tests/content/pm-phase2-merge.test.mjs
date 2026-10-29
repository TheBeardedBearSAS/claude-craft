import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

// PM roadmap phase 2 (8.25.0): /project: 34 + /gate: 7 + 3 /common checks
// merge into 5 /project: commands + /gate:check. Old commands stay as
// redirect stubs until 9.0 (removed in 9.0, see pm-v9-removal.test.mjs).
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

