import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const RALPH_LIB = path.join(PROJECT_ROOT, 'Tools/Ralph/lib');
const RECOVERY_ENGINE = path.join(RALPH_LIB, 'recovery-engine.sh');
const DOD_VALIDATOR = path.join(RALPH_LIB, 'dod-validator.sh');
const SPRINT_CONDUCTOR = path.join(RALPH_LIB, 'sprint-conductor.sh');

/**
 * Helper: run bash in a subprocess with stubs for common functions.
 */
function runBash(script, options = {}) {
  const result = spawnSync('bash', ['-c', script], {
    encoding: 'utf8',
    timeout: options.timeout || 10000,
    cwd: PROJECT_ROOT,
    env: { ...process.env, ...options.env },
  });
  return { stdout: result.stdout, stderr: result.stderr, status: result.status };
}

/**
 * Wrapper: source recovery-engine.sh with stubs and evaluate an expression.
 */
function evalInRecovery(expression, env = {}) {
  const envExports = Object.entries(env)
    .map(([k, v]) => `export ${k}="${v}"`)
    .join('\n');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-craft-asc-'));
  const script = `
set -euo pipefail

# Stubs for functions used during sourcing/init
print_verbose() { :; }
print_info() { :; }
print_warning() { :; }
print_error() { :; }
print_success() { :; }
CONFIG_FILE=""
RALPH_SESSION_BASE="${tmpDir}"

${envExports}

source "${RECOVERY_ENGINE}"

${expression}
`;
  const result = runBash(script);
  // Cleanup
  try {
    fs.rmSync(tmpDir, { recursive: true });
  } catch { /* noop */ }
  return result;
}

