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

    // Mock exec to simulate all tools present
    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      if (cmd.includes('claude')) return '2.1.38';
      if (cmd.includes('git')) return 'git version 2.45.0';
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[OK]');
    expect(output).toContain('Node.js');
    expect(output).toContain('npm');
    expect(output).toContain('Claude Code');
    expect(output).toContain('git');
    expect(output).toContain('.claude/ directory exists');
    expect(output).toContain('.claude/CLAUDE.md');
  });

  it('reports missing Claude Code as warning', () => {
    mkdirSync(join(tempDir, '.claude'));

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      if (cmd.includes('claude')) return null;
      if (cmd.includes('git')) return 'git version 2.45.0';
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
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[FAIL]');
    expect(output).toContain('npm not found');
    expect(process.exitCode).toBe(1);
  });

  it('warns when .claude/ directory is not present', () => {
    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      if (cmd.includes('claude')) return '2.1.38';
      if (cmd.includes('git')) return 'git version 2.45.0';
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[WARN]');
    expect(output).toContain('not installed here');
  });

  it('warns on missing .claude subdirectories', () => {
    mkdirSync(join(tempDir, '.claude'));
    writeFileSync(join(tempDir, '.claude', 'CLAUDE.md'), '# Config');

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      if (cmd.includes('claude')) return '2.1.38';
      if (cmd.includes('git')) return 'git version 2.45.0';
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('.claude/commands/ missing');
    expect(output).toContain('.claude/agents/ missing');
  });

  it('checks shell script execute permissions', () => {
    mkdirSync(join(tempDir, '.claude'));
    mkdirSync(join(tempDir, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(tempDir, 'Dev', 'scripts', 'test.sh'), '#!/bin/bash');
    chmodSync(join(tempDir, 'Dev', 'scripts', 'test.sh'), 0o755);

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      if (cmd.includes('claude')) return '2.1.38';
      if (cmd.includes('git')) return 'git version 2.45.0';
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Shell scripts executable');
  });

  it('checks i18n base dirs', () => {
    mkdirSync(join(tempDir, '.claude'));
    mkdirSync(join(tempDir, 'Dev', 'i18n', 'en'), { recursive: true });
    mkdirSync(join(tempDir, 'Dev', 'i18n', 'fr'), { recursive: true });

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      if (cmd.includes('claude')) return '2.1.38';
      if (cmd.includes('git')) return 'git version 2.45.0';
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('i18n base dirs');
    expect(output).toContain('en, fr');
  });
});
