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
    if (args[1] === 'uninstall') {
      delete settings.enabledPlugins?.[args[2]];
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
    const { ids, marketplace } = installPlugins(
      { target: project, cliRoot: ROOT, install, version: '10.0.0' },
      { execFn: fakeClaude(project, calls) }
    );
    expect(marketplace).toMatch(/^bear-craft-[0-9a-f]{8}$/);

    const add = calls.find((c) => c.args[1] === 'marketplace');
    expect(add.args).toEqual(['plugin', 'marketplace', 'add', './.bear-craft/marketplace', '--scope', 'project']);
    expect(add.cwd).toBe(project);
    const installs = calls.filter((c) => c.args[1] === 'install');
    expect(
      installs.every((c) => c.args.includes('--scope') && c.args.includes('project') && c.args.includes('-y'))
    ).toBe(true);
    expect(ids).toEqual(
      [...CORE_PLUGINS, 'react', 'docker', 'hooks', 'hooks-full'].map((n) => `bear-${n}@${marketplace}`)
    );

    const settings = JSON.parse(fs.readFileSync(path.join(project, '.claude/settings.json'), 'utf8'));
    expect(settings.extraKnownMarketplaces[marketplace].source.path).toBe('./.bear-craft/marketplace');
    expect(Object.keys(settings.enabledPlugins)).toEqual(ids);
    expect(fs.readFileSync(path.join(project, '.bear-craft/VERSION'), 'utf8').trim()).toBe('10.0.0');
    expect(readInstallJson(project)).toEqual({
      lang: 'fr',
      techs: ['react'],
      infra: ['docker'],
      hooks: { profile: 'full', memory: false },
      marketplace,
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
    expect(settings.extraKnownMarketplaces[readInstallJson(project).marketplace].source.path).toBe(
      './.bear-craft/marketplace'
    );

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
  const mktOf = (project) => readInstallJson(project).marketplace;
  const levels = (res) => res.map((r) => r.level);

  it('is silent for a project without install.json', () => {
    expect(diagnosePlugins(TMP, { execFn: vi.fn() })).toEqual([]);
  });

  it('reports ok when marketplace, settings and registration agree', () => {
    const project = installed();
    const res = diagnosePlugins(project, {
      execFn: list(project, [
        { name: mktOf(project), source: 'directory', path: path.join(project, '.bear-craft/marketplace') },
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
      execFn: list(project, [
        { name: mktOf(project), source: 'directory', path: '/elsewhere/.bear-craft/marketplace' },
      ]),
    });
    expect(res.at(-1).message).toContain('another path');
  });

  it('fails when plugins recorded in install.json are not enabled', () => {
    const project = installed();
    const file = path.join(project, '.claude/settings.json');
    const settings = JSON.parse(fs.readFileSync(file, 'utf8'));
    delete settings.enabledPlugins[`bear-react@${mktOf(project)}`];
    fs.writeFileSync(file, JSON.stringify(settings));
    const res = diagnosePlugins(project, { execFn: list(project, []) });
    expect(res.some((r) => r.level === 'fail' && r.message.includes(`bear-react@${mktOf(project)}`))).toBe(true);
  });

  it('flags an absolute marketplace path (not portable)', () => {
    const project = installed();
    const file = path.join(project, '.claude/settings.json');
    const settings = JSON.parse(fs.readFileSync(file, 'utf8'));
    settings.extraKnownMarketplaces[mktOf(project)].source.path = project;
    fs.writeFileSync(file, JSON.stringify(settings));
    const res = diagnosePlugins(project, { execFn: list(project, []) });
    expect(res.some((r) => r.level === 'warn' && r.message.includes('expected ./.bear-craft/marketplace'))).toBe(true);
  });

  it('reads the enabled plugins and their content from the marketplace copy', () => {
    const project = installed();
    const state = readPluginState(project);
    expect(state.marketplace).toBe(mktOf(project));
    const react = state.plugins.find((p) => p.name === 'bear-react');
    expect(react.commands).toBeGreaterThanOrEqual(5);
    expect(react.agents).toBe(1);
    expect(state.plugins.find((p) => p.name === 'bear-common').agents).toBe(20);
    expect(readPluginState(TMP)).toBeNull();
  });
});

describe('unique marketplace id per project', () => {
  const install = { lang: 'fr', techs: ['react'], infra: [], hooks: parseHooks('none') };
  const proj = (name) => {
    const dir = path.join(TMP, name);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  };
  const run = (project, extra = {}) =>
    installPlugins(
      { target: project, cliRoot: ROOT, install: { ...install, ...extra }, version: '10.0.0' },
      { execFn: fakeClaude(project) }
    );

  it('generates bear-craft-<8 hex> on the first install, persists it and writes it in the copied manifest only', () => {
    const project = proj('a');
    const { marketplace } = run(project);
    expect(marketplace).toMatch(/^bear-craft-[0-9a-f]{8}$/);
    expect(readInstallJson(project).marketplace).toBe(marketplace);
    const copy = JSON.parse(
      fs.readFileSync(path.join(project, '.bear-craft/marketplace/.claude-plugin/marketplace.json'), 'utf8')
    );
    expect(copy.name).toBe(marketplace);
    // the sources of the package keep the language name
    const source = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'marketplaces/fr/.claude-plugin/marketplace.json'), 'utf8')
    );
    expect(source.name).toBe('bear-craft-fr');
    // component names do not depend on the marketplace name
    expect(fs.existsSync(path.join(project, '.bear-craft/marketplace/plugins/bear-react/commands/check.md'))).toBe(
      true
    );
  });

  it('gives two projects (en and fr) different ids, so they never share a registry entry', () => {
    const a = run(proj('a'), { lang: 'en' }).marketplace;
    const b = run(proj('b'), { lang: 'fr' }).marketplace;
    expect(a).not.toBe(b);
  });

  it('update reuses the recorded id, even when the language changes', () => {
    const project = proj('a');
    const first = run(project).marketplace;
    expect(run(project).marketplace).toBe(first);
    expect(run(project, { lang: 'de' }).marketplace).toBe(first);
    const copy = JSON.parse(
      fs.readFileSync(path.join(project, '.bear-craft/marketplace/.claude-plugin/marketplace.json'), 'utf8')
    );
    expect(copy.name).toBe(first);
  });

  it('sync reuses the recorded id', () => {
    const project = proj('a');
    const { marketplace } = run(project);
    fs.rmSync(path.join(project, '.claude'), { recursive: true });
    const res = syncPlugins(project, { execFn: fakeClaude(project) });
    expect(res.marketplace).toBe(marketplace);
    expect(res.ids.every((id) => id.endsWith(`@${marketplace}`))).toBe(true);
    expect(readInstallJson(project).marketplace).toBe(marketplace);
  });

  it('migrates a generic-name installation: new id, old entries removed, plugins uninstalled at project scope', () => {
    const project = proj('legacy');
    fs.mkdirSync(path.join(project, '.bear-craft'), { recursive: true });
    fs.mkdirSync(path.join(project, '.claude'), { recursive: true });
    fs.writeFileSync(
      path.join(project, '.bear-craft/install.json'),
      JSON.stringify({
        lang: 'fr',
        techs: ['react'],
        infra: [],
        hooks: { profile: 'none', memory: false },
        version: '10.0.0',
      })
    );
    fs.writeFileSync(
      path.join(project, '.claude/settings.json'),
      JSON.stringify({
        permissions: { allow: ['Bash(ls)'] },
        enabledPlugins: {
          'bear-react@bear-craft-fr': true,
          'bear-common@bear-craft-fr': true,
          'other@somewhere': true,
        },
        extraKnownMarketplaces: {
          'bear-craft-fr': { source: { source: 'directory', path: './.bear-craft/marketplace' } },
          somewhere: { source: { source: 'github', repo: 'a/b' } },
        },
      })
    );
    const calls = [];
    const { marketplace } = installPlugins(
      { target: project, cliRoot: ROOT, install: { ...install }, version: '10.0.1' },
      { execFn: fakeClaude(project, calls) }
    );

    expect(marketplace).toMatch(/^bear-craft-[0-9a-f]{8}$/);
    const unins = calls.filter((c) => c.args[1] === 'uninstall');
    expect(unins.map((c) => c.args[2]).sort()).toEqual(['bear-common@bear-craft-fr', 'bear-react@bear-craft-fr']);
    expect(unins.every((c) => c.cwd === project && c.args.includes('project'))).toBe(true);

    const settings = JSON.parse(fs.readFileSync(path.join(project, '.claude/settings.json'), 'utf8'));
    expect(settings.extraKnownMarketplaces['bear-craft-fr']).toBeUndefined();
    expect(Object.keys(settings.enabledPlugins).filter((id) => id.endsWith('@bear-craft-fr'))).toEqual([]);
    expect(settings.enabledPlugins[`bear-react@${marketplace}`]).toBe(true);
    expect(settings.enabledPlugins['other@somewhere']).toBe(true);
    expect(settings.extraKnownMarketplaces.somewhere.source.repo).toBe('a/b');
    expect(settings.permissions.allow).toEqual(['Bash(ls)']);
    expect(readInstallJson(project).marketplace).toBe(marketplace);
  });
});
