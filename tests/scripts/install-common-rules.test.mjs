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
  });
});
