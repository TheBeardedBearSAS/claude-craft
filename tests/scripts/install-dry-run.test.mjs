import { describe, it, expect, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(PROJECT_ROOT, 'Dev/scripts/install-common-rules.sh');

const tmpDirs = [];

/** Strip ANSI escape codes from a string */
function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-dry-run-'));
  tmpDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('install-common-rules.sh dry-run integration', { timeout: 60000 }, () => {
  it('dry-run reports expected file count in summary', () => {
    const tmpDir = makeTmpDir();
    const rawOutput = execSync(`bash "${SCRIPT}" --dry-run --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });
    const output = stripAnsi(rawOutput);

    // Summary line should show created files count (at least 50)
    const match = output.match(/Files created:\s+(\d+)/);
    expect(match).not.toBeNull();
    const createdCount = parseInt(match[1]);
    expect(createdCount).toBeGreaterThanOrEqual(50);
  });

  it('dry-run creates no actual files', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --dry-run --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    // Dry-run should NOT create any actual directories
    expect(fs.existsSync(path.join(tmpDir, '.claude'))).toBe(false);
  });

  it('dry-run lists all 5 command namespace directories', () => {
    const tmpDir = makeTmpDir();
    const output = execSync(`bash "${SCRIPT}" --dry-run --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const namespaces = ['commands/bear-common', 'commands/bear-workflow', 'commands/bear-team', 'commands/bear-qa', 'commands/bear-uiux'];
    for (const ns of namespaces) {
      expect(output).toContain(ns);
    }
  });

  it('dry-run lists correct minimum command counts per namespace', () => {
    const tmpDir = makeTmpDir();
    const rawOutput = execSync(`bash "${SCRIPT}" --dry-run --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });
    const output = stripAnsi(rawOutput);

    const countMatches = (pattern) => (output.match(new RegExp(pattern, 'g')) || []).length;

    // Expected minimum counts (from v7.0.0 structure)
    expect(countMatches('Creating:.*commands/bear-common/')).toBeGreaterThanOrEqual(10);
    expect(countMatches('Creating:.*commands/bear-workflow/')).toBeGreaterThanOrEqual(9);
    expect(countMatches('Creating:.*commands/bear-team/')).toBeGreaterThanOrEqual(4);
    expect(countMatches('Creating:.*commands/bear-qa/')).toBeGreaterThanOrEqual(5);
    expect(countMatches('Creating:.*commands/bear-uiux/')).toBeGreaterThanOrEqual(7);
  });

  it('full install creates all namespace directories with correct file counts', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const countMd = (dir) => {
      if (!fs.existsSync(dir)) return 0;
      return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length;
    };

    const base = path.join(tmpDir, '.claude', 'commands');

    // All 5 namespaces exist
    expect(fs.existsSync(path.join(base, 'bear-common'))).toBe(true);
    expect(fs.existsSync(path.join(base, 'bear-workflow'))).toBe(true);
    expect(fs.existsSync(path.join(base, 'bear-team'))).toBe(true);
    expect(fs.existsSync(path.join(base, 'bear-qa'))).toBe(true);
    expect(fs.existsSync(path.join(base, 'bear-uiux'))).toBe(true);

    // Minimum file counts per namespace
    expect(countMd(path.join(base, 'bear-common'))).toBeGreaterThanOrEqual(10);
    expect(countMd(path.join(base, 'bear-workflow'))).toBeGreaterThanOrEqual(9);
    expect(countMd(path.join(base, 'bear-team'))).toBeGreaterThanOrEqual(4);
    expect(countMd(path.join(base, 'bear-qa'))).toBeGreaterThanOrEqual(5);
    expect(countMd(path.join(base, 'bear-uiux'))).toBeGreaterThanOrEqual(7);
  });

  it('full install creates skills, agents, rules, and checklists', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const claude = path.join(tmpDir, '.claude');

    // Core directories
    expect(fs.existsSync(path.join(claude, 'skills'))).toBe(true);
    expect(fs.existsSync(path.join(claude, 'agents'))).toBe(true);
    expect(fs.existsSync(path.join(claude, 'rules'))).toBe(true);
    expect(fs.existsSync(path.join(claude, 'checklists'))).toBe(true);

    // CLAUDE.md generated
    expect(fs.existsSync(path.join(claude, 'CLAUDE.md'))).toBe(true);

    // Minimum counts
    const countDir = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).length : 0);
    expect(countDir(path.join(claude, 'skills'))).toBeGreaterThanOrEqual(5);
    expect(countDir(path.join(claude, 'agents'))).toBeGreaterThanOrEqual(8);
    expect(countDir(path.join(claude, 'checklists'))).toBeGreaterThanOrEqual(3);
  });
});
