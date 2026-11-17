import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Commands are identical whatever the channel: the CLI installs /bear-react:check like the
// plugins do, and an upgrade from a pre-10.0 install (commands/react/) must not leave both.
const ROOT = path.resolve(import.meta.dirname, '../..');
const TMP = path.join(ROOT, '.test-tmp', 'bear-prefixed-commands');
const COMMON = path.join(ROOT, 'Dev/scripts/install-common-rules.sh');
const REACT = path.join(ROOT, 'Dev/scripts/install-react-rules.sh');
const PROJECT = path.join(ROOT, 'Project/install-project-commands.sh');
const CLI = path.join(ROOT, 'cli/index.js');

const cmdDir = (target, name) => path.join(target, '.claude', 'commands', name);
const sh = (script, args) => spawnSync('bash', [script, '--lang=en', ...args], { encoding: 'utf8', cwd: ROOT });
const dirs = (target) => fs.readdirSync(path.join(target, '.claude', 'commands')).sort();

/** Turn a fresh install into what 9.4.0 left on disk: commands/<ns>/ instead of commands/bear-<ns>/. */
function downgradeToLegacyLayout(target) {
  const base = path.join(target, '.claude', 'commands');
  for (const d of fs.readdirSync(base).filter((n) => n.startsWith('bear-'))) {
    fs.renameSync(path.join(base, d), path.join(base, d.slice('bear-'.length)));
  }
}

function install(target) {
  fs.mkdirSync(target, { recursive: true });
  for (const [script, args] of [
    [COMMON, ['--hooks=none', '--force']],
    [REACT, ['--force']],
    [PROJECT, ['--skip-common', '--force']],
  ]) {
    const r = sh(script, [...args, target]);
    expect(r.status, r.stderr).toBe(0);
  }
}

beforeAll(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
});
afterAll(() => fs.rmSync(TMP, { recursive: true, force: true }));

describe('fresh install', { timeout: 120_000 }, () => {
  const target = path.join(TMP, 'fresh');
  beforeAll(() => install(target));

  it('installs bear-<ns> command folders and no unprefixed ones', () => {
    for (const ns of ['common', 'workflow', 'team', 'qa', 'uiux', 'gate', 'project', 'react']) {
      expect(fs.existsSync(cmdDir(target, `bear-${ns}`)), `bear-${ns}`).toBe(true);
      expect(fs.existsSync(cmdDir(target, ns)), ns).toBe(false);
    }
    expect(fs.existsSync(path.join(cmdDir(target, 'bear-react'), 'check.md'))).toBe(true);
  });

  it('keeps references/<tech> unprefixed', () => {
    expect(fs.existsSync(path.join(target, '.claude/references/react/checks/all.md'))).toBe(true);
  });

  it('the shipped commands cite the prefixed names', () => {
    const text = fs.readFileSync(path.join(cmdDir(target, 'bear-react'), 'check.md'), 'utf8');
    expect(text).toContain('.claude/references/react/checks');
    expect(text).not.toMatch(/(^|[\s`'"(\[|>])\/react:/m);
  });
});

describe('upgrade from a pre-10.0 install', { timeout: 180_000 }, () => {
  it('re-running the installers removes the old folders when they only hold shipped files', () => {
    const target = path.join(TMP, 'legacy-clean');
    install(target);
    downgradeToLegacyLayout(target);
    expect(dirs(target)).toContain('react');

    install(target);
    expect(dirs(target).filter((d) => !d.startsWith('bear-'))).toEqual([]);
    expect(fs.existsSync(path.join(cmdDir(target, 'bear-react'), 'check.md'))).toBe(true);
  });

  it('keeps an old folder holding a user file, warns, and still installs the new one', () => {
    const target = path.join(TMP, 'legacy-user-file');
    install(target);
    downgradeToLegacyLayout(target);
    fs.writeFileSync(path.join(cmdDir(target, 'react'), 'my-own-command.md'), '# mine\n');

    const r = sh(REACT, ['--force', target]);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/\.claude\/commands\/react\/ kept.*my-own-command\.md/);
    expect(fs.readFileSync(path.join(cmdDir(target, 'react'), 'my-own-command.md'), 'utf8')).toBe('# mine\n');
    expect(fs.existsSync(path.join(cmdDir(target, 'bear-react'), 'check.md'))).toBe(true);
    // the other, clean legacy folders are still migrated by their own installers
    install(target);
    expect(fs.existsSync(cmdDir(target, 'common'))).toBe(false);
    expect(fs.existsSync(path.join(cmdDir(target, 'react'), 'my-own-command.md'))).toBe(true);
  });

  it('bear-craft update migrates a 9.4.0-style install, project commands included', () => {
    const target = path.join(TMP, 'legacy-update');
    install(target);
    downgradeToLegacyLayout(target);
    fs.writeFileSync(path.join(cmdDir(target, 'project'), 'my-own-command.md'), '# mine\n');

    const r = spawnSync(process.execPath, [CLI, 'update', target, '--lang=en'], { encoding: 'utf8', cwd: ROOT });
    expect(r.status, r.stdout + r.stderr).toBe(0);
    const left = dirs(target).filter((d) => !d.startsWith('bear-'));
    expect(left).toEqual(['project']); // only the folder with the user's file survives
    expect(r.stdout).toMatch(/commands\/project\/ kept/);
    for (const ns of ['common', 'workflow', 'gate', 'project', 'react']) {
      expect(fs.existsSync(cmdDir(target, `bear-${ns}`)), `bear-${ns}`).toBe(true);
    }
  });
});

describe('retired commands pruning', () => {
  it('removes a retired file from both layouts', () => {
    const target = path.join(TMP, 'prune');
    fs.mkdirSync(cmdDir(target, 'bear-project'), { recursive: true });
    fs.mkdirSync(cmdDir(target, 'project'), { recursive: true });
    fs.writeFileSync(path.join(cmdDir(target, 'bear-project'), 'add-epic.md'), '#');
    fs.writeFileSync(path.join(cmdDir(target, 'project'), 'add-epic.md'), '#');
    const r = spawnSync('bash', [path.join(ROOT, 'Dev/scripts/prune-removed-commands.sh'), target], { encoding: 'utf8' });
    expect(r.status).toBe(0);
    expect(fs.existsSync(cmdDir(target, 'bear-project'))).toBe(false);
    expect(fs.existsSync(cmdDir(target, 'project'))).toBe(false);
  });
});
