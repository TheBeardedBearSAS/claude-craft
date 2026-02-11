import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { printBanner, printSuccess } from '../../cli/lib/banner.js';

describe('printBanner', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('outputs banner with version string', () => {
    printBanner('1.2.3');
    expect(logSpy).toHaveBeenCalledOnce();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('1.2.3');
    expect(output).toContain('Claude');
  });

  it('handles long version strings without crashing', () => {
    const longVersion = '12345678901234567890';
    expect(() => printBanner(longVersion)).not.toThrow();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain(longVersion);
  });
});

describe('printSuccess', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('outputs success box with target path and next steps', () => {
    printSuccess('/home/user/project');
    expect(logSpy).toHaveBeenCalledOnce();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('Installation Complete');
    expect(output).toContain('/home/user/project');
    expect(output).toContain('Next Steps');
    expect(output).toContain('/workflow:init');
  });
});
