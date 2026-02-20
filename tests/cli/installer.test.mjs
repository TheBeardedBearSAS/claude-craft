import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import { runInstallation } from '../../cli/lib/installer.js';

// Mock child_process.spawnSync
vi.mock('child_process', () => ({
  spawnSync: vi.fn(() => ({ status: 0, error: null })),
}));

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

  it('calls spawnSync for common rules script', async () => {
    const cli = makeCli();
    await runInstallation(cli, { CLI_ROOT: '/fake/root' });
    expect(spawnSyncMock).toHaveBeenCalled();
    const firstCall = spawnSyncMock.mock.calls[0];
    expect(firstCall[0]).toBe('bash');
    expect(firstCall[1][0]).toContain('install-common-rules.sh');
  });

  it('skips docker tech (handled by infra)', async () => {
    const cli = makeCli({ technologies: ['docker', 'react'] });
    await runInstallation(cli, { CLI_ROOT: '/fake/root' });
    const scriptPaths = spawnSyncMock.mock.calls.map((c) => c[1][0]);
    expect(scriptPaths.some((p) => p.includes('install-docker-rules.sh'))).toBe(false);
    expect(scriptPaths.some((p) => p.includes('install-react-rules.sh'))).toBe(true);
  });

  it('counts steps correctly with 2 techs + infra + project', async () => {
    const cli = makeCli({
      technologies: ['symfony', 'react'],
      includeInfra: true,
      includeProject: true,
    });
    await runInstallation(cli, { CLI_ROOT: '/fake/root' });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    // 1 common + 2 techs + infra + project = 5 steps
    expect(output).toContain('[1/5]');
    expect(output).toContain('[5/5]');
  });

  it('calls printSuccess on completion', async () => {
    const cli = makeCli();
    await runInstallation(cli, { CLI_ROOT: '/fake/root' });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Installation Complete');
  });

  it('reports failure when spawnSync returns an error', async () => {
    spawnSyncMock.mockReturnValue({ status: null, error: new Error('spawn ENOENT') });
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const cli = makeCli();
    await expect(runInstallation(cli, { CLI_ROOT: '/fake/root' })).rejects.toThrow('process.exit called');
    const errOutput = vi
      .mocked(console.error)
      .mock.calls.map((c) => c[0])
      .join('\n');
    expect(errOutput).toContain('Installation failed');
    exitSpy.mockRestore();
  });

  it('reports failure when spawnSync returns non-zero exit code', async () => {
    spawnSyncMock.mockReturnValue({ status: 127, error: null });
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const cli = makeCli();
    await expect(runInstallation(cli, { CLI_ROOT: '/fake/root' })).rejects.toThrow('process.exit called');
    const errOutput = vi
      .mocked(console.error)
      .mock.calls.map((c) => c[0])
      .join('\n');
    expect(errOutput).toContain('Installation failed');
    exitSpy.mockRestore();
  });

  it('skips infra script gracefully when file does not exist', async () => {
    // Override existsSync to return false for infra script
    const fsModule = await import('fs');
    const originalMock = fsModule.existsSync;
    fsModule.existsSync.mockImplementation((p) => {
      if (typeof p === 'string' && p.includes('install-docker-rules.sh')) return false;
      if (typeof p === 'string' && p.endsWith('.sh')) return true;
      return fsModule.default.existsSync(p);
    });
    fsModule.default.existsSync.mockImplementation((p) => {
      if (typeof p === 'string' && p.includes('install-docker-rules.sh')) return false;
      if (typeof p === 'string' && p.endsWith('.sh')) return true;
      return true;
    });

    const cli = makeCli({ includeInfra: true });
    await runInstallation(cli, { CLI_ROOT: '/fake/root' });
    // Should not call spawnSync for infra script
    const scriptPaths = spawnSyncMock.mock.calls.map((c) => c[1][0]);
    expect(scriptPaths.some((p) => p.includes('install-docker-rules.sh'))).toBe(false);

    // Restore original mock behavior
    fsModule.existsSync.mockImplementation(originalMock.getMockImplementation());
  });
});
