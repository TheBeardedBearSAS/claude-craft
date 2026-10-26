import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import * as yaml from 'js-yaml';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const MANIFEST = path.join(PROJECT_ROOT, 'config/removed-commands.yaml');
const PRUNE = path.join(PROJECT_ROOT, 'Dev/scripts/prune-removed-commands.sh');
const LANGS = ['base', 'en', 'fr', 'es', 'de', 'pt'];

const removed = () => yaml.load(fs.readFileSync(MANIFEST, 'utf8')).removed;

// Every `<ns>/<name>.md` currently distributed, from the i18n sources.
function distributed() {
  const out = new Set();
  for (const root of ['Dev/i18n', 'Infra/i18n', 'Project/i18n']) {
    for (const lang of LANGS) {
      const langDir = path.join(PROJECT_ROOT, root, lang);
      if (!fs.existsSync(langDir)) continue;
      for (const entry of fs.readdirSync(langDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const flat = entry.name === 'commands';
        const dir = flat ? path.join(langDir, 'commands') : path.join(langDir, entry.name, 'commands');
        if (!fs.existsSync(dir)) continue;
        const ns = flat ? root.split('/')[0].toLowerCase() : entry.name.toLowerCase();
        for (const f of fs.readdirSync(dir)) if (f.endsWith('.md')) out.add(`${ns}/${f}`);
      }
    }
  }
  return out;
}

describe('config/removed-commands.yaml', () => {
  it('lists <namespace>/<command>.md paths only', () => {
    expect(removed().length).toBeGreaterThan(0);
    for (const p of removed()) expect(p).toMatch(/^[a-z]+\/[a-z0-9-]+\.md$/);
  });

  it('only lists commands that are no longer distributed', () => {
    const live = distributed();
    expect(removed().filter((p) => live.has(p))).toEqual([]);
  });

  it('removes the maintainer-only commands from distribution', () => {
    expect(removed()).toEqual(
      expect.arrayContaining(['common/add-technology.md', 'common/audit-claude-alignment.md', 'common/audit-freshness.md'])
    );
  });

  it('ships with the npm package', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
    expect(pkg.files).toContain('config/removed-commands.yaml');
  });
});

describe('prune-removed-commands.sh', () => {
  it('deletes listed files from <target>/.claude/commands and keeps the others', () => {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-prune-'));
    const cmds = path.join(target, '.claude/commands/common');
    fs.mkdirSync(cmds, { recursive: true });
    fs.writeFileSync(path.join(cmds, 'add-technology.md'), 'old');
    fs.writeFileSync(path.join(cmds, 'init.md'), 'kept');

    execFileSync('bash', [PRUNE, target, MANIFEST]);

    expect(fs.existsSync(path.join(cmds, 'add-technology.md'))).toBe(false);
    expect(fs.readFileSync(path.join(cmds, 'init.md'), 'utf8')).toBe('kept');
    fs.rmSync(target, { recursive: true, force: true });
  });

  it('is a no-op on a target without .claude/commands', () => {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-prune-'));
    expect(() => execFileSync('bash', [PRUNE, target, MANIFEST])).not.toThrow();
    fs.rmSync(target, { recursive: true, force: true });
  });

  it.each([
    'Project/install-project-commands.sh',
    'Dev/scripts/install-common-rules.sh',
    'cli/lib/update.js',
  ])('is called by %s', (file) => {
    expect(fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8')).toContain('prune-removed-commands.sh');
  });
});
