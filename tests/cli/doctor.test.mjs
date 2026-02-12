import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock colors to simplify output assertions
vi.mock('../../cli/lib/colors.js', () => ({
  default: {
    red: '', green: '', yellow: '', blue: '', cyan: '',
    bold: '', dim: '', reset: '',
  },
}));

import { runDoctor } from '../../cli/lib/doctor.js';

/** Helper: exec mock with all tools present (including yq). */
function allToolsExec(cmd) {
  if (cmd.includes('npm')) return '10.0.0';
  if (cmd.includes('claude')) return '2.1.38';
  if (cmd.includes('git')) return 'git version 2.45.0';
  if (cmd.includes('yq')) return 'yq (https://github.com/mikefarah/yq/) version v4.44.1';
  return null;
}

describe('runDoctor', () => {
  let tempDir;
  let consoleSpy;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claude-craft-doctor-'));
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    process.exitCode = undefined;
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    consoleSpy.mockRestore();
    process.exitCode = undefined;
  });

  it('reports all checks with mocked exec for success', () => {
    // Create .claude structure
    mkdirSync(join(tempDir, '.claude', 'commands'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'agents'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'references'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'skills'), { recursive: true });
    writeFileSync(join(tempDir, '.claude', 'CLAUDE.md'), '# Config');

    runDoctor(tempDir, { execFn: allToolsExec });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[OK]');
    expect(output).toContain('Node.js');
    expect(output).toContain('npm');
    expect(output).toContain('Claude Code');
    expect(output).toContain('git');
    expect(output).toContain('yq');
    expect(output).toContain('.claude/ directory exists');
    expect(output).toContain('.claude/CLAUDE.md');
  });

  it('reports missing Claude Code as warning', () => {
    mkdirSync(join(tempDir, '.claude'));

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      if (cmd.includes('claude')) return null;
      if (cmd.includes('git')) return 'git version 2.45.0';
      if (cmd.includes('yq')) return 'yq v4.44.1';
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[WARN]');
    expect(output).toContain('Claude Code not found');
  });

  it('reports missing git as failure', () => {
    mkdirSync(join(tempDir, '.claude'));

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      if (cmd.includes('claude')) return '2.1.38';
      if (cmd.includes('git')) return null;
      if (cmd.includes('yq')) return 'yq v4.44.1';
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[FAIL]');
    expect(output).toContain('git not found');
    expect(process.exitCode).toBe(1);
  });

  it('reports missing npm as failure', () => {
    mkdirSync(join(tempDir, '.claude'));

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return null;
      if (cmd.includes('claude')) return '2.1.38';
      if (cmd.includes('git')) return 'git version 2.45.0';
      if (cmd.includes('yq')) return 'yq v4.44.1';
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[FAIL]');
    expect(output).toContain('npm not found');
    expect(process.exitCode).toBe(1);
  });

  it('warns when .claude/ directory is not present', () => {
    runDoctor(tempDir, { execFn: allToolsExec });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[WARN]');
    expect(output).toContain('not installed here');
  });

  it('warns on missing .claude subdirectories', () => {
    mkdirSync(join(tempDir, '.claude'));
    writeFileSync(join(tempDir, '.claude', 'CLAUDE.md'), '# Config');

    runDoctor(tempDir, { execFn: allToolsExec });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('.claude/commands/ missing');
    expect(output).toContain('.claude/agents/ missing');
  });

  it('checks shell script execute permissions', () => {
    mkdirSync(join(tempDir, '.claude'));
    mkdirSync(join(tempDir, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(tempDir, 'Dev', 'scripts', 'test.sh'), '#!/bin/bash');
    chmodSync(join(tempDir, 'Dev', 'scripts', 'test.sh'), 0o755);

    runDoctor(tempDir, { execFn: allToolsExec });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Shell scripts executable');
  });

  it('checks i18n base dirs', () => {
    mkdirSync(join(tempDir, '.claude'));
    mkdirSync(join(tempDir, 'Dev', 'i18n', 'en'), { recursive: true });
    mkdirSync(join(tempDir, 'Dev', 'i18n', 'fr'), { recursive: true });

    runDoctor(tempDir, { execFn: allToolsExec });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('i18n base dirs');
    expect(output).toContain('en, fr');
  });

  // --- yq check coverage ---

  it('reports yq present as OK', () => {
    mkdirSync(join(tempDir, '.claude'));

    runDoctor(tempDir, { execFn: allToolsExec });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[OK]');
    expect(output).toContain('yq');
  });

  it('warns when yq is not found', () => {
    mkdirSync(join(tempDir, '.claude'));

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      if (cmd.includes('claude')) return '2.1.38';
      if (cmd.includes('git')) return 'git version 2.45.0';
      if (cmd.includes('yq')) return null;
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[WARN]');
    expect(output).toContain('yq not found');
  });

  // --- Error path coverage ---

  it('silently handles unreadable Dev/scripts directory', () => {
    mkdirSync(join(tempDir, '.claude'));
    mkdirSync(join(tempDir, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(tempDir, 'Dev', 'scripts', 'test.sh'), '#!/bin/bash');
    // Make scripts dir unreadable
    chmodSync(join(tempDir, 'Dev', 'scripts'), 0o000);

    runDoctor(tempDir, { execFn: allToolsExec });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    // Should NOT crash, and should not mention shell scripts
    expect(output).not.toContain('Shell scripts executable');
    expect(output).not.toContain('[FAIL]');

    // Restore permissions for cleanup
    chmodSync(join(tempDir, 'Dev', 'scripts'), 0o755);
  });

  it('warns when i18n dir exists but listDirs returns empty', () => {
    mkdirSync(join(tempDir, '.claude'));
    // Create i18n base with only files, no subdirectories
    mkdirSync(join(tempDir, 'Dev', 'i18n'), { recursive: true });
    writeFileSync(join(tempDir, 'Dev', 'i18n', 'README.md'), '# i18n');

    runDoctor(tempDir, { execFn: allToolsExec });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[WARN]');
    expect(output).toContain('no language dirs found');
  });

  it('uses real tryExec when no execFn provided', () => {
    mkdirSync(join(tempDir, '.claude'));

    // Call without injected execFn — exercises the real tryExec code path
    runDoctor(tempDir);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    // Should at minimum show Node.js check (always available in test env)
    expect(output).toContain('Node.js');
    // npm should also be available
    expect(output).toContain('npm');
  });

  it('warns on scripts missing execute permission', () => {
    mkdirSync(join(tempDir, '.claude'));
    mkdirSync(join(tempDir, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(tempDir, 'Dev', 'scripts', 'no-exec.sh'), '#!/bin/bash');
    chmodSync(join(tempDir, 'Dev', 'scripts', 'no-exec.sh'), 0o644);

    runDoctor(tempDir, { execFn: allToolsExec });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[WARN]');
    expect(output).toContain('missing execute permission');
  });
});
