import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, symlinkSync, lstatSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { load as yamlLoad } from 'js-yaml';
import { ClaudeCompatibilityLayer, claudeCompat } from '../../../cli/lib/legacy/claude-compat.js';

describe('ClaudeCompatibilityLayer', () => {
  let tempDir;
  let layer;
  let logSpy;
  let errorSpy;
  let warnSpy;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claude-compat-test-'));
    layer = new ClaudeCompatibilityLayer();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(tempDir, { recursive: true, force: true });
  });

  // ---------------------------------------------------------------------
  // Singleton
  // ---------------------------------------------------------------------
  describe('singleton export', () => {
    it('exports a claudeCompat singleton instance', () => {
      expect(claudeCompat).toBeInstanceOf(ClaudeCompatibilityLayer);
    });
  });

  // ---------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------
  describe('constructor', () => {
    it('initializes legacyPaths, legacyDirectories and migrationStats', () => {
      expect(layer.legacyPaths).toContain('CLAUDE.md');
      expect(layer.legacyDirectories).toEqual(['.claude']);
      expect(layer.migrationStats).toEqual({ total: 0, success: 0, failed: 0, skipped: 0 });
    });
  });

  // ---------------------------------------------------------------------
  // isClaudeCraftProject
  // ---------------------------------------------------------------------
  describe('isClaudeCraftProject', () => {
    it('returns true when .claude/ exists', () => {
      mkdirSync(join(tempDir, '.claude'));
      expect(layer.isClaudeCraftProject(tempDir)).toBe(true);
    });

    it('returns false when .claude/ does not exist', () => {
      expect(layer.isClaudeCraftProject(tempDir)).toBe(false);
    });
  });

  // ---------------------------------------------------------------------
  // isAlreadyMigrated
  // ---------------------------------------------------------------------
  describe('isAlreadyMigrated', () => {
    it('returns false when .ai-craft/ai-craft.yaml does not exist', () => {
      expect(layer.isAlreadyMigrated(tempDir)).toBe(false);
    });

    it('returns true when ai-craft.yaml has compatibility.migrated set', () => {
      const aiCraftDir = join(tempDir, '.ai-craft');
      mkdirSync(aiCraftDir);
      writeFileSync(join(aiCraftDir, 'ai-craft.yaml'), 'compatibility:\n  migrated: "2026-01-01T00:00:00.000Z"\n');
      expect(layer.isAlreadyMigrated(tempDir)).toBe(true);
    });

    it('returns false when ai-craft.yaml has no compatibility.migrated field', () => {
      const aiCraftDir = join(tempDir, '.ai-craft');
      mkdirSync(aiCraftDir);
      writeFileSync(join(aiCraftDir, 'ai-craft.yaml'), 'version: "1.0.0"\n');
      expect(layer.isAlreadyMigrated(tempDir)).toBe(false);
    });

    it('returns false when ai-craft.yaml content is invalid YAML', () => {
      const aiCraftDir = join(tempDir, '.ai-craft');
      mkdirSync(aiCraftDir);
      writeFileSync(join(aiCraftDir, 'ai-craft.yaml'), ': : : not yaml : : :\n\tbad');
      expect(layer.isAlreadyMigrated(tempDir)).toBe(false);
    });
  });

  // ---------------------------------------------------------------------
  // getDefaultConfig
  // ---------------------------------------------------------------------
  describe('getDefaultConfig', () => {
    it('returns the expected default configuration shape', () => {
      const config = layer.getDefaultConfig();
      expect(config.version).toBe('1.0.0');
      expect(config.providers.primary).toBe('claude');
      expect(config.providers.fallback).toEqual(['vibe', 'codex', 'opencode']);
      expect(config.memory.enabled).toBe(true);
      expect(config.hooks.enabled).toBe(true);
      expect(config.optimization.model_routing).toBe('auto');
      expect(config.compatibility.claude_craft).toBe(true);
      expect(config.security.max_execution_time).toBe(3600);
    });

    it('does not declare security flags that are never read anywhere (SEC-05)', () => {
      const config = layer.getDefaultConfig();

      // hook_sandboxing and api_key_validation are fake security: no code path
      // in the repo ever reads them, so they must not be advertised as active.
      expect(config.security).not.toHaveProperty('hook_sandboxing');
      expect(config.security).not.toHaveProperty('api_key_validation');
      // max_execution_time IS consumed by executeHook() and must remain.
      expect(config.security).toHaveProperty('max_execution_time', 3600);
    });
  });

  // ---------------------------------------------------------------------
  // getStats / resetStats
  // ---------------------------------------------------------------------
  describe('getStats / resetStats', () => {
    it('returns a copy of migrationStats', () => {
      const stats = layer.getStats();
      expect(stats).toEqual({ total: 0, success: 0, failed: 0, skipped: 0 });
      stats.total = 99;
      expect(layer.migrationStats.total).toBe(0);
    });

    it('resets stats to zero', () => {
      layer.migrationStats.total = 5;
      layer.migrationStats.success = 3;
      layer.resetStats();
      expect(layer.getStats()).toEqual({ total: 0, success: 0, failed: 0, skipped: 0 });
    });
  });

  // ---------------------------------------------------------------------
  // transformClaudeMd
  // ---------------------------------------------------------------------
  describe('transformClaudeMd', () => {
    it('replaces the Claude-Craft header block with the AI Craft header', () => {
      const content = `# Claude-Craft\n\nSome intro text\n---\nBody content`;
      const result = layer.transformClaudeMd(content);
      expect(result).toContain('# AI Craft - Multi-AI Development Framework');
      expect(result).toContain('Body content');
      expect(result).not.toContain('# Claude-Craft');
    });

    it('replaces "Claude Code" with "Multi-AI"', () => {
      const result = layer.transformClaudeMd('Use Claude Code for development.');
      expect(result).toContain('Use Multi-AI for development.');
    });

    it('replaces "claude-craft" with "ai-craft"', () => {
      const result = layer.transformClaudeMd('npm install claude-craft');
      expect(result).toContain('npm install ai-craft');
    });

    it('replaces the npm package scope reference', () => {
      const result = layer.transformClaudeMd('npx @the-bearded-bear/claude-craft install');
      expect(result).toContain('@ai-craft/core');
    });

    it('replaces .claude/ path references with .ai-craft/', () => {
      const result = layer.transformClaudeMd('See .claude/rules for details');
      expect(result).toContain('.ai-craft/rules');
    });

    it('replaces CLAUDE.md references with AI-CRAFT.md', () => {
      const result = layer.transformClaudeMd('Read CLAUDE.md first');
      expect(result).toContain('Read AI-CRAFT.md first');
    });
  });

  // ---------------------------------------------------------------------
  // transformClaudeContent
  // ---------------------------------------------------------------------
  describe('transformClaudeContent', () => {
    it('replaces all Claude-specific references', () => {
      const content = [
        'Claude Code is great.',
        'npm i claude-craft',
        '@the-bearded-bear/claude-craft',
        '.claude/agents',
        'CLAUDE.md',
        'Claude Craft framework',
      ].join('\n');

      const result = layer.transformClaudeContent(content);

      expect(result).toContain('AI Provider is great.');
      expect(result).toContain('npm i ai-craft');
      expect(result).toContain('@ai-craft/core');
      expect(result).toContain('.ai-craft/agents');
      expect(result).toContain('AI-CRAFT.md');
      expect(result).toContain('AI Craft framework');
      expect(result).not.toContain('Claude Code');
      expect(result).not.toContain('Claude Craft');
    });

    it('leaves unrelated content untouched', () => {
      const content = 'Just a regular sentence with no special tokens.';
      expect(layer.transformClaudeContent(content)).toBe(content);
    });
  });

  // ---------------------------------------------------------------------
  // copyDirSync / removeDirSync
  // ---------------------------------------------------------------------
  describe('copyDirSync', () => {
    it('copies files and nested directories recursively', () => {
      const src = join(tempDir, 'src');
      const dest = join(tempDir, 'dest');
      mkdirSync(join(src, 'nested'), { recursive: true });
      writeFileSync(join(src, 'a.txt'), 'A');
      writeFileSync(join(src, 'nested', 'b.txt'), 'B');

      layer.copyDirSync(src, dest);

      expect(readFileSync(join(dest, 'a.txt'), 'utf8')).toBe('A');
      expect(readFileSync(join(dest, 'nested', 'b.txt'), 'utf8')).toBe('B');
    });

    it('creates the destination directory if missing', () => {
      const src = join(tempDir, 'src2');
      const dest = join(tempDir, 'deep', 'dest2');
      mkdirSync(src);
      writeFileSync(join(src, 'f.txt'), 'F');

      layer.copyDirSync(src, dest);

      expect(existsSync(dest)).toBe(true);
      expect(readFileSync(join(dest, 'f.txt'), 'utf8')).toBe('F');
    });
  });

  describe('removeDirSync', () => {
    it('removes a directory and all of its contents', () => {
      const dir = join(tempDir, 'toRemove');
      mkdirSync(join(dir, 'inner'), { recursive: true });
      writeFileSync(join(dir, 'x.txt'), 'x');
      writeFileSync(join(dir, 'inner', 'y.txt'), 'y');

      layer.removeDirSync(dir);

      expect(existsSync(dir)).toBe(false);
    });

    it('does nothing when the directory does not exist', () => {
      expect(() => layer.removeDirSync(join(tempDir, 'nope'))).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------
  // createBackup / restoreBackup
  // ---------------------------------------------------------------------
  describe('createBackup', () => {
    it('creates a timestamped backup directory with copied content', async () => {
      const claudeDir = join(tempDir, '.claude');
      mkdirSync(claudeDir);
      writeFileSync(join(claudeDir, 'CLAUDE.md'), '# hi');

      const backupPath = await layer.createBackup(claudeDir);

      expect(backupPath).toContain('.claude-backup-');
      expect(existsSync(backupPath)).toBe(true);
      expect(readFileSync(join(backupPath, 'CLAUDE.md'), 'utf8')).toBe('# hi');
    });
  });

  describe('restoreBackup', () => {
    it('replaces the target directory content with the backup content', () => {
      const backupDir = join(tempDir, 'backup');
      const targetDir = join(tempDir, 'target');
      mkdirSync(backupDir);
      writeFileSync(join(backupDir, 'restored.txt'), 'restored-content');
      mkdirSync(targetDir);
      writeFileSync(join(targetDir, 'stale.txt'), 'stale');

      layer.restoreBackup(backupDir, targetDir);

      expect(existsSync(join(targetDir, 'stale.txt'))).toBe(false);
      expect(readFileSync(join(targetDir, 'restored.txt'), 'utf8')).toBe('restored-content');
    });

    it('restores into a target directory that does not yet exist', () => {
      const backupDir = join(tempDir, 'backup2');
      const targetDir = join(tempDir, 'target2');
      mkdirSync(backupDir);
      writeFileSync(join(backupDir, 'f.txt'), 'f');

      layer.restoreBackup(backupDir, targetDir);

      expect(readFileSync(join(targetDir, 'f.txt'), 'utf8')).toBe('f');
    });
  });

  // ---------------------------------------------------------------------
  // copyClaudeFiles
  // ---------------------------------------------------------------------
  describe('copyClaudeFiles', () => {
    it('copies files and directories but skips CLAUDE.md', () => {
      const src = join(tempDir, '.claude');
      const dest = join(tempDir, '.ai-craft');
      mkdirSync(join(src, 'agents'), { recursive: true });
      writeFileSync(join(src, 'CLAUDE.md'), '# claude');
      writeFileSync(join(src, 'settings.json'), '{}');
      writeFileSync(join(src, 'agents', 'a.md'), 'agent');
      mkdirSync(dest);

      const result = layer.copyClaudeFiles(src, dest, false);

      expect(result.filesCopied).toBe(2); // settings.json + agents/
      expect(existsSync(join(dest, 'CLAUDE.md'))).toBe(false);
      expect(existsSync(join(dest, 'settings.json'))).toBe(true);
      expect(existsSync(join(dest, 'agents', 'a.md'))).toBe(true);
    });

    it('logs progress when verbose is true', () => {
      const src = join(tempDir, '.claude2');
      const dest = join(tempDir, '.ai-craft2');
      mkdirSync(src);
      writeFileSync(join(src, 'CLAUDE.md'), '# claude');
      writeFileSync(join(src, 'settings.json'), '{}');
      mkdirSync(dest);

      layer.copyClaudeFiles(src, dest, true);

      expect(logSpy).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------
  // createAICraftMd
  // ---------------------------------------------------------------------
  describe('createAICraftMd', () => {
    it('creates AI-CRAFT.md with transformed content when CLAUDE.md exists', () => {
      const claudeDir = join(tempDir, '.claude');
      const aiCraftDir = join(tempDir, '.ai-craft');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'CLAUDE.md'), 'Use Claude Code daily.');

      const result = layer.createAICraftMd(claudeDir, aiCraftDir);

      expect(result.created).toBe(true);
      expect(existsSync(result.path)).toBe(true);
      expect(readFileSync(result.path, 'utf8')).toContain('Use Multi-AI daily.');
    });

    it('returns created:false when CLAUDE.md is missing', () => {
      const claudeDir = join(tempDir, '.claude-missing');
      const aiCraftDir = join(tempDir, '.ai-craft-missing');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);

      const result = layer.createAICraftMd(claudeDir, aiCraftDir);

      expect(result.created).toBe(false);
      expect(result.error).toBe('CLAUDE.md not found');
    });
  });

  // ---------------------------------------------------------------------
  // createConfig
  // ---------------------------------------------------------------------
  describe('createConfig', () => {
    it('creates ai-craft.yaml with migrated timestamp when no CLAUDE.md exists', () => {
      const claudeDir = join(tempDir, '.claude3');
      const aiCraftDir = join(tempDir, '.ai-craft3');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);

      const result = layer.createConfig(claudeDir, aiCraftDir);

      expect(result.created).toBe(true);
      const written = yamlLoad(readFileSync(result.path, 'utf8'));
      expect(written.compatibility.migrated).toBeDefined();
      expect(written.compatibility.auto_migrate).toBe(false);
    });

    it('extracts version from CLAUDE.md frontmatter when present', () => {
      const claudeDir = join(tempDir, '.claude4');
      const aiCraftDir = join(tempDir, '.ai-craft4');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'CLAUDE.md'), '---\nversion: "8.19.2"\n---\n# Body');

      const result = layer.createConfig(claudeDir, aiCraftDir);
      const written = yamlLoad(readFileSync(result.path, 'utf8'));

      expect(written.compatibility.claude_craft_version).toBe('8.19.2');
    });

    it('ignores invalid frontmatter and still creates config', () => {
      const claudeDir = join(tempDir, '.claude5');
      const aiCraftDir = join(tempDir, '.ai-craft5');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'CLAUDE.md'), '---\n: : : bad yaml : : :\n\tinvalid\n---\nBody');

      const result = layer.createConfig(claudeDir, aiCraftDir);

      expect(result.created).toBe(true);
    });

    it('handles CLAUDE.md with no frontmatter block', () => {
      const claudeDir = join(tempDir, '.claude6');
      const aiCraftDir = join(tempDir, '.ai-craft6');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'CLAUDE.md'), '# Just a heading, no frontmatter');

      const result = layer.createConfig(claudeDir, aiCraftDir);

      expect(result.created).toBe(true);
    });
  });

  // ---------------------------------------------------------------------
  // createProvidersDir / initializeSubdirs / createSymlink
  // ---------------------------------------------------------------------
  describe('createProvidersDir', () => {
    it('creates the providers directory', () => {
      const aiCraftDir = join(tempDir, '.ai-craft7');
      mkdirSync(aiCraftDir);
      layer.createProvidersDir(aiCraftDir);
      expect(existsSync(join(aiCraftDir, 'providers'))).toBe(true);
    });

    it('does not throw when providers directory already exists', () => {
      const aiCraftDir = join(tempDir, '.ai-craft8');
      mkdirSync(join(aiCraftDir, 'providers'), { recursive: true });
      expect(() => layer.createProvidersDir(aiCraftDir)).not.toThrow();
    });
  });

  describe('initializeSubdirs', () => {
    it('creates all expected subdirectories', () => {
      const aiCraftDir = join(tempDir, '.ai-craft9');
      mkdirSync(aiCraftDir);
      layer.initializeSubdirs(aiCraftDir);

      for (const sub of ['agents', 'commands', 'skills', 'templates', 'memory', 'logs', 'hooks']) {
        expect(existsSync(join(aiCraftDir, sub))).toBe(true);
      }
    });
  });

  describe('createSymlink', () => {
    it('creates a symlink from claudeDir to aiCraftDir, replacing an existing directory', () => {
      const aiCraftDir = join(tempDir, '.ai-craft10');
      const claudeDir = join(tempDir, '.claude10');
      mkdirSync(aiCraftDir);
      mkdirSync(claudeDir);
      writeFileSync(join(claudeDir, 'stale.txt'), 'stale');

      layer.createSymlink(aiCraftDir, claudeDir);

      const stats = lstatSync(claudeDir);
      expect(stats.isSymbolicLink()).toBe(true);
    });

    it('leaves claudeDir and its original content untouched when symlinkSync fails (SEC-03)', () => {
      const aiCraftDir = join(tempDir, '.ai-craft11');
      const claudeDir = join(tempDir, '.claude11');
      mkdirSync(aiCraftDir);
      mkdirSync(claudeDir);
      writeFileSync(join(claudeDir, 'important.txt'), 'do not lose me');

      const symlinkSpy = vi.spyOn(fs, 'symlinkSync').mockImplementation(() => {
        throw new Error('EPERM: simulated symlink failure');
      });

      expect(() => layer.createSymlink(aiCraftDir, claudeDir)).toThrow('simulated symlink failure');
      symlinkSpy.mockRestore();

      // claudeDir must still exist as a real directory, not removed or partially replaced.
      const stats = lstatSync(claudeDir);
      expect(stats.isSymbolicLink()).toBe(false);
      expect(stats.isDirectory()).toBe(true);
      expect(existsSync(join(claudeDir, 'important.txt'))).toBe(true);
      expect(readFileSync(join(claudeDir, 'important.txt'), 'utf8')).toBe('do not lose me');
    });
  });

  // ---------------------------------------------------------------------
  // loadLegacyConfig
  // ---------------------------------------------------------------------
  describe('loadLegacyConfig', () => {
    it('returns empty object when neither CLAUDE.md nor settings.json exist', () => {
      const claudeDir = join(tempDir, '.claude');
      mkdirSync(claudeDir);
      expect(layer.loadLegacyConfig(tempDir)).toEqual({});
    });

    it('merges CLAUDE.md frontmatter and settings.json content', () => {
      const claudeDir = join(tempDir, '.claude');
      mkdirSync(claudeDir);
      writeFileSync(join(claudeDir, 'CLAUDE.md'), '---\nversion: "1.2.3"\n---\nBody');
      writeFileSync(join(claudeDir, 'settings.json'), JSON.stringify({ foo: 'bar' }));

      const config = layer.loadLegacyConfig(tempDir);

      expect(config.version).toBe('1.2.3');
      expect(config.settings).toEqual({ foo: 'bar' });
    });

    it('ignores invalid settings.json content', () => {
      const claudeDir = join(tempDir, '.claude13');
      mkdirSync(claudeDir);
      writeFileSync(join(claudeDir, 'settings.json'), '{ not valid json');

      const config = layer.loadLegacyConfig(tempDir);

      expect(config.settings).toBeUndefined();
    });

    it('ignores invalid CLAUDE.md frontmatter', () => {
      const claudeDir = join(tempDir, '.claude14');
      mkdirSync(claudeDir);
      writeFileSync(join(claudeDir, 'CLAUDE.md'), '---\n: : bad : :\n\tinvalid\n---\nBody');

      expect(() => layer.loadLegacyConfig(tempDir)).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------
  // migrateRules / migrateAgents / migrateSkills / migrateTemplates / migrateMCP
  // ---------------------------------------------------------------------
  describe('migrateRules', () => {
    it('returns skipped result when rules/ directory is absent', () => {
      const claudeDir = join(tempDir, '.claudeR1');
      const aiCraftDir = join(tempDir, '.ai-craftR1');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);

      const result = layer.migrateRules(claudeDir, aiCraftDir);

      expect(result).toEqual({ success: true, skipped: true, message: 'No rules directory found' });
    });

    it('migrates rule files into provider subdirectories under claude/', () => {
      const claudeDir = join(tempDir, '.claudeR2');
      const aiCraftDir = join(tempDir, '.ai-craftR2');
      mkdirSync(join(claudeDir, 'rules'), { recursive: true });
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'rules', '01-solid.md'), '# SOLID');

      const result = layer.migrateRules(claudeDir, aiCraftDir);

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1);
      expect(result.errorCount).toBe(0);
      for (const provider of ['vibe', 'codex', 'opencode', 'claude', 'cursor']) {
        expect(existsSync(join(aiCraftDir, 'rules', provider))).toBe(true);
      }
      expect(existsSync(join(aiCraftDir, 'rules', 'claude', '01-solid.md'))).toBe(true);
    });

    it('migrates nested rule directories recursively', () => {
      const claudeDir = join(tempDir, '.claudeR3');
      const aiCraftDir = join(tempDir, '.ai-craftR3');
      mkdirSync(join(claudeDir, 'rules', 'sub'), { recursive: true });
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'rules', 'sub', 'nested.md'), 'nested');

      const result = layer.migrateRules(claudeDir, aiCraftDir);

      expect(result.migratedCount).toBe(1);
      expect(existsSync(join(aiCraftDir, 'rules', 'claude', 'sub', 'nested.md'))).toBe(true);
    });
  });

  describe('migrateAgents', () => {
    it('returns skipped result when agents/ directory is absent', () => {
      const claudeDir = join(tempDir, '.claudeA1');
      const aiCraftDir = join(tempDir, '.ai-craftA1');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);

      const result = layer.migrateAgents(claudeDir, aiCraftDir);

      expect(result).toEqual({ success: true, skipped: true, message: 'No agents directory found' });
    });

    it('copies agent files directly (provider-agnostic)', () => {
      const claudeDir = join(tempDir, '.claudeA2');
      const aiCraftDir = join(tempDir, '.ai-craftA2');
      mkdirSync(join(claudeDir, 'agents'), { recursive: true });
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'agents', 'tdd-coach.md'), 'agent def');

      const result = layer.migrateAgents(claudeDir, aiCraftDir);

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1);
      expect(readFileSync(join(aiCraftDir, 'agents', 'tdd-coach.md'), 'utf8')).toBe('agent def');
    });

    it('copies nested agent directories', () => {
      const claudeDir = join(tempDir, '.claudeA3');
      const aiCraftDir = join(tempDir, '.ai-craftA3');
      mkdirSync(join(claudeDir, 'agents', 'group'), { recursive: true });
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'agents', 'group', 'sub.md'), 'x');

      const result = layer.migrateAgents(claudeDir, aiCraftDir);

      expect(result.migratedCount).toBe(1);
      expect(existsSync(join(aiCraftDir, 'agents', 'group', 'sub.md'))).toBe(true);
    });
  });

  describe('migrateSkills', () => {
    it('returns skipped result when skills/ directory is absent', () => {
      const claudeDir = join(tempDir, '.claudeS1');
      const aiCraftDir = join(tempDir, '.ai-craftS1');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);

      const result = layer.migrateSkills(claudeDir, aiCraftDir);

      expect(result).toEqual({ success: true, skipped: true, message: 'No skills directory found' });
    });

    it('copies skill files and directories', () => {
      const claudeDir = join(tempDir, '.claudeS2');
      const aiCraftDir = join(tempDir, '.ai-craftS2');
      mkdirSync(join(claudeDir, 'skills', 'testing'), { recursive: true });
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'skills', 'testing', 'SKILL.md'), 'skill body');

      const result = layer.migrateSkills(claudeDir, aiCraftDir);

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1);
      expect(existsSync(join(aiCraftDir, 'skills', 'testing', 'SKILL.md'))).toBe(true);
    });
  });

  describe('migrateTemplates', () => {
    it('returns skipped result when templates/ directory is absent', () => {
      const claudeDir = join(tempDir, '.claudeT1');
      const aiCraftDir = join(tempDir, '.ai-craftT1');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);

      const result = layer.migrateTemplates(claudeDir, aiCraftDir);

      expect(result).toEqual({ success: true, skipped: true, message: 'No templates directory found' });
    });

    it('transforms markdown template content and copies other files verbatim', () => {
      const claudeDir = join(tempDir, '.claudeT2');
      const aiCraftDir = join(tempDir, '.ai-craftT2');
      mkdirSync(join(claudeDir, 'templates'), { recursive: true });
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'templates', 'DESIGN.md'), 'Using Claude Code today');
      writeFileSync(join(claudeDir, 'templates', 'DESIGN.md.template'), 'Using Claude Code today');
      writeFileSync(join(claudeDir, 'templates', 'raw.json'), '{"a":1}');

      const result = layer.migrateTemplates(claudeDir, aiCraftDir);

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(3);
      for (const provider of ['vibe', 'codex', 'opencode', 'claude', 'cursor']) {
        expect(existsSync(join(aiCraftDir, 'templates', provider))).toBe(true);
      }
      const transformed = readFileSync(join(aiCraftDir, 'templates', 'claude', 'DESIGN.md'), 'utf8');
      expect(transformed).toContain('Using AI Provider today');
      // `.md.template` (the project's own scaffold naming convention, see
      // .claude/templates/DESIGN.md.template) does NOT end in exactly ".md",
      // so it is copied verbatim, not content-transformed. Documents actual
      // behavior, not necessarily intended behavior.
      const dotTemplateVerbatim = readFileSync(join(aiCraftDir, 'templates', 'claude', 'DESIGN.md.template'), 'utf8');
      expect(dotTemplateVerbatim).toBe('Using Claude Code today');
      const raw = readFileSync(join(aiCraftDir, 'templates', 'claude', 'raw.json'), 'utf8');
      expect(raw).toBe('{"a":1}');
    });
  });

  describe('migrateMCP', () => {
    it('returns skipped result when mcp/ directory is absent', () => {
      const claudeDir = join(tempDir, '.claudeM1');
      const aiCraftDir = join(tempDir, '.ai-craftM1');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);

      const result = layer.migrateMCP(claudeDir, aiCraftDir);

      expect(result).toEqual({ success: true, skipped: true, message: 'No MCP directory found' });
    });

    it('copies MCP configuration files and directories', () => {
      const claudeDir = join(tempDir, '.claudeM2');
      const aiCraftDir = join(tempDir, '.ai-craftM2');
      mkdirSync(join(claudeDir, 'mcp'), { recursive: true });
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'mcp', 'server.json'), '{"name":"test"}');

      const result = layer.migrateMCP(claudeDir, aiCraftDir);

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1);
      expect(existsSync(join(aiCraftDir, 'mcp', 'server.json'))).toBe(true);
    });
  });

  // ---------------------------------------------------------------------
  // migrateCommands / migrateCommandDirectory
  // ---------------------------------------------------------------------
  describe('migrateCommands', () => {
    it('returns skipped result when commands/ directory is absent', () => {
      const claudeDir = join(tempDir, '.claudeC1');
      const aiCraftDir = join(tempDir, '.ai-craftC1');
      mkdirSync(claudeDir);
      mkdirSync(aiCraftDir);

      const result = layer.migrateCommands(claudeDir, aiCraftDir);

      expect(result).toEqual({ success: true, skipped: true, message: 'No commands directory found' });
    });

    it('copies top-level command files directly', () => {
      const claudeDir = join(tempDir, '.claudeC2');
      const aiCraftDir = join(tempDir, '.ai-craftC2');
      mkdirSync(join(claudeDir, 'commands'), { recursive: true });
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'commands', 'top.md'), 'top level command');

      const result = layer.migrateCommands(claudeDir, aiCraftDir);

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1);
      expect(existsSync(join(aiCraftDir, 'commands', 'top.md'))).toBe(true);
    });

    it('migrates command namespace directories via migrateCommandDirectory with content transform', () => {
      const claudeDir = join(tempDir, '.claudeC3');
      const aiCraftDir = join(tempDir, '.ai-craftC3');
      mkdirSync(join(claudeDir, 'commands', 'common'), { recursive: true });
      mkdirSync(aiCraftDir);
      writeFileSync(join(claudeDir, 'commands', 'common', 'audit.md'), 'Run with Claude Code');
      writeFileSync(join(claudeDir, 'commands', 'common', 'config.json'), '{"x":1}');

      const result = layer.migrateCommands(claudeDir, aiCraftDir);

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1);
      const mdContent = readFileSync(join(aiCraftDir, 'commands', 'common', 'audit.md'), 'utf8');
      expect(mdContent).toBe('Run with AI Provider');
      const jsonContent = readFileSync(join(aiCraftDir, 'commands', 'common', 'config.json'), 'utf8');
      expect(jsonContent).toBe('{"x":1}');
    });
  });

  describe('migrateCommandDirectory', () => {
    it('creates the destination directory and recurses into nested subdirectories', () => {
      const src = join(tempDir, 'cmdSrc');
      const dest = join(tempDir, 'cmdDest');
      mkdirSync(join(src, 'nested'), { recursive: true });
      writeFileSync(join(src, 'index.md'), 'Powered by claude-craft');
      writeFileSync(join(src, 'nested', 'deep.txt'), 'binary-ish');

      layer.migrateCommandDirectory(src, dest);

      expect(existsSync(dest)).toBe(true);
      expect(readFileSync(join(dest, 'index.md'), 'utf8')).toBe('Powered by ai-craft');
      expect(readFileSync(join(dest, 'nested', 'deep.txt'), 'utf8')).toBe('binary-ish');
    });
  });

  // ---------------------------------------------------------------------
  // migrate() — full orchestration
  // ---------------------------------------------------------------------
  describe('migrate', () => {
    function seedClaudeCraftProject(root) {
      const claudeDir = join(root, '.claude');
      mkdirSync(join(claudeDir, 'agents'), { recursive: true });
      mkdirSync(join(claudeDir, 'rules'), { recursive: true });
      writeFileSync(join(claudeDir, 'CLAUDE.md'), '---\nversion: "8.0.0"\n---\n# Claude-Craft\nBody\n---\nMore');
      writeFileSync(join(claudeDir, 'settings.json'), '{}');
      writeFileSync(join(claudeDir, 'agents', 'a.md'), 'agent');
      writeFileSync(join(claudeDir, 'rules', 'r.md'), 'rule');
      return claudeDir;
    }

    it('returns failure when the target is not a Claude Craft project', async () => {
      const result = await layer.migrate(tempDir, { backup: false });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Not a Claude Craft project');
    });

    it('returns failure with alreadyMigrated when isAlreadyMigrated is true and force is false', async () => {
      seedClaudeCraftProject(tempDir);
      const aiCraftDir = join(tempDir, '.ai-craft');
      mkdirSync(aiCraftDir);
      writeFileSync(join(aiCraftDir, 'ai-craft.yaml'), 'compatibility:\n  migrated: "x"\n');
      // remove aiCraftDir before calling since migrate also checks fs.existsSync(aiCraftDir)
      // Actually migrate checks isAlreadyMigrated first, which requires the file to exist — keep it.
      const result = await layer.migrate(tempDir, { backup: false });
      expect(result.success).toBe(false);
      expect(result.alreadyMigrated).toBe(true);
    });

    it('returns failure when .ai-craft directory already exists without a migrated marker', async () => {
      seedClaudeCraftProject(tempDir);
      mkdirSync(join(tempDir, '.ai-craft'));

      const result = await layer.migrate(tempDir, { backup: false });

      expect(result.success).toBe(false);
      expect(result.alreadyMigrated).toBe(true);
      expect(result.error).toContain('AI Craft already initialized');
    });

    it('performs a full successful migration without backup', async () => {
      seedClaudeCraftProject(tempDir);

      const result = await layer.migrate(tempDir, { backup: false, verbose: false });

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeNull();
      expect(result.filesCopied).toBeGreaterThan(0);
      expect(result.aiCraftMdCreated).toBe(true);
      expect(result.configCreated).toBe(true);
      expect(result.symlinkCreated).toBe(true);
      expect(existsSync(join(tempDir, '.ai-craft', 'AI-CRAFT.md'))).toBe(true);
      expect(existsSync(join(tempDir, '.ai-craft', 'ai-craft.yaml'))).toBe(true);
      expect(existsSync(join(tempDir, '.ai-craft', 'providers'))).toBe(true);
      expect(lstatSync(join(tempDir, '.claude')).isSymbolicLink()).toBe(true);
      expect(layer.getStats().success).toBe(1);
      expect(layer.getStats().total).toBe(1);
    });

    it('creates a backup when backup option is true (default)', async () => {
      seedClaudeCraftProject(tempDir);

      const result = await layer.migrate(tempDir, { verbose: true });

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeTruthy();
      expect(existsSync(result.backupPath)).toBe(true);
      expect(logSpy).toHaveBeenCalled();
    });

    it('allows forcing migration even when already migrated', async () => {
      seedClaudeCraftProject(tempDir);
      // First migration
      await layer.migrate(tempDir, { backup: false });
      layer.resetStats();

      // .ai-craft now exists so a second migrate would normally fail with
      // "AI Craft already initialized" — force alone does not bypass that check,
      // only isAlreadyMigrated. Verify actual behavior:
      const result = await layer.migrate(tempDir, { backup: false, force: true });

      expect(result.success).toBe(false);
      expect(result.alreadyMigrated).toBe(true);
    });
  });

  // ---------------------------------------------------------------------
  // migrateDetailed()
  // ---------------------------------------------------------------------
  describe('migrateDetailed', () => {
    function seedFullClaudeCraftProject(root) {
      const claudeDir = join(root, '.claude');
      mkdirSync(join(claudeDir, 'agents'), { recursive: true });
      mkdirSync(join(claudeDir, 'rules'), { recursive: true });
      mkdirSync(join(claudeDir, 'commands'), { recursive: true });
      mkdirSync(join(claudeDir, 'skills'), { recursive: true });
      mkdirSync(join(claudeDir, 'templates'), { recursive: true });
      mkdirSync(join(claudeDir, 'mcp'), { recursive: true });
      writeFileSync(join(claudeDir, 'CLAUDE.md'), '---\nversion: "8.0.0"\n---\n# Claude-Craft\nBody');
      writeFileSync(join(claudeDir, 'agents', 'a.md'), 'agent');
      writeFileSync(join(claudeDir, 'rules', 'r.md'), 'rule');
      writeFileSync(join(claudeDir, 'commands', 'c.md'), 'command');
      writeFileSync(join(claudeDir, 'skills', 's.md'), 'skill');
      writeFileSync(join(claudeDir, 'templates', 't.md'), 'template');
      writeFileSync(join(claudeDir, 'mcp', 'm.json'), '{}');
      return claudeDir;
    }

    it('returns failure when the target is not a Claude Craft project', async () => {
      const result = await layer.migrateDetailed(tempDir);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Not a Claude Craft project');
    });

    it('migrates all components and returns a detailed breakdown', async () => {
      seedFullClaudeCraftProject(tempDir);

      const result = await layer.migrateDetailed(tempDir);

      expect(result.success).toBe(true);
      expect(result.results.claudeMd.created).toBe(true);
      expect(result.results.config.created).toBe(true);
      expect(result.results.rules.success).toBe(true);
      expect(result.results.rules.migratedCount).toBe(1);
      expect(result.results.agents.migratedCount).toBe(1);
      expect(result.results.commands.migratedCount).toBe(1);
      expect(result.results.skills.migratedCount).toBe(1);
      expect(result.results.templates.migratedCount).toBe(1);
      expect(result.results.mcp.migratedCount).toBe(1);
      expect(result.duration).toBeDefined();
      expect(existsSync(join(tempDir, '.ai-craft', 'providers'))).toBe(true);
      expect(lstatSync(join(tempDir, '.claude')).isSymbolicLink()).toBe(true);

      const configContent = yamlLoad(readFileSync(join(tempDir, '.ai-craft', 'ai-craft.yaml'), 'utf8'));
      expect(configContent.compatibility.migrated).toBeDefined();
      expect(configContent.compatibility.from_claude_craft).toBe(true);

      expect(layer.getStats().success).toBe(1);
    });

    it('handles a project with no optional subdirectories (all skipped)', async () => {
      const claudeDir = join(tempDir, '.claude');
      mkdirSync(claudeDir);
      writeFileSync(claudeDir + '/CLAUDE.md', '# Claude-Craft\nBody');

      const result = await layer.migrateDetailed(tempDir);

      expect(result.success).toBe(true);
      expect(result.results.rules.skipped).toBe(true);
      expect(result.results.agents.skipped).toBe(true);
      expect(result.results.commands.skipped).toBe(true);
      expect(result.results.skills.skipped).toBe(true);
      expect(result.results.templates.skipped).toBe(true);
      expect(result.results.mcp.skipped).toBe(true);
    });
  });
});
