import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runDoctor } from '../../cli/lib/doctor.js';
import { runList } from '../../cli/lib/list.js';
import { runCheck } from '../../cli/lib/check.js';
import { detectProject } from '../../cli/lib/detect-project.js';
import { installPlugins, parseHooks } from '../../cli/lib/plugin-install.js';
import { installFakeClaude } from '../helpers/fake-claude.mjs';
import { spawnSync } from 'child_process';

// Project with a plugin installation made by the REAL CLI code and a fake claude (no real binary).
const ROOT = path.resolve(import.meta.dirname, '../..');
const TMP = path.join(ROOT, '.test-tmp', 'plugin-commands-test');
let project;
let out;

const ok = (stdout = '') => ({ status: 0, stdout, stderr: '' });
function fakeExec(projectDir) {
  return (cmd, args, opts = {}) => {
    if (args[0] === '--version') return ok('2.1.326 (Claude Code)');
    const file = path.join(projectDir, '.claude', 'settings.json');
    const s = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    if (args[1] === 'marketplace') {
      s.extraKnownMarketplaces = {
        'bear-craft': { source: { source: 'directory', path: path.join(projectDir, '.bear-craft/marketplace') } },
      };
    }
    if (args[1] === 'install') s.enabledPlugins = { ...s.enabledPlugins, [args[2]]: true };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(s));
    return ok();
  };
}