// =============================================================================
// Recovery Engine — Error Classification
// =============================================================================
describe('recovery-engine.sh — error classification', { timeout: 30000 }, () => {
  describe('classify_error', () => {
    // Level 0: Transient
    const transientErrors = [
      ['timeout', 'Connection timed out after 30s'],
      ['rate_limit', 'Error 429: Too Many Requests'],
      ['network', 'ECONNRESET: socket hang up'],
      ['temporary', 'Service Unavailable 503'],
    ];

    it.each(transientErrors)(
      'classifies "%s" as Level 0 (transient)',
      (expectedType, errorMsg) => {
        const { stdout } = evalInRecovery(`
          result=$(classify_error "${errorMsg}")
          echo "$result"
        `);
        expect(stdout.trim()).toMatch(/^0:/);
        expect(stdout.trim()).toContain(expectedType);
      },
    );

    // Level 1: Recoverable
    const recoverableErrors = [
      ['lint', 'ESLint found 3 lint errors in src/index.ts'],
      ['test_fail', '5 tests failed in the test suite'],
      ['deps', 'Module not found: @scope/package'],
      ['syntax', 'SyntaxError: Unexpected token in JSON at position 0'],
      ['type_error', 'TypeScript error TS2322: Type mismatch'],
    ];

    it.each(recoverableErrors)(
      'classifies "%s" as Level 1 (recoverable)',
      (expectedType, errorMsg) => {
        const { stdout } = evalInRecovery(`
          result=$(classify_error "${errorMsg}")
          echo "$result"
        `);
        expect(stdout.trim()).toMatch(/^1:/);
        expect(stdout.trim()).toContain(expectedType);
      },
    );

    // Level 2: Degraded
    const degradedErrors = [
      ['docs', 'Documentation build failed for changelog'],
      ['coverage', 'Coverage below 80% threshold'],
      ['warning', 'Warning: deprecated API usage detected'],
    ];

    it.each(degradedErrors)(
      'classifies "%s" as Level 2 (degraded)',
      (expectedType, errorMsg) => {
        const { stdout } = evalInRecovery(`
          result=$(classify_error "${errorMsg}")
          echo "$result"
        `);
        expect(stdout.trim()).toMatch(/^2:/);
        expect(stdout.trim()).toContain(expectedType);
      },
    );

    // Level 3: Blocked
    const blockedErrors = [
      ['security', 'Critical security vulnerability CVE-2025-1234 detected'],
      ['architecture', 'Architecture violation: circular dependency found'],
      ['auth', 'Authentication failed: unauthorized access'],
      ['resource', 'Out of memory: heap allocation failed'],
    ];

    it.each(blockedErrors)(
      'classifies "%s" as Level 3 (blocked)',
      (expectedType, errorMsg) => {
        const { stdout } = evalInRecovery(`
          result=$(classify_error "${errorMsg}")
          echo "$result"
        `);
        expect(stdout.trim()).toMatch(/^3:/);
        expect(stdout.trim()).toContain(expectedType);
      },
    );

    it('classifies unknown errors as Level 1', () => {
      const { stdout } = evalInRecovery(`
        result=$(classify_error "some completely unknown error xyz")
        echo "$result"
      `);
      expect(stdout.trim()).toBe('1:unknown');
    });
  });

  describe('get_level_name', () => {
    it.each([
      [0, 'transient'],
      [1, 'recoverable'],
      [2, 'degraded'],
      [3, 'blocked'],
    ])('returns "%s" for level %i', (level, expected) => {
      const { stdout } = evalInRecovery(`
        echo "$(get_level_name ${level})"
      `);
      expect(stdout.trim()).toBe(expected);
    });
  });

  describe('should_attempt_recovery', () => {
    it('returns true for transient errors', () => {
      const { status } = evalInRecovery(`
        RECOVERY_ENABLED="true"
        RECOVERY_CURRENT_ATTEMPT=0
        RECOVERY_MAX_ATTEMPTS=3
        should_attempt_recovery "timeout error"
      `);
      expect(status).toBe(0);
    });

    it('returns true for recoverable errors', () => {
      const { status } = evalInRecovery(`
        RECOVERY_ENABLED="true"
        RECOVERY_CURRENT_ATTEMPT=0
        RECOVERY_MAX_ATTEMPTS=3
        should_attempt_recovery "lint error found"
      `);
      expect(status).toBe(0);
    });

    it('returns false for blocked errors', () => {
      const { status } = evalInRecovery(`
        RECOVERY_ENABLED="true"
        RECOVERY_CURRENT_ATTEMPT=0
        RECOVERY_MAX_ATTEMPTS=3
        should_attempt_recovery "critical security vulnerability CVE-2025" || exit 1
      `);
      expect(status).toBe(1);
    });

    it('returns false when disabled', () => {
      const { status } = evalInRecovery(`
        RECOVERY_ENABLED="false"
        RECOVERY_CURRENT_ATTEMPT=0
        should_attempt_recovery "timeout" || exit 1
      `);
      expect(status).toBe(1);
    });

    it('returns false when max attempts reached', () => {
      const { status } = evalInRecovery(`
        RECOVERY_ENABLED="true"
        RECOVERY_CURRENT_ATTEMPT=3
        RECOVERY_MAX_ATTEMPTS=3
        should_attempt_recovery "timeout" || exit 1
      `);
      expect(status).toBe(1);
    });
  });
});

