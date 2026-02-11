import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const colors = require('../../cli/lib/colors.js');

describe('cli/lib/colors', () => {
  const EXPECTED_KEYS = ['reset', 'bold', 'dim', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

  it('exports a plain object (not a function)', () => {
    expect(typeof colors).toBe('object');
    expect(colors).not.toBeNull();
    expect(Array.isArray(colors)).toBe(false);
  });

  it('contains all 9 expected color keys', () => {
    expect(Object.keys(colors).sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it.each(EXPECTED_KEYS)('%s is a valid ANSI escape sequence', (key) => {
    expect(colors[key]).toMatch(/^\x1b\[\d+m$/);
  });
});
