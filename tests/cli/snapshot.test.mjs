import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

const CLI_PATH = path.resolve(__dirname, '../../cli/index.js');

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function stripVersion(str) {
  return str.replace(/\d+\.\d+\.\d+/g, 'X.Y.Z');
}

function stripPaths(str) {
  return str.replace(/\/[^\s")]+\/claude-craft/g, '/PATH/claude-craft');
}

function normalize(str) {
  return stripPaths(stripVersion(stripAnsi(str))).trim();
}

function runCLI(args) {
  return execSync(`node "${CLI_PATH}" ${args}`, {
    encoding: 'utf8',
    timeout: 15000,
  });
}

function runCLIExpectFail(args) {
  try {
    execSync(`node "${CLI_PATH}" ${args}`, {
      encoding: 'utf8',
      timeout: 15000,
    });
    throw new Error('Expected command to fail');
  } catch (error) {
    if (error.message === 'Expected command to fail') throw error;
    return { stdout: error.stdout || '', stderr: error.stderr || '' };
  }
}

describe('CLI snapshot tests', { timeout: 15000 }, () => {
  it('--help output matches snapshot', () => {
    const output = runCLI('--help');
    expect(normalize(output)).toMatchSnapshot();
  });

  it('--version output format matches snapshot', () => {
    const output = runCLI('--version');
    expect(normalize(output)).toMatchSnapshot();
  });

  it('error for invalid tech matches snapshot', () => {
    const result = runCLIExpectFail('install /tmp/nopath --tech=invalid');
    const combined = result.stdout + result.stderr;
    expect(normalize(combined)).toMatchSnapshot();
  });

  it('error for invalid lang matches snapshot', () => {
    const result = runCLIExpectFail('install /tmp/nopath --lang=invalid');
    const combined = result.stdout + result.stderr;
    expect(normalize(combined)).toMatchSnapshot();
  });
});