// =============================================================================
// Recovery Engine — Retry logic (backoff)
// =============================================================================
describe('recovery-engine.sh — retry logic', { timeout: 30000 }, () => {
  it('retry_with_backoff computes exponential delay', () => {
    // We override sleep to capture the delay instead of actually sleeping
    const { stdout } = evalInRecovery(`
      # Override sleep to just echo the delay
      sleep() { echo "SLEEP:$1"; }
      RECOVERY_CURRENT_ATTEMPT=1
      retry_with_backoff "timeout"
    `);
    // Attempt 1: base_delay * 2^0 = 5 * 1 = 5
    expect(stdout).toContain('SLEEP:5');
  });

  it('retry_with_backoff increases delay exponentially', () => {
    const { stdout } = evalInRecovery(`
      sleep() { echo "SLEEP:$1"; }
      RECOVERY_CURRENT_ATTEMPT=3
      retry_with_backoff "timeout"
    `);
    // Attempt 3: base_delay * 2^2 = 5 * 4 = 20
    expect(stdout).toContain('SLEEP:20');
  });

  it('retry_with_backoff caps at max_delay', () => {
    const { stdout } = evalInRecovery(`
      sleep() { echo "SLEEP:$1"; }
      RECOVERY_CURRENT_ATTEMPT=5
      retry_with_backoff "timeout"
    `);
    // Attempt 5: base_delay * 2^4 = 5 * 16 = 80 → capped at 60
    expect(stdout).toContain('SLEEP:60');
  });

  it('reset_recovery_state clears attempt counter', () => {
    const { stdout } = evalInRecovery(`
      RECOVERY_CURRENT_ATTEMPT=5
      RECOVERY_LAST_ERROR="timeout"
      RECOVERY_LAST_LEVEL=0
      RECOVERY_FIX_REQUEST=""
      reset_recovery_state
      echo "attempt=$RECOVERY_CURRENT_ATTEMPT error=$RECOVERY_LAST_ERROR level=$RECOVERY_LAST_LEVEL"
    `);
    expect(stdout).toContain('attempt=0');
    expect(stdout).toContain('error=');
    expect(stdout).toContain('level=-1');
  });
});

// =============================================================================
// DoD Validator — Security regression (SEC-2: no eval)
// =============================================================================
describe('dod-validator.sh — security', { timeout: 30000 }, () => {
  it('does not use eval for command execution (SEC-2)', () => {
    const content = fs.readFileSync(DOD_VALIDATOR, 'utf8');
    // validate_command should use bash -c, not eval
    expect(content).not.toMatch(/\beval\b/);
  });

  it('validate_command uses allowlist regex for safety', () => {
    const content = fs.readFileSync(DOD_VALIDATOR, 'utf8');
    // The validate_command function checks against a safe pattern
    expect(content).toContain('bash -c "$cmd"');
    expect(content).toMatch(/\[\[.*\$cmd.*=~.*\]\]/);
  });
});

// =============================================================================
// Sprint Conductor — Stop conditions
// =============================================================================
describe('sprint-conductor.sh — stop conditions', { timeout: 30000 }, () => {
  function evalInConductor(expression) {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-craft-asc-'));
    const script = `
set -euo pipefail

# Stubs
print_verbose() { :; }
print_info() { :; }
print_warning() { :; }
print_error() { :; }
print_success() { :; }
log_conductor() { :; }
CONFIG_FILE=""
RALPH_SESSION_BASE="${tmpDir}"
BMAD_DIR="${tmpDir}"
C_CYAN="" C_RESET="" C_BOLD="" C_DIM="" C_GREEN="" C_RED="" C_YELLOW="" C_MAGENTA=""

# Minimal stubs for functions that sprint-conductor calls
print_header_conductor() { :; }
init_recovery_engine() { :; }
init_escalation_service() { :; }
enable_autonomous_mode() { :; }

source "${SPRINT_CONDUCTOR}"

# Set default state
ASC_START_TIME=$(date +%s)
ASC_STATE_FILE="${tmpDir}/state.yaml"
ASC_LOG_FILE="${tmpDir}/log.log"
touch "$ASC_STATE_FILE" "$ASC_LOG_FILE"

${expression}
`;
    const result = runBash(script);
    try {
      fs.rmSync(tmpDir, { recursive: true });
    } catch { /* noop */ }
    return result;
  }

  it('stops when max stories reached', () => {
    const { status } = evalInConductor(`
      ASC_MAX_STORIES=5
      ASC_STORIES_COMPLETED=3
      ASC_STORIES_FAILED=1
      ASC_STORIES_SKIPPED=1
      ASC_CONSECUTIVE_FAILURES=0
      ASC_MAX_CONSECUTIVE_FAILURES=3
      ASC_MAX_RUNTIME_HOURS=12
      ASC_STOP_WINDOW=""
      check_continue_conditions || exit 1
    `);
    expect(status).toBe(1);
  });

  it('stops when max consecutive failures reached', () => {
    const { status } = evalInConductor(`
      ASC_MAX_STORIES=100
      ASC_STORIES_COMPLETED=0
      ASC_STORIES_FAILED=3
      ASC_STORIES_SKIPPED=0
      ASC_CONSECUTIVE_FAILURES=3
      ASC_MAX_CONSECUTIVE_FAILURES=3
      ASC_MAX_RUNTIME_HOURS=12
      ASC_STOP_WINDOW=""
      check_continue_conditions || exit 1
    `);
    expect(status).toBe(1);
  });

  it('continues when limits not reached', () => {
    const { status } = evalInConductor(`
      ASC_MAX_STORIES=100
      ASC_STORIES_COMPLETED=2
      ASC_STORIES_FAILED=0
      ASC_STORIES_SKIPPED=0
      ASC_CONSECUTIVE_FAILURES=0
      ASC_MAX_CONSECUTIVE_FAILURES=3
      ASC_MAX_RUNTIME_HOURS=12
      ASC_STOP_WINDOW=""
      check_continue_conditions
    `);
    expect(status).toBe(0);
  });
});

