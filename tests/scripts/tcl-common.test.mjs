import { describe, it, expect, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const TCL_SCRIPT = path.join(PROJECT_ROOT, 'Dev/scripts/tcl-common.sh');

const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-test-tcl-'));
  tmpDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

/**
 * Helper: run a bash snippet that sources tcl-common.sh via a wrapper.
 * The wrapper is placed in Dev/scripts/ so that BASH_SOURCE[1] resolves
 * correctly for get_claude_craft_version (which uses BASH_SOURCE[1]).
 */
function runTclFunction(bashCode) {
  const scriptsDir = path.join(PROJECT_ROOT, 'Dev/scripts');

  // Stub log_* functions that tcl-common.sh expects to exist when called
  // from its consumers, then source tcl-common.sh and run the test code.
  const wrapper = `
set -euo pipefail
log_success() { echo "OK: $1"; }
log_info() { echo "INFO: $1"; }
log_warning() { echo "WARN: $1"; }
log_dry_run() { echo "DRY: $1"; }
source "${TCL_SCRIPT}"
${bashCode}
`;

  return execSync(`bash -c '${wrapper.replace(/'/g, "'\\''")}'`, {
    encoding: 'utf8',
    timeout: 15000,
    cwd: scriptsDir,
  });
}

describe('tcl-common.sh', { timeout: 30000 }, () => {
  it('get_claude_craft_version returns valid semver', () => {
    // get_claude_craft_version uses BASH_SOURCE[1] to locate package.json.
    // When sourced from a wrapper in Dev/scripts/, BASH_SOURCE[1] points to
    // the wrapper itself, so we need to call it from there.
    // We create a tiny wrapper script in Dev/scripts/ to make BASH_SOURCE work.
    const scriptsDir = path.join(PROJECT_ROOT, 'Dev/scripts');
    const wrapperPath = path.join(scriptsDir, '__test_version_wrapper.sh');

    try {
      fs.writeFileSync(
        wrapperPath,
        `#!/bin/bash
set -euo pipefail
source "${TCL_SCRIPT}"
get_claude_craft_version
`,
      );
      fs.chmodSync(wrapperPath, 0o755);

      const output = execSync(`bash "${wrapperPath}"`, {
        encoding: 'utf8',
        timeout: 10000,
        cwd: scriptsDir,
      });

      // Should match semver pattern (e.g. 5.9.2)
      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+/);
    } finally {
      fs.rmSync(wrapperPath, { force: true });
    }
  });

  it('create_tcl_directory_structure creates expected dirs', () => {
    const tmpDir = makeTmpDir();

    runTclFunction(`create_tcl_directory_structure "${tmpDir}" "react" "false"`);

    const expected = [
      '.claude',
      '.claude/references',
      '.claude/references/base',
      '.claude/references/react',
      '.claude/skills',
      '.claude/commands',
      '.claude/commands/common',
      '.claude/commands/react',
      '.claude/agents',
      '.claude/templates',
      '.claude/checklists',
    ];

    for (const dir of expected) {
      expect(
        fs.existsSync(path.join(tmpDir, dir)),
        `Expected directory ${dir} to exist`,
      ).toBe(true);
    }
  });

  it('generate_minimal_claude_md creates CLAUDE.md', () => {
    const tmpDir = makeTmpDir();
    fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });

    runTclFunction(
      `generate_minimal_claude_md "${tmpDir}" "TestProject" "React" "React 19 + TypeScript" "react" "- /react:check-architecture" "false" "false"`,
    );

    const claudeMd = path.join(tmpDir, '.claude', 'CLAUDE.md');
    expect(fs.existsSync(claudeMd)).toBe(true);

    const content = fs.readFileSync(claudeMd, 'utf8');
    expect(content).toContain('TestProject');
    expect(content).toContain('React');
    expect(content).toContain('Docker');
  });

  it('show_tcl_summary outputs structure info', () => {
    const tmpDir = makeTmpDir();

    const output = runTclFunction(
      `show_tcl_summary "${tmpDir}" "React" "react"`,
    );

    expect(output).toContain('Structure');
    expect(output).toContain('.claude/');
    expect(output).toContain('CLAUDE.md');
    expect(output).toContain('react');
  });
});
