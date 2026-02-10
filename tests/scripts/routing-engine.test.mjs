import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const ROUTING_ENGINE = path.join(PROJECT_ROOT, '.bmad/lib/routing-engine.sh');

/**
 * Helper: source routing-engine.sh in a bash subprocess and run a command.
 * We stub out external dependencies (check_sprint_status, log_*, yq calls)
 * and export functions so we can test pure logic.
 */
function runBash(script) {
  const result = spawnSync('bash', ['-c', script], {
    encoding: 'utf8',
    timeout: 10000,
    cwd: PROJECT_ROOT,
  });
  return { stdout: result.stdout, stderr: result.stderr, status: result.status };
}

/**
 * Wrapper that sources routing-engine.sh with stubs and evaluates an expression.
 */
function evalInEngine(expression) {
  // Source routing-engine.sh but strip the `main "$@"` invocation at the end
  // to prevent it from running usage() during sourcing.
  const wrapper = `
set -euo pipefail

# Stub out functions that require external state
check_sprint_status() { :; }
log_info() { :; }
log_success() { :; }
log_warning() { :; }
log_error() { echo "ERROR: $1" >&2; }
SPRINT_STATUS_FILE="/dev/null"

# Source the script without the trailing main call
source <(sed '/^main "\\$@"$/d' "${ROUTING_ENGINE}")

${expression}
`;
  return runBash(wrapper);
}

describe('routing-engine.sh', { timeout: 30000 }, () => {
  // =========================================================================
  // VALID_STATES
  // =========================================================================
  describe('VALID_STATES', () => {
    it('contains all 6 expected states', () => {
      const { stdout } = evalInEngine(`
        echo "\${VALID_STATES[@]}"
      `);
      const states = stdout.trim().split(/\s+/);
      expect(states).toContain('backlog');
      expect(states).toContain('ready-for-dev');
      expect(states).toContain('in-progress');
      expect(states).toContain('review');
      expect(states).toContain('done');
      expect(states).toContain('blocked');
      expect(states).toHaveLength(6);
    });
  });

  // =========================================================================
  // is_valid_transition
  // =========================================================================
  describe('is_valid_transition', () => {
    const validTransitions = [
      ['backlog', 'ready-for-dev'],
      ['backlog', 'blocked'],
      ['ready-for-dev', 'in-progress'],
      ['ready-for-dev', 'blocked'],
      ['in-progress', 'review'],
      ['in-progress', 'blocked'],
      ['review', 'done'],
      ['review', 'in-progress'],
      ['review', 'blocked'],
      ['blocked', 'backlog'],
      ['blocked', 'ready-for-dev'],
      ['blocked', 'in-progress'],
      ['blocked', 'review'],
    ];

    it.each(validTransitions)(
      'allows transition from %s to %s',
      (from, to) => {
        const { status } = evalInEngine(`
          is_valid_transition "${from}" "${to}"
        `);
        expect(status).toBe(0);
      },
    );

    const invalidTransitions = [
      ['done', 'backlog'],
      ['done', 'ready-for-dev'],
      ['done', 'in-progress'],
      ['done', 'review'],
      ['done', 'blocked'],
      ['backlog', 'in-progress'],
      ['backlog', 'review'],
      ['backlog', 'done'],
      ['ready-for-dev', 'backlog'],
      ['ready-for-dev', 'review'],
      ['ready-for-dev', 'done'],
      ['in-progress', 'backlog'],
      ['in-progress', 'ready-for-dev'],
      ['in-progress', 'done'],
      ['review', 'backlog'],
      ['review', 'ready-for-dev'],
    ];

    it.each(invalidTransitions)(
      'rejects transition from %s to %s',
      (from, to) => {
        const { status } = evalInEngine(`
          is_valid_transition "${from}" "${to}" || exit 1
        `);
        expect(status).toBe(1);
      },
    );
  });

  // =========================================================================
  // TRANSITIONS matrix
  // =========================================================================
  describe('TRANSITIONS matrix', () => {
    it('done state has no allowed transitions', () => {
      const { stdout } = evalInEngine(`
        echo "\${TRANSITIONS[done]}"
      `);
      expect(stdout.trim()).toBe('');
    });

    it('blocked can return to any active state', () => {
      const { stdout } = evalInEngine(`
        echo "\${TRANSITIONS[blocked]}"
      `);
      const allowed = stdout.trim().split(/\s+/);
      expect(allowed).toContain('backlog');
      expect(allowed).toContain('ready-for-dev');
      expect(allowed).toContain('in-progress');
      expect(allowed).toContain('review');
    });

    it('every non-done state can transition to blocked', () => {
      const activeStates = ['backlog', 'ready-for-dev', 'in-progress', 'review'];
      for (const state of activeStates) {
        const { status } = evalInEngine(`
          is_valid_transition "${state}" "blocked"
        `);
        expect(status, `${state} -> blocked should be valid`).toBe(0);
      }
    });
  });

  // =========================================================================
  // usage / help
  // =========================================================================
  describe('CLI usage', () => {
    it('shows help on --help', () => {
      const { stdout } = runBash(`bash "${ROUTING_ENGINE}" --help 2>&1`);
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('routing-engine.sh');
    });

    it('shows help with no arguments', () => {
      const { stdout } = runBash(`bash "${ROUTING_ENGINE}" 2>&1`);
      expect(stdout).toContain('Usage:');
    });

    it('exits with error on unknown command', () => {
      const result = runBash(`bash "${ROUTING_ENGINE}" unknown-cmd 2>&1; echo "EXIT:$?"`);
      expect(result.stdout).toContain('EXIT:1');
    });
  });

  // =========================================================================
  // diagram
  // =========================================================================
  describe('diagram command', () => {
    it('prints the state machine diagram', () => {
      const { stdout } = runBash(`
        # Stub check_sprint_status since diagram doesn't need it
        bash "${ROUTING_ENGINE}" diagram 2>&1
      `);
      expect(stdout).toContain('State Machine');
      expect(stdout).toContain('backlog');
      expect(stdout).toContain('in-progress');
      expect(stdout).toContain('review');
      expect(stdout).toContain('done');
      expect(stdout).toContain('blocked');
    });
  });

  // =========================================================================
  // Autonomous mode toggles
  // =========================================================================
  describe('autonomous mode', () => {
    it('enable-autonomous sets all flags to true', () => {
      const { stdout } = evalInEngine(`
        cmd_enable_autonomous
        echo "auto=$ROUTING_AUTONOMOUS_MODE trans=$ROUTING_AUTO_TRANSITION_ENABLED claim=$ROUTING_AUTO_CLAIM_ENABLED"
      `);
      expect(stdout).toContain('auto=true');
      expect(stdout).toContain('trans=true');
      expect(stdout).toContain('claim=true');
    });

    it('disable-autonomous sets all flags to false', () => {
      const { stdout } = evalInEngine(`
        cmd_enable_autonomous
        cmd_disable_autonomous
        echo "auto=$ROUTING_AUTONOMOUS_MODE trans=$ROUTING_AUTO_TRANSITION_ENABLED claim=$ROUTING_AUTO_CLAIM_ENABLED"
      `);
      expect(stdout).toContain('auto=false');
      expect(stdout).toContain('trans=false');
      expect(stdout).toContain('claim=false');
    });
  });
});
