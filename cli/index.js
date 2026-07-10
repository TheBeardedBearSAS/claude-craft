#!/usr/bin/env node

/**
 * AI Craft CLI - Multi-AI Development Framework
 * Interactive installer for AI rules, agents, and commands.
 * Compatible with Vibe, Codex, OpenCode, Claude Code, Cursor, and GitHub Copilot.
 *
 * This is a thin orchestrator that dispatches to focused modules:
 * - banner.js: ASCII art banner and success messages
 * - help.js: Usage help text
 * - installer.js: Interactive and non-interactive installation
 * - ralph.js: Ralph Wiggum continuous loop launcher
 * - ai-provider.js: Multi-AI provider management
 *
 * Usage: npx @ai-craft/core [command] [options]
 * Backward compatible: npx @the-bearded-bear/claude-craft [command] [options]
 *
 * @module cli/index
 */

import readline from 'readline';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

// ANSI colors (shared module)
import colors from './lib/colors.js';
const c = colors;

// Extracted pure modules
import { TECHNOLOGIES, LANGUAGES } from './lib/constants.js';
import { parseArgs } from './lib/parse-args.js';
import { detectProject } from './lib/detect-project.js';

// AI Provider Manager (Multi-AI support)
import { providerManager } from './lib/ai-provider.js';
import { claudeCompat } from './lib/legacy/claude-compat.js';

// Extracted UI modules
import { printBanner } from './lib/banner.js';
import { printHelp } from './lib/help.js';
import { interactiveInstall, runInstallation, autoInstall } from './lib/installer.js';
import { runRalph } from './lib/ralph.js';
import { runCheck } from './lib/check.js';
import { runList } from './lib/list.js';
import { runDoctor } from './lib/doctor.js';
import { runUpdate } from './lib/update.js';
import { runInstallFromUrl } from './lib/install-from-url.js';
import { runSkillAdd, runSkillList, runSkillRemove } from './lib/skill.js';
// Flattener module
import { flatten as flattenCodebaseFn } from './lib/flattener.js';
import { assertSafeTarget, assertWithinDir } from './lib/path-safety.js';

// CLI package root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = path.resolve(__dirname, '..');

