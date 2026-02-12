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

// Mock detectProject to avoid filesystem side-effects
vi.mock('../../cli/lib/detect-project.js', () => ({
  detectProject: vi.fn(() => ({
    suggestedTechs: [],
    complexity: 'quick',
  })),
}));

import { runCheck } from '../../cli/lib/check.js';
import { detectProject } from '../../cli/lib/detect-project.js';

describe('runCheck', () => {
  let tempDir;
  let consoleSpy;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claude-craft-check-'));
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    process.exitCode = undefined;
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    consoleSpy.mockRestore();
    process.exitCode = undefined;
  });

  it('reports missing .claude/ directory and sets exitCode', () => {
    runCheck(tempDir);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[MISSING]');
    expect(output).toContain('.claude/ directory not found');
    expect(process.exitCode).toBe(1);
  });

  it('reports OK for a full installation structure', () => {
    // Create full structure
    mkdirSync(join(tempDir, '.claude', 'commands', 'common'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'agents'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'references', 'symfony'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'skills', 'architecture'), { recursive: true });
    writeFileSync(join(tempDir, '.claude', 'CLAUDE.md'), '# Config');
    writeFileSync(join(tempDir, '.claude', 'commands', 'common', 'pre-commit-check.md'), '---\n---');
    writeFileSync(join(tempDir, '.claude', 'agents', 'tdd-coach.md'), '---\n---');
    writeFileSync(join(tempDir, '.claude', 'skills', 'architecture', 'solid.md'), '# SOLID');
    writeFileSync(join(tempDir, '.claude', 'references', 'symfony', 'architecture.md'), '# Arch');

    detectProject.mockReturnValueOnce({ suggestedTechs: ['symfony'], complexity: 'standard' });
    runCheck(tempDir);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[OK]');
    expect(output).toContain('.claude/CLAUDE.md exists');
    expect(output).toContain('1 commands in 1 namespace(s)');
    expect(output).toContain('1 agent(s)');
    expect(output).toContain('symfony');
    expect(output).toContain('1 skill(s)');
    expect(output).toContain('Installation looks good');
    expect(process.exitCode).toBeUndefined();
  });

  it('reports warnings for partial structure (no CLAUDE.md, no agents)', () => {
    mkdirSync(join(tempDir, '.claude', 'commands', 'common'), { recursive: true });
    writeFileSync(join(tempDir, '.claude', 'commands', 'common', 'test.md'), '# test');

    runCheck(tempDir);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[WARN]');
    expect(output).toContain('CLAUDE.md not found');
    expect(output).toContain('no agents found');
    expect(output).toContain('warning(s)');
  });

  it('counts commands across multiple namespaces', () => {
    mkdirSync(join(tempDir, '.claude', 'commands', 'common'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'commands', 'workflow'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'agents'), { recursive: true });
    writeFileSync(join(tempDir, '.claude', 'CLAUDE.md'), '# Config');
    writeFileSync(join(tempDir, '.claude', 'commands', 'common', 'a.md'), '#');
    writeFileSync(join(tempDir, '.claude', 'commands', 'common', 'b.md'), '#');
    writeFileSync(join(tempDir, '.claude', 'commands', 'workflow', 'c.md'), '#');

    runCheck(tempDir);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('3 commands in 2 namespace(s)');
    expect(output).toContain('common, workflow');
  });

  it('handles empty .claude directory (all warnings)', () => {
    mkdirSync(join(tempDir, '.claude'));

    runCheck(tempDir);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('.claude/ directory exists');
    expect(output).toContain('CLAUDE.md not found');
    expect(output).toContain('no namespaces found');
    expect(output).toContain('no agents found');
  });

  it('shows detected tech from detectProject', () => {
    mkdirSync(join(tempDir, '.claude'));
    detectProject.mockReturnValueOnce({ suggestedTechs: ['react', 'docker'], complexity: 'standard' });

    runCheck(tempDir);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('react, docker');
    expect(output).toContain('standard');
  });
});
