import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock child_process.spawn before importing ralph
vi.mock('child_process', () => ({
  spawn: vi.fn(() => ({
    on: vi.fn(),
  })),
}));

// Mock fs.existsSync
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      existsSync: vi.fn(() => true),
      readFileSync: actual.default.readFileSync,
    },
    existsSync: vi.fn(() => true),
    readFileSync: actual.readFileSync,
  };
});

// Mock process.exit to prevent test runner from exiting
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

import { runRalph } from '../../cli/lib/ralph.js';

describe('runRalph', () => {
  let logSpy;
  let errorSpy;
  let spawnMock;
  let existsSyncMock;
  let handlers;

  beforeEach(async () => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cp = await import('child_process');
    spawnMock = cp.spawn;
    spawnMock.mockClear();
    handlers = {};
    spawnMock.mockReturnValue({
      on: vi.fn((event, cb) => {
        handlers[event] = cb;
      }),
    });
    const fsMod = await import('fs');
    existsSyncMock = fsMod.default.existsSync;
    existsSyncMock.mockReturnValue(true);
    mockExit.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeCli() {
    return { config: { targetPath: '/tmp/test-project' } };
  }

  it('builds args with --lang option', async () => {
    await runRalph(makeCli(), [], { lang: 'fr' }, { CLI_ROOT: '/fake/root', VERSION: '1.0.0' });
    const spawnArgs = spawnMock.mock.calls[0][1];
    expect(spawnArgs.some((a) => a === '--lang=fr')).toBe(true);
  });

  it('builds args with --config option', async () => {
    await runRalph(
      makeCli(),
      [],
      { config: 'ralph.yml' },
      { CLI_ROOT: '/fake/root', VERSION: '1.0.0' },
    );
    const spawnArgs = spawnMock.mock.calls[0][1];
    expect(spawnArgs.some((a) => a === '--config=ralph.yml')).toBe(true);
  });

  it('builds args with all flags', async () => {
    const options = {
      lang: 'en',
      config: 'cfg.yml',
      continue: 'session-123',
      'max-iterations': '10',
      verbose: true,
      'dry-run': true,
    };
    await runRalph(makeCli(), [], options, { CLI_ROOT: '/fake/root', VERSION: '1.0.0' });
    const spawnArgs = spawnMock.mock.calls[0][1];
    expect(spawnArgs).toContain('--lang=en');
    expect(spawnArgs).toContain('--config=cfg.yml');
    expect(spawnArgs).toContain('--continue=session-123');
    expect(spawnArgs).toContain('--max-iterations=10');
    expect(spawnArgs).toContain('--verbose');
    expect(spawnArgs).toContain('--dry-run');
  });

  it('includes positional prompt args', async () => {
    await runRalph(
      makeCli(),
      ['Implement', 'auth', 'feature'],
      {},
      { CLI_ROOT: '/fake/root', VERSION: '1.0.0' },
    );
    const spawnArgs = spawnMock.mock.calls[0][1];
    expect(spawnArgs.some((a) => a === 'Implement auth feature')).toBe(true);
  });

  it('shows error when ralph.sh is missing', async () => {
    existsSyncMock.mockReturnValue(false);
    try {
      await runRalph(makeCli(), [], {}, { CLI_ROOT: '/fake/root', VERSION: '1.0.0' });
    } catch {
      // vitest may intercept process.exit
    }
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Error');
    expect(output).toContain('Ralph script not found');
  });

  it('logs success message on close code 0', async () => {
    await runRalph(makeCli(), [], {}, { CLI_ROOT: '/fake/root', VERSION: '1.0.0' });
    try {
      handlers.close(0);
    } catch {
      // vitest intercepts process.exit
    }
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('completed successfully');
  });

  it('logs warning message on close code 1', async () => {
    await runRalph(makeCli(), [], {}, { CLI_ROOT: '/fake/root', VERSION: '1.0.0' });
    try {
      handlers.close(1);
    } catch {
      // vitest intercepts process.exit
    }
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('ended with code 1');
  });

  it('logs error message on spawn error', async () => {
    await runRalph(makeCli(), [], {}, { CLI_ROOT: '/fake/root', VERSION: '1.0.0' });
    try {
      handlers.error(new Error('spawn ENOENT'));
    } catch {
      // vitest intercepts process.exit
    }
    const output = errorSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Failed to start Ralph');
  });
});
