import { describe, it, expect, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(PROJECT_ROOT, 'Dev/scripts/install-common-rules.sh');

const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-test-common-'));
  tmpDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('install-common-rules.sh', { timeout: 60000 }, () => {
  it('shows help with --help flag', () => {
    const output = execSync(`bash "${SCRIPT}" --help`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    expect(output).toMatch(/Usage:/i);
    expect(output).toMatch(/--dry-run/);
    expect(output).toMatch(/--lang/);
  });

  it('runs successfully in dry-run mode', () => {
    const tmpDir = makeTmpDir();
    const output = execSync(`bash "${SCRIPT}" --dry-run --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    expect(output).toMatch(/DRY-RUN|dry.run/i);
  });

  it('accepts all valid languages', { timeout: 60000 }, () => {
    const tmpDir = makeTmpDir();
    const langs = ['en', 'fr', 'es', 'de', 'pt'];

    for (const lang of langs) {
      const output = execSync(
        `bash "${SCRIPT}" --dry-run --lang=${lang} "${tmpDir}"`,
        { encoding: 'utf8', timeout: 30000 },
      );
      // Dry-run should succeed for each language
      expect(output).toBeTruthy();
    }
  });

  it('creates expected directory structure', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    // Core directories that install-common-rules.sh creates
    expect(fs.existsSync(path.join(tmpDir, '.claude'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'agents'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'commands', 'common'))).toBe(true);

    // v7.0.0 namespace directories
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'commands', 'workflow'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'commands', 'team'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'commands', 'qa'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'commands', 'uiux'))).toBe(true);
  });

  it('installs commands into correct namespace directories', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    // Workflow namespace should have workflow commands
    const workflowDir = path.join(tmpDir, '.claude', 'commands', 'workflow');
    expect(fs.existsSync(path.join(workflowDir, 'init.md'))).toBe(true);
    expect(fs.existsSync(path.join(workflowDir, 'analyze.md'))).toBe(true);

    // Team namespace
    const teamDir = path.join(tmpDir, '.claude', 'commands', 'team');
    expect(fs.existsSync(path.join(teamDir, 'audit.md'))).toBe(true);

    // QA namespace
    const qaDir = path.join(tmpDir, '.claude', 'commands', 'qa');
    expect(fs.existsSync(path.join(qaDir, 'recette.md'))).toBe(true);
    expect(fs.existsSync(path.join(qaDir, 'tdd.md'))).toBe(true);

    // UIUX namespace
    const uiuxDir = path.join(tmpDir, '.claude', 'commands', 'uiux');
    expect(fs.existsSync(path.join(uiuxDir, 'audit.md'))).toBe(true);

    // Common should NOT have moved commands
    const commonDir = path.join(tmpDir, '.claude', 'commands', 'common');
    expect(fs.existsSync(path.join(commonDir, 'workflow-init.md'))).toBe(false);
    expect(fs.existsSync(path.join(commonDir, 'team-audit.md'))).toBe(false);
    expect(fs.existsSync(path.join(commonDir, 'recette.md'))).toBe(false);
    // Common should still have its commands
    expect(fs.existsSync(path.join(commonDir, 'ralph-run.md'))).toBe(true);
    expect(fs.existsSync(path.join(commonDir, 'pre-commit-check.md'))).toBe(true);
  });
});
