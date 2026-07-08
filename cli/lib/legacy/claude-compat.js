/**
 * AI Craft - Claude Craft Compatibility Layer
 * 
 * This module provides backward compatibility for existing Claude Craft projects.
 * It allows AI Craft to work seamlessly with projects that were set up with Claude Craft.
 * 
 * This file is part of AI Craft (formerly Claude Craft)
 * Multi-AI Development Framework
 * 
 * @module legacy/claude-compat
 */

import fs from 'fs';
import path from 'path';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

/**
 * Claude Craft Compatibility Layer
 * 
 * Handles:
 * - Detecting Claude Craft projects
 * - Migrating to AI Craft
 * - Symlink management
 * - Legacy configuration loading
 */
export class ClaudeCompatibilityLayer {
  constructor() {
    /** @type {string[]} */
    this.legacyPaths = [
      'CLAUDE.md',
      'INDEX.md',
      'agents/',
      'commands/',
      'skills/',
      'templates/',
      'rules/',
      'checklists/',
      'references/',
      'hooks/',
      'mcp/',
      'settings.json',
      'context.yaml',
    ];
    
    /** @type {string[]} */
    this.legacyDirectories = [
      '.claude',
    ];
    
    /** @type {Object} */
    this.migrationStats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
    };
  }

  /**
   * Check if a path is a Claude Craft project
   * @param {string} projectPath - Path to check
   * @returns {boolean} - Whether it's a Claude Craft project
   */
  isClaudeCraftProject(projectPath) {
    const claudeDir = path.join(projectPath, '.claude');
    return fs.existsSync(claudeDir);
  }

  /**
   * Check if a project has already been migrated to AI Craft
   * @param {string} projectPath - Path to check
   * @returns {boolean} - Whether already migrated
   */
  isAlreadyMigrated(projectPath) {
    const aiCraftDir = path.join(projectPath, '.ai-craft');
    const aiCraftYaml = path.join(aiCraftDir, 'ai-craft.yaml');
    
    if (!fs.existsSync(aiCraftYaml)) {
      return false;
    }
    
    try {
      const content = fs.readFileSync(aiCraftYaml, 'utf8');
      const config = yamlLoad(content);
      return config.compatibility?.migrated !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Migrate a Claude Craft project to AI Craft
   * @param {string} projectPath - Path to the project
   * @param {Object} options - Migration options
   * @returns {Promise<Object>} - Migration result
   */
  async migrate(projectPath, options = {}) {
    const {
      backup = true,
      force = false,
      verbose = false,
    } = options;
    
    const targetPath = path.resolve(projectPath);
    const claudeDir = path.join(targetPath, '.claude');
    const aiCraftDir = path.join(targetPath, '.ai-craft');
    
    // Check if it's a Claude Craft project
    if (!this.isClaudeCraftProject(targetPath)) {
      return {
        success: false,
        error: 'Not a Claude Craft project (no .claude/ directory found)',
        path: targetPath,
      };
    }
    
    // Check if already migrated
    if (!force && this.isAlreadyMigrated(targetPath)) {
      return {
        success: false,
        error: 'Project already migrated to AI Craft',
        alreadyMigrated: true,
        path: targetPath,
      };
    }

    // Check for existing AI Craft directory
    if (fs.existsSync(aiCraftDir)) {
      return {
        success: false,
        error: 'AI Craft already initialized in this directory',
        alreadyMigrated: true,
        path: targetPath,
      };
    }
    
    // Create backup if requested
    let backupPath = null;
    if (backup) {
      backupPath = await this.createBackup(claudeDir);
      if (verbose) {
        console.log(`💾 Backup created: ${backupPath}`);
      }
    }
    
    // Log start
    if (verbose) {
      console.log(`🔄 Migrating Claude Craft project: ${targetPath}`);
    }
    
    try {
      // Step 1: Create .ai-craft directory
      if (verbose) {
        console.log('📁 Creating .ai-craft/ directory...');
      }
      if (!fs.existsSync(aiCraftDir)) {
        fs.mkdirSync(aiCraftDir, { recursive: true });
      }
      
      // Step 2: Copy files from .claude/ to .ai-craft/
      if (verbose) {
        console.log('📋 Copying files from .claude/ to .ai-craft/...');
      }
      const copyResult = await this.copyClaudeFiles(claudeDir, aiCraftDir, verbose);
      
      // Step 3: Create AI-CRAFT.md from CLAUDE.md
      if (verbose) {
        console.log('📄 Creating AI-CRAFT.md from CLAUDE.md...');
      }
      const aiCraftMdResult = this.createAICraftMd(claudeDir, aiCraftDir);
      
      // Step 4: Create ai-craft.yaml configuration
      if (verbose) {
        console.log('⚙️ Creating ai-craft.yaml configuration...');
      }
      const configResult = this.createConfig(claudeDir, aiCraftDir);
      
      // Step 5: Create providers directory
      if (verbose) {
        console.log('📂 Creating providers directory...');
      }
      this.createProvidersDir(aiCraftDir);
      
      // Step 6: Create symlink for backward compatibility
      if (verbose) {
        console.log('🔗 Creating .claude -> .ai-craft symlink...');
      }
      this.createSymlink(aiCraftDir, claudeDir);
      
      // Step 7: Initialize subdirectories
      if (verbose) {
        console.log('📦 Initializing subdirectories...');
      }
      this.initializeSubdirs(aiCraftDir);
      
      // Update stats
      this.migrationStats.total++;
      this.migrationStats.success++;
      
      // Return result
      const result = {
        success: true,
        path: targetPath,
        aiCraftDir,
        claudeDir,
        filesCopied: copyResult.filesCopied,
        aiCraftMdCreated: aiCraftMdResult.created,
        configCreated: configResult.created,
        symlinkCreated: true,
        backupPath,
        timestamp: new Date().toISOString(),
      };
      
      if (verbose) {
        console.log('✅ Migration completed successfully!');
      }
      
      return result;
      
    } catch (error) {
      this.migrationStats.total++;
      this.migrationStats.failed++;
      
      console.error(`❌ Migration failed: ${error.message}`);
      
      // Restore from backup if available
      if (backupPath && fs.existsSync(backupPath)) {
        try {
          this.restoreBackup(backupPath, claudeDir);
          console.log(`🔄 Restored from backup: ${backupPath}`);
        } catch (restoreError) {
          console.error(`❌ Failed to restore from backup: ${restoreError.message}`);
        }
      }
      
      return {
        success: false,
        error: error.message,
        path: targetPath,
        backupPath,
      };
    }
  }

  /**
   * Create a backup of the .claude directory
   * @param {string} claudeDir - Path to .claude directory
   * @returns {Promise<string>} - Path to backup
   */
  async createBackup(claudeDir) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(path.dirname(claudeDir), `.claude-backup-${timestamp}`);
    
    // Copy the entire .claude directory
    this.copyDirSync(claudeDir, backupDir);
    
    return backupDir;
  }

  /**
   * Restore from a backup
   * @param {string} backupPath - Path to backup
   * @param {string} targetDir - Target directory to restore to
   */
  restoreBackup(backupPath, targetDir) {
    // Remove existing directory
    if (fs.existsSync(targetDir)) {
      this.removeDirSync(targetDir);
    }
    
    // Copy from backup
    this.copyDirSync(backupPath, targetDir);
  }

  /**
   * Copy files from .claude/ to .ai-craft/
   * @param {string} srcDir - Source directory (.claude/)
   * @param {string} destDir - Destination directory (.ai-craft/)
   * @param {boolean} verbose - Whether to log progress
   * @returns {Object} - Copy result
   */
  copyClaudeFiles(srcDir, destDir, verbose = false) {
    let filesCopied = 0;
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      
      // Skip CLAUDE.md - we'll handle it separately
      if (entry.name === 'CLAUDE.md') {
        if (verbose) {
          console.log(`  ⏭️  Skipping CLAUDE.md (will be converted to AI-CRAFT.md)`);
        }
        continue;
      }
      
      if (entry.isDirectory()) {
        // Copy directory recursively
        if (verbose) {
          console.log(`  📁 Copying directory: ${entry.name}/`);
        }
        this.copyDirSync(srcPath, destPath);
        filesCopied++;
      } else if (entry.isFile()) {
        // Copy file
        if (verbose) {
          console.log(`  📄 Copying file: ${entry.name}`);
        }
        fs.copyFileSync(srcPath, destPath);
        filesCopied++;
      }
    }
    
    return { filesCopied };
  }

  /**
   * Create AI-CRAFT.md from CLAUDE.md
   * @param {string} claudeDir - Path to .claude directory
   * @param {string} aiCraftDir - Path to .ai-craft directory
   * @returns {Object} - Result
   */
  createAICraftMd(claudeDir, aiCraftDir) {
    const claudeMdPath = path.join(claudeDir, 'CLAUDE.md');
    const aiCraftMdPath = path.join(aiCraftDir, 'AI-CRAFT.md');
    
    if (!fs.existsSync(claudeMdPath)) {
      return { created: false, error: 'CLAUDE.md not found' };
    }
    
    try {
      let content = fs.readFileSync(claudeMdPath, 'utf8');
      
      // Replace Claude-specific references with AI Craft equivalents
      content = this.transformClaudeMd(content);
      
      fs.writeFileSync(aiCraftMdPath, content);
      
      return { created: true, path: aiCraftMdPath };
    } catch (error) {
      return { created: false, error: error.message };
    }
  }

  /**
   * Transform CLAUDE.md content to AI-CRAFT.md format
   * @param {string} content - Original CLAUDE.md content
   * @returns {string} - Transformed content
   */
  transformClaudeMd(content) {
    // Replace header
    content = content.replace(
      /^# Claude-Craft[\s\S]*?^---/m,
      `# AI Craft - Multi-AI Development Framework

**Version:** 1.0.0 | **Providers:** Vibe, Codex, OpenCode, Claude Code, Cursor, GitHub Copilot  
**Legacy:** Compatible with existing Claude Craft installations

A comprehensive AI-assisted development framework compatible with **multiple AI providers**. This framework extends the proven Claude Craft methodology to work seamlessly with any supported AI.

---
`
    );
    
    // Replace references
    const replacements = [
      [/Claude Code/g, 'Multi-AI'],
      [/claude-craft/g, 'ai-craft'],
      [/@the-bearded-bear\/claude-craft/g, '@ai-craft/core'],
      [/\.claude\//g, '.ai-craft/'],
      [/CLAUDE\.md/g, 'AI-CRAFT.md'],
      [/a comprehensive framework for AI-assisted development with Claude Code/g, 
        'a comprehensive multi-AI development framework'],
      [/Install standardized rules, agents, and commands for your projects\./g, 
        'Install standardized rules, agents, and commands for your projects across any AI provider.'],
    ];
    
    for (const [pattern, replacement] of replacements) {
      content = content.replace(pattern, replacement);
    }
    
    return content;
  }

  /**
   * Create ai-craft.yaml configuration
   * @param {string} claudeDir - Path to .claude directory
   * @param {string} aiCraftDir - Path to .ai-craft directory
   * @returns {Object} - Result
   */
  createConfig(claudeDir, aiCraftDir) {
    const configPath = path.join(aiCraftDir, 'ai-craft.yaml');
    
    // Load existing CLAUDE.md to extract some info
    const claudeMdPath = path.join(claudeDir, 'CLAUDE.md');
    let config = this.getDefaultConfig();
    
    if (fs.existsSync(claudeMdPath)) {
      try {
        // Try to load frontmatter from CLAUDE.md
        const content = fs.readFileSync(claudeMdPath, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        
        if (frontmatterMatch) {
          const frontmatter = yamlLoad(frontmatterMatch[1]);
          // Extract version if available
          if (frontmatter.version) {
            config.compatibility = config.compatibility || {};
            config.compatibility.claude_craft_version = frontmatter.version;
          }
        }
      } catch {
        // Ignore errors in frontmatter parsing
      }
    }
    
    // Mark as migrated
    config.compatibility = config.compatibility || {};
    config.compatibility.migrated = new Date().toISOString();
    config.compatibility.auto_migrate = false;
    
    try {
      const yamlContent = yamlDump(config, { indent: 2 });
      fs.writeFileSync(configPath, yamlContent);
      return { created: true, path: configPath };
    } catch (error) {
      return { created: false, error: error.message };
    }
  }

  /**
   * Create providers directory
   * @param {string} aiCraftDir - Path to .ai-craft directory
   */
  createProvidersDir(aiCraftDir) {
    const providersDir = path.join(aiCraftDir, 'providers');
    if (!fs.existsSync(providersDir)) {
      fs.mkdirSync(providersDir, { recursive: true });
    }
  }

  /**
   * Create symlink from .claude to .ai-craft
   * @param {string} aiCraftDir - Path to .ai-craft directory
   * @param {string} claudeDir - Path to .claude directory
   */
  createSymlink(aiCraftDir, claudeDir) {
    // Remove existing .claude directory first
    if (fs.existsSync(claudeDir)) {
      this.removeDirSync(claudeDir);
    }
    
    // Create symlink
    fs.symlinkSync(aiCraftDir, claudeDir, 'dir');
  }

  /**
   * Initialize subdirectories in .ai-craft/
   * @param {string} aiCraftDir - Path to .ai-craft directory
   */
  initializeSubdirs(aiCraftDir) {
    const subDirs = [
      'agents',
      'commands',
      'skills',
      'templates',
      'memory',
      'logs',
      'hooks',
    ];
    
    for (const subDir of subDirs) {
      const dirPath = path.join(aiCraftDir, subDir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
  }

  /**
   * Get default AI Craft configuration
   * @returns {Object} - Default configuration
   */
  getDefaultConfig() {
    return {
      version: '1.0.0',
      providers: {
        primary: 'claude',
        fallback: ['vibe', 'codex', 'opencode'],
      },
      memory: {
        enabled: true,
        scope: 'project',
        storage: 'file',
      },
      hooks: {
        enabled: true,
        providers: ['mcp', 'webhook', 'plugin'],
      },
      optimization: {
        prompt_caching: true,
        context_forking: true,
        model_routing: 'auto',
      },
      compatibility: {
        claude_craft: true,
        legacy_hooks: true,
      },
      security: {
        api_key_validation: true,
        hook_sandboxing: true,
        max_execution_time: 3600,
      },
    };
  }

  /**
   * Load legacy Claude Craft configuration
   * @param {string} projectPath - Path to project
   * @returns {Object} - Loaded configuration
   */
  loadLegacyConfig(projectPath) {
    const claudeDir = path.join(projectPath, '.claude');
    const claudeMdPath = path.join(claudeDir, 'CLAUDE.md');
    const settingsPath = path.join(claudeDir, 'settings.json');
    
    const config = {};
    
    // Try to load CLAUDE.md frontmatter
    if (fs.existsSync(claudeMdPath)) {
      try {
        const content = fs.readFileSync(claudeMdPath, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        
        if (frontmatterMatch) {
          Object.assign(config, yamlLoad(frontmatterMatch[1]));
        }
      } catch {
        // Ignore errors
      }
    }
    
    // Try to load settings.json
    if (fs.existsSync(settingsPath)) {
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        config.settings = settings;
      } catch {
        // Ignore errors
      }
    }
    
    return config;
  }

  /**
   * Copy directory recursively (synchronous)
   * @param {string} src - Source path
   * @param {string} dest - Destination path
   */
  copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        this.copyDirSync(srcPath, destPath);
      } else if (entry.isFile()) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Remove directory recursively (synchronous)
   * @param {string} dirPath - Directory path
   */
  removeDirSync(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }
    
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        this.removeDirSync(entryPath);
      } else if (entry.isFile()) {
        fs.unlinkSync(entryPath);
      }
    }
    
    fs.rmdirSync(dirPath);
  }

  /**
   * Get migration statistics
   * @returns {Object} - Migration statistics
   */
  getStats() {
    return { ...this.migrationStats };
  }

  /**
   * Reset migration statistics
   */
  resetStats() {
    this.migrationStats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
    };
  }

  // =========================================================================
  // Component Migration Methods
  // =========================================================================

  /**
   * Migrate rules from Claude Craft to AI Craft
   * @param {string} claudeDir - Source .claude directory
   * @param {string} aiCraftDir - Destination .ai-craft directory
   * @returns {Object} - Migration result
   */
  migrateRules(claudeDir, aiCraftDir) {
    const rulesDir = path.join(claudeDir, 'rules');
    const destRulesDir = path.join(aiCraftDir, 'rules');
    
    if (!fs.existsSync(rulesDir)) {
      return { success: true, skipped: true, message: 'No rules directory found' };
    }
    
    const entries = fs.readdirSync(rulesDir, { withFileTypes: true });
    let migratedCount = 0;
    let errorCount = 0;
    
    // Create destination directory
    if (!fs.existsSync(destRulesDir)) {
      fs.mkdirSync(destRulesDir, { recursive: true });
    }
    
    // Create provider-specific subdirectories
    const providerNames = ['vibe', 'codex', 'opencode', 'claude', 'cursor'];
    for (const providerName of providerNames) {
      const providerRulesDir = path.join(destRulesDir, providerName);
      if (!fs.existsSync(providerRulesDir)) {
        fs.mkdirSync(providerRulesDir, { recursive: true });
      }
    }
    
    // Copy rules to each provider directory
    for (const entry of entries) {
      const srcPath = path.join(rulesDir, entry.name);
      const destPath = path.join(destRulesDir, 'claude', entry.name);
      
      try {
        if (entry.isDirectory()) {
          this.copyDirSync(srcPath, destPath);
        } else if (entry.isFile()) {
          fs.copyFileSync(srcPath, destPath);
        }
        migratedCount++;
      } catch (error) {
        errorCount++;
        console.warn(`⚠️  Failed to migrate rule: ${entry.name} - ${error.message}`);
      }
    }
    
    return {
      success: errorCount === 0,
      migratedCount,
      errorCount,
      source: rulesDir,
      destination: destRulesDir,
    };
  }

  /**
   * Migrate agents from Claude Craft to AI Craft
   * @param {string} claudeDir - Source .claude directory
   * @param {string} aiCraftDir - Destination .ai-craft directory
   * @returns {Object} - Migration result
   */
  migrateAgents(claudeDir, aiCraftDir) {
    const agentsDir = path.join(claudeDir, 'agents');
    const destAgentsDir = path.join(aiCraftDir, 'agents');
    
    if (!fs.existsSync(agentsDir)) {
      return { success: true, skipped: true, message: 'No agents directory found' };
    }
    
    const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
    let migratedCount = 0;
    let errorCount = 0;
    
    // Create destination directory
    if (!fs.existsSync(destAgentsDir)) {
      fs.mkdirSync(destAgentsDir, { recursive: true });
    }
    
    // Copy agents (they're generally provider-agnostic)
    for (const entry of entries) {
      const srcPath = path.join(agentsDir, entry.name);
      const destPath = path.join(destAgentsDir, entry.name);
      
      try {
        if (entry.isDirectory()) {
          this.copyDirSync(srcPath, destPath);
        } else if (entry.isFile()) {
          fs.copyFileSync(srcPath, destPath);
        }
        migratedCount++;
      } catch (error) {
        errorCount++;
        console.warn(`⚠️  Failed to migrate agent: ${entry.name} - ${error.message}`);
      }
    }
    
    return {
      success: errorCount === 0,
      migratedCount,
      errorCount,
      source: agentsDir,
      destination: destAgentsDir,
    };
  }

  /**
   * Migrate commands from Claude Craft to AI Craft
   * @param {string} claudeDir - Source .claude directory
   * @param {string} aiCraftDir - Destination .ai-craft directory
   * @returns {Object} - Migration result
   */
  migrateCommands(claudeDir, aiCraftDir) {
    const commandsDir = path.join(claudeDir, 'commands');
    const destCommandsDir = path.join(aiCraftDir, 'commands');
    
    if (!fs.existsSync(commandsDir)) {
      return { success: true, skipped: true, message: 'No commands directory found' };
    }
    
    const entries = fs.readdirSync(commandsDir, { withFileTypes: true });
    let migratedCount = 0;
    let errorCount = 0;
    
    // Create destination directory
    if (!fs.existsSync(destCommandsDir)) {
      fs.mkdirSync(destCommandsDir, { recursive: true });
    }
    
    // Copy commands
    for (const entry of entries) {
      const srcPath = path.join(commandsDir, entry.name);
      const destPath = path.join(destCommandsDir, entry.name);
      
      try {
        if (entry.isDirectory()) {
          // Migrate command directory with provider-specific adaptations
          this.migrateCommandDirectory(srcPath, destPath);
        } else if (entry.isFile()) {
          fs.copyFileSync(srcPath, destPath);
        }
        migratedCount++;
      } catch (error) {
        errorCount++;
        console.warn(`⚠️  Failed to migrate command: ${entry.name} - ${error.message}`);
      }
    }
    
    return {
      success: errorCount === 0,
      migratedCount,
      errorCount,
      source: commandsDir,
      destination: destCommandsDir,
    };
  }

  /**
   * Migrate a single command directory with provider adaptations
   * @param {string} srcPath - Source command directory
   * @param {string} destPath - Destination command directory
   */
  migrateCommandDirectory(srcPath, destPath) {
    const entries = fs.readdirSync(srcPath, { withFileTypes: true });
    
    // Create destination directory
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    // Copy all files
    for (const entry of entries) {
      const srcFile = path.join(srcPath, entry.name);
      const destFile = path.join(destPath, entry.name);
      
      if (entry.isDirectory()) {
        this.copyDirSync(srcFile, destFile);
      } else if (entry.isFile()) {
        // For markdown files, replace Claude-specific references
        if (entry.name.endsWith('.md')) {
          let content = fs.readFileSync(srcFile, 'utf8');
          content = this.transformClaudeContent(content);
          fs.writeFileSync(destFile, content);
        } else {
          fs.copyFileSync(srcFile, destFile);
        }
      }
    }
  }

  /**
   * Transform Claude-specific content to AI Craft
   * @param {string} content - Original content
   * @returns {string} - Transformed content
   */
  transformClaudeContent(content) {
    // Replace Claude-specific references
    const replacements = [
      [/Claude Code/g, 'AI Provider'],
      [/claude-craft/g, 'ai-craft'],
      [/@the-bearded-bear\/claude-craft/g, '@ai-craft/core'],
      [/\.claude\//g, '.ai-craft/'],
      [/CLAUDE\.md/g, 'AI-CRAFT.md'],
      [/Claude Craft/g, 'AI Craft'],
    ];
    
    for (const [pattern, replacement] of replacements) {
      content = content.replace(pattern, replacement);
    }
    
    return content;
  }

  /**
   * Migrate skills from Claude Craft to AI Craft
   * @param {string} claudeDir - Source .claude directory
   * @param {string} aiCraftDir - Destination .ai-craft directory
   * @returns {Object} - Migration result
   */
  migrateSkills(claudeDir, aiCraftDir) {
    const skillsDir = path.join(claudeDir, 'skills');
    const destSkillsDir = path.join(aiCraftDir, 'skills');
    
    if (!fs.existsSync(skillsDir)) {
      return { success: true, skipped: true, message: 'No skills directory found' };
    }
    
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    let migratedCount = 0;
    let errorCount = 0;
    
    // Create destination directory
    if (!fs.existsSync(destSkillsDir)) {
      fs.mkdirSync(destSkillsDir, { recursive: true });
    }
    
    // Copy skills
    for (const entry of entries) {
      const srcPath = path.join(skillsDir, entry.name);
      const destPath = path.join(destSkillsDir, entry.name);
      
      try {
        if (entry.isDirectory()) {
          this.copyDirSync(srcPath, destPath);
        } else if (entry.isFile()) {
          fs.copyFileSync(srcPath, destPath);
        }
        migratedCount++;
      } catch (error) {
        errorCount++;
        console.warn(`⚠️  Failed to migrate skill: ${entry.name} - ${error.message}`);
      }
    }
    
    return {
      success: errorCount === 0,
      migratedCount,
      errorCount,
      source: skillsDir,
      destination: destSkillsDir,
    };
  }

  /**
   * Migrate templates from Claude Craft to AI Craft
   * @param {string} claudeDir - Source .claude directory
   * @param {string} aiCraftDir - Destination .ai-craft directory
   * @returns {Object} - Migration result
   */
  migrateTemplates(claudeDir, aiCraftDir) {
    const templatesDir = path.join(claudeDir, 'templates');
    const destTemplatesDir = path.join(aiCraftDir, 'templates');
    
    if (!fs.existsSync(templatesDir)) {
      return { success: true, skipped: true, message: 'No templates directory found' };
    }
    
    const entries = fs.readdirSync(templatesDir, { withFileTypes: true });
    let migratedCount = 0;
    let errorCount = 0;
    
    // Create destination directory
    if (!fs.existsSync(destTemplatesDir)) {
      fs.mkdirSync(destTemplatesDir, { recursive: true });
    }
    
    // Create provider-specific subdirectories
    const providerNames = ['vibe', 'codex', 'opencode', 'claude', 'cursor'];
    for (const providerName of providerNames) {
      const providerTemplatesDir = path.join(destTemplatesDir, providerName);
      if (!fs.existsSync(providerTemplatesDir)) {
        fs.mkdirSync(providerTemplatesDir, { recursive: true });
      }
    }
    
    // Copy templates to each provider directory
    for (const entry of entries) {
      const srcPath = path.join(templatesDir, entry.name);
      const destPath = path.join(destTemplatesDir, 'claude', entry.name);
      
      try {
        if (entry.isDirectory()) {
          this.copyDirSync(srcPath, destPath);
        } else if (entry.isFile()) {
          // Transform template content
          if (entry.name.endsWith('.md')) {
            let content = fs.readFileSync(srcPath, 'utf8');
            content = this.transformClaudeContent(content);
            fs.writeFileSync(destPath, content);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
        migratedCount++;
      } catch (error) {
        errorCount++;
        console.warn(`⚠️  Failed to migrate template: ${entry.name} - ${error.message}`);
      }
    }
    
    return {
      success: errorCount === 0,
      migratedCount,
      errorCount,
      source: templatesDir,
      destination: destTemplatesDir,
    };
  }

  /**
   * Migrate MCP servers from Claude Craft to AI Craft
   * @param {string} claudeDir - Source .claude directory
   * @param {string} aiCraftDir - Destination .ai-craft directory
   * @returns {Object} - Migration result
   */
  migrateMCP(claudeDir, aiCraftDir) {
    const mcpDir = path.join(claudeDir, 'mcp');
    const destMCPDir = path.join(aiCraftDir, 'mcp');
    
    if (!fs.existsSync(mcpDir)) {
      return { success: true, skipped: true, message: 'No MCP directory found' };
    }
    
    // Create destination directory
    if (!fs.existsSync(destMCPDir)) {
      fs.mkdirSync(destMCPDir, { recursive: true });
    }
    
    // Copy MCP configurations
    const entries = fs.readdirSync(mcpDir, { withFileTypes: true });
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const entry of entries) {
      const srcPath = path.join(mcpDir, entry.name);
      const destPath = path.join(destMCPDir, entry.name);
      
      try {
        if (entry.isDirectory()) {
          this.copyDirSync(srcPath, destPath);
        } else if (entry.isFile()) {
          fs.copyFileSync(srcPath, destPath);
        }
        migratedCount++;
      } catch (error) {
        errorCount++;
        console.warn(`⚠️  Failed to migrate MCP config: ${entry.name} - ${error.message}`);
      }
    }
    
    return {
      success: errorCount === 0,
      migratedCount,
      errorCount,
      source: mcpDir,
      destination: destMCPDir,
    };
  }

  /**
   * Perform a detailed migration with component-by-component breakdown
   * @param {string} projectPath - Path to the project
   * @param {Object} options - Migration options
   * @returns {Promise<Object>} - Detailed migration result
   */
  async migrateDetailed(projectPath, options = {}) {
    const targetPath = path.resolve(projectPath);
    const claudeDir = path.join(targetPath, '.claude');
    const aiCraftDir = path.join(targetPath, '.ai-craft');
    
    // Check if it's a Claude Craft project
    if (!this.isClaudeCraftProject(targetPath)) {
      return {
        success: false,
        error: 'Not a Claude Craft project (no .claude/ directory found)',
        path: targetPath,
      };
    }
    
    // Create .ai-craft directory if it doesn't exist
    if (!fs.existsSync(aiCraftDir)) {
      fs.mkdirSync(aiCraftDir, { recursive: true });
    }
    
    const results = {};
    const startTime = Date.now();
    
    // Migrate each component
    console.log(`🔄 Migrating AI Craft components...\n`);
    
    // 1. Migrate CLAUDE.md to AI-CRAFT.md
    console.log(`  📄 Migrating CLAUDE.md...`);
    results.claudeMd = this.createAICraftMd(claudeDir, aiCraftDir);
    console.log(`     ${results.claudeMd.created ? '✅' : '⚠️ '} AI-CRAFT.md`);
    
    // 2. Migrate configuration
    console.log(`  ⚙️  Migrating configuration...`);
    results.config = this.createConfig(claudeDir, aiCraftDir);
    console.log(`     ${results.config.created ? '✅' : '⚠️ '} ai-craft.yaml`);
    
    // 3. Migrate rules
    console.log(`  📜 Migrating rules...`);
    results.rules = this.migrateRules(claudeDir, aiCraftDir);
    console.log(`     ${results.rules.success ? '✅' : '⚠️ '} ${results.rules.migratedCount || 0} rules`);
    
    // 4. Migrate agents
    console.log(`  🤖 Migrating agents...`);
    results.agents = this.migrateAgents(claudeDir, aiCraftDir);
    console.log(`     ${results.agents.success ? '✅' : '⚠️ '} ${results.agents.migratedCount || 0} agents`);
    
    // 5. Migrate commands
    console.log(`  ⚡ Migrating commands...`);
    results.commands = this.migrateCommands(claudeDir, aiCraftDir);
    console.log(`     ${results.commands.success ? '✅' : '⚠️ '} ${results.commands.migratedCount || 0} commands`);
    
    // 6. Migrate skills
    console.log(`  🎯 Migrating skills...`);
    results.skills = this.migrateSkills(claudeDir, aiCraftDir);
    console.log(`     ${results.skills.success ? '✅' : '⚠️ '} ${results.skills.migratedCount || 0} skills`);
    
    // 7. Migrate templates
    console.log(`  📋 Migrating templates...`);
    results.templates = this.migrateTemplates(claudeDir, aiCraftDir);
    console.log(`     ${results.templates.success ? '✅' : '⚠️ '} ${results.templates.migratedCount || 0} templates`);
    
    // 8. Migrate MCP
    console.log(`  🔗 Migrating MCP servers...`);
    results.mcp = this.migrateMCP(claudeDir, aiCraftDir);
    console.log(`     ${results.mcp.success ? '✅' : '⚠️ '} ${results.mcp.migratedCount || 0} MCP configs`);
    
    // 9. Create subdirectories
    console.log(`  📦 Creating subdirectories...`);
    this.initializeSubdirs(aiCraftDir);
    console.log(`     ✅ Subdirectories created`);
    
    // 10. Create providers directory structure
    console.log(`  🎨 Creating providers directory...`);
    this.createProvidersDir(aiCraftDir);
    console.log(`     ✅ Providers directory created`);
    
    // 11. Create symlink for backward compatibility
    console.log(`  🔗 Creating backward compatibility symlink...`);
    this.createSymlink(aiCraftDir, claudeDir);
    console.log(`     ✅ .claude -> .ai-craft symlink created`);
    
    // Mark as migrated
    const configPath = path.join(aiCraftDir, 'ai-craft.yaml');
    if (fs.existsSync(configPath)) {
      try {
        let config = yamlLoad(fs.readFileSync(configPath, 'utf8'));
        config.compatibility = config.compatibility || {};
        config.compatibility.migrated = new Date().toISOString();
        config.compatibility.auto_migrate = false;
        config.compatibility.from_claude_craft = true;
        
        fs.writeFileSync(configPath, yamlDump(config, { indent: 2 }));
      } catch {
        // Ignore errors
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Update stats
    this.migrationStats.total++;
    this.migrationStats.success++;
    
    return {
      success: true,
      path: targetPath,
      aiCraftDir,
      claudeDir,
      results,
      duration,
      timestamp: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const claudeCompat = new ClaudeCompatibilityLayer();
