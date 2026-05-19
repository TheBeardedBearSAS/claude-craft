import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateUrl, validateConfig, runInstallFromUrl } from '../../cli/lib/install-from-url.js';

vi.mock('../../cli/lib/installer.js', () => ({
  runInstallation: vi.fn(async () => {}),
}));

describe('validateUrl', () => {
  it('accepts https URLs', () => {
    expect(validateUrl('https://example.com/cc.json').protocol).toBe('https:');
  });

  it('accepts http on localhost', () => {
    expect(validateUrl('http://localhost:8080/x').hostname).toBe('localhost');
    expect(validateUrl('http://127.0.0.1/x').hostname).toBe('127.0.0.1');
  });

  it('rejects http on remote hosts', () => {
    expect(() => validateUrl('http://example.com/cc.json')).toThrow(/only https/);
  });

  it('rejects malformed URLs', () => {
    expect(() => validateUrl('not-a-url')).toThrow(/invalid URL/);
  });

  it('rejects non-http schemes', () => {
    expect(() => validateUrl('file:///etc/passwd')).toThrow(/only https/);
    expect(() => validateUrl('ftp://example.com/x')).toThrow(/only https/);
  });
});

describe('validateConfig', () => {
  it('accepts a minimal valid config', () => {
    expect(validateConfig({ version: 1 })).toEqual({ version: 1 });
  });

  it('accepts a full valid config', () => {
    const cfg = {
      version: 1,
      language: 'fr',
      technologies: ['symfony', 'docker'],
      includeInfra: true,
      includeProject: true,
      includeRtk: false,
    };
    expect(validateConfig(cfg)).toEqual(cfg);
  });

  it('rejects non-objects', () => {
    expect(() => validateConfig(null)).toThrow(/must be a JSON object/);
    expect(() => validateConfig([])).toThrow(/must be a JSON object/);
    expect(() => validateConfig('hello')).toThrow(/must be a JSON object/);
  });

  it('rejects unsupported schema versions', () => {
    expect(() => validateConfig({ version: 2 })).toThrow(/unsupported schema version/);
    expect(() => validateConfig({})).toThrow(/unsupported schema version/);
  });

  it('rejects unknown languages', () => {
    expect(() => validateConfig({ version: 1, language: 'xx' })).toThrow(/unknown language/);
  });

  it('rejects unknown technologies', () => {
    expect(() => validateConfig({ version: 1, technologies: ['cobol'] })).toThrow(/unknown technology/);
  });

  it('rejects non-array technologies', () => {
    expect(() => validateConfig({ version: 1, technologies: 'symfony' })).toThrow(/must be an array/);
  });

  it('rejects non-boolean include flags', () => {
    expect(() => validateConfig({ version: 1, includeInfra: 'yes' })).toThrow(/must be a boolean/);
    expect(() => validateConfig({ version: 1, includeProject: 1 })).toThrow(/must be a boolean/);
    expect(() => validateConfig({ version: 1, includeRtk: null })).toThrow(/must be a boolean/);
  });
});

describe('runInstallFromUrl', () => {
  let cli;
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    cli = {
      config: { language: 'en', technologies: [], targetPath: process.cwd() },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('fetches, parses and applies a valid config', async () => {
    const cfg = { version: 1, language: 'fr', technologies: ['symfony'], includeProject: true };
    const fetchFn = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify(cfg),
    }));
    await runInstallFromUrl('https://x.example/cc.json', cli, { CLI_ROOT: '/cli' }, fetchFn);
    expect(fetchFn).toHaveBeenCalledOnce();
    expect(cli.config.language).toBe('fr');
    expect(cli.config.technologies).toEqual(['symfony']);
    expect(cli.config.includeProject).toBe(true);
    const { runInstallation } = await import('../../cli/lib/installer.js');
    expect(runInstallation).toHaveBeenCalledWith(cli, { CLI_ROOT: '/cli' });
  });

  it('throws on HTTP error', async () => {
    const fetchFn = vi.fn(async () => ({ ok: false, status: 404, statusText: 'Not Found' }));
    await expect(runInstallFromUrl('https://x.example/cc.json', cli, { CLI_ROOT: '/cli' }, fetchFn)).rejects.toThrow(
      /HTTP 404/
    );
  });

  it('throws on invalid JSON', async () => {
    const fetchFn = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => '<html>oops</html>',
    }));
    await expect(runInstallFromUrl('https://x.example/cc.json', cli, { CLI_ROOT: '/cli' }, fetchFn)).rejects.toThrow(
      /not valid JSON/
    );
  });

  it('throws on fetch network failure', async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error('ENOTFOUND');
    });
    await expect(runInstallFromUrl('https://x.example/cc.json', cli, { CLI_ROOT: '/cli' }, fetchFn)).rejects.toThrow(
      /fetch failed/
    );
  });

  it('rejects http URLs to remote hosts before fetching', async () => {
    const fetchFn = vi.fn();
    await expect(runInstallFromUrl('http://evil.example/cc.json', cli, { CLI_ROOT: '/cli' }, fetchFn)).rejects.toThrow(
      /only https/
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('does not override CLI-provided language', async () => {
    cli.config.language = 'es'; // user passed --lang=es
    const cfg = { version: 1, language: 'fr' };
    const fetchFn = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify(cfg),
    }));
    await runInstallFromUrl('https://x.example/cc.json', cli, { CLI_ROOT: '/cli' }, fetchFn);
    expect(cli.config.language).toBe('es');
  });
});
