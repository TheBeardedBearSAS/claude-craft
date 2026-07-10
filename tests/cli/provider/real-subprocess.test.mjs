/**
 * Real (non-mocked) subprocess integration coverage for AI Craft providers (FIAB).
 *
 * All other provider tests (tests/cli/provider/providers.test.mjs) mock `execa`
 * entirely, so a bug in how a provider builds its real argv (e.g. flattening
 * several flags into a single joined string instead of passing them as
 * distinct argv elements - the SEC-04 class of bug) can pass unnoticed as long
 * as the mock assertion only checks the array shape in the abstract.
 *
 * This file deliberately does NOT mock `execa`. Instead, for each provider it
 * writes a tiny executable shell script named after the provider's real binary
 * (e.g. `codex`, `opencode`, `vibe`, `claude`, `cursor`) into a temp directory
 * prepended to `process.env.PATH`, so the provider's real `execa(binary, args,
 * options)` call really spawns a process - just not the real (unavailable in
 * CI) AI CLI. The fixture script echoes back its argv, one element per line,
 * with an unambiguous delimiter, so the test can assert the exact argv the
 * provider handed to the OS - which is exactly what SEC-04 would have caught.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, chmodSync, rmSync } from 'fs';
import path from 'path';
import os from 'os';

/**
 * Writes an executable fixture binary at <dir>/<name> that prints one argv
 * element per line, prefixed with "ARG:" so an argument that is itself empty
 * or contains spaces is still unambiguously delimited, then exits 0 with a
 * plausible stdout tail.
 */
function writeFixtureBinary(dir, name) {
  const scriptPath = path.join(dir, name);
  const script = [
    '#!/bin/sh',
    'for arg in "$@"; do',
    '  echo "ARG:$arg"',
    'done',
    'echo "FIXTURE_OK"',
    'exit 0',
    '',
  ].join('\n');
  writeFileSync(scriptPath, script);
  chmodSync(scriptPath, 0o755);
  return scriptPath;
}

/** Parses the fixture's stdout back into the argv array it received. */
function parseArgs(stdout) {
  return stdout
    .split('\n')
    .filter((line) => line.startsWith('ARG:'))
    .map((line) => line.slice('ARG:'.length));
}

describe('Provider real subprocess integration (FIAB, execa not mocked)', () => {
  let fixtureDir;
  let originalPath;

  beforeAll(() => {
    fixtureDir = mkdtempSync(path.join(os.tmpdir(), 'ai-craft-provider-fixture-'));
    ['claude', 'codex', 'opencode', 'vibe', 'cursor'].forEach((name) => writeFixtureBinary(fixtureDir, name));
    originalPath = process.env.PATH;
    process.env.PATH = `${fixtureDir}${path.delimiter}${originalPath}`;
  });

  afterAll(() => {
    process.env.PATH = originalPath;
    rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('ClaudeProvider.spawnSubAgent() really invokes the claude binary with the prompt as one distinct arg', async () => {
    const { ClaudeProvider } = await import('../../../cli/lib/provider/claude-provider.js');
    const provider = new ClaudeProvider();

    const result = await provider.spawnSubAgent('investigate the bug');

    expect(result.success).toBe(true);
    expect(result.stdout).toContain('FIXTURE_OK');
    expect(parseArgs(result.stdout)).toEqual(['--fork', 'investigate the bug']);
  });

  it('CodexProvider.spawnSubAgent() really invokes the codex binary with each flag as a distinct arg (SEC-04)', async () => {
    const { CodexProvider } = await import('../../../cli/lib/provider/codex-provider.js');
    const provider = new CodexProvider();

    const result = await provider.spawnSubAgent('investigate the bug');

    expect(result.success).toBe(true);
    const args = parseArgs(result.stdout);
    expect(args).toEqual(['--system', '.ai-craft/AI-CRAFT.md', 'investigate the bug']);
    // This is exactly what SEC-04 (argument flattening) would have broken:
    // a single joined string instead of 3 distinct argv elements.
    expect(args).toHaveLength(3);
  });

  it('OpenCodeProvider.spawnSubAgent() really invokes the opencode binary with each flag as a distinct arg (SEC-04)', async () => {
    const { OpenCodeProvider } = await import('../../../cli/lib/provider/opencode-provider.js');
    const provider = new OpenCodeProvider();

    const result = await provider.spawnSubAgent('investigate', { maxIterations: 4, timeout: 30, dod: 'tests pass' });

    expect(result.success).toBe(true);
    const args = parseArgs(result.stdout);
    expect(args).toEqual(['--task', 'investigate', '--max-iterations', '4', '--timeout', '30', '--dod', 'tests pass']);
    expect(args).toHaveLength(8);
  });

  it('VibeProvider.spawnSubAgent() really invokes the vibe binary with each flag as a distinct arg (SEC-04)', async () => {
    const { VibeProvider } = await import('../../../cli/lib/provider/vibe-provider.js');
    const provider = new VibeProvider();

    const result = await provider.spawnSubAgent('investigate', { maxIterations: 2, timeout: 15, dod: 'green CI' });

    expect(result.success).toBe(true);
    const args = parseArgs(result.stdout);
    expect(args).toEqual([
      '--task',
      'investigate',
      '--loop',
      '--max-iterations',
      '2',
      '--timeout',
      '15',
      '--dod',
      'green CI',
    ]);
    expect(args).toHaveLength(9);
  });

  it('CursorProvider.execute("version") really invokes the cursor binary (spawnSubAgent is unimplemented by design)', async () => {
    const { CursorProvider } = await import('../../../cli/lib/provider/cursor-provider.js');
    const provider = new CursorProvider();

    const result = await provider.execute('version', []);

    expect(result.success).toBe(true);
    expect(result.stdout).toContain('FIXTURE_OK');
    expect(parseArgs(result.stdout)).toEqual(['--version']);
  });

  it('CursorProvider.isAvailable()/getVersion() really invoke the cursor binary', async () => {
    const { CursorProvider } = await import('../../../cli/lib/provider/cursor-provider.js');
    const provider = new CursorProvider();

    await expect(provider.isAvailable()).resolves.toBe(true);
    const version = await provider.getVersion();
    expect(version).toContain('ARG:--version');
    expect(version).toContain('FIXTURE_OK');
  });
});
