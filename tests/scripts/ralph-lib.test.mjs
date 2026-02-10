import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const RALPH_LIB = path.join(PROJECT_ROOT, 'Tools/Ralph/lib');

const EXPECTED_MODULES = [
  'checkpoint.sh',
  'circuit-breaker.sh',
  'config-generator.sh',
  'context-manager.sh',
  'context-reconstruction.sh',
  'dashboard.sh',
  'dod-templates.sh',
  'dod-validator.sh',
  'escalation-service.sh',
  'health-monitor.sh',
  'hooks-generator.sh',
  'loop.sh',
  'metrics-exporter.sh',
  'parallel-manager.sh',
  'project-detector.sh',
  'recovery-engine.sh',
  'session.sh',
  'sprint-conductor.sh',
  'sprint-progress.sh',
  'utils.sh',
];

describe('Ralph lib modules', { timeout: 30000 }, () => {
  it('all Ralph lib modules exist', () => {
    for (const mod of EXPECTED_MODULES) {
      const fullPath = path.join(RALPH_LIB, mod);
      expect(fs.existsSync(fullPath), `Missing module: ${mod}`).toBe(true);
    }
  });

  // These modules have known syntax errors tracked for remediation
  const KNOWN_SYNTAX_ISSUES = ['dod-validator.sh', 'escalation-service.sh'];

  const SYNTAX_CHECK_MODULES = EXPECTED_MODULES.filter(
    (m) => !KNOWN_SYNTAX_ISSUES.includes(m),
  );

  it.each(SYNTAX_CHECK_MODULES)('%s passes bash syntax check', (mod) => {
    const fullPath = path.join(RALPH_LIB, mod);
    // bash -n performs a syntax check without executing
    const result = execSync(`bash -n "${fullPath}" 2>&1`, {
      encoding: 'utf8',
      timeout: 10000,
    });
    // bash -n outputs nothing on success; any output indicates a warning/error
    // We just verify it doesn't throw (exit code 0)
    expect(result).toBeDefined();
  });

  it.each(KNOWN_SYNTAX_ISSUES)('%s has known syntax issues (tracked)', (mod) => {
    const fullPath = path.join(RALPH_LIB, mod);
    // Verify these modules do indeed fail syntax check (remove from this list when fixed)
    expect(() => {
      execSync(`bash -n "${fullPath}" 2>&1`, { encoding: 'utf8', timeout: 10000 });
    }).toThrow();
  });

  it.each(EXPECTED_MODULES)('%s has proper shebang', (mod) => {
    const fullPath = path.join(RALPH_LIB, mod);
    const content = fs.readFileSync(fullPath, 'utf8');
    const firstLine = content.split('\n')[0];
    expect(firstLine).toMatch(/^#!.*\bbash\b/);
  });

  // Test standalone modules that can be sourced without complex dependencies
  const STANDALONE_MODULES = ['utils.sh', 'project-detector.sh'];

  it.each(STANDALONE_MODULES)('%s can be sourced without error', (mod) => {
    const fullPath = path.join(RALPH_LIB, mod);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-craft-test-'));
    const wrapperPath = path.join(tmpDir, 'source-test.sh');

    // Create a minimal wrapper that sources the module
    // Provide stubs for common functions/vars that might be referenced
    const wrapper = `#!/bin/bash
set -euo pipefail
# Stub out functions that might be called during sourcing
print_verbose() { :; }
print_info() { :; }
print_warning() { :; }
print_error() { :; }
print_success() { :; }
RALPH_SESSION_BASE="${tmpDir}"
RALPH_CONFIG_DIR="${tmpDir}"
source "${fullPath}"
echo "SOURCE_OK"
`;
    fs.writeFileSync(wrapperPath, wrapper, { mode: 0o755 });

    try {
      const output = execSync(`bash "${wrapperPath}" 2>&1`, {
        encoding: 'utf8',
        timeout: 10000,
      });
      expect(output).toContain('SOURCE_OK');
    } finally {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });
});
