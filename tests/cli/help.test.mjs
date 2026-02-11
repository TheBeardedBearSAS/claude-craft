import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { printHelp } from '../../cli/lib/help.js';
import { TECHNOLOGIES, LANGUAGES } from '../../cli/lib/constants.js';

describe('printHelp', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('lists all CLI commands', () => {
    printHelp();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('install');
    expect(output).toContain('flatten');
    expect(output).toContain('ralph');
    expect(output).toContain('help');
  });

  it('lists all supported technologies', () => {
    printHelp();
    const output = logSpy.mock.calls[0][0];
    for (const key of Object.keys(TECHNOLOGIES)) {
      expect(output).toContain(key);
    }
  });

  it('lists all supported languages', () => {
    printHelp();
    const output = logSpy.mock.calls[0][0];
    for (const key of Object.keys(LANGUAGES)) {
      expect(output).toContain(key);
    }
  });
});
