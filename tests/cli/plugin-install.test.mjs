import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  CORE_PLUGINS,
  PluginInstallError,
  copyMarketplace,
  diagnosePlugins,
  ensureClaude,
  hookPlugins,
  installPlugins,
  marketplaceName,
  parseHooks,
  planPlugins,
  readInstallJson,
  readPluginState,
  resolveInfra,
  rewriteMarketplacePath,
  syncPlugins,
} from '../../cli/lib/plugin-install.js';

const ROOT = path.resolve(import.meta.dirname, '../..');
const TMP = path.join(ROOT, '.test-tmp', 'plugin-install-test');

const ok = (stdout = '') => ({ status: 0, stdout, stderr: '' });
const version = (v) => vi.fn((cmd, args) => (args[0] === '--version' ? ok(`${v} (Claude Code)`) : ok()));

/** Fake `claude`: mimics what the real one writes in .claude/settings.json (an ABSOLUTE marketplace path). */
function fakeClaude(project, calls = []) {
  return vi.fn((cmd, args, opts = {}) => {
    calls.push({ cmd, args, cwd: opts.cwd });
    if (args[0] === '--version') return ok('2.1.326 (Claude Code)');
    const file = path.join(project, '.claude', 'settings.json');
    const settings = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    if (args[1] === 'marketplace' && args[2] === 'add') {
      const mkt = JSON.parse(
        fs.readFileSync(path.join(project, '.bear-craft/marketplace/.claude-plugin/marketplace.json'), 'utf8')
      ).name;
      settings.extraKnownMarketplaces = {
        ...settings.extraKnownMarketplaces,
        [mkt]: { source: { source: 'directory', path: path.join(project, '.bear-craft/marketplace') } },
      };
    }
    if (args[1] === 'install') {
      settings.enabledPlugins = { ...settings.enabledPlugins, [args[2]]: true };
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(settings, null, 2));
    return ok();
  });
}

beforeEach(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
});
afterEach(() => fs.rmSync(TMP, { recursive: true, force: true }));

describe('naming and planning', () => {
  it('names the marketplace per language', () => {
    expect(marketplaceName('en')).toBe('bear-craft');
    expect(marketplaceName('fr')).toBe('bear-craft-fr');
  });

  it('maps --hooks to plugins (default, full, none, ,memory)', () => {
    expect(hookPlugins(parseHooks(undefined))).toEqual(['hooks']);
    expect(hookPlugins(parseHooks('default'))).toEqual(['hooks']);
    expect(hookPlugins(parseHooks('full'))).toEqual(['hooks', 'hooks-full']);
    expect(hookPlugins(parseHooks('none'))).toEqual([]);
    expect(hookPlugins(parseHooks('none,memory'))).toEqual(['hooks-memory']);
    expect(hookPlugins(parseHooks('full,memory'))).toEqual(['hooks', 'hooks-full', 'hooks-memory']);
  });

  it('resolves infra from an explicit list or the legacy boolean (docker)', () => {
    expect(resolveInfra({})).toEqual([]);
    expect(resolveInfra({ includeInfra: true })).toEqual(['docker']);
    expect(resolveInfra({ infra: ['kubernetes', 'nope', 'kubernetes'] })).toEqual(['kubernetes']);
  });

  it('plans the core plugins, stacks, infra and hooks', () => {
    const plan = planPlugins({ techs: ['react'], infra: ['docker'], hooks: parseHooks('full') });
    expect(plan).toEqual([...CORE_PLUGINS, 'react', 'docker', 'hooks', 'hooks-full']);
  });
});

describe('ensureClaude', () => {
  it('returns the version when claude is recent enough', () => {
    expect(ensureClaude({ execFn: version('2.1.400') })).toBe('2.1.400');
  });

  it('throws a clear error with the way forward when claude is absent', () => {
    const missing = vi.fn(() => ({ status: null, stdout: '', stderr: 'ENOENT' }));
    expect(() => ensureClaude({ execFn: missing })).toThrow(PluginInstallError);
    expect(() => ensureClaude({ execFn: missing })).toThrow(/npm install -g @anthropic-ai\/claude-code/);
  });

  it('throws when claude is older than the minimum', () => {
    expect(() => ensureClaude({ execFn: version('2.1.100') })).toThrow(/older than the minimum/);
  });
});

