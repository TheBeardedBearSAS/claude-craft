import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { parseArgs } = require('../../cli/lib/parse-args');

describe('parseArgs', () => {
  it('returns defaults when no arguments are given', () => {
    const result = parseArgs([]);
    expect(result).toEqual({ command: null, path: null, options: {} });
  });

  it('parses --help as an option flag', () => {
    const result = parseArgs(['--help']);
    expect(result.options.help).toBe(true);
    expect(result.command).toBeNull();
  });

  it('parses --version as an option flag', () => {
    const result = parseArgs(['--version']);
    expect(result.options.version).toBe(true);
    expect(result.command).toBeNull();
  });

  it('parses install command with --tech option', () => {
    const result = parseArgs(['install', '/some/path', '--tech=symfony', '--lang=fr']);
    expect(result.command).toBe('install');
    expect(result.path).toBe('/some/path');
    expect(result.options.tech).toBe('symfony');
    expect(result.options.lang).toBe('fr');
  });

  it('parses command without path', () => {
    const result = parseArgs(['help']);
    expect(result.command).toBe('help');
    expect(result.path).toBeNull();
  });

  it('treats --force as a boolean flag (no value)', () => {
    const result = parseArgs(['install', '--force']);
    expect(result.command).toBe('install');
    expect(result.options.force).toBe(true);
  });

  it('ignores extra positional arguments beyond command and path', () => {
    const result = parseArgs(['install', '/path', 'extra']);
    expect(result.command).toBe('install');
    expect(result.path).toBe('/path');
    // 'extra' is silently dropped since there is no third positional slot
  });

  it('handles mixed order of options and positional args', () => {
    const result = parseArgs(['--lang=en', 'install', '--tech=react', '/my/project']);
    expect(result.options.lang).toBe('en');
    expect(result.command).toBe('install');
    expect(result.options.tech).toBe('react');
    expect(result.path).toBe('/my/project');
  });
});
