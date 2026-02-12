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
    expect(output).toContain('init');
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

  it('displays Available Namespaces section', () => {
    printHelp();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('Available Namespaces');
  });

  it('lists all v7.0 namespace prefixes', () => {
    printHelp();
    const output = logSpy.mock.calls[0][0];
    const expectedPrefixes = [
      'common', 'workflow', 'team', 'qa', 'uiux',
      'sprint', 'gate', 'project', 'docker',
      'csharp', 'symfony', 'flutter', 'react',
      'angular', 'laravel', 'vuejs',
    ];
    for (const prefix of expectedPrefixes) {
      expect(output, `Missing namespace: ${prefix}`).toContain(`/${prefix}:`);
    }
  });

  it('displays usage line', () => {
    printHelp();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('Usage:');
  });

  it('displays options section with key flags', () => {
    printHelp();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('--lang=');
    expect(output).toContain('--tech=');
    expect(output).toContain('--force');
  });

  it('displays examples section', () => {
    printHelp();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('Examples:');
    expect(output).toContain('npx @the-bearded-bear/claude-craft');
  });
});
