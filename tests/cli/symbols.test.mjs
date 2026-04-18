import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('symbols module', () => {
  let originalEnv;
  let originalIsTTY;

  beforeEach(() => {
    originalEnv = { ...process.env };
    originalIsTTY = process.stdout.isTTY;
    // Reset module cache so each test gets fresh imports
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, writable: true });
  });

  it('exports standard symbols', async () => {
    const { symbols } = await import('../../cli/lib/symbols.js');
    expect(symbols.success).toBe('✓');
    expect(symbols.error).toBe('✗');
    expect(symbols.warning).toBe('⚠');
    expect(symbols.info).toBe('ℹ');
  });

  describe('useColor', () => {
    it('returns false when NO_COLOR is set', async () => {
      process.env.NO_COLOR = '1';
      const { useColor } = await import('../../cli/lib/symbols.js');
      expect(useColor()).toBe(false);
    });

    it('returns false when stdout is not a TTY', async () => {
      delete process.env.NO_COLOR;
      Object.defineProperty(process.stdout, 'isTTY', { value: false, writable: true });
      const { useColor } = await import('../../cli/lib/symbols.js');
      expect(useColor()).toBe(false);
    });

    it('returns true when TTY and no NO_COLOR', async () => {
      delete process.env.NO_COLOR;
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      const { useColor } = await import('../../cli/lib/symbols.js');
      expect(useColor()).toBe(true);
    });
  });

  describe('formatting functions', () => {
    it('success includes symbol without color when NO_COLOR set', async () => {
      process.env.NO_COLOR = '1';
      const { success } = await import('../../cli/lib/symbols.js');
      const result = success('done');
      expect(result).toContain('✓');
      expect(result).toContain('done');
    });

    it('error includes symbol without color when NO_COLOR set', async () => {
      process.env.NO_COLOR = '1';
      const { error } = await import('../../cli/lib/symbols.js');
      const result = error('fail');
      expect(result).toContain('✗');
      expect(result).toContain('fail');
    });

    it('warning includes symbol without color when NO_COLOR set', async () => {
      process.env.NO_COLOR = '1';
      const { warning } = await import('../../cli/lib/symbols.js');
      const result = warning('caution');
      expect(result).toContain('⚠');
      expect(result).toContain('caution');
    });

    it('info includes symbol without color when NO_COLOR set', async () => {
      process.env.NO_COLOR = '1';
      const { info } = await import('../../cli/lib/symbols.js');
      const result = info('note');
      expect(result).toContain('ℹ');
      expect(result).toContain('note');
    });

    it('success includes color codes when TTY', async () => {
      delete process.env.NO_COLOR;
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      const { success } = await import('../../cli/lib/symbols.js');
      const result = success('ok');
      expect(result).toContain('\x1b[');
      expect(result).toContain('ok');
    });

    it('error includes color codes when TTY', async () => {
      delete process.env.NO_COLOR;
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      const { error } = await import('../../cli/lib/symbols.js');
      const result = error('bad');
      expect(result).toContain('\x1b[');
    });

    it('warning includes color codes when TTY', async () => {
      delete process.env.NO_COLOR;
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      const { warning } = await import('../../cli/lib/symbols.js');
      const result = warning('warn');
      expect(result).toContain('\x1b[');
    });

    it('info includes color codes when TTY', async () => {
      delete process.env.NO_COLOR;
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      const { info } = await import('../../cli/lib/symbols.js');
      const result = info('msg');
      expect(result).toContain('\x1b[');
    });
  });
});
