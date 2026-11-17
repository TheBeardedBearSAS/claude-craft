import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { installFakeClaude } from '../helpers/fake-claude.mjs';
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

  it('mixed old folder: our files are deleted, the user file is kept with a warning', () => {
    const target = path.join(TMP, 'legacy-user-file');
    install(target);
    downgradeToLegacyLayout(target);
    fs.writeFileSync(path.join(cmdDir(target, 'react'), 'my-own-command.md'), '# mine\n');

    const r = sh(REACT, ['--force', target]);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/\.claude\/commands\/react\/ kept for your files \(my-own-command\.md\)/);
    expect(fs.readdirSync(cmdDir(target, 'react'))).toEqual(['my-own-command.md']);
    expect(fs.readFileSync(path.join(cmdDir(target, 'react'), 'my-own-command.md'), 'utf8')).toBe('# mine\n');
    expect(fs.existsSync(path.join(cmdDir(target, 'bear-react'), 'check.md'))).toBe(true);
    // the other, clean legacy folders are still migrated by their own installers
    install(target);
    expect(fs.existsSync(cmdDir(target, 'common'))).toBe(false);
    expect(fs.readdirSync(cmdDir(target, 'react'))).toEqual(['my-own-command.md']);
  });

  it('bear-craft update migrates a 9.4.0-style install to plugins (fake claude), keeping the user files', () => {
    const target = path.join(TMP, 'legacy-update');
    install(target);
    downgradeToLegacyLayout(target);
    fs.writeFileSync(path.join(cmdDir(target, 'project'), 'my-own-command.md'), '# mine\n');
    fs.writeFileSync(path.join(cmdDir(target, 'common'), 'my-own-command.md'), '# mine\n');
    const fake = installFakeClaude(path.join(TMP, 'fake-bin'));

    const r = spawnSync(process.execPath, [CLI, 'update', target, '--lang=en'], {
      encoding: 'utf8',
      cwd: ROOT,
      env: fake.env(),
    });
    expect(r.status, r.stdout + r.stderr).toBe(0);
    // our files are gone, only the folders holding a user file survive
    expect(dirs(target).sort()).toEqual(['common', 'project']);
    for (const d of ['common', 'project']) expect(fs.readdirSync(cmdDir(target, d))).toEqual(['my-own-command.md']);
    expect(r.stdout).toMatch(/commands\/project\/ kept for your files/);
    expect(fs.existsSync(path.join(target, '.claude/agents'))).toBe(false);
    // the plugins replaced them
    const settings = JSON.parse(fs.readFileSync(path.join(target, '.claude/settings.json'), 'utf8'));
    const mkt = JSON.parse(fs.readFileSync(path.join(target, '.bear-craft/install.json'), 'utf8')).marketplace;
    expect(mkt).toMatch(/^bear-craft-[0-9a-f]{8}$/);
    expect(settings.enabledPlugins[`bear-common@${mkt}`]).toBe(true);
    expect(settings.enabledPlugins[`bear-react@${mkt}`]).toBe(true);
    expect(settings.extraKnownMarketplaces[mkt].source.path).toBe('./.bear-craft/marketplace');
    expect(fs.existsSync(path.join(target, '.bear-craft/marketplace/plugins/bear-react/commands/check.md'))).toBe(true);
  });
});

describe('infra installers', { timeout: 120_000 }, () => {
  const DOCKER = path.join(ROOT, 'Infra/install-docker-rules.sh');

  it('install bear-docker/ with the redundant prefix removed from the command names', () => {
    const target = path.join(TMP, 'infra');
    fs.mkdirSync(target, { recursive: true });
    const r = sh(DOCKER, ['--force', target]);
    expect(r.status, r.stderr).toBe(0);
    expect(fs.readdirSync(cmdDir(target, 'bear-docker')).sort()).toEqual([
      'architecture.md',
      'cicd-pipeline.md',
      'compose-setup.md',
      'debug.md',
      'optimize.md',
    ]);
    expect(fs.existsSync(cmdDir(target, 'docker'))).toBe(false);
  });

  it('migrate a pre-10.0 .claude/commands/docker/ folder (shipped files removed, user file kept)', () => {
    const target = path.join(TMP, 'infra-legacy');
    fs.mkdirSync(cmdDir(target, 'docker'), { recursive: true });
    fs.writeFileSync(path.join(cmdDir(target, 'docker'), 'docker-architecture.md'), '# old name of ours\n');
    fs.writeFileSync(path.join(cmdDir(target, 'docker'), 'optimize.md'), '# ours\n');
    fs.writeFileSync(path.join(cmdDir(target, 'docker'), 'mine.md'), '# mine\n');
    const r = sh(DOCKER, ['--force', target]);
    expect(r.status, r.stderr).toBe(0);
    expect(fs.readdirSync(cmdDir(target, 'docker'))).toEqual(['mine.md']);
    expect(fs.existsSync(path.join(cmdDir(target, 'bear-docker'), 'architecture.md'))).toBe(true);
  });
});

describe('retired commands pruning', () => {
  it('removes a retired file from both layouts', () => {
    const target = path.join(TMP, 'prune');
    fs.mkdirSync(cmdDir(target, 'bear-project'), { recursive: true });
    fs.mkdirSync(cmdDir(target, 'project'), { recursive: true });
    fs.writeFileSync(path.join(cmdDir(target, 'bear-project'), 'add-epic.md'), '#');
    fs.writeFileSync(path.join(cmdDir(target, 'project'), 'add-epic.md'), '#');
    const r = spawnSync('bash', [path.join(ROOT, 'Dev/scripts/prune-removed-commands.sh'), target], {
      encoding: 'utf8',
    });
    expect(r.status).toBe(0);
    expect(fs.existsSync(cmdDir(target, 'bear-project'))).toBe(false);
    expect(fs.existsSync(cmdDir(target, 'project'))).toBe(false);
  });
});
