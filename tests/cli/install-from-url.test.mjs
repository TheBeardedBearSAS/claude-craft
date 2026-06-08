import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateUrl, validateConfig, runInstallFromUrl, isBlockedHost } from '../../cli/lib/install-from-url.js';

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

  // Audit 2026-06-01 P1 — SSRF: https to private/link-local/metadata addresses
  it('rejects https to cloud-metadata and private/link-local addresses (SSRF)', () => {
    expect(() => validateUrl('https://169.254.169.254/latest/meta-data/')).toThrow(/SSRF|private|link-local|metadata/i);
    expect(() => validateUrl('https://10.0.0.5/cc.json')).toThrow(/SSRF/i);
    expect(() => validateUrl('https://192.168.1.10/cc.json')).toThrow(/SSRF/i);
    expect(() => validateUrl('https://172.16.0.1/cc.json')).toThrow(/SSRF/i);
    expect(() => validateUrl('https://127.0.0.1/cc.json')).toThrow(/SSRF/i);
    expect(() => validateUrl('https://[::1]/cc.json')).toThrow(/SSRF/i);
    expect(() => validateUrl('https://[fd00::1]/cc.json')).toThrow(/SSRF/i);
  });

  it('still accepts https to regular public hosts', () => {
    expect(validateUrl('https://raw.githubusercontent.com/org/repo/main/cc.json').protocol).toBe('https:');
  });
});

describe('isBlockedHost (SSRF guard)', () => {
  it('blocks private, loopback, link-local and metadata ranges', () => {
    for (const h of [
      '10.1.2.3',
      '127.0.0.1',
      '169.254.169.254',
      '172.20.0.1',
      '192.168.0.1',
      '100.100.100.200',
      '0.0.0.0',
      '::1',
      'fe80::1',
      'fc00::1',
      'fd00:ec2::254',
    ]) {
      expect(isBlockedHost(h), h).toBe(true);
    }
  });
  it('allows public IPs and hostnames', () => {
    for (const h of ['8.8.8.8', '1.1.1.1', '172.32.0.1', 'example.com', 'raw.githubusercontent.com']) {
      expect(isBlockedHost(h), h).toBe(false);
    }
  });
});

describe('runInstallFromUrl — redirect re-validation (SSRF)', () => {
  const cli = {
    config: { language: 'en', technologies: [], includeInfra: false, includeProject: false, includeRtk: false },
  };
  it('re-validates redirect targets and refuses a redirect to a metadata address', async () => {
    const fetchFn = vi.fn(async () => ({
      status: 302,
      ok: false,
      headers: { get: (k) => (k.toLowerCase() === 'location' ? 'https://169.254.169.254/latest/' : null) },
    }));
    await expect(runInstallFromUrl('https://x.example/cc.json', cli, { CLI_ROOT: '/cli' }, fetchFn)).rejects.toThrow(
      /SSRF|private|link-local|metadata/i
    );
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

  it('rejects an oversized body read (DoS hardening)', async () => {
    const huge = 'x'.repeat(50 * 1024 + 1);
    const fetchFn = vi.fn(async () => ({ ok: true, status: 200, statusText: 'OK', text: async () => huge }));
    await expect(runInstallFromUrl('https://x.example/cc.json', cli, { CLI_ROOT: '/cli' }, fetchFn)).rejects.toThrow(
      /config too large/
    );
  });

  it('rejects an oversized declared Content-Length up front', async () => {
    const fetchFn = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: (k) => (k.toLowerCase() === 'content-length' ? String(50 * 1024 + 1) : null) },
      text: async () => '{}',
    }));
    await expect(runInstallFromUrl('https://x.example/cc.json', cli, { CLI_ROOT: '/cli' }, fetchFn)).rejects.toThrow(
      /config too large/
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