// Package version
const { version: VERSION } = JSON.parse(fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf8'));

/**
 * AI Craft CLI - Main class for the multi-AI development framework
 * Supports Vibe, Codex, OpenCode, Claude Code, Cursor, and GitHub Copilot
 */
class AICraftCLI {
  /**
   * Initialize the CLI with default configuration.
   */
  constructor() {
    /** @type {readline.Interface|null} */
    this.rl = null;

    /** @type {CLIConfig} */
    this.config = {
      targetPath: process.cwd(),
      language: 'en',
      technologies: [],
      includeCommon: true,
      includeInfra: false,
      includeProject: true,
      track: null,
      provider: null, // AI provider to use (vibe, codex, opencode, claude, cursor)
      migrate: false, // Whether to migrate from Claude Craft
    };

    /** @type {string} */
    this.currentProvider = null;
  }

  /**
   * Create a readline interface for interactive user input.
   */
  createReadline() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Close the readline interface and release resources.
   */
  closeReadline() {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  /**
   * Prompt the user for input and return the trimmed response.
   * @param {string} question - The prompt text displayed to the user
   * @returns {Promise<string>} The user's trimmed input
   */
  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Detect project characteristics by inspecting files in the target directory.
   * Delegates to the extracted detectProject module.
   * @param {string} targetPath - Absolute path to the project directory
   * @returns {import('./lib/detect-project').DetectedProject}
   */
  detectProject(targetPath) {
    return detectProject(targetPath, { debug: !!process.env.DEBUG });
  }

  /**
   * Parse CLI arguments into a structured object.
   * Delegates to the extracted parseArgs module.
   * @param {string[]} args - Raw command-line arguments (without node and script path)
   * @returns {import('./lib/parse-args').ParsedArgs}
   */
  parseArgs(args) {
    return parseArgs(args);
  }

  /**
   * Main entry point that dispatches to the appropriate command handler.
   * @returns {Promise<void>}
   */
  async run() {
    const args = process.argv.slice(2);

    // Handle --version and -v early
    if (args.includes('--version') || args.includes('-v')) {
      console.log(VERSION);
      return;
    }

    // ERG-01: parseArgs() routes every `--`-prefixed argument into `options`,
    // never into `command`. So `--help` becomes options.help=true with
    // command left null, and the switch's default branch mistakes that for
    // "no command" and launches interactiveInstall — which blocks on stdin
    // and hangs in CI when stdin is closed. `-h` and the bare `help` command
    // already work correctly via the switch below, so only the long flag
    // needs this early, pre-parse check.
    if (args.includes('--help')) {
      await this.printAICraftHelp();
      return;
    }

    // Parse arguments
    const { command, path: targetPath, options } = this.parseArgs(args);

    // Set target path
    // For commands with subcommands (config, mcp, provider), don't use the parsed path
    const commandsWithoutPath = ['config', 'configure', 'mcp', 'mcp-servers', 'provider', 'use'];
    if (commandsWithoutPath.includes(command)) {
      this.config.targetPath = path.resolve(this.config.targetPath || process.cwd());
    } else {
      this.config.targetPath = path.resolve(targetPath || this.config.targetPath);
    }

    // =========================================================================
    // Phase 2: Multi-AI Provider Detection and Configuration
    // =========================================================================

    // Handle --provider option
    if (options.provider) {
      const providerNames = providerManager.getProviderNames();
      if (!providerNames.includes(options.provider)) {
        console.error(
          `${c.red}Error: Unknown AI provider '${options.provider}'. Available: ${providerNames.join(', ')}${c.reset}`
        );
        console.error(`\nSupported providers: Vibe, Codex, OpenCode, Claude Code, Cursor`);
        process.exit(1);
      }
      this.config.provider = options.provider;
      providerManager.setProvider(options.provider);
    }

    // Detect current AI provider
    try {
      this.currentProvider = await providerManager.detectProvider();
      if (options.verbose) {
        console.log(`${c.cyan}🤖 Detected AI provider: ${this.currentProvider}${c.reset}`);
      }
    } catch (error) {
      console.warn(`${c.yellow}⚠️  Could not detect AI provider: ${error.message}${c.reset}`);
      this.currentProvider = 'claude'; // Fallback to Claude for backward compatibility
    }

    // Handle migrate command
    if (options.migrate || command === 'migrate') {
      await this.handleMigration(args, options);
      return;
    }

    // Apply and validate language option
    if (options.lang) {
      if (!LANGUAGES[options.lang]) {
        console.error(
          `${c.red}Error: Unknown language '${options.lang}'. Available: ${Object.keys(LANGUAGES).join(', ')}${c.reset}`
        );
        process.exit(1);
      }
      this.config.language = options.lang;
    }

    // Apply and validate technology option
    if (options.tech) {
      if (!TECHNOLOGIES[options.tech]) {
        console.error(
          `${c.red}Error: Unknown technology '${options.tech}'. Available: ${Object.keys(TECHNOLOGIES).join(', ')}${c.reset}`
        );
        process.exit(1);
      }
      this.config.technologies = [options.tech];
    }

    // Initialize AI Craft in target directory if it doesn't exist
    if (this.currentProvider !== 'claude') {
      await this.initializeAICraft();
    }

    const ctx = { CLI_ROOT, VERSION, provider: this.currentProvider };

    switch (command) {
      case 'install':
        if (options.from) {
          await runInstallFromUrl(options.from, this, ctx);
        } else if (options.auto) {
          await autoInstall(this, ctx);
        } else if (targetPath && options.tech) {
          // Non-interactive install
          await runInstallation(this, ctx);
        } else {
          // Interactive install
          await interactiveInstall(this, ctx);
        }
        break;

      case 'skill': {
        // Skill subcommands take their args positionally; the parseArgs() above
        // would otherwise treat the subcommand as the targetPath.
        const positional = args.filter((a) => !a.startsWith('--')).slice(1);
        const sub = positional[0];
        const arg = positional[1];
        const skillTarget = path.resolve(options.target || process.cwd());
        if (sub === 'add') {
          if (!arg) {
            console.error(`${c.red}Usage: claude-craft skill add <package>${c.reset}`);
            process.exit(1);
          }
          runSkillAdd(arg, skillTarget);
        } else if (sub === 'list') {
          runSkillList(skillTarget);
        } else if (sub === 'remove' || sub === 'rm') {
          if (!arg) {
            console.error(`${c.red}Usage: claude-craft skill remove <short-name>${c.reset}`);
            process.exit(1);
          }
          runSkillRemove(arg, skillTarget);
        } else {
          console.error(`${c.red}Unknown skill subcommand: ${sub || '(none)'}${c.reset}`);
          console.error(`Available: add, list, remove`);
          process.exit(1);
        }
        break;
      }

      case 'check':
        printBanner(VERSION);
        runCheck(this.config.targetPath);
        break;

      case 'list':
        printBanner(VERSION);
        runList(this.config.targetPath);
        break;

      case 'doctor':
        printBanner(VERSION);
        runDoctor(this.config.targetPath);
        break;

      case 'update':
        printBanner(VERSION);
        runUpdate(this.config.targetPath, options, CLI_ROOT);
        break;

      case 'init':
        printBanner(VERSION);
        console.log(`${c.cyan}Workflow initialization is available after installation.${c.reset}`);
        console.log(`Run ${c.bold}/workflow:init${c.reset} in Claude Code.\n`);
        break;

      case 'flatten':
        await this.flattenCodebase(options);
        break;

      case 'ralph':
        await runRalph(this, args.slice(1), options, ctx);
        break;

      case 'kanban': {
        printBanner(VERSION);
        const { runKanban } = await import('./lib/kanban.js');
        await runKanban({ targetPath: this.config.targetPath, options });
        break;
      }

      case 'help':
      case '--help':
      case '-h':
        // ERG-08: printAICraftHelp() already calls printBanner(VERSION)
        // internally, so calling it here too printed the banner twice.
        await this.printAICraftHelp();
        break;

      case 'providers':
        await this.handleProvidersCommand(options);
        break;

      case 'provider-status':
      case 'status':
        await this.handleProviderStatus(options);
        break;

      case 'init-ai-craft':
        await this.initializeAICraft();
        console.log(`${c.green}✅ AI Craft initialized!${c.reset}`);
        console.log(`   Provider: ${this.currentProvider}`);
        console.log(`   Directory: ${path.join(this.config.targetPath, '.ai-craft')}`);
        break;

      case 'provider':
      case 'use': {
        // ERG-03: unlike `mcp <subcommand>`/`config <subcommand>`, args[1] was
        // always treated as a raw provider name, so `provider list/status/use`
        // all failed with "Unknown AI provider 'list'". Dispatch subcommand
        // keywords first, falling back to the original "set provider" behavior.
        const sub = args[1];
        if (sub === 'list') {
          await this.handleProvidersCommand(options);
        } else if (sub === 'status') {
          await this.handleProviderStatus(options);
        } else if (sub === 'use') {
          if (!args[2]) {
            console.error(`${c.red}Usage: ai-craft provider use <provider>${c.reset}`);
            console.error(`Available providers: ${providerManager.getProviderNames().join(', ')}`);
            process.exit(1);
          }
          await this.handleSetProvider(args[2]);
        } else {
          // Set default provider for this project
          if (args.length < 2) {
            console.error(`${c.red}Usage: ai-craft use <provider>${c.reset}`);
            console.error(`Available providers: ${providerManager.getProviderNames().join(', ')}`);
            process.exit(1);
          }
          await this.handleSetProvider(args[1]);
        }
        break;
      }

      case 'mcp':
      case 'mcp-servers': {
        await this.handleMCPCommand(args.slice(1), options);
        break;
      }

      case 'config':
      case 'configure': {
        await this.handleConfigCommand(args.slice(1), options);
        break;
      }

      default:
        if (!command) {
          // No command - run interactive install
          await interactiveInstall(this, ctx);
        } else {
          console.log(`${c.red}Unknown command: ${command}${c.reset}`);
          await this.printAICraftHelp();
          process.exit(1);
        }
    }
  }

  /**
   * Initialize AI Craft in the current directory
   */
  async initializeAICraft() {
    try {
      const result = await providerManager.initProject(this.config.targetPath, {
        provider: this.config.provider || this.currentProvider,
      });

      if (result.success) {
        if (!fs.existsSync(path.join(this.config.targetPath, '.ai-craft', 'AI-CRAFT.md'))) {
          // Copy AI-CRAFT.md if it doesn't exist
          const sourcePath = path.join(CLI_ROOT, '.claude', 'AI-CRAFT.md');
          const destPath = path.join(this.config.targetPath, '.ai-craft', 'AI-CRAFT.md');
          if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
          }
        }
      }

      return result;
    } catch (error) {
      console.warn(`${c.yellow}⚠️  Could not initialize AI Craft: ${error.message}${c.reset}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle migration from Claude Craft to AI Craft
   */
  async handleMigration(args, options) {
    const targetPath = this.config.targetPath;

    console.log(`${c.cyan}🔄 AI Craft Migration Tool${c.reset}\n`);

    // Check if it's a Claude Craft project
    if (!claudeCompat.isClaudeCraftProject(targetPath)) {
      console.log(`${c.yellow}⚠️  This is not a Claude Craft project (no .claude/ directory found).${c.reset}\n`);

      // Offer to initialize AI Craft anyway
      const readline = await import('readline');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

      const answer = await new Promise((resolve) => {
        rl.question(`${c.cyan}Would you like to initialize AI Craft in this directory? (y/N): ${c.reset}`, (ans) => {
          resolve(ans.toLowerCase());
          rl.close();
        });
      });

      if (answer === 'y' || answer === 'yes') {
        await this.initializeAICraft();
        console.log(`${c.green}✅ AI Craft initialized!${c.reset}`);
      } else {
        console.log(`${c.yellow}Skipped.${c.reset}`);
      }
      return;
    }

    console.log(`${c.green}✅ Claude Craft project detected!${c.reset}\n`);
    console.log(`Migration steps:`);
    console.log(`  1. Create .ai-craft/ directory`);
    console.log(`  2. Copy files from .claude/ to .ai-craft/`);
    console.log(`  3. Create AI-CRAFT.md from CLAUDE.md`);
    console.log(`  4. Generate ai-craft.yaml configuration`);
    console.log(`  5. Create symlink .claude/ -> .ai-craft/`);
    console.log(`  6. Initialize subdirectories\n`);

    // Ask for confirmation
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const confirm = await new Promise((resolve) => {
      rl.question(`${c.cyan}Proceed with migration? (Y/n): ${c.reset}`, (ans) => {
        resolve(ans.toLowerCase());
        rl.close();
      });
    });

    if (confirm === 'n' || confirm === 'no') {
      console.log(`${c.yellow}Migration cancelled.${c.reset}`);
      return;
    }

    // Run migration
    console.log(`\n${c.cyan}🔄 Migrating...${c.reset}\n`);

    try {
      const result = await claudeCompat.migrate(targetPath, {
        backup: true,
        verbose: true,
      });

      if (result.success) {
        console.log(`\n${c.green}✅ Migration completed successfully!${c.reset}\n`);
        console.log(`Summary:`);
        console.log(`  - AI Craft directory: ${result.aiCraftDir}`);
        console.log(`  - Files copied: ${result.filesCopied}`);
        console.log(`  - AI-CRAFT.md created: ${result.aiCraftMdCreated ? 'Yes' : 'No'}`);
        console.log(`  - Configuration created: ${result.configCreated ? 'Yes' : 'No'}`);
        console.log(`  - Symlink created: ${result.symlinkCreated ? 'Yes' : 'No'}`);
        console.log(`\n${c.bold}Next steps:${c.reset}`);
        console.log(`  1. Test with your preferred provider:`);
        console.log(`     cd ${targetPath}`);
        console.log(`     vibe --system .ai-craft/AI-CRAFT.md`);
        console.log(`     OR`);
        console.log(`     claude  # (backward compatible)`);
        console.log(`\n  2. Customize your provider configuration:`);
        console.log(`     nano .ai-craft/ai-craft.yaml`);
        console.log(`\n  3. Explore AI Craft commands:`);
        console.log(`     ai-craft --help`);
      } else {
        console.error(`${c.red}❌ Migration failed: ${result.error}${c.reset}`);
        if (result.alreadyMigrated) {
          console.log(`${c.yellow}This project has already been migrated to AI Craft.${c.reset}`);
        }
      }
    } catch (error) {
      console.error(`${c.red}❌ Migration error: ${error.message}${c.reset}`);
      process.exit(1);
    }
  }

  /**
   * Handle providers command
   */
  async handleProvidersCommand(options) {
    const providers = providerManager.getProviderNames();
    const currentProvider = this.currentProvider || (await providerManager.detectProvider());

    console.log(`${c.bold}Available AI Providers:${c.reset}\n`);

    const statusPromises = providers.map(async (name) => {
      const provider = providerManager.getProvider(name);
      const available = (await provider?.isAvailable()) || false;
      const version = available ? await provider.getVersion() : 'not installed';
      const isCurrent = name === currentProvider;

      return { name, available, version, isCurrent };
    });

    const statuses = await Promise.all(statusPromises);

    statuses.forEach(({ name, available, version, isCurrent }) => {
      const marker = isCurrent ? `${c.green}✓${c.reset}` : available ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
      const status = available ? 'available' : 'not installed';
      console.log(`  ${marker} ${name.padEnd(15)} - ${version.padEnd(20)} (${status})`);
    });

    console.log(`\n${c.dim}Primary provider: ${currentProvider}${c.reset}\n`);
    console.log(`Usage:`);
    console.log(`  ai-craft --provider=<name> <command>  Set provider for a single command`);
    console.log(`  ai-craft providers                     List all providers`);
    console.log(`  ai-craft provider-status               Show provider health status`);
  }

  /**
   * Handle provider status command
   */
  async handleProviderStatus(options) {
    console.log(`${c.bold}AI Provider Health Status:${c.reset}\n`);

    const healthStatus = await providerManager.getHealthStatus();

    for (const [name, status] of Object.entries(healthStatus)) {
      const symbol = status.available ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
      const version = status.version || 'unknown';
      const displayName = status.displayName || name;

      console.log(`  ${symbol} ${displayName}`);
      console.log(`     Version: ${version}`);
      console.log(`     Available: ${status.available ? 'Yes' : 'No'}`);

      if (status.health) {
        console.log(`     Health: ${status.health.healthy ? 'Healthy' : 'Unhealthy'} - ${status.health.message}`);
      }

      if (status.error) {
        console.log(`     Error: ${status.error}`);
      }
      console.log('');
    }
  }

  /**
   * Print AI Craft help with multi-provider information
   */
  async printAICraftHelp() {
    printBanner(VERSION);
    printHelp();

    console.log(`\n${c.bold}Multi-AI Provider Support:${c.reset}`);
    console.log(`  AI Craft now supports multiple AI providers!`);
    console.log(`\n  Supported providers:`);
    console.log(`    ${c.green}✓${c.reset} Vibe (Mistral AI)     - https://vibe.mistral.ai`);
    console.log(`    ${c.green}✓${c.reset} Codex (Google)       - https://codex.google.com`);
    console.log(`    ${c.green}✓${c.reset} OpenCode            - https://github.com/create-open-code/open-code`);
    console.log(`    ${c.green}✓${c.reset} Claude Code        - https://code.claude.com`);
    console.log(`    ${c.green}✓${c.reset} Cursor (VSCode)     - https://cursor.com`);
    console.log(`\n  Current provider: ${this.currentProvider || 'auto-detected'}`);
    console.log(`\n  Usage:`);
    console.log(`    ai-craft --provider=vibe install ./my-project`);
    console.log(`    ai-craft migrate ./my-project`);
    console.log(`    ai-craft providers`);
    console.log(`\n  Backward compatible with Claude Craft:`);
    console.log(`    claude-craft install ./my-project  # Still works!`);
  }

  /**
   * Flatten the codebase into a context-optimized markdown summary.
   * @param {Object} options - Flattener options from CLI flags
   * @param {string} [options.output] - Output filename (defaults to CODEBASE_CONTEXT.md)
   * @returns {Promise<void>}
   */
  async flattenCodebase(options) {
    printBanner(VERSION);
    console.log(`${c.bold}Codebase Flattener${c.reset}\n`);
    console.log(`${c.dim}Generating context-optimized summary of your codebase...${c.reset}\n`);

    const targetPath = this.config.targetPath;
    const rawOutput = options.output || 'CODEBASE_CONTEXT.md';

    // CLI-08: validate the output path against system directories (CWE-22).
    // assertSafeTarget resolves the path first, catching relative traversals like
    // /var/../../etc/evil.md that bypass naive string checks.
    const outputFile = assertSafeTarget(rawOutput);

    await flattenCodebaseFn(targetPath, outputFile, options);
  }

  /**
   * Set the default provider for a project
   * @param {string} providerName - Provider name to set as default
   */
  async handleSetProvider(providerName) {
    const providerNames = providerManager.getProviderNames();

    if (!providerNames.includes(providerName)) {
      console.error(
        `${c.red}Error: Unknown AI provider '${providerName}'. Available: ${providerNames.join(', ')}${c.reset}`
      );
      process.exit(1);
    }

    // Set the provider
    providerManager.setProvider(providerName);
    this.config.provider = providerName;
    this.currentProvider = providerName;

    // Save to project configuration
    const configPath = path.join(this.config.targetPath, '.ai-craft', 'ai-craft.yaml');
    const config = providerManager.loadConfig(configPath);
    config.providers = config.providers || {};
    config.providers.primary = providerName;
    providerManager.saveConfig(config, configPath);

    console.log(`${c.green}✅ Default provider set to: ${providerName}${c.reset}`);
    console.log(`${c.cyan}This provider will be used for all commands in this project.${c.reset}`);
    console.log(`\n${c.dim}To override for a single command, use: ai-craft --provider=<name> <command>${c.reset}`);
  }

  /**
   * Handle MCP server commands
   * @param {string[]} args - Command arguments
   * @param {Object} options - Command options
   */
  async handleMCPCommand(args, options) {
    const subcommand = args[0];

    if (!subcommand || subcommand === 'list' || subcommand === 'ls') {
      // List all MCP servers
      await this.listMCPServers();
    } else if (subcommand === 'start') {
      // Start MCP servers for current provider
      const providerName = this.currentProvider || (await providerManager.detectProvider());
      await this.startMCPServers(providerName);
    } else if (subcommand === 'stop') {
      // Stop MCP servers (placeholder - would require process management)
      console.log(`${c.yellow}⚠️  MCP server stopping is not yet implemented.${c.reset}`);
      console.log(`${c.dim}This will be added in a future version.${c.reset}`);
    } else if (subcommand === 'add') {
      // Add a custom MCP server
      if (args.length < 2) {
        console.error(`${c.red}Usage: ai-craft mcp add <server-name> --command=<cmd> --args=<args>${c.reset}`);
        process.exit(1);
      }
      await this.addMCPServer(args[1], options);
    } else {
      console.error(`${c.red}Unknown MCP subcommand: ${subcommand}${c.reset}`);
      console.error(`Available: list, start, stop, add`);
      process.exit(1);
    }
  }

  /**
   * List all MCP servers
   */
  async listMCPServers() {
    const providerName = this.currentProvider || (await providerManager.detectProvider());
    const targetPath = this.config.targetPath;

    console.log(`${c.bold}MCP Servers for ${providerName}:${c.reset}\n`);

    const { builtIn, providerCustom, globalCustom } = await providerManager.getAllMCPServers(providerName, targetPath);

    console.log(`${c.cyan}Built-in Servers:${c.reset}`);
    for (const [name, config] of Object.entries(builtIn)) {
      console.log(`  ${c.green}✓${c.reset} ${name} - ${config.description || 'No description'}`);
    }

    if (Object.keys(providerCustom).length > 0) {
      console.log(`\n${c.cyan}Provider Custom Servers:${c.reset}`);
      for (const [name, config] of Object.entries(providerCustom)) {
        console.log(`  ${c.green}✓${c.reset} ${name} - ${config.description || 'No description'} (${config.source})`);
      }
    }

    if (Object.keys(globalCustom).length > 0) {
      console.log(`\n${c.cyan}Global Custom Servers:${c.reset}`);
      for (const [name, config] of Object.entries(globalCustom)) {
        console.log(`  ${c.green}✓${c.reset} ${name} - ${config.description || 'No description'} (${config.source})`);
      }
    }

    console.log(
      `\n${c.dim}Total: ${Object.keys(builtIn).length + Object.keys(providerCustom).length + Object.keys(globalCustom).length} servers${c.reset}`
    );
  }

  /**
   * Start MCP servers for a provider
   * @param {string} providerName - Provider name
   */
  async startMCPServers(providerName) {
    const targetPath = this.config.targetPath;

    console.log(`${c.bold}Starting MCP Servers for ${providerName}...${c.reset}\n`);

    const result = await providerManager.startAllMCPServers(providerName, targetPath);

    console.log(`${c.green}✅ MCP Servers initialized:${c.reset}`);
    console.log(`   Started: ${Object.keys(result.started).length}`);
    console.log(`   Failed: ${Object.keys(result.failed).length}`);
    console.log(`   Total: ${result.total}`);

    if (Object.keys(result.failed).length > 0) {
      console.log(`\n${c.yellow}⚠️  Failed to start some servers:${c.reset}`);
      for (const [name, info] of Object.entries(result.failed)) {
        console.log(`  ${c.red}✗${c.reset} ${name}: ${info.error}`);
      }
    }
  }

  /**
   * Add a custom MCP server
   * @param {string} serverName - Server name
   * @param {Object} options - Server options
   */
  async addMCPServer(serverName, options) {
    const targetPath = this.config.targetPath;
    const mcpDir = path.join(targetPath, '.ai-craft', 'mcp');

    if (!fs.existsSync(mcpDir)) {
      fs.mkdirSync(mcpDir, { recursive: true });
    }

    // SEC-01: serverName is user input (positional arg of `mcp add <name>`).
    // Without this check a name like `../../escaped-poc` writes the JSON
    // config outside .ai-craft/mcp/ (CWE-22 path traversal).
    let serverPath;
    try {
      serverPath = assertWithinDir(mcpDir, path.join(mcpDir, `${serverName}.json`));
    } catch (error) {
      console.error(`${c.red}Error: Invalid MCP server name '${serverName}': ${error.message}${c.reset}`);
      process.exit(1);
    }

    // ERG-06: without --command the JSON is written with `command: undefined`,
    // which JSON.stringify silently drops, producing an unusable server entry.
    if (!options.command) {
      console.error(`${c.red}Usage: ai-craft mcp add <name> --command=<cmd>${c.reset}`);
      process.exit(1);
    }

    const serverConfig = {
      name: serverName,
      description: options.description || '',
      command: options.command,
      args: options.args ? options.args.split(',') : [],
      env: options.env ? JSON.parse(options.env) : {},
      timeout: parseInt(options.timeout) || 30,
      enabled: true,
      auto_start: true,
    };

    fs.writeFileSync(serverPath, JSON.stringify(serverConfig, null, 2));

    console.log(`${c.green}✅ MCP Server added: ${serverName}${c.reset}`);
    console.log(`   Config: ${serverPath}`);
  }

  /**
   * Handle configuration commands
   * @param {string[]} args - Command arguments
   * @param {Object} options - Command options
   */
  async handleConfigCommand(args, options) {
    const subcommand = args[0];

    if (!subcommand || subcommand === 'show' || subcommand === 'get') {
      // Show current configuration
      await this.showConfig();
    } else if (subcommand === 'set') {
      // Set configuration value
      if (args.length < 3) {
        console.error(`${c.red}Usage: ai-craft config set <key> <value>${c.reset}`);
        process.exit(1);
      }
      await this.setConfig(args[1], args[2]);
    } else if (subcommand === 'edit') {
      // Edit configuration in editor
      await this.editConfig();
    } else {
      console.error(`${c.red}Unknown config subcommand: ${subcommand}${c.reset}`);
      console.error(`Available: show, set, edit`);
      process.exit(1);
    }
  }

  /**
   * Show current configuration
   */
  async showConfig() {
    const configPath = path.join(this.config.targetPath, '.ai-craft', 'ai-craft.yaml');

    let config;
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        config = yamlLoad(content) || {};
      } catch {
        config = {};
      }
    } else {
      config = providerManager.getDefaultConfig();
    }

    console.log(`${c.bold}AI Craft Configuration:${c.reset}\n`);
    console.log(yamlDump(config, { indent: 2 }));
  }

  /**
   * Set configuration value
   * @param {string} key - Configuration key (dot notation)
   * @param {string} value - Value to set
   */
  async setConfig(key, value) {
    const configPath = path.join(this.config.targetPath, '.ai-craft', 'ai-craft.yaml');

    // Use fs directly to read the file to avoid path issues
    let config;
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        config = yamlLoad(content) || {};
      } catch {
        config = {};
      }
    } else {
      config = providerManager.getDefaultConfig();
    }

    // Simple dot notation parsing
    const keys = key.split('.');

    // SEC-02: without this guard, `config set __proto__.polluted 1` walks
    // into Object.prototype and pollutes it for the whole process (CWE-1321).
    const forbiddenKeySegments = new Set(['__proto__', 'constructor', 'prototype']);
    if (keys.some((segment) => forbiddenKeySegments.has(segment))) {
      console.error(
        `${c.red}Error: Invalid configuration key '${key}' — '__proto__', 'constructor', and 'prototype' are reserved.${c.reset}`
      );
      process.exit(1);
    }

    let current = config;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    // Set the value (try to parse as JSON for numbers/booleans)
    try {
      current[keys[keys.length - 1]] = JSON.parse(value);
    } catch {
      current[keys[keys.length - 1]] = value;
    }

    // Save directly
    const yamlContent = yamlDump(config, { indent: 2 });
    fs.writeFileSync(configPath, yamlContent);

    console.log(`${c.green}✅ Configuration set: ${key} = ${value}${c.reset}`);
  }

  /**
   * Edit configuration in editor
   */
  async editConfig() {
    const configPath = path.join(this.config.targetPath, '.ai-craft', 'ai-craft.yaml');

    if (!fs.existsSync(configPath)) {
      // Create default config if it doesn't exist
      const defaultConfig = providerManager.getDefaultConfig();
      providerManager.saveConfig(defaultConfig, configPath);
    }

    // Open in default editor
    const editor = process.env.EDITOR || process.env.VISUAL || 'nano';
    console.log(`${c.cyan}Opening configuration in ${editor}...${c.reset}`);
    console.log(`${c.dim}File: ${configPath}${c.reset}`);

    // Note: In a real implementation, we'd spawn the editor process
    // For now, just show the path
  }
}

// Export class for testing
// Backward compatibility: export both names
export { AICraftCLI as ClaudeCraftCLI, AICraftCLI };

// Run CLI only when executed directly (not imported by tests)
const isDirectRun =
  process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
if (isDirectRun) {
  const cli = new AICraftCLI();
  cli.run().catch((error) => {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}
