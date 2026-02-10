import { describe, it, expect, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(PROJECT_ROOT, 'Dev/scripts/migrate-project.sh');

const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-test-migrate-'));
  tmpDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('migrate-project.sh', { timeout: 30000 }, () => {
  it('shows help with --help flag', () => {
    const output = execSync(`bash "${SCRIPT}" --help`, {
      encoding: 'utf8',
      timeout: 15000,
    });

    expect(output).toMatch(/Usage|migrate/i);
    expect(output).toMatch(/--dry-run/);
  });

  it('runs successfully in dry-run mode', () => {
    const tmpDir = makeTmpDir();
    // Create a minimal claude-craft project structure for migration
    fs.mkdirSync(path.join(tmpDir, '.claude', 'rules'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, '.claude', 'CLAUDE.md'),
      '# Test Project\n',
    );
    fs.writeFileSync(
      path.join(tmpDir, '.claude', 'rules', '00-project-context.md'),
      '# Context\n',
    );

    const output = execSync(
      `bash "${SCRIPT}" --dry-run --lang=en "${tmpDir}"`,
      {
        encoding: 'utf8',
        timeout: 20000,
      },
    );

    expect(output).toMatch(/DRY-RUN|dry.run/i);
  });

  it('handles non-existent source directory', () => {
    let exitCode = 0;
    try {
      execSync(`bash "${SCRIPT}" /nonexistent/path/that/does/not/exist`, {
        encoding: 'utf8',
        timeout: 15000,
        stdio: 'pipe',
      });
    } catch (err) {
      exitCode = err.status;
    }
    expect(exitCode).not.toBe(0);
  });
});
