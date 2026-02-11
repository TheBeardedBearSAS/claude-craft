import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import { runInstallation } from '../../cli/lib/installer.js';

// Mock child_process.spawnSync
vi.mock('child_process', () => ({
  spawnSync: vi.fn(() => ({ status: 0, error: null })),
}));

// Mock fs.existsSync to allow script path checks to pass
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      existsSync: vi.fn((p) => {
        // Allow all script path checks to pass
        if (typeof p === 'string' && p.endsWith('.sh')) return true;
        return actual.default.existsSync(p);
      }),
      readFileSync: actual.default.readFileSync,
      mkdirSync: actual.default.mkdirSync,
    },
    existsSync: vi.fn((p) => {
      if (typeof p === 'string' && p.endsWith('.sh')) return true;
      return actual.existsSync(p);
    }),
    readFileSync: actual.readFileSync,
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
});
