import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('cli/lib/colors', () => {
  const EXPECTED_KEYS = ['reset', 'bold', 'dim', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

  // Snapshot env vars so tests don't leak.
  const originalNoColor = process.env.NO_COLOR;
  const originalForceColor = process.env.FORCE_COLOR;
  const originalIsTTY = process.stdout.isTTY;

  afterEach(() => {
    if (originalNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = originalNoColor;
    if (originalForceColor === undefined) delete process.env.FORCE_COLOR;
    else process.env.FORCE_COLOR = originalForceColor;
    process.stdout.isTTY = originalIsTTY;
  });

  /**
   * The module caches `colorEnabled` at import time, so we use Vite's
   * dynamic import + `vi.resetModules` equivalent (re-import via cache bust).
   */
  async function loadColorsFresh() {
    const url = new URL(`../../cli/lib/colors.js?bust=${Date.now()}-${Math.random()}`, import.meta.url);
    return import(url.href);
  }

  describe('shape', () => {
    it('exports a plain object (not a function)', async () => {
      const { default: colors } = await loadColorsFresh();
      expect(typeof colors).toBe('object');
      expect(colors).not.toBeNull();
      expect(Array.isArray(colors)).toBe(false);
    });

    it('contains all 9 expected color keys', async () => {
      const { default: colors } = await loadColorsFresh();
      expect(Object.keys(colors).sort()).toEqual([...EXPECTED_KEYS].sort());
    });
  });

  describe('FORCE_COLOR enabled', () => {
    beforeEach(() => {
      delete process.env.NO_COLOR;
      process.env.FORCE_COLOR = '1';
    });

    it.each(EXPECTED_KEYS)('%s is a valid ANSI escape sequence', async (key) => {
      const { default: colors } = await loadColorsFresh();
      expect(colors[key]).toMatch(/^\x1b\[\d+m$/);
    });

    it('exports colorEnabled = true', async () => {
      const { colorEnabled } = await loadColorsFresh();
      expect(colorEnabled).toBe(true);
    });
  });

  describe('NO_COLOR set (https://no-color.org)', () => {
    beforeEach(() => {
      process.env.NO_COLOR = '1';
      process.env.FORCE_COLOR = '1'; // NO_COLOR must win even with FORCE_COLOR.
    });

    it.each(EXPECTED_KEYS)('%s resolves to empty string', async (key) => {
      const { default: colors } = await loadColorsFresh();
      expect(colors[key]).toBe('');
    });

    it('exports colorEnabled = false', async () => {
      const { colorEnabled } = await loadColorsFresh();
      expect(colorEnabled).toBe(false);
    });
  });

  describe('non-TTY stdout (e.g. piped to file)', () => {
    beforeEach(() => {
      delete process.env.NO_COLOR;
      delete process.env.FORCE_COLOR;
      process.stdout.isTTY = false;
    });

    it.each(EXPECTED_KEYS)('%s resolves to empty string', async (key) => {
      const { default: colors } = await loadColorsFresh();
      expect(colors[key]).toBe('');
    });
  });
});
