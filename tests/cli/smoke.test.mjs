import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

const CLI_PATH = path.resolve(__dirname, '../../cli/index.js');

describe('CLI smoke test', () => {
  it('exits 0 and outputs banner on --help', () => {
    const output = execSync(`node "${CLI_PATH}" --help`, {
      encoding: 'utf8',
      timeout: 20000,
    });

    // The CLI should output something containing the project name
    const lowerOutput = output.toLowerCase();
    expect(
      lowerOutput.includes('claude-craft') || lowerOutput.includes('claude') || lowerOutput.includes('craft')
    ).toBe(true);
  });

  it('exits 0 and outputs version on --version', () => {
    const output = execSync(`node "${CLI_PATH}" --version`, {
      encoding: 'utf8',
      timeout: 20000,
    });

    // Should output a semver-like version string
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });
});
