import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');

/** Recipe `make -n` would run (dry-run: nothing executed) */
function recipe(target, vars = '') {
  return execSync(`make -s -n ${target} CONFIG=cfg.yaml ${vars}`, { cwd: PROJECT_ROOT, encoding: 'utf8' });
}

// Régression : les cibles config-* étaient déclarées .PHONY, or GNU make ne cherche
// pas de règle implicite (config-%) pour une cible phony → « Rien à faire » silencieux.
describe('Makefile config-* targets', () => {
  it('config-validate runs the validator', () => {
    expect(recipe('config-validate')).toMatch(/install-from-config\.sh --validate cfg\.yaml/);
  });

  it('config-list lists projects', () => {
    expect(recipe('config-list')).toMatch(/install-from-config\.sh --list cfg\.yaml/);
  });

  it('config-install installs one project without unknown --install flag', () => {
    const cmd = recipe('config-install', 'PROJECT=RedmineAI');
    expect(cmd).toMatch(/install-from-config\.sh --project RedmineAI +cfg\.yaml/);
    expect(cmd).not.toContain('--install');
  });

  it('config-install-all installs every project without unknown --install-all flag', () => {
    const cmd = recipe('config-install-all');
    expect(cmd).toMatch(/install-from-config\.sh +cfg\.yaml/);
    expect(cmd).not.toContain('--install');
  });

  it('config-check verifies installed projects', () => {
    expect(recipe('config-check', 'PROJECT=RedmineAI')).toMatch(/check-config\.sh --project RedmineAI +cfg\.yaml/);
  });

  it('config-check-fix verifies and proposes fixes', () => {
    expect(recipe('config-check-fix')).toMatch(/check-config\.sh --fix +cfg\.yaml/);
  });

  it('config-dry-run simulates a project install', () => {
    expect(recipe('config-dry-run', 'PROJECT=RedmineAI')).toMatch(
      /install-from-config\.sh --dry-run --project RedmineAI +cfg\.yaml/
    );
  });
});