describe('marketplace copy and settings rewrite', () => {
  it('copies marketplaces/<lang> into .bear-craft/marketplace and replaces a previous copy', () => {
    const project = path.join(TMP, 'p');
    fs.mkdirSync(path.join(project, '.bear-craft/marketplace'), { recursive: true });
    fs.writeFileSync(path.join(project, '.bear-craft/marketplace/stale.txt'), 'old');
    const dest = copyMarketplace(ROOT, 'fr', project);
    expect(fs.existsSync(path.join(dest, '.claude-plugin/marketplace.json'))).toBe(true);
    expect(fs.existsSync(path.join(dest, 'plugins/bear-react/commands/check.md'))).toBe(true);
    expect(fs.existsSync(path.join(dest, 'stale.txt'))).toBe(false);
  });

  it('refuses an unknown language', () => {
    expect(() => copyMarketplace(ROOT, 'xx', path.join(TMP, 'p'))).toThrow(/No marketplace for language/);
  });

  it('rewrites the absolute marketplace path to a relative one and preserves every other key', () => {
    const project = path.join(TMP, 'p');
    fs.mkdirSync(path.join(project, '.claude'), { recursive: true });
    const file = path.join(project, '.claude/settings.json');
    fs.writeFileSync(
      file,
      JSON.stringify({
        permissions: { allow: ['Bash(ls)'] },
        enabledPlugins: { 'bear-react@bear-craft': true },
        extraKnownMarketplaces: {
          other: { source: { source: 'github', repo: 'a/b' } },
          'bear-craft': { source: { source: 'directory', path: '/abs/.bear-craft/marketplace' } },
        },
      })
    );
    expect(rewriteMarketplacePath(project, 'bear-craft')).toBe(true);
    const out = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(out.extraKnownMarketplaces['bear-craft'].source).toEqual({
      source: 'directory',
      path: './.bear-craft/marketplace',
    });
    expect(out.extraKnownMarketplaces.other.source.repo).toBe('a/b');
    expect(out.permissions.allow).toEqual(['Bash(ls)']);
    expect(out.enabledPlugins).toEqual({ 'bear-react@bear-craft': true });
    expect(rewriteMarketplacePath(project, 'bear-craft')).toBe(false); // idempotent
  });
});

describe('installPlugins / syncPlugins (fake claude)', () => {
  const install = { lang: 'fr', techs: ['react'], infra: ['docker'], hooks: parseHooks('full') };

  it('registers the marketplace from the project, makes the path relative and installs every plugin', () => {
    const project = path.join(TMP, 'p');
    fs.mkdirSync(project, { recursive: true });
    const calls = [];
    const { ids } = installPlugins(
      { target: project, cliRoot: ROOT, install, version: '10.0.0' },
      { execFn: fakeClaude(project, calls) }
    );

    const add = calls.find((c) => c.args[1] === 'marketplace');
    expect(add.args).toEqual(['plugin', 'marketplace', 'add', './.bear-craft/marketplace', '--scope', 'project']);
    expect(add.cwd).toBe(project);
    const installs = calls.filter((c) => c.args[1] === 'install');
    expect(
      installs.every((c) => c.args.includes('--scope') && c.args.includes('project') && c.args.includes('-y'))
    ).toBe(true);
    expect(ids).toEqual(
      [...CORE_PLUGINS, 'react', 'docker', 'hooks', 'hooks-full'].map((n) => `bear-${n}@bear-craft-fr`)
    );

    const settings = JSON.parse(fs.readFileSync(path.join(project, '.claude/settings.json'), 'utf8'));
    expect(settings.extraKnownMarketplaces['bear-craft-fr'].source.path).toBe('./.bear-craft/marketplace');
    expect(Object.keys(settings.enabledPlugins)).toEqual(ids);
    expect(fs.readFileSync(path.join(project, '.bear-craft/VERSION'), 'utf8').trim()).toBe('10.0.0');
    expect(readInstallJson(project)).toEqual({
      lang: 'fr',
      techs: ['react'],
      infra: ['docker'],
      hooks: { profile: 'full', memory: false },
      version: '10.0.0',
    });
  });

  it('stops with the claude error when an installation fails', () => {
    const project = path.join(TMP, 'p');
    fs.mkdirSync(project, { recursive: true });
    const failing = vi.fn((cmd, args) =>
      args[0] === '--version' ? ok('2.1.326') : args[1] === 'install' ? { status: 1, stdout: '', stderr: 'boom' } : ok()
    );
    expect(() =>
      installPlugins({ target: project, cliRoot: ROOT, install, version: '10.0.0' }, { execFn: failing })
    ).toThrow(/boom/);
  });

  it('does not run anything when claude is missing', () => {
    const project = path.join(TMP, 'p');
    fs.mkdirSync(project, { recursive: true });
    const missing = vi.fn(() => ({ status: null, stdout: '', stderr: 'ENOENT' }));
    expect(() =>
      installPlugins({ target: project, cliRoot: ROOT, install, version: '10.0.0' }, { execFn: missing })
    ).toThrow(PluginInstallError);
    expect(missing).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(path.join(project, '.bear-craft'))).toBe(false);
  });

  it('sync replays install.json without copying anything, and needs the marketplace copy', () => {
    const project = path.join(TMP, 'p');
    fs.mkdirSync(project, { recursive: true });
    installPlugins({ target: project, cliRoot: ROOT, install, version: '10.0.0' }, { execFn: fakeClaude(project) });
    fs.rmSync(path.join(project, '.claude'), { recursive: true });

    const calls = [];
    const { ids } = syncPlugins(project, { execFn: fakeClaude(project, calls) });
    expect(ids).toHaveLength(CORE_PLUGINS.length + 4);
    const settings = JSON.parse(fs.readFileSync(path.join(project, '.claude/settings.json'), 'utf8'));
    expect(settings.extraKnownMarketplaces['bear-craft-fr'].source.path).toBe('./.bear-craft/marketplace');

    fs.rmSync(path.join(project, '.bear-craft/marketplace'), { recursive: true });
    expect(() => syncPlugins(project, { execFn: fakeClaude(project) })).toThrow(/marketplace is missing/);
    fs.rmSync(path.join(project, '.bear-craft/install.json'));
    expect(() => syncPlugins(project, { execFn: fakeClaude(project) })).toThrow(/install\.json/);
  });
});

