import { describe, it, expect, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(PROJECT_ROOT, 'Project/install-project-commands.sh');
const LANGS = ['en', 'fr', 'es', 'de', 'pt'];

const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-test-project-'));
  tmpDirs.push(dir);
  return dir;
}

function install(dir, args = '') {
  execSync(`bash "${SCRIPT}" ${args} "${dir}"`, { encoding: 'utf8', timeout: 30000 });
  return fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('install-project-commands.sh — stack-aware CLAUDE.md', { timeout: 60000 }, () => {
  it('renders the selected stack instead of a hardcoded Symfony/Flutter one', () => {
    const claudeMd = install(makeTmpDir(), '--lang=en --tech=python,react,docker');

    expect(claudeMd).toContain('FastAPI');
    expect(claudeMd).toContain('React');
    expect(claudeMd).toContain('Docker');
    expect(claudeMd).not.toMatch(/Symfony|Flutter|API Platform/);
  });

  it.each(LANGS)('leaves no unrendered placeholder (lang=%s)', (lang) => {
    const claudeMd = install(makeTmpDir(), `--lang=${lang} --tech=python,react`);

    expect(claudeMd).not.toContain('{{');
    expect(claudeMd).toContain('FastAPI');
    expect(claudeMd).not.toMatch(/Symfony|Flutter/);
  });

  it('stays stack-neutral without --tech', () => {
    const claudeMd = install(makeTmpDir(), '--lang=fr');

    expect(claudeMd).not.toContain('{{');
    expect(claudeMd).not.toMatch(/Symfony|Flutter/);
    expect(claudeMd).toContain('/project:generate-tech-spec');
  });

  it('ignores the project pseudo-tech and duplicates', () => {
    const claudeMd = install(makeTmpDir(), '--lang=en --tech=project,python,python');

    expect(claudeMd.match(/^python:/gm)).toHaveLength(1);
    expect(claudeMd).not.toMatch(/^project:/m);
  });

  it('preserves an existing CLAUDE.md', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Custom\n');

    const claudeMd = install(dir, '--lang=en --tech=python');

    expect(claudeMd).toBe('# Custom\n');
  });

  it('overwrites an existing CLAUDE.md with --force', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Custom\n');

    const claudeMd = install(dir, '--lang=en --force --tech=python');

    expect(claudeMd).toContain('FastAPI');
  });
});
