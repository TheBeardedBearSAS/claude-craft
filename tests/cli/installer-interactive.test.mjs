import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { interactiveInstall } from '../../cli/lib/installer.js';

// Mock child_process.spawnSync
vi.mock('child_process', () => ({
  spawnSync: vi.fn(() => ({ status: 0, error: null })),
}));

// Mock fs — existsSync defaults to true; tests override when needed
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  const existsSyncMock = vi.fn(() => true);
  const mkdirSyncMock = vi.fn();
  return {
    ...actual,
    default: {
      ...actual,
      existsSync: existsSyncMock,
      mkdirSync: mkdirSyncMock,
    },
    existsSync: existsSyncMock,
    mkdirSync: mkdirSyncMock,
  };
});

describe('interactiveInstall', () => {
  let logSpy;
  let errorSpy;
  let exitSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeCli(promptResponses = []) {
    let callIndex = 0;
    const cli = {
      config: {
        targetPath: process.cwd(),
        language: 'en',
        technologies: [],
        includeCommon: true,
        includeInfra: false,
        includeProject: true,
        track: null,
      },
      rl: null,
      createReadline: vi.fn(() => {
        cli.rl = { close: vi.fn() };
      }),
      closeReadline: vi.fn(() => {
        if (cli.rl) {
          cli.rl.close();
          cli.rl = null;
        }
      }),
      prompt: vi.fn(async () => {
        const response = promptResponses[callIndex] ?? '';
        callIndex++;
        return response;
      }),
      detectProject: vi.fn(() => ({
        suggestedTechs: [],
        hasClaude: false,
      })),
    };
    return cli;
  }

  it('runs full interactive flow with defaults and proceeds to install', async () => {
    // Responses: target='', lang='1', techs='1', infra='y', project='Y', rtk='y', confirm='y'
    const cli = makeCli(['', '1', '1', 'y', 'Y', 'y', 'y']);
    await interactiveInstall(cli, { CLI_ROOT: '/fake/root', VERSION: '7.0.0' });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[1/5]');
    expect(output).toContain('[5/5]');
    expect(cli.createReadline).toHaveBeenCalled();
    expect(cli.closeReadline).toHaveBeenCalled();
  });

  it('cancels installation when user says no at confirmation', async () => {
    // Responses: target='', lang='1', techs='1', infra='n', project='n', rtk='n', confirm='n'
    const cli = makeCli(['', '1', '1', 'n', 'n', 'n', 'n']);
    await interactiveInstall(cli, { CLI_ROOT: '/fake/root', VERSION: '7.0.0' });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('cancelled');
    expect(cli.closeReadline).toHaveBeenCalled();
  });

  it('creates directory when it does not exist and user confirms', async () => {
    const fs = await import('fs');
    // Make existsSync return false for the target path check
    const originalExistsMock = fs.existsSync.getMockImplementation();
    const originalDefaultExistsMock = fs.default.existsSync.getMockImplementation();
    fs.existsSync.mockImplementation((p) => {
      if (typeof p === 'string' && p.endsWith('.sh')) return true;
      return false;
    });
    fs.default.existsSync.mockImplementation((p) => {
      if (typeof p === 'string' && p.endsWith('.sh')) return true;
      return false;
    });

    // '/nonexistent', confirm create='y', lang='1', tech='1', infra='n', project='Y', rtk='n', confirm='y'
    const cli = makeCli(['/tmp/test-nonexistent', 'y', '1', '1', 'n', 'Y', 'n', 'y']);
    await interactiveInstall(cli, { CLI_ROOT: '/fake/root', VERSION: '7.0.0' });
    expect(fs.default.mkdirSync).toHaveBeenCalled();

    // Restore both named and default export mocks
    if (originalExistsMock) fs.existsSync.mockImplementation(originalExistsMock);
    if (originalDefaultExistsMock) fs.default.existsSync.mockImplementation(originalDefaultExistsMock);
  });

  it('aborts when user declines directory creation', async () => {
    const fs = await import('fs');
    const originalExistsMock = fs.existsSync.getMockImplementation();
    const originalDefaultExistsMock = fs.default.existsSync.getMockImplementation();
    fs.existsSync.mockImplementation((p) => {
      if (typeof p === 'string' && p.endsWith('.sh')) return true;
      return false;
    });
    fs.default.existsSync.mockImplementation((p) => {
      if (typeof p === 'string' && p.endsWith('.sh')) return true;
      return false;
    });

    const cli = makeCli(['/tmp/test-nonexistent', 'n']);
    await interactiveInstall(cli, { CLI_ROOT: '/fake/root', VERSION: '7.0.0' });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Aborted');
    expect(cli.closeReadline).toHaveBeenCalled();

    // Restore both named and default export mocks
    if (originalExistsMock) fs.existsSync.mockImplementation(originalExistsMock);
    if (originalDefaultExistsMock) fs.default.existsSync.mockImplementation(originalDefaultExistsMock);
  });

  it('shows detected techs and pre-selects them', async () => {
    const cli = makeCli(['', '1', '', 'n', 'Y', 'n', 'y']);
    cli.detectProject = vi.fn(() => ({
      suggestedTechs: ['react'],
      hasClaude: true,
    }));
    await interactiveInstall(cli, { CLI_ROOT: '/fake/root', VERSION: '7.0.0' });
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Detected');
    expect(output).toContain('Existing .claude/');
  });

  it('selects multiple technologies when user provides space-separated numbers', async () => {
    // techs input = '1 3' (symfony + react)
    const cli = makeCli(['', '1', '1 3', 'n', 'Y', 'n', 'y']);
    await interactiveInstall(cli, { CLI_ROOT: '/fake/root', VERSION: '7.0.0' });
    expect(cli.config.technologies).toContain('symfony');
    expect(cli.config.technologies).toContain('react');
  });

  it('includes infra when user selects yes', async () => {
    const cli = makeCli(['', '1', '1', 'y', 'Y', 'n', 'y']);
    await interactiveInstall(cli, { CLI_ROOT: '/fake/root', VERSION: '7.0.0' });
    expect(cli.config.includeInfra).toBe(true);
  });

  it('excludes project management when user selects no', async () => {
    const cli = makeCli(['', '1', '1', 'n', 'n', 'n', 'y']);
    await interactiveInstall(cli, { CLI_ROOT: '/fake/root', VERSION: '7.0.0' });
    expect(cli.config.includeProject).toBe(false);
  });

  it('selects language by index', async () => {
    // Select lang='2' (fr)
    const cli = makeCli(['', '2', '1', 'n', 'Y', 'n', 'y']);
    await interactiveInstall(cli, { CLI_ROOT: '/fake/root', VERSION: '7.0.0' });
    expect(cli.config.language).toBe('fr');
  });

  it('defaults to detected locale for invalid language index', async () => {
    // When the user enters an invalid index (99), the wizard falls back to the
    // auto-detected locale from process.env.LANG / LC_ALL.
    // In CI / dev environments LANG may vary, so we force it to a known value.
    const savedLang = process.env.LANG;
    const savedLcAll = process.env.LC_ALL;
    process.env.LANG = 'en_US.UTF-8';
    delete process.env.LC_ALL;
    try {
      const cli = makeCli(['', '99', '1', 'n', 'Y', 'n', 'y']);
      await interactiveInstall(cli, { CLI_ROOT: '/fake/root', VERSION: '7.0.0' });
      expect(cli.config.language).toBe('en');
    } finally {
      if (savedLang === undefined) delete process.env.LANG;
      else process.env.LANG = savedLang;
      if (savedLcAll === undefined) delete process.env.LC_ALL;
      else process.env.LC_ALL = savedLcAll;
    }
  });
});
