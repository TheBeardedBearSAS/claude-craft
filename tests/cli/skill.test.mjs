import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {
  validateSkillPackageName,
  runSkillAdd,
  runSkillList,
  runSkillRemove,
} from '../../cli/lib/skill.js';

describe('validateSkillPackageName', () => {
  it('accepts unscoped claude-craft-skill-* names', () => {
    expect(validateSkillPackageName('claude-craft-skill-foo')).toEqual({
      pkg: 'claude-craft-skill-foo',
      shortName: 'foo',
    });
  });

  it('accepts scoped names', () => {
    expect(validateSkillPackageName('@acme/claude-craft-skill-bar-baz')).toEqual({
      pkg: '@acme/claude-craft-skill-bar-baz',
      shortName: 'bar-baz',
    });
  });

  it('accepts names with version specs', () => {
    expect(validateSkillPackageName('claude-craft-skill-foo@1.2.3').shortName).toBe('foo');
  });

  it('rejects names without the convention prefix', () => {
    expect(() => validateSkillPackageName('lodash')).toThrow(/must start with "claude-craft-skill-"/);
  });

  it('rejects empty input', () => {
    expect(() => validateSkillPackageName('')).toThrow(/required/);
  });

  it('rejects invalid scoped names without slash', () => {
    expect(() => validateSkillPackageName('@acme')).toThrow(/invalid scoped name/);
  });

  it('rejects short-names with invalid chars', () => {
    expect(() => validateSkillPackageName('claude-craft-skill-Bad_Name')).toThrow(/invalid skill short-name/);
  });
});

describe('runSkillList', () => {
  let tmpDir;
  let logSpy;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir().includes('/tmp') ? path.join(process.cwd(), '.test-tmp') : os.tmpdir(), 'cc-skill-list-'));
    fs.mkdirSync(tmpDir, { recursive: true });
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reports no skills when community dir is missing', () => {
    expect(runSkillList(tmpDir)).toEqual([]);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/No community skills/));
  });

  it('lists installed community skills', () => {
    const dir = path.join(tmpDir, '.claude', 'skills', 'community');
    fs.mkdirSync(path.join(dir, 'foo'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'bar-baz'), { recursive: true });
    expect(runSkillList(tmpDir).sort()).toEqual(['bar-baz', 'foo']);
  });
});

describe('runSkillRemove', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.test-tmp-cc-skill-rm-'));
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns false if the skill is not installed', () => {
    expect(runSkillRemove('foo', tmpDir)).toBe(false);
  });

  it('removes an installed skill', () => {
    const dir = path.join(tmpDir, '.claude', 'skills', 'community', 'foo');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), '# foo');
    expect(runSkillRemove('foo', tmpDir)).toBe(true);
    expect(fs.existsSync(dir)).toBe(false);
  });

  it('rejects invalid short-names', () => {
    expect(() => runSkillRemove('../escape', tmpDir)).toThrow(/invalid short-name/);
  });
});

describe('runSkillAdd', () => {
  let tmpDir;
  let spawnMock;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.test-tmp-cc-skill-add-'));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    // Simulate npm install by creating the package layout where it would land.
    spawnMock = vi.fn((cmd, args, opts) => {
      const cwd = opts.cwd;
      const pkgArg = args[args.length - 1];
      const pkgDir = path.join(cwd, 'node_modules', pkgArg);
      fs.mkdirSync(path.join(pkgDir, 'skills'), { recursive: true });
      fs.writeFileSync(path.join(pkgDir, 'SKILL.md'), '# root skill');
      fs.writeFileSync(path.join(pkgDir, 'skills', 'extra.md'), '# extra');
      return { status: 0, error: null };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('installs a skill and copies SKILL.md + skills/*.md', () => {
    const result = runSkillAdd('claude-craft-skill-foo', tmpDir, { spawn: spawnMock });
    expect(result.shortName).toBe('foo');
    expect(result.files.sort()).toEqual(['SKILL.md', 'skills/extra.md']);
    const dest = path.join(tmpDir, '.claude', 'skills', 'community', 'foo');
    expect(fs.existsSync(path.join(dest, 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(dest, 'extra.md'))).toBe(true);
  });

  it('throws if npm install fails', () => {
    spawnMock = vi.fn(() => ({ status: 1, error: null }));
    expect(() => runSkillAdd('claude-craft-skill-foo', tmpDir, { spawn: spawnMock })).toThrow(/exited with code 1/);
  });

  it('throws if the package contains no skill files', () => {
    spawnMock = vi.fn((cmd, args, opts) => {
      const cwd = opts.cwd;
      const pkgArg = args[args.length - 1];
      fs.mkdirSync(path.join(cwd, 'node_modules', pkgArg), { recursive: true });
      return { status: 0, error: null };
    });
    expect(() => runSkillAdd('claude-craft-skill-foo', tmpDir, { spawn: spawnMock })).toThrow(/no SKILL\.md or skills/);
  });

  it('rejects system targets via assertSafeTarget', () => {
    expect(() => runSkillAdd('claude-craft-skill-foo', '/etc', { spawn: spawnMock })).toThrow(/system directory/);
  });
});
