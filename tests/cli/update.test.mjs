import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock colors to simplify output assertions
vi.mock('../../cli/lib/colors.js', () => ({
  default: {
    red: '',
    green: '',
    yellow: '',
    blue: '',
    cyan: '',
    bold: '',
    dim: '',
    reset: '',
  },
}));

// Mock child_process to avoid running real install scripts.
// Security audit 2026-04-23 (C-2): update.js now uses spawnSync with argv array
// instead of execSync with shell string interpolation. Tests mock spawnSync.
vi.mock('child_process', () => ({
  spawnSync: vi.fn(() => ({ status: 0, stdout: '', stderr: '' })),
}));

// The real `claude` binary is never run: plugin installation and legacy migration are replaced.
vi.mock('../../cli/lib/plugin-install.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ensureClaude: vi.fn(() => '2.1.326'),
    installPlugins: vi.fn(() => ({ ids: ['bear-common@bear-craft'], claudeVersion: '2.1.326' })),
  };
});
vi.mock('../../cli/lib/migrate-legacy.js', () => ({ migrateLegacyInstall: vi.fn() }));

import { runUpdate } from '../../cli/lib/update.js';
import * as pluginInstall from '../../cli/lib/plugin-install.js';
import { migrateLegacyInstall } from '../../cli/lib/migrate-legacy.js';
import { spawnSync } from 'child_process';

