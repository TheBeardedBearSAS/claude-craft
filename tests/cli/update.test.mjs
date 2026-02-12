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

// Mock child_process to avoid running real install scripts
vi.mock('child_process', () => ({
  execSync: vi.fn(() => ''),
}));

import { runUpdate } from '../../cli/lib/update.js';
import { execSync } from 'child_process';

describe('runUpdate', () => {
  let tempDir;
  let cliRoot;
  let consoleSpy;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claude-craft-update-'));
    cliRoot = mkdtempSync(join(tmpdir(), 'claude-craft-cli-'));
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    process.exitCode = undefined;
    execSync.mockClear();
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

  it('updates with explicit --tech flag', () => {
    mkdirSync(join(tempDir, '.claude'));
    // Create mock install scripts
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');

    execSync.mockImplementation(() => '');

    runUpdate(tempDir, { tech: 'react', lang: 'fr' }, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Common rules updated');
    expect(output).toContain('React updated');
    expect(output).toContain('Update complete');
    // Verify --force is passed
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('--force'),
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

    execSync.mockImplementation(() => '');

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

    execSync.mockImplementation(() => '');

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

    execSync.mockImplementation((cmd) => {
      if (cmd.includes('install-react')) throw new Error('Script failed');
      return '';
    });

    runUpdate(tempDir, { tech: 'react' }, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[FAIL]');
    expect(output).toContain('React');
  });
});
