import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import { runInstallation } from '../../cli/lib/installer.js';
import * as pluginInstall from '../../cli/lib/plugin-install.js';
import { migrateLegacyInstall } from '../../cli/lib/migrate-legacy.js';

// Mock child_process.spawnSync (the rules scripts)
vi.mock('child_process', () => ({
  spawnSync: vi.fn(() => ({ status: 0, error: null })),
}));

// The real `claude` binary is never run: the plugin step is replaced, `ensureClaude` keeps its real logic
// through the injected execFn.
vi.mock('../../cli/lib/plugin-install.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, installPlugins: vi.fn(() => ({ ids: ['bear-common@bear-craft'], claudeVersion: '2.1.326' })) };
});
vi.mock('../../cli/lib/migrate-legacy.js', () => ({ migrateLegacyInstall: vi.fn() }));

// Mock fs — existsSync returns true (script paths always resolve)
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  const existsSyncMock = vi.fn(() => true);
  return {
    ...actual,
    default: {
      ...actual,
      existsSync: existsSyncMock,
    },
    existsSync: existsSyncMock,
  };
});

const claudeOk = vi.fn(() => ({ status: 0, stdout: '2.1.326 (Claude Code)', stderr: '' }));

describe('runInstallation', () => {
  let logSpy;
  let spawnSyncMock;

  beforeEach(async () => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const cp = await import('child_process');
    spawnSyncMock = cp.spawnSync;
    spawnSyncMock.mockClear();
    spawnSyncMock.mockReturnValue({ status: 0, error: null });
    pluginInstall.installPlugins.mockClear();
    migrateLegacyInstall.mockClear();
    claudeOk.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeCli(overrides = {}) {
    return {
      config: {
        targetPath: '/tmp/test-project',
        language: 'en',
        technologies: [],
        includeInfra: false,
        includeProject: false,
        ...overrides,
      },
    };
  }

  const ctx = { CLI_ROOT: '/fake/root', VERSION: '10.0.0', execFn: claudeOk };
  const scriptsCalled = () => spawnSyncMock.mock.calls.map((c) => c[1][0]);
  const installArg = () => pluginInstall.installPlugins.mock.calls[0][0].install;

  it('copies the rules in plugin mode (no commands, agents or skills copy)', async () => {
    await runInstallation(makeCli(), ctx);
    const first = spawnSyncMock.mock.calls[0];
    expect(first[0]).toBe('bash');
    expect(first[1][0]).toContain('install-common-rules.sh');
    expect(first[1]).toContain('--plugin-mode');
  });

  it('passes --hooks to the common rules script only when set', async () => {
    await runInstallation(makeCli(), ctx);
    expect(spawnSyncMock.mock.calls[0][1].some((a) => a.startsWith('--hooks'))).toBe(false);

    spawnSyncMock.mockClear();
    await runInstallation(makeCli({ hooks: 'full' }), ctx);
    expect(spawnSyncMock.mock.calls[0][1]).toContain('--hooks=full');
  });

  it('records the stack, php base layer, infra and hooks in the plugin installation', async () => {
    await runInstallation(
      makeCli({ technologies: ['symfony', 'react'], infra: ['kubernetes'], hooks: 'full,memory' }),
      ctx
    );
    expect(installArg()).toEqual({
      lang: 'en',
      techs: ['symfony', 'react', 'php'],
      infra: ['kubernetes'],
      hooks: { profile: 'full', memory: true },
    });
  });

  it('keeps the legacy includeInfra boolean as docker, and never runs an Infra script', async () => {
    await runInstallation(makeCli({ includeInfra: true }), ctx);
    expect(installArg().infra).toEqual(['docker']);
    expect(scriptsCalled().some((p) => p.includes(`${path.sep}Infra${path.sep}`))).toBe(false);
  });

  it('copies the references of each tech in plugin mode, docker and coolify are plugins only', async () => {
    await runInstallation(makeCli({ technologies: ['docker', 'coolify', 'react'] }), ctx);
    const calls = spawnSyncMock.mock.calls.filter((c) => c[1][0].includes('install-react-rules.sh'));
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toContain('--plugin-mode');
    expect(
      scriptsCalled().some((p) => p.includes('install-docker-rules.sh') || p.includes('install-coolify-rules.sh'))
    ).toBe(false);
    expect(installArg().infra.sort()).toEqual(['coolify', 'docker']);
    expect(installArg().techs).toEqual(['react']);
  });

  it('counts steps: rules + techs + project + plugins', async () => {
    await runInstallation(makeCli({ technologies: ['symfony', 'react'], includeProject: true }), ctx);
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    // symfony auto-includes the php base layer: 1 rules + 3 techs + project + plugins = 6 steps
    expect(output).toContain('[1/6]');
    expect(output).toContain('[6/6]');
  });

  it('passes the selected stack to common and project scripts via --tech', async () => {
    const cli = makeCli({ technologies: ['python', 'react'], infra: ['docker'], includeProject: true });
    await runInstallation(cli, ctx);
    const argsFor = (script) => spawnSyncMock.mock.calls.find((c) => c[1][0].includes(script))[1];
    expect(argsFor('install-common-rules.sh')).toContain('--tech=python,react,docker');
    expect(argsFor('install-project-commands.sh')).toContain('--tech=python,react,docker');
    expect(argsFor('install-project-commands.sh')).toContain('--plugin-mode');
  });

  it('omits --tech when no technology is selected', async () => {
    await runInstallation(makeCli(), ctx);
    expect(spawnSyncMock.mock.calls[0][1].some((a) => a.startsWith('--tech='))).toBe(false);
  });

  it('migrates copied leftovers before installing the plugins', async () => {
    const order = [];
    migrateLegacyInstall.mockImplementation(() => order.push('migrate'));
    pluginInstall.installPlugins.mockImplementation(() => {
      order.push('plugins');
      return { ids: [], claudeVersion: '2.1.326' };
    });
    await runInstallation(makeCli({ language: 'fr' }), ctx);
    expect(order).toEqual(['migrate', 'plugins']);
    expect(migrateLegacyInstall.mock.calls[0][0]).toMatchObject({ target: '/tmp/test-project', lang: 'fr' });
  });

  it('calls printSuccess on completion', async () => {
    await runInstallation(makeCli(), ctx);
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Installation Complete');
  });

  it('fails with a clear message and touches nothing when claude is missing (no fallback)', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const missing = vi.fn(() => ({ status: null, stdout: '', stderr: 'spawn claude ENOENT' }));
    await expect(runInstallation(makeCli(), { ...ctx, execFn: missing })).rejects.toThrow('process.exit called');
    const errOutput = vi
      .mocked(console.error)
      .mock.calls.map((c) => c[0])
      .join('\n');
    expect(errOutput).toContain('Claude Code');
    expect(errOutput).toContain('npm install -g @anthropic-ai/claude-code');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(spawnSyncMock).not.toHaveBeenCalled();
    expect(pluginInstall.installPlugins).not.toHaveBeenCalled();
  });

  it('fails when claude is older than the minimum', async () => {
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const old = vi.fn(() => ({ status: 0, stdout: '2.1.100 (Claude Code)', stderr: '' }));
    await expect(runInstallation(makeCli(), { ...ctx, execFn: old })).rejects.toThrow('process.exit called');
    const errOutput = vi
      .mocked(console.error)
      .mock.calls.map((c) => c[0])
      .join('\n');
    expect(errOutput).toContain('older than the minimum');
  });

  it('reports failure when a script returns an error', async () => {
    spawnSyncMock.mockReturnValue({ status: null, error: new Error('spawn ENOENT') });
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    await expect(runInstallation(makeCli(), ctx)).rejects.toThrow('process.exit called');
    const errOutput = vi
      .mocked(console.error)
      .mock.calls.map((c) => c[0])
      .join('\n');
    expect(errOutput).toContain('Installation failed');
    exitSpy.mockRestore();
  });

  it('reports failure when a script returns a non-zero exit code', async () => {
    spawnSyncMock.mockReturnValue({ status: 127, error: null });
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    await expect(runInstallation(makeCli(), ctx)).rejects.toThrow('process.exit called');
    const errOutput = vi
      .mocked(console.error)
      .mock.calls.map((c) => c[0])
      .join('\n');
    expect(errOutput).toContain('Installation failed');
  });
});
