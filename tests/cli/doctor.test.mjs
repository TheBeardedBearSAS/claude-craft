import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock colors to simplify output assertions
vi.mock('../../cli/lib/colors.js', () => ({
  default: {
    red: '',
    green: '',
    yellow: '',
    blue: '',
    cyan: '',
    bold: '',
    dim: '',
    reset: '',
  },
}));

import { runDoctor } from '../../cli/lib/doctor.js';

/** Helper: exec mock with all tools present (including yq).
 *  Uses Claude Code 2.1.193 (recommended baseline since v8.19.0 — Week 26: Artifacts,
 *  claude mcp login, /cd) so the version check does not emit [WARN]/[FAIL] in tests
 *  that don't expect one.
 */
function allToolsExec(cmd) {
  if (cmd.includes('npm')) return '10.0.0';
  if (cmd.includes('claude')) return '2.1.193';
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

  // Sprint 2 — version-check branches (CVE-2025-59536 minimum 2.1.97).

  it('reports outdated Claude Code (< 2.1.97 minimum) as failure with upgrade hint', () => {
    mkdirSync(join(tempDir, '.claude'));

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      // 2.1.50 is below the CVE-2025-59536 baseline ; must produce [FAIL].
      if (cmd.includes('claude')) return '2.1.50';
      if (cmd.includes('git')) return 'git version 2.45.0';
      if (cmd.includes('yq')) return 'yq v4.44.1';
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[FAIL]');
    expect(output).toContain('2.1.50');
    expect(output).toContain('CVE-2025-59536');
    // Upgrade hint must mention the npm install command.
    expect(output).toContain('npm install -g @anthropic-ai/claude-code@latest');
  });

  it('reports Claude Code between min (2.1.97) and recommended as warning with correct recommended version', () => {
    mkdirSync(join(tempDir, '.claude'));

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      // 2.1.105 is >= min (2.1.97) but below the recommended version ; must produce [WARN].
      if (cmd.includes('claude')) return '2.1.105';
      if (cmd.includes('git')) return 'git version 2.45.0';
      if (cmd.includes('yq')) return 'yq v4.44.1';
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[WARN]');
    expect(output).toContain('2.1.105');
    // RECOMMENDED_CLAUDE_CODE is loaded from config/versions.yaml (2.1.193)
    expect(output).toContain('recommended 2.1.193');
  });

  it('reports unparseable Claude Code version output as OK without crashing', () => {
    // Defensive: if `claude --version` returns garbage, extractSemver returns
    // null and the version check should fall through to OK rather than crash.
    mkdirSync(join(tempDir, '.claude'));

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      if (cmd.includes('claude')) return 'no version here';
      if (cmd.includes('git')) return 'git version 2.45.0';
      if (cmd.includes('yq')) return 'yq v4.44.1';
      return null;
    };

    runDoctor(tempDir, { execFn });

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[OK]');
    expect(output).toContain('Claude Code');
    // Garbage string itself must appear (the fallback path uses claudeVerRaw).
    expect(output).toContain('no version here');
  });

  it('reports missing git as failure', () => {
    mkdirSync(join(tempDir, '.claude'));

    const execFn = (cmd) => {
      if (cmd.includes('npm')) return '10.0.0';
      if (cmd.includes('claude')) return '2.1.118';
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
      if (cmd.includes('claude')) return '2.1.118';
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
      if (cmd.includes('claude')) return '2.1.118';
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

  it('refuses to run against a forbidden system directory (CC-REL-05)', () => {
    expect(() => runDoctor('/etc', { execFn: allToolsExec })).toThrow(/system directory/);
    expect(() => runDoctor('/', { execFn: allToolsExec })).toThrow(/system directory/);
    expect(() => runDoctor('/usr/local', { execFn: allToolsExec })).toThrow(/system directory/);
  });
});
