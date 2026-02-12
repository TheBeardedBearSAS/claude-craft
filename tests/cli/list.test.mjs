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

// Mock detectProject
vi.mock('../../cli/lib/detect-project.js', () => ({
  detectProject: vi.fn(() => ({
    suggestedTechs: [],
    complexity: 'quick',
  })),
}));

import { runList } from '../../cli/lib/list.js';
import { detectProject } from '../../cli/lib/detect-project.js';

describe('runList', () => {
  let tempDir;
  let consoleSpy;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claude-craft-list-'));
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    process.exitCode = undefined;
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    consoleSpy.mockRestore();
    process.exitCode = undefined;
  });

  it('reports missing installation when .claude/ not found', () => {
    runList(tempDir);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('No claude-craft installation detected');
    expect(process.exitCode).toBe(1);
  });

  it('lists components for a full installation structure', () => {
    mkdirSync(join(tempDir, '.claude', 'commands', 'common'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'commands', 'workflow'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'agents'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'references', 'symfony'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'skills', 'architecture'), { recursive: true });
    writeFileSync(join(tempDir, '.claude', 'commands', 'common', 'a.md'), '#');
    writeFileSync(join(tempDir, '.claude', 'commands', 'common', 'b.md'), '#');
    writeFileSync(join(tempDir, '.claude', 'commands', 'workflow', 'c.md'), '#');
    writeFileSync(join(tempDir, '.claude', 'agents', 'tdd-coach.md'), '#');
    writeFileSync(join(tempDir, '.claude', 'skills', 'architecture', 'solid.md'), '#');

    detectProject.mockReturnValueOnce({ suggestedTechs: ['symfony'], complexity: 'standard' });
    runList(tempDir);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('/common:*');
    expect(output).toContain('/workflow:*');
    expect(output).toContain('2 command(s)');
    expect(output).toContain('1 command(s)');
    expect(output).toContain('3 commands in 2 namespace(s)');
    expect(output).toContain('1 agent(s)');
    expect(output).toContain('symfony');
    expect(output).toContain('1 skill(s)');
  });

  it('handles empty .claude directory', () => {
    mkdirSync(join(tempDir, '.claude'));

    runList(tempDir);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('No namespaces found');
    expect(output).toContain('No agents found');
    expect(output).toContain('No tech references found');
    expect(output).toContain('No skills found');
  });

  it('counts top-level skills', () => {
    mkdirSync(join(tempDir, '.claude', 'skills'), { recursive: true });
    writeFileSync(join(tempDir, '.claude', 'skills', 'security.md'), '#');
    writeFileSync(join(tempDir, '.claude', 'skills', 'testing.md'), '#');

    runList(tempDir);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('2 top-level');
    expect(output).toContain('2 skill(s)');
  });
});
