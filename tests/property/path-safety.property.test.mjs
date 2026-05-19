import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import path from 'path';
import { assertSafeTarget, assertSafeLang, FORBIDDEN_SYSTEM_DIRS } from '../../cli/lib/path-safety.js';

describe('assertSafeTarget — property-based', () => {
  it('always rejects exact FORBIDDEN_SYSTEM_DIRS paths', () => {
    fc.assert(
      fc.property(fc.constantFrom(...FORBIDDEN_SYSTEM_DIRS), (forbidden) => {
        expect(() => assertSafeTarget(forbidden)).toThrow(/system directory|Refusing/);
      })
    );
  });

  it('always rejects subtrees of non-root FORBIDDEN_SYSTEM_DIRS', () => {
    // For '/' alone, startsWith('//') is the check — children like '/_' are not blocked by design.
    // For all other forbidden dirs (e.g. '/etc'), children MUST be rejected.
    const nonRootForbidden = FORBIDDEN_SYSTEM_DIRS.filter((d) => d !== '/');
    fc.assert(
      fc.property(
        fc.constantFrom(...nonRootForbidden),
        fc.array(fc.stringMatching(/^[a-zA-Z0-9_-]{1,12}$/), { minLength: 1, maxLength: 3 }),
        (forbidden, extra) => {
          const target = `${forbidden}/${extra.join('/')}`;
          expect(() => assertSafeTarget(target)).toThrow(/system directory|Refusing/);
        }
      )
    );
  });

  it('always accepts valid user paths (outside forbidden dirs) and returns an absolute path', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Z0-9_-]{1,12}$/),
        fc.array(fc.stringMatching(/^[a-zA-Z0-9_-]{1,12}$/), { minLength: 1, maxLength: 3 }),
        (segment, rest) => {
          const target = `/home/${segment}/${rest.join('/')}`;
          const result = assertSafeTarget(target);
          expect(path.isAbsolute(result)).toBe(true);
          expect(result).toBe(path.resolve(target));
        }
      )
    );
  });

  it('non-string inputs always throw', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer(), fc.float(), fc.boolean(), fc.constant(null), fc.constant(undefined)),
        (nonString) => {
          expect(() => assertSafeTarget(nonString)).toThrow(/non-empty string/);
        }
      )
    );
  });
});

describe('assertSafeLang — property-based', () => {
  it('accepts exactly 2-char lowercase ASCII strings', () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[a-z]{2}$/), (lang) => {
        expect(assertSafeLang(lang)).toBe(lang);
      })
    );
  });

  it('rejects strings that are not exactly 2 lowercase letters', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ minLength: 0, maxLength: 1 }),
          fc.string({ minLength: 3, maxLength: 10 }),
          fc.stringMatching(/^[A-Z]{2}$/),
          fc.constant('fr_FR'),
          fc.constant('fr;rm'),
          fc.constant('en\n')
        ),
        (invalid) => {
          if (!/^[a-z]{2}$/.test(invalid)) {
            expect(() => assertSafeLang(invalid)).toThrow(/Invalid --lang/);
          }
        }
      )
    );
  });
});
