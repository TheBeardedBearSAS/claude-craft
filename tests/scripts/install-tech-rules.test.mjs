import { describe, it, expect, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPTS_DIR = path.join(PROJECT_ROOT, 'Dev/scripts');

const TECH_SCRIPTS = [
  'install-symfony-rules.sh',
  'install-flutter-rules.sh',
  'install-react-rules.sh',
  'install-reactnative-rules.sh',
  'install-angular-rules.sh',
  'install-csharp-rules.sh',
  'install-laravel-rules.sh',
  'install-vuejs-rules.sh',
  'install-php-rules.sh',
  'install-python-rules.sh',
];

const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-test-tech-'));
  tmpDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('tech install scripts', { timeout: 30000 }, () => {
  it('all tech install scripts exist', () => {
    for (const script of TECH_SCRIPTS) {
      const scriptPath = path.join(SCRIPTS_DIR, script);
      expect(fs.existsSync(scriptPath), `Missing: ${script}`).toBe(true);
    }
  });

  it('all scripts have valid bash syntax', () => {
    for (const script of TECH_SCRIPTS) {
      const scriptPath = path.join(SCRIPTS_DIR, script);
      const result = execSync(`bash -n "${scriptPath}" 2>&1`, {
        encoding: 'utf8',
        timeout: 10000,
      });
      // bash -n returns empty output on success
      expect(result.trim()).toBe('');
    }
  });

  it.each(['symfony', 'react', 'python'])(
    'install-%s-rules.sh shows help',
    (tech) => {
      const scriptPath = path.join(SCRIPTS_DIR, `install-${tech}-rules.sh`);
      const output = execSync(`bash "${scriptPath}" --help`, {
        encoding: 'utf8',
        timeout: 15000,
      });

      expect(output).toMatch(/Usage:/i);
      expect(output).toMatch(/--dry-run/);
      expect(output).toMatch(/--help/);
    },
  );

  it.each(['symfony', 'react', 'python'])(
    'install-%s-rules.sh runs in dry-run mode',
    (tech) => {
      const tmpDir = makeTmpDir();
      const scriptPath = path.join(SCRIPTS_DIR, `install-${tech}-rules.sh`);
      const output = execSync(
        `bash "${scriptPath}" --dry-run --lang=en "${tmpDir}"`,
        {
          encoding: 'utf8',
          timeout: 20000,
        },
      );

      expect(output).toMatch(/DRY-RUN|dry.run/i);
    },
  );

  it('symfony install creates expected directory structure', () => {
    const tmpDir = makeTmpDir();
    const scriptPath = path.join(SCRIPTS_DIR, 'install-symfony-rules.sh');
    execSync(`bash "${scriptPath}" --install --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    // Core TCL directories
    expect(fs.existsSync(path.join(tmpDir, '.claude'))).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, '.claude', 'references', 'symfony')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, '.claude', 'references', 'base')),
    ).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'skills'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'agents'))).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, '.claude', 'commands', 'symfony')),
    ).toBe(true);

    // Generated config files
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'CLAUDE.md'))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'INDEX.md'))).toBe(true);
  });
});