beforeEach(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
  project = path.join(TMP, 'p');
  fs.mkdirSync(path.join(project, '.claude/references/react'), { recursive: true });
  fs.writeFileSync(path.join(project, '.claude/CLAUDE.md'), '#');
  installPlugins(
    {
      target: project,
      cliRoot: ROOT,
      install: { lang: 'en', techs: ['react'], infra: [], hooks: parseHooks('none') },
      version: '10.0.0',
    },
    { execFn: fakeExec(project) }
  );
  out = [];
  vi.spyOn(console, 'log').mockImplementation((m) => out.push(String(m)));
  process.exitCode = undefined;
});
afterEach(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

const text = () => out.join('\n');

describe('list', () => {
  it('lists the enabled plugins and their content instead of .claude/commands', () => {
    runList(project);
    expect(text()).toContain('Plugins (bear-craft, v10.0.0)');
    expect(text()).toContain('/bear-react:*');
    expect(text()).toContain('/bear-common:*');
    expect(text()).toMatch(/Total: 8 plugin\(s\)/);
    expect(text()).not.toContain('No namespaces found');
  });
});

describe('check', () => {
  it('checks the enabled plugins and the references', () => {
    runCheck(project);
    expect(text()).toContain('plugins — 8 enabled (bear-craft)');
    expect(text()).toContain('references/');
    expect(text()).toContain('Installation looks good!');
  });

  it('warns when no plugin is enabled', () => {
    const file = path.join(project, '.claude/settings.json');
    const s = JSON.parse(fs.readFileSync(file, 'utf8'));
    s.enabledPlugins = {};
    fs.writeFileSync(file, JSON.stringify(s));
    runCheck(project);
    expect(text()).toContain('none enabled');
    expect(text()).toContain('bear-craft sync');
  });
});

describe('doctor', () => {
  const claude =
    (extra = {}) =>
    (cmd) => {
      if (cmd === 'claude --version') return '2.1.326 (Claude Code)';
      if (cmd === 'claude plugin marketplace list --json') return extra.list ?? '[]';
      return 'x';
    };

  it('reports the plugin setup and proposes sync when the marketplace is not registered on this machine', () => {
    runDoctor(project, { execFn: claude() });
    expect(text()).toContain('.bear-craft/marketplace present');
    expect(text()).toContain('declared with a relative path');
    expect(text()).toContain('plugins enabled as recorded in install.json');
    expect(text()).toContain('not registered on this machine');
    expect(text()).toContain('bear-craft sync');
    expect(text()).not.toContain('.claude/commands/ missing');
  });

  it('is happy when the marketplace is registered for this project', () => {
    const list = JSON.stringify([
      { name: 'bear-craft', source: 'directory', path: path.join(project, '.bear-craft/marketplace') },
    ]);
    runDoctor(project, { execFn: claude({ list }) });
    expect(text()).toContain('registered on this machine');
    expect(text()).not.toContain('not registered');
  });

  it('fails when Claude Code is missing (required, no fallback)', () => {
    runDoctor(project, { execFn: () => null });
    expect(text()).toContain('Claude Code not found');
    expect(process.exitCode).toBe(1);
  });

  it('fails when plugins recorded in install.json are not enabled', () => {
    const file = path.join(project, '.claude/settings.json');
    const s = JSON.parse(fs.readFileSync(file, 'utf8'));
    delete s.enabledPlugins['bear-react@bear-craft'];
    fs.writeFileSync(file, JSON.stringify(s));
    runDoctor(project, { execFn: claude() });
    expect(text()).toContain('plugins not enabled: bear-react@bear-craft');
    expect(process.exitCode).toBe(1);
  });
});

describe('infra detection and CLI options', () => {
  it('detects kubernetes, opentofu, ansible and pgbouncer next to docker', () => {
    const p = path.join(TMP, 'infra');
    fs.mkdirSync(path.join(p, 'k8s'), { recursive: true });
    fs.writeFileSync(path.join(p, 'main.tf'), '');
    fs.writeFileSync(path.join(p, 'ansible.cfg'), '');
    fs.writeFileSync(path.join(p, 'pgbouncer.ini'), '');
    fs.writeFileSync(path.join(p, 'Dockerfile'), '');
    expect(detectProject(p).suggestedInfra.sort()).toEqual([
      'ansible',
      'docker',
      'kubernetes',
      'opentofu',
      'pgbouncer',
    ]);
    expect(detectProject(project).suggestedInfra).toEqual([]);
  });

  it('install accepts several --tech and --infra=<names>, and rejects unknown infra (real CLI, fake claude)', () => {
    const fake = installFakeClaude(path.join(TMP, 'bin'));
    const target = path.join(TMP, 'cli-proj');
    fs.mkdirSync(target, { recursive: true });
    const r = spawnSync(
      process.execPath,
      [
        path.join(ROOT, 'cli/index.js'),
        'install',
        target,
        '--tech=react,python',
        '--infra=kubernetes,docker',
        '--lang=fr',
        '--hooks=default,memory',
      ],
      { encoding: 'utf8', env: fake.env() }
    );
    expect(r.status, r.stdout + r.stderr).toBe(0);
    const record = JSON.parse(fs.readFileSync(path.join(target, '.bear-craft/install.json'), 'utf8'));
    expect(record).toMatchObject({
      lang: 'fr',
      techs: ['react', 'python'],
      infra: ['kubernetes', 'docker'],
      hooks: { profile: 'default', memory: true },
    });
    const settings = JSON.parse(fs.readFileSync(path.join(target, '.claude/settings.json'), 'utf8'));
    for (const id of [
      'bear-react',
      'bear-python',
      'bear-kubernetes',
      'bear-docker',
      'bear-hooks',
      'bear-hooks-memory',
      'bear-gate',
    ]) {
      expect(settings.enabledPlugins[`${id}@bear-craft-fr`], id).toBe(true);
    }
    expect(settings.enabledPlugins['bear-hooks-full@bear-craft-fr']).toBeUndefined();
    for (const d of ['commands', 'agents', 'skills'])
      expect(fs.existsSync(path.join(target, '.claude', d)), d).toBe(false);

    const bad = spawnSync(process.execPath, [path.join(ROOT, 'cli/index.js'), 'install', target, '--infra=nope'], {
      encoding: 'utf8',
      env: fake.env(),
    });
    expect(bad.status).toBe(1);
    expect(bad.stderr + bad.stdout).toContain("Unknown infra 'nope'");
  });

  it('sync replays an installation through the real CLI (fake claude), and install fails without claude', () => {
    const fake = installFakeClaude(path.join(TMP, 'bin'));
    const target = path.join(TMP, 'cli-sync');
    fs.mkdirSync(target, { recursive: true });
    const cli = path.join(ROOT, 'cli/index.js');
    expect(
      spawnSync(process.execPath, [cli, 'install', target, '--tech=react'], { encoding: 'utf8', env: fake.env() })
        .status
    ).toBe(0);
    fs.rmSync(path.join(target, '.claude/settings.json'));
    const sync = spawnSync(process.execPath, [cli, 'sync', target], { encoding: 'utf8', env: fake.env() });
    expect(sync.status, sync.stdout + sync.stderr).toBe(0);
    expect(
      JSON.parse(fs.readFileSync(path.join(target, '.claude/settings.json'), 'utf8')).enabledPlugins[
        'bear-react@bear-craft'
      ]
    ).toBe(true);

    const noClaude = spawnSync(process.execPath, [cli, 'install', path.join(TMP, 'none'), '--tech=react'], {
      encoding: 'utf8',
      env: { ...process.env, PATH: path.dirname(process.execPath) },
    });
    expect(noClaude.status).toBe(1);
    expect(noClaude.stderr).toContain('was not found in your PATH');
    expect(fs.existsSync(path.join(TMP, 'none', '.claude'))).toBe(false);
  });
});
