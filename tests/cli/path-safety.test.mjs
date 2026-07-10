import { describe, it, expect } from 'vitest';
import path from 'path';
import { assertSafeTarget, assertSafeLang, assertWithinDir, FORBIDDEN_SYSTEM_DIRS } from '../../cli/lib/path-safety.js';

// Sprint 4 hotfix : path-safety.js was at 90% branch coverage because the
// non-string / empty-string guard branch (line 48-49 of the source) had no
// dedicated test. The function is also indirectly covered via update.test.mjs,
// but a focused test suite makes the contract explicit.

describe('assertSafeTarget', () => {
  it('rejects an empty string', () => {
    expect(() => assertSafeTarget('')).toThrow(/non-empty string/);
  });

  it('rejects undefined', () => {
    expect(() => assertSafeTarget(undefined)).toThrow(/non-empty string/);
  });

  it('rejects null', () => {
    expect(() => assertSafeTarget(null)).toThrow(/non-empty string/);
  });

  it('rejects a number', () => {
    expect(() => assertSafeTarget(42)).toThrow(/non-empty string/);
  });

  it('rejects /', () => {
    expect(() => assertSafeTarget('/')).toThrow(/system directory/);
  });

  it('rejects /etc', () => {
    expect(() => assertSafeTarget('/etc')).toThrow(/system directory/);
  });

  it('rejects /etc/anything (subtree of /etc)', () => {
    expect(() => assertSafeTarget('/etc/cron.d')).toThrow(/system directory/);
  });

  it('rejects relative path resolving to /etc', () => {
    // path.resolve('/var/tmp/../../etc') → '/etc'
    expect(() => assertSafeTarget('/var/tmp/../../etc')).toThrow(/system directory/);
  });

  it('accepts a normal user path and returns the resolved absolute path', () => {
    const result = assertSafeTarget('/home/user/project');
    expect(result).toBe('/home/user/project');
  });

  it('resolves a relative path before validating', () => {
    // process.cwd() is the project root in tests — known not to be a forbidden
    // dir, so this should pass.
    const result = assertSafeTarget('.');
    expect(result).toBe(process.cwd());
  });
});

describe('assertSafeLang', () => {
  it('accepts a canonical 2-letter lowercase code', () => {
    expect(assertSafeLang('en')).toBe('en');
    expect(assertSafeLang('fr')).toBe('fr');
  });

  it('rejects uppercase', () => {
    expect(() => assertSafeLang('EN')).toThrow(/Invalid --lang/);
  });

  it('rejects underscore (e.g. fr_FR)', () => {
    expect(() => assertSafeLang('fr_FR')).toThrow(/Invalid --lang/);
  });

  it('rejects shell metacharacters', () => {
    expect(() => assertSafeLang('fr;rm')).toThrow(/Invalid --lang/);
  });

  it('rejects empty string', () => {
    expect(() => assertSafeLang('')).toThrow(/Invalid --lang/);
  });

  it('rejects 1-letter code', () => {
    expect(() => assertSafeLang('e')).toThrow(/Invalid --lang/);
  });

  it('rejects 3+ letter code', () => {
    expect(() => assertSafeLang('eng')).toThrow(/Invalid --lang/);
  });
});

describe('assertWithinDir', () => {
  it('accepts a direct child path', () => {
    const result = assertWithinDir('/home/user/hooks', '/home/user/hooks/pre-execute.sh');
    expect(result).toBe('/home/user/hooks/pre-execute.sh');
  });

  it('rejects a candidate built by joining a traversal name onto the base', () => {
    // Mirrors real usage: hookPath = path.join(hooksDir, hookName)
    const hooksDir = '/home/user/project/.ai-craft/providers/vibe/hooks';
    const hookName = '../../../../../../tmp/evil.sh';
    const hookPath = path.join(hooksDir, hookName);
    expect(() => assertWithinDir(hooksDir, hookPath)).toThrow(/escapes/);
  });

  it('rejects a sibling directory that shares a name prefix', () => {
    // /home/user/hooks-evil must NOT be considered "within" /home/user/hooks
    expect(() => assertWithinDir('/home/user/hooks', '/home/user/hooks-evil/x.sh')).toThrow(/escapes/);
  });

  it('returns the resolved absolute candidate path when safe', () => {
    const result = assertWithinDir('/home/user/hooks', '/home/user/hooks/sub/pre.sh');
    expect(result).toBe('/home/user/hooks/sub/pre.sh');
  });
});

describe('FORBIDDEN_SYSTEM_DIRS', () => {
  it('exposes the canonical list', () => {
    expect(FORBIDDEN_SYSTEM_DIRS).toContain('/');
    expect(FORBIDDEN_SYSTEM_DIRS).toContain('/etc');
    expect(FORBIDDEN_SYSTEM_DIRS).toContain('/usr');
    expect(FORBIDDEN_SYSTEM_DIRS).toContain('/bin');
  });

  it('is frozen so callers cannot mutate it', () => {
    expect(Object.isFrozen(FORBIDDEN_SYSTEM_DIRS)).toBe(true);
  });
});
