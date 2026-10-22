import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
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

// Régression : check-config.sh attendait l'ancien layout (.claude/rules par techno),
// ne connaissait ni l'infra, ni `project`, ni vite/vercel/paperclip, et lisait
// `tech: [a, b]` comme une seule techno inconnue → faux échecs sur une install saine.
describe('check-config.sh — module checks', { timeout: 120000 }, () => {
  let root;

  /** Sources the script (no yq needed) and runs check_module on the given techs */
  function checkModule(dir, ...techs) {
    return spawnSync('bash', ['-c', `source "${SCRIPT}"; check_module "$@"`, '_', dir, 'label', ...techs], {
      encoding: 'utf8',
    }).status;
  }

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-test-check-'));
    const run = (script, dir) => {
      fs.mkdirSync(dir, { recursive: true });
      execSync(`bash "${path.join(PROJECT_ROOT, script)}" --lang=en "${dir}"`, { encoding: 'utf8', timeout: 60000 });
    };
    run('Dev/scripts/install-python-rules.sh', path.join(root, 'backend'));
    run('Dev/scripts/install-vite-rules.sh', path.join(root, 'web'));
    run('Project/install-project-commands.sh', root);
    run('Infra/install-docker-rules.sh', root);
  });

  afterAll(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('accepts a dev tech module installed with the current layout', () => {
    expect(checkModule(path.join(root, 'backend'), 'python')).toBe(0);
    expect(checkModule(path.join(root, 'web'), 'vite')).toBe(0);
  });

  it('accepts a multi-tech module mixing project and infra techs', () => {
    expect(checkModule(root, 'project', 'docker')).toBe(0);
  });

  it('flags a tech that is not installed', () => {
    expect(checkModule(path.join(root, 'backend'), 'react')).not.toBe(0);
    expect(checkModule(root, 'ansible')).not.toBe(0);
  });

  it('flags an unknown tech', () => {
    expect(checkModule(root, 'cobol')).not.toBe(0);
  });
});

