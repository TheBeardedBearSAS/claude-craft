import { describe, it, expect } from 'vitest';
import { parseArgs, validateOption } from '../../cli/lib/parse-args.js';

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

describe('parseArgs input validation (SEC-12)', () => {
  describe('--max-iterations', () => {
    it('accepts a valid positive integer', () => {
      const result = parseArgs(['ralph', '--max-iterations=5']);
      expect(result.options['max-iterations']).toBe('5');
    });

    it('rejects non-numeric value', () => {
      expect(() => parseArgs(['ralph', '--max-iterations=abc'])).toThrow(
        'must be a positive integer',
      );
    });

    it('rejects zero', () => {
      expect(() => parseArgs(['ralph', '--max-iterations=0'])).toThrow(
        'must be a positive integer',
      );
    });

    it('rejects negative numbers', () => {
      expect(() => parseArgs(['ralph', '--max-iterations=-3'])).toThrow(
        'must be a positive integer',
      );
    });

    it('rejects floating-point numbers', () => {
      expect(() => parseArgs(['ralph', '--max-iterations=2.5'])).toThrow(
        'must be a positive integer',
      );
    });
  });

  describe('--output', () => {
    it('accepts a normal output path', () => {
      const result = parseArgs(['flatten', '--output=/home/user/out']);
      expect(result.options.output).toBe('/home/user/out');
    });

    it('rejects path traversal with ..', () => {
      expect(() => parseArgs(['flatten', '--output=../../etc/passwd'])).toThrow(
        'path traversal',
      );
    });

    it('rejects path traversal in the middle of path', () => {
      expect(() =>
        parseArgs(['flatten', '--output=/home/user/../../../etc/shadow']),
      ).toThrow('path traversal');
    });

    it('allows filenames containing dots (not traversal)', () => {
      const result = parseArgs(['flatten', '--output=file..name.txt']);
      expect(result.options.output).toBe('file..name.txt');
    });
  });

  describe('null bytes', () => {
    it('rejects null bytes in option values', () => {
      expect(() => parseArgs(['install', '--tech=sym\0fony'])).toThrow(
        'null bytes not allowed',
      );
    });
  });

  describe('validateOption', () => {
    it('allows boolean values without validation', () => {
      expect(() => validateOption('force', true)).not.toThrow();
    });

    it('allows unknown options without specific validation', () => {
      expect(() => validateOption('unknown-flag', 'any-value')).not.toThrow();
    });
  });
});