// =============================================================================
// Sprint Conductor — Default config values
// =============================================================================
describe('sprint-conductor.sh — default configuration', { timeout: 30000 }, () => {
  it('has sensible defaults', () => {
    const content = fs.readFileSync(SPRINT_CONDUCTOR, 'utf8');
    // Check defaults are declared
    expect(content).toContain('ASC_MODE="${ASC_MODE:-bounded}"');
    expect(content).toContain('ASC_MAX_STORIES="${ASC_MAX_STORIES:-10}"');
    expect(content).toContain('ASC_MAX_CONSECUTIVE_FAILURES="${ASC_MAX_CONSECUTIVE_FAILURES:-3}"');
    expect(content).toContain('ASC_MAX_RUNTIME_HOURS="${ASC_MAX_RUNTIME_HOURS:-12}"');
    expect(content).toContain('ASC_PARALLEL_ENABLED="${ASC_PARALLEL_ENABLED:-false}"');
    expect(content).toContain('ASC_PARALLEL_MAX="${ASC_PARALLEL_MAX:-3}"');
  });

  it('supports three execution modes', () => {
    const content = fs.readFileSync(SPRINT_CONDUCTOR, 'utf8');
    expect(content).toContain('bounded');
    expect(content).toContain('continuous');
    expect(content).toContain('supervised');
  });
});

// =============================================================================
// Recovery Engine — RECOVERY_LEVELS structure
// =============================================================================
describe('recovery-engine.sh — RECOVERY_LEVELS', { timeout: 30000 }, () => {
  it('defines all 4 levels', () => {
    const content = fs.readFileSync(RECOVERY_ENGINE, 'utf8');
    expect(content).toContain('[0]="transient"');
    expect(content).toContain('[1]="recoverable"');
    expect(content).toContain('[2]="degraded"');
    expect(content).toContain('[3]="blocked"');
  });

  it('Level 3 (blocked) is checked first for priority', () => {
    // In classify_error, blocked patterns should be checked before transient
    // to ensure security issues aren't accidentally classified as transient
    const content = fs.readFileSync(RECOVERY_ENGINE, 'utf8');
    const blockedCheckPos = content.indexOf('ERROR_PATTERNS_BLOCKED');
    const transientCheckPos = content.indexOf('ERROR_PATTERNS_TRANSIENT');
    // In the classify_error function body, blocked is checked first
    const classifyFn = content.substring(content.indexOf('classify_error()'));
    const blockedInFn = classifyFn.indexOf('ERROR_PATTERNS_BLOCKED');
    const transientInFn = classifyFn.indexOf('ERROR_PATTERNS_TRANSIENT');
    expect(blockedInFn).toBeLessThan(transientInFn);
  });
});
