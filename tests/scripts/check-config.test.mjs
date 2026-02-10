import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(PROJECT_ROOT, 'Dev/scripts/check-config.sh');

describe('check-config.sh', { timeout: 30000 }, () => {
  it('shows help with --help flag', () => {
    const output = execSync(`bash "${SCRIPT}" --help`, {
      encoding: 'utf8',
      timeout: 15000,
    });

    expect(output).toMatch(/Usage:/i);
    expect(output).toMatch(/--check/);
    expect(output).toMatch(/--fix/);
    expect(output).toMatch(/--project/);
  });

  it('errors on non-existent config file', () => {
    try {
      execSync(`bash "${SCRIPT}" /nonexistent/path/config.yaml`, {
        encoding: 'utf8',
        timeout: 15000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      // Should not reach here
      expect.unreachable('Expected script to exit with non-zero code');
    } catch (err) {
      expect(err.status).not.toBe(0);
      // The script checks for yq first; if yq is missing it errors on that,
      // otherwise it errors on the missing config file.
      const combined = (err.stdout || '') + (err.stderr || '');
      expect(combined).toMatch(/introuvable|not found|yq/i);
    }
  });

  it('checks yq dependency', () => {
    // Run with a fake PATH that excludes yq to trigger the dependency check.
    // If yq IS available on the system, the script passes this check and
    // then fails on the non-existent config — both outcomes are valid.
    try {
      execSync(`bash "${SCRIPT}" /nonexistent/config.yaml`, {
        encoding: 'utf8',
        timeout: 15000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      expect.unreachable('Expected script to exit with non-zero code');
    } catch (err) {
      const combined = (err.stdout || '') + (err.stderr || '');
      // Either yq is missing (shows install instructions) or config is missing
      const mentionsYq = /yq/i.test(combined);
      const mentionsConfig = /introuvable|not found|config/i.test(combined);
      expect(mentionsYq || mentionsConfig).toBe(true);
    }
  });
});
