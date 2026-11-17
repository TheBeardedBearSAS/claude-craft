import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

// 10.0.0: the redirect stubs scheduled in 9.0 ("Obsolète (retirée en 10.0)") are removed — the five per-axis
// /<tech>:check-<axis> commands of 13 stacks and /bear-team:sprint. Users get docs/MIGRATION-v10.md and the
// installers / `bear-craft update` prune the files listed in config/removed-commands.yaml.
const ROOT = path.resolve(import.meta.dirname, '../..');
const LANGS = ['en', 'fr', 'es', 'de', 'pt'];
const STACKS = {
  angular: 'Angular',
  csharp: 'CSharp',
  flutter: 'Flutter',
  laravel: 'Laravel',
  paperclip: 'Paperclip',
  php: 'PHP',
  python: 'Python',
  react: 'React',
  reactnative: 'ReactNative',
  symfony: 'Symfony',
  vercel: 'Vercel',
  vite: 'Vite',
  vuejs: 'VueJS',
};
// <old command file> -> new invocation (also the MIGRATION-v10 table, with <tech> standing for the stack)
const AXES = {
  architecture: 'architecture',
  'code-quality': 'code-quality',
  security: 'security',
  testing: 'testing',
  compliance: 'all',
};

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const manifest = () => yaml.load(read('config/removed-commands.yaml'));
const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
        const p = path.join(dir, d.name);
        return d.isDirectory() ? walk(p) : [p];
      })
    : [];

const REMOVED = [
  ...Object.keys(STACKS).flatMap((ns) => Object.keys(AXES).map((axis) => `${ns}/check-${axis}.md`)),
  'team/sprint.md',
];

describe('10.0: deprecated stubs are gone', () => {
  it('removes 66 commands (13 stacks x 5 axes + team:sprint)', () => {
    expect(REMOVED).toHaveLength(66);
  });

  it('no command file is marked deprecated any more, anywhere', () => {
    const files = ['Dev', 'Infra', 'Project', '.claude/commands'].flatMap((d) => walk(path.join(ROOT, d)));
    const deprecated = files.filter(
      (f) => f.endsWith('.md') && /^---\n[\s\S]*?\ndeprecated: true\n/.test(fs.readFileSync(f, 'utf8'))
    );
    expect(deprecated.map((f) => path.relative(ROOT, f))).toEqual([]);
  });

  it('the 66 files exist in none of the 5 languages, the maintainer layer or the plugins', () => {
    const stackDir = { ...STACKS, team: 'Team' };
    const present = [];
    for (const rel of REMOVED) {
      const [ns, file] = rel.split('/');
      const candidates = [
        `.claude/commands/bear-${ns}/${file}`,
        ...LANGS.map((l) => `Dev/i18n/${l}/${stackDir[ns]}/commands/${file}`),
        ...LANGS.map((l) => `marketplaces/${l}/plugins/bear-${ns}/commands/${file}`),
      ];
      present.push(...candidates.filter((c) => fs.existsSync(path.join(ROOT, c))));
    }
    expect(present).toEqual([]);
  });

  it('every removed command is listed under removed: so installs are pruned, and nothing is still scheduled', () => {
    const { removed, scheduled } = manifest();
    expect(removed).toEqual(expect.arrayContaining(REMOVED));
    expect(scheduled ?? {}).toEqual({});
  });

  it('docs/MIGRATION-v10.md maps every removed command to its replacement', () => {
    const doc = read('docs/MIGRATION-v10.md');
    expect(doc).toContain('## Removed in 10.0');
    for (const [old, axis] of Object.entries(AXES)) {
      expect(doc, old).toContain(`\`/<tech>:check-${old}\``);
      expect(doc, old).toContain(`\`/bear-<tech>:check ${axis}\``);
    }
    expect(doc).toContain('`/bear-team:delivery --phase=implementation`');
  });
});