describe('diagnosePlugins and readPluginState', () => {
  function installed() {
    const project = path.join(TMP, 'p');
    fs.mkdirSync(project, { recursive: true });
    installPlugins(
      {
        target: project,
        cliRoot: ROOT,
        install: { lang: 'en', techs: ['react'], infra: [], hooks: parseHooks('none') },
        version: '10.0.0',
      },
      { execFn: fakeClaude(project) }
    );
    return project;
  }
  const list = (project, entries) => vi.fn(() => ok(JSON.stringify(entries)));
  const levels = (res) => res.map((r) => r.level);

  it('is silent for a project without install.json', () => {
    expect(diagnosePlugins(TMP, { execFn: vi.fn() })).toEqual([]);
  });

  it('reports ok when marketplace, settings and registration agree', () => {
    const project = installed();
    const res = diagnosePlugins(project, {
      execFn: list(project, [
        { name: 'bear-craft', source: 'directory', path: path.join(project, '.bear-craft/marketplace') },
      ]),
    });
    expect(levels(res)).toEqual(['ok', 'ok', 'ok', 'ok']);
  });

  it('flags a marketplace that is not registered on this machine and proposes sync', () => {
    const project = installed();
    const res = diagnosePlugins(project, { execFn: list(project, []) });
    expect(res.at(-1)).toMatchObject({ level: 'warn' });
    expect(res.at(-1).message).toContain('bear-craft sync');
  });

  it('flags a marketplace registered for another path', () => {
    const project = installed();
    const res = diagnosePlugins(project, {
      execFn: list(project, [{ name: 'bear-craft', source: 'directory', path: '/elsewhere/.bear-craft/marketplace' }]),
    });
    expect(res.at(-1).message).toContain('another path');
  });

  it('fails when plugins recorded in install.json are not enabled', () => {
    const project = installed();
    const file = path.join(project, '.claude/settings.json');
    const settings = JSON.parse(fs.readFileSync(file, 'utf8'));
    delete settings.enabledPlugins['bear-react@bear-craft'];
    fs.writeFileSync(file, JSON.stringify(settings));
    const res = diagnosePlugins(project, { execFn: list(project, []) });
    expect(res.some((r) => r.level === 'fail' && r.message.includes('bear-react@bear-craft'))).toBe(true);
  });

  it('flags an absolute marketplace path (not portable)', () => {
    const project = installed();
    const file = path.join(project, '.claude/settings.json');
    const settings = JSON.parse(fs.readFileSync(file, 'utf8'));
    settings.extraKnownMarketplaces['bear-craft'].source.path = project;
    fs.writeFileSync(file, JSON.stringify(settings));
    const res = diagnosePlugins(project, { execFn: list(project, []) });
    expect(res.some((r) => r.level === 'warn' && r.message.includes('expected ./.bear-craft/marketplace'))).toBe(true);
  });

  it('reads the enabled plugins and their content from the marketplace copy', () => {
    const project = installed();
    const state = readPluginState(project);
    expect(state.marketplace).toBe('bear-craft');
    const react = state.plugins.find((p) => p.name === 'bear-react');
    expect(react.commands).toBeGreaterThanOrEqual(5);
    expect(react.agents).toBe(1);
    expect(state.plugins.find((p) => p.name === 'bear-common').agents).toBe(20);
    expect(readPluginState(TMP)).toBeNull();
  });
});
