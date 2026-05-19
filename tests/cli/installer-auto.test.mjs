import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { autoInstall } from '../../cli/lib/installer.js';

// Mock the actual script runner so autoInstall doesn't try to exec bash.
vi.mock('child_process', () => ({
  spawnSync: vi.fn(() => ({ status: 0, error: null })),
}));

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: { ...actual.default, existsSync: vi.fn(() => true) },
    existsSync: vi.fn(() => true),
  };
});

describe('autoInstall', () => {
  let cli;
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    cli = {
      config: {
        targetPath: process.cwd(),
        language: 'en',
        technologies: [],
      },
      detectProject: vi.fn(() => ({
        suggestedTechs: ['symfony'],
        hasDockerfile: false,
        hasClaude: false,
        complexity: 'standard',
      })),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('auto-detects technologies from project files', async () => {
    await autoInstall(cli, { CLI_ROOT: '/cli', VERSION: '0.0.0' });
    expect(cli.detectProject).toHaveBeenCalled();
    expect(cli.config.technologies).toEqual(['symfony']);
  });

  it('respects --tech if already configured', async () => {
    cli.config.technologies = ['react'];
    await autoInstall(cli, { CLI_ROOT: '/cli', VERSION: '0.0.0' });
    expect(cli.detectProject).not.toHaveBeenCalled();
    expect(cli.config.technologies).toEqual(['react']);
  });

  it('respects --lang if not "en"', async () => {
    cli.config.language = 'fr';
    await autoInstall(cli, { CLI_ROOT: '/cli', VERSION: '0.0.0' });
    expect(cli.config.language).toBe('fr');
  });

  it('falls back to detected locale when --lang=en or absent', async () => {
    const origLang = process.env.LANG;
    process.env.LANG = 'es_ES.UTF-8';
    try {
      await autoInstall(cli, { CLI_ROOT: '/cli', VERSION: '0.0.0' });
      expect(cli.config.language).toBe('es');
    } finally {
      if (origLang === undefined) delete process.env.LANG;
      else process.env.LANG = origLang;
    }
  });

  it('applies default include flags', async () => {
    await autoInstall(cli, { CLI_ROOT: '/cli', VERSION: '0.0.0' });
    expect(cli.config.includeProject).toBe(true);
    expect(cli.config.includeRtk).toBe(false);
    expect(cli.config.includeInfra).toBe(false);
  });

  it('enables infra when a Dockerfile is detected', async () => {
    cli.detectProject = vi.fn(() => ({
      suggestedTechs: ['python', 'docker'],
      hasDockerfile: true,
      hasClaude: false,
      complexity: 'standard',
    }));
    await autoInstall(cli, { CLI_ROOT: '/cli', VERSION: '0.0.0' });
    expect(cli.config.includeInfra).toBe(true);
  });
});
