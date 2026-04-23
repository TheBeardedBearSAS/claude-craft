import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock colors to simplify output assertions
vi.mock('../../cli/lib/colors.js', () => ({
  default: {
    red: '', green: '', yellow: '', blue: '', cyan: '',
    bold: '', dim: '', reset: '',
  },
}));

// Mock child_process to avoid running real install scripts.
// Security audit 2026-04-23 (C-2): update.js now uses spawnSync with argv array
// instead of execSync with shell string interpolation. Tests mock spawnSync.
vi.mock('child_process', () => ({
  spawnSync: vi.fn(() => ({ status: 0, stdout: '', stderr: '' })),
}));

import { runUpdate } from '../../cli/lib/update.js';
import { spawnSync } from 'child_process';

describe('runUpdate', () => {
  let tempDir;
  let cliRoot;
  let consoleSpy;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claude-craft-update-'));
    cliRoot = mkdtempSync(join(tmpdir(), 'claude-craft-cli-'));
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    process.exitCode = undefined;
    spawnSync.mockClear();
    spawnSync.mockReturnValue({ status: 0, stdout: '', stderr: '' });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    rmSync(cliRoot, { recursive: true, force: true });
    consoleSpy.mockRestore();
    process.exitCode = undefined;
  });

  it('reports no installation when .claude/ is missing', () => {
    runUpdate(tempDir, {}, cliRoot);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('No claude-craft installation detected');
    expect(process.exitCode).toBe(1);
  });

  it('reports unknown technology for invalid --tech', () => {
    mkdirSync(join(tempDir, '.claude'));
    runUpdate(tempDir, { tech: 'nonexistent' }, cliRoot);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Unknown technology: nonexistent');
    expect(process.exitCode).toBe(1);
  });

  it('rejects invalid --lang value (security: argument injection prevention)', () => {
    mkdirSync(join(tempDir, '.claude'));
    expect(() => runUpdate(tempDir, { lang: 'en" && touch /tmp/pwned #' }, cliRoot)).toThrow(/Invalid --lang/);
  });

  it('rejects system directory as target (security: path traversal prevention)', () => {
    expect(() => runUpdate('/etc', {}, cliRoot)).toThrow(/Refusing to operate on system directory/);
  });

  it('updates with explicit --tech flag', () => {
    mkdirSync(join(tempDir, '.claude'));
    // Create mock install scripts
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');

    spawnSync.mockReturnValue({ status: 0, stdout: '', stderr: '' });

    runUpdate(tempDir, { tech: 'react', lang: 'fr' }, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Common rules updated');
    expect(output).toContain('React updated');
    expect(output).toContain('Update complete');
    // Verify --force is passed in the spawnSync argv array
    expect(spawnSync).toHaveBeenCalledWith(
      'bash',
      expect.arrayContaining(['--force']),
      expect.any(Object),
    );
    // Verify --lang is passed as a single argv item (no shell interpolation)
    expect(spawnSync).toHaveBeenCalledWith(
      'bash',
      expect.arrayContaining(['--lang=fr']),
      expect.any(Object),
    );
  });

  it('auto-detects techs from installed references', () => {
    mkdirSync(join(tempDir, '.claude', 'references', 'symfony'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'references', 'react'), { recursive: true });
    // Create mock install scripts
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-symfony-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');

    spawnSync.mockReturnValue({ status: 0, stdout: '', stderr: '' });

    runUpdate(tempDir, {}, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Symfony');
    expect(output).toContain('React');
    expect(output).toContain('Update complete');
  });

  it('shows no tech warning when no references detected and common rules updated', () => {
    mkdirSync(join(tempDir, '.claude', 'references'), { recursive: true });
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');

    spawnSync.mockReturnValue({ status: 0, stdout: '', stderr: '' });

    runUpdate(tempDir, {}, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    // Common rules updated, but no tech-specific scripts ran
    expect(output).toContain('Common rules updated');
    expect(output).toContain('Update complete');
  });

  it('warns when no tech references and no common script', () => {
    mkdirSync(join(tempDir, '.claude', 'references'), { recursive: true });
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    // No install scripts at all

    runUpdate(tempDir, {}, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('No tech references detected');
  });

  it('handles install script failure gracefully', () => {
    mkdirSync(join(tempDir, '.claude'));
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');

    spawnSync.mockImplementation((_cmd, args) => {
      const argsStr = Array.isArray(args) ? args.join(' ') : '';
      if (argsStr.includes('install-react')) return { status: 1, stdout: '', stderr: 'Script failed' };
      return { status: 0, stdout: '', stderr: '' };
    });

    runUpdate(tempDir, { tech: 'react' }, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[FAIL]');
    expect(output).toContain('React');
  });

  it('skips tech when install script not found', () => {
    mkdirSync(join(tempDir, '.claude', 'references', 'react'), { recursive: true });
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    // Deliberately NOT creating install-react-rules.sh

    spawnSync.mockReturnValue({ status: 0, stdout: '', stderr: '' });

    runUpdate(tempDir, {}, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[SKIP]');
    expect(output).toContain('install script not found');
  });

  it('reports update failed when all scripts fail', () => {
    mkdirSync(join(tempDir, '.claude'));
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');

    // All scripts fail
    spawnSync.mockReturnValue({ status: 1, stdout: '', stderr: 'Script failed' });

    runUpdate(tempDir, { tech: 'react' }, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Update failed');
    expect(process.exitCode).toBe(1);
  });
});