describe('runUpdate', () => {
  let tempDir;
  let cliRoot;
  let consoleSpy;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'bear-craft-update-'));
    cliRoot = mkdtempSync(join(tmpdir(), 'bear-craft-cli-'));
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    process.exitCode = undefined;
    spawnSync.mockClear();
    spawnSync.mockReturnValue({ status: 0, stdout: '', stderr: '' });
    pluginInstall.ensureClaude.mockClear();
    pluginInstall.installPlugins.mockClear();
    migrateLegacyInstall.mockReset();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    rmSync(cliRoot, { recursive: true, force: true });
    consoleSpy.mockRestore();
    process.exitCode = undefined;
  });

  it('reports no installation when .claude/ is missing', () => {
    runUpdate(tempDir, {}, cliRoot);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('No bear-craft installation detected');
    expect(process.exitCode).toBe(1);
  });

  it('reports unknown technology for invalid --tech', () => {
    mkdirSync(join(tempDir, '.claude'));
    runUpdate(tempDir, { tech: 'nonexistent' }, cliRoot);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Unknown technology: nonexistent');
    expect(process.exitCode).toBe(1);
  });

  it('rejects invalid --lang value (security: argument injection prevention)', () => {
    mkdirSync(join(tempDir, '.claude'));
    expect(() => runUpdate(tempDir, { lang: 'en" && touch /tmp/pwned #' }, cliRoot)).toThrow(/Invalid --lang/);
  });

  it('rejects system directory as target (security: path traversal prevention)', () => {
    expect(() => runUpdate('/etc', {}, cliRoot)).toThrow(/Refusing to operate on system directory/);
  });

  it('updates with explicit --tech flag', () => {
    mkdirSync(join(tempDir, '.claude'));
    // Create mock install scripts
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');

    spawnSync.mockReturnValue({ status: 0, stdout: '', stderr: '' });

    runUpdate(tempDir, { tech: 'react', lang: 'fr' }, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Common rules updated');
    expect(output).toContain('React updated');
    expect(output).toContain('Update complete');
    // Verify --force is passed in the spawnSync argv array
    expect(spawnSync).toHaveBeenCalledWith('bash', expect.arrayContaining(['--force']), expect.any(Object));
    // Verify --lang is passed as a single argv item (no shell interpolation)
    expect(spawnSync).toHaveBeenCalledWith('bash', expect.arrayContaining(['--lang=fr']), expect.any(Object));
  });

  it('auto-detects techs from installed references', () => {
    mkdirSync(join(tempDir, '.claude', 'references', 'symfony'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'references', 'react'), { recursive: true });
    // Create mock install scripts
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-symfony-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');

    spawnSync.mockReturnValue({ status: 0, stdout: '', stderr: '' });

    runUpdate(tempDir, {}, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Symfony');
    expect(output).toContain('React');
    expect(output).toContain('Update complete');
  });

  it('shows no tech warning when no references detected and common rules updated', () => {
    mkdirSync(join(tempDir, '.claude', 'references'), { recursive: true });
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');

    spawnSync.mockReturnValue({ status: 0, stdout: '', stderr: '' });

    runUpdate(tempDir, {}, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    // Common rules updated, but no tech-specific scripts ran
    expect(output).toContain('Common rules updated');
    expect(output).toContain('Update complete');
  });

  it('still refreshes the plugins when no tech references and no common script exist', () => {
    mkdirSync(join(tempDir, '.claude', 'references'), { recursive: true });
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    // No install scripts at all

    runUpdate(tempDir, {}, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('plugins enabled');
    expect(pluginInstall.installPlugins).toHaveBeenCalledTimes(1);
  });

  it('runs the rules scripts in plugin mode and migrates copied leftovers before installing the plugins', () => {
    mkdirSync(join(tempDir, '.claude', 'references', 'react'), { recursive: true });
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');
    const order = [];
    spawnSync.mockImplementation((_c, args) => {
      order.push(`script:${String(args[0]).split('/').pop()}`);
      return { status: 0, stdout: '', stderr: '' };
    });
    migrateLegacyInstall.mockImplementation(() => order.push('migrate'));
    pluginInstall.installPlugins.mockImplementation(() => {
      order.push('plugins');
      return { ids: [], claudeVersion: '2.1.326' };
    });

    runUpdate(tempDir, { lang: 'fr' }, cliRoot);

    expect(order).toEqual(['script:install-common-rules.sh', 'script:install-react-rules.sh', 'migrate', 'plugins']);
    expect(spawnSync).toHaveBeenCalledWith('bash', expect.arrayContaining(['--plugin-mode']), expect.any(Object));
    expect(pluginInstall.installPlugins.mock.calls[0][0].install).toMatchObject({ lang: 'fr', techs: ['react'] });
  });

  it('replays .bear-craft/install.json (techs, infra, hooks, language) when it exists', () => {
    mkdirSync(join(tempDir, '.claude'));
    mkdirSync(join(tempDir, '.bear-craft'));
    writeFileSync(
      join(tempDir, '.bear-craft', 'install.json'),
      JSON.stringify({
        lang: 'de',
        techs: ['python'],
        infra: ['kubernetes'],
        hooks: { profile: 'full', memory: false },
        version: '10.0.0',
      })
    );
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-python-rules.sh'), '#!/bin/bash');

    runUpdate(tempDir, {}, cliRoot);

    expect(pluginInstall.installPlugins.mock.calls[0][0].install).toEqual({
      lang: 'de',
      techs: ['python'],
      infra: ['kubernetes'],
      hooks: { profile: 'full', memory: false },
    });
  });

  it('detects techs, infra and hooks of a 9.x copy-based installation (no install.json)', () => {
    mkdirSync(join(tempDir, '.claude', 'references', 'symfony'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'commands', 'docker'), { recursive: true });
    writeFileSync(
      join(tempDir, '.claude', 'settings.json'),
      JSON.stringify({
        hooks: {
          Stop: [{ hooks: [{ command: 'bash x/quality-gate.sh' }] }],
          PreToolUse: [{ hooks: [{ command: 'bash x/guard-network.sh' }] }],
        },
      })
    );

    runUpdate(tempDir, {}, cliRoot);

    expect(pluginInstall.installPlugins.mock.calls[0][0].install).toEqual({
      lang: 'en',
      techs: ['symfony'],
      infra: ['docker'],
      hooks: { profile: 'full', memory: false },
    });
  });

  it('fails without touching anything when claude is missing (no fallback)', () => {
    mkdirSync(join(tempDir, '.claude'));
    writeFileSync(join(tempDir, '.claude', 'BEFORE.txt'), 'x');
    pluginInstall.ensureClaude.mockImplementationOnce(() => {
      throw new pluginInstall.PluginInstallError('Claude Code (the `claude` command) was not found in your PATH.');
    });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    runUpdate(tempDir, {}, cliRoot);

    expect(errSpy.mock.calls.map((c) => c[0]).join('\n')).toContain('was not found in your PATH');
    expect(process.exitCode).toBe(1);
    expect(spawnSync).not.toHaveBeenCalled();
    expect(pluginInstall.installPlugins).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('handles install script failure gracefully', () => {
    mkdirSync(join(tempDir, '.claude'));
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');

    spawnSync.mockImplementation((_cmd, args) => {
      const argsStr = Array.isArray(args) ? args.join(' ') : '';
      if (argsStr.includes('install-react')) return { status: 1, stdout: '', stderr: 'Script failed' };
      return { status: 0, stdout: '', stderr: '' };
    });

    runUpdate(tempDir, { tech: 'react' }, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[FAIL]');
    expect(output).toContain('React');
  });

  it('skips tech when install script not found', () => {
    mkdirSync(join(tempDir, '.claude', 'references', 'react'), { recursive: true });
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    // Deliberately NOT creating install-react-rules.sh

    spawnSync.mockReturnValue({ status: 0, stdout: '', stderr: '' });

    runUpdate(tempDir, {}, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('[SKIP]');
    expect(output).toContain('install script not found');
  });

  it('reports update failed when all scripts fail', () => {
    mkdirSync(join(tempDir, '.claude'));
    mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
    writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');

    // All scripts fail
    spawnSync.mockReturnValue({ status: 1, stdout: '', stderr: 'Script failed' });

    runUpdate(tempDir, { tech: 'react' }, cliRoot);

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Update failed');
    expect(process.exitCode).toBe(1);
  });

  // CC-REL-14 — rollback on partial failure
  describe('rollback (CC-REL-14)', () => {
    it('restores .claude/ from snapshot when a script fails', () => {
      // Seed .claude/ with a marker file so we can verify restoration.
      mkdirSync(join(tempDir, '.claude'));
      writeFileSync(join(tempDir, '.claude', 'BEFORE.txt'), 'original-content');
      mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
      writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
      writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');

      // Mock spawnSync to mutate .claude/ then fail on react.
      spawnSync.mockImplementation((_cmd, args) => {
        const argsStr = Array.isArray(args) ? args.join(' ') : '';
        if (argsStr.includes('install-react')) {
          writeFileSync(join(tempDir, '.claude', 'PARTIAL.txt'), 'should-be-rolled-back');
          return { status: 1, stdout: '', stderr: 'Boom' };
        }
        writeFileSync(join(tempDir, '.claude', 'COMMON.txt'), 'common-updated');
        return { status: 0, stdout: '', stderr: '' };
      });

      runUpdate(tempDir, { tech: 'react' }, cliRoot);

      const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
      expect(output).toContain('[ROLLBACK]');
      expect(output).toContain('Restored .claude/');
      expect(process.exitCode).toBe(1);

      // Marker file from before is back, partial mutations are gone.
      expect(readFileSync(join(tempDir, '.claude', 'BEFORE.txt'), 'utf8')).toBe('original-content');
      expect(existsSync(join(tempDir, '.claude', 'PARTIAL.txt'))).toBe(false);
      expect(existsSync(join(tempDir, '.claude', 'COMMON.txt'))).toBe(false);

      // No leftover backup dirs in tempDir.
      const entries = readdirSync(tempDir);
      expect(entries.some((e) => e.startsWith('.claude.backup-'))).toBe(false);
    });

    it('drops the snapshot when every script succeeds', () => {
      mkdirSync(join(tempDir, '.claude'));
      mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
      writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');

      spawnSync.mockReturnValue({ status: 0, stdout: '', stderr: '' });

      runUpdate(tempDir, {}, cliRoot);

      // No backup left behind on success.
      const entries = readdirSync(tempDir);
      expect(entries.some((e) => e.startsWith('.claude.backup-'))).toBe(false);
    });

    it('skips snapshot when --no-rollback is set', () => {
      mkdirSync(join(tempDir, '.claude'));
      writeFileSync(join(tempDir, '.claude', 'BEFORE.txt'), 'original');
      mkdirSync(join(cliRoot, 'Dev', 'scripts'), { recursive: true });
      writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-common-rules.sh'), '#!/bin/bash');
      writeFileSync(join(cliRoot, 'Dev', 'scripts', 'install-react-rules.sh'), '#!/bin/bash');

      spawnSync.mockImplementation((_cmd, args) => {
        const argsStr = Array.isArray(args) ? args.join(' ') : '';
        if (argsStr.includes('install-react')) {
          writeFileSync(join(tempDir, '.claude', 'PARTIAL.txt'), 'should-NOT-be-rolled-back');
          return { status: 1, stdout: '', stderr: 'Boom' };
        }
        return { status: 0, stdout: '', stderr: '' };
      });

      runUpdate(tempDir, { tech: 'react', 'no-rollback': true }, cliRoot);

      const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
      expect(output).not.toContain('[ROLLBACK]');
      // Partial mutation persists (rollback was disabled).
      expect(existsSync(join(tempDir, '.claude', 'PARTIAL.txt'))).toBe(true);
    });
  });
});
