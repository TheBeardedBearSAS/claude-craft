import { describe, it, expect } from 'vitest';
import { parsePort, resolveUser } from '../../cli/kanban/server/cli-options.js';

describe('parsePort', () => {
  it('defaults to 3737 when absent', () => {
    expect(parsePort(undefined)).toBe(3737);
  });
  it('accepts numbers and numeric strings in 1024..65535', () => {
    expect(parsePort('4000')).toBe(4000);
    expect(parsePort(1024)).toBe(1024);
    expect(parsePort('65535')).toBe(65535);
  });
  it('explains the --port=<number> form when the value is bare (true)', () => {
    expect(() => parsePort(true)).toThrow(/--port=<number>/);
  });
  it('rejects non-numeric values', () => {
    expect(() => parsePort('abc')).toThrow(/--port=<number>/);
    expect(() => parsePort('40.5')).toThrow(/--port=<number>/);
  });
  it('rejects out-of-range ports', () => {
    expect(() => parsePort('1')).toThrow(/1024/);
    expect(() => parsePort('70000')).toThrow(/65535/);
  });
});

describe('resolveUser', () => {
  const env = {};
  it('--user wins over env and git', () => {
    expect(resolveUser({ user: 'cli' }, { CLAUDE_CRAFT_USER: 'env' }, { gitUserName: 'git' })).toBe('cli');
  });
  it('env wins over git', () => {
    expect(resolveUser({}, { CLAUDE_CRAFT_USER: 'env' }, { gitUserName: 'git' })).toBe('env');
  });
  it('falls back to git user.name', () => {
    expect(resolveUser({}, env, { gitUserName: 'Jane Doe' })).toBe('Jane Doe');
  });
  it('falls back to the OS username when git yields nothing', () => {
    const u = resolveUser({}, env, { gitUserName: '' });
    expect(u.length).toBeGreaterThan(0);
  });
  it('ignores a bare --user (true) and blank values', () => {
    expect(resolveUser({ user: true }, { CLAUDE_CRAFT_USER: '  ' }, { gitUserName: 'git' })).toBe('git');
  });
  it('trims, strips newlines and caps at 60 characters', () => {
    expect(resolveUser({ user: '  bob  ' }, env, { gitUserName: '' })).toBe('bob');
    expect(resolveUser({ user: 'a\nb' }, env, { gitUserName: '' })).toBe('a b');
    expect(resolveUser({ user: 'x'.repeat(100) }, env, { gitUserName: '' })).toHaveLength(60);
  });
});
