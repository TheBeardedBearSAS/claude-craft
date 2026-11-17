import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runSync } from '../../cli/lib/sync.js';

const ROOT = path.resolve(import.meta.dirname, '../..');
const TMP = path.join(ROOT, '.test-tmp', 'sync-test');

describe('runSync', () => {
  let logSpy;
  let errSpy;
  beforeEach(() => {
    fs.rmSync(TMP, { recursive: true, force: true });
    fs.mkdirSync(TMP, { recursive: true });
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    process.exitCode = undefined;
  });
  afterEach(() => {
    fs.rmSync(TMP, { recursive: true, force: true });
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it('exits non-zero with the way forward when there is no install.json', () => {
    runSync(TMP, { execFn: vi.fn() });
    expect(errSpy.mock.calls.map((c) => c[0]).join('\n')).toContain('bear-craft install');
    expect(process.exitCode).toBe(1);
  });

  it('replays install.json: marketplace add from the project, then one install per plugin', () => {
    fs.mkdirSync(path.join(TMP, '.bear-craft/marketplace/.claude-plugin'), { recursive: true });
    fs.writeFileSync(path.join(TMP, '.bear-craft/marketplace/.claude-plugin/marketplace.json'), '{}');
    fs.writeFileSync(
      path.join(TMP, '.bear-craft/install.json'),
      JSON.stringify({
        lang: 'es',
        techs: ['vuejs'],
        infra: [],
        hooks: { profile: 'none', memory: false },
        version: '10.0.0',
      })
    );
    const calls = [];
    const execFn = vi.fn((cmd, args, opts) => {
      calls.push({ args, cwd: opts?.cwd });
      return { status: 0, stdout: args[0] === '--version' ? '2.1.326' : '', stderr: '' };
    });
    runSync(TMP, { execFn });
    expect(process.exitCode).toBeUndefined();
    expect(calls.find((c) => c.args[1] === 'marketplace')).toMatchObject({ cwd: path.resolve(TMP) });
    const ids = calls.filter((c) => c.args[1] === 'install').map((c) => c.args[2]);
    expect(ids).toContain('bear-vuejs@bear-craft-es');
    expect(ids).toContain('bear-common@bear-craft-es');
    expect(ids.some((i) => i.startsWith('bear-hooks'))).toBe(false);
    expect(logSpy.mock.calls.map((c) => c[0]).join('\n')).toContain('plugins enabled from bear-craft-es');
  });

  it('exits non-zero when claude is missing', () => {
    fs.mkdirSync(path.join(TMP, '.bear-craft/marketplace/.claude-plugin'), { recursive: true });
    fs.writeFileSync(path.join(TMP, '.bear-craft/marketplace/.claude-plugin/marketplace.json'), '{}');
    fs.writeFileSync(
      path.join(TMP, '.bear-craft/install.json'),
      JSON.stringify({ lang: 'en', techs: [], infra: [], hooks: { profile: 'default', memory: false }, version: '1' })
    );
    runSync(TMP, { execFn: vi.fn(() => ({ status: null, stdout: '', stderr: 'ENOENT' })) });
    expect(errSpy.mock.calls.map((c) => c[0]).join('\n')).toContain('was not found in your PATH');
    expect(process.exitCode).toBe(1);
  });
});
