#!/usr/bin/env node

/**
 * Claude-Craft CLI
 * Interactive installer for Claude Code rules, agents, and commands.
 *
 * This is a thin orchestrator that dispatches to focused modules:
 * - banner.js: ASCII art banner and success messages
 * - help.js: Usage help text
 * - installer.js: Interactive and non-interactive installation
 * - ralph.js: Ralph Wiggum continuous loop launcher
 *
 * Usage: npx @the-bearded-bear/claude-craft [command] [options]
 *
 * @module cli/index
 */

import readline from 'readline';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ANSI colors (shared module)
import colors from './lib/colors.js';
const c = colors;

// Extracted pure modules
import { TECHNOLOGIES, LANGUAGES } from './lib/constants.js';
import { parseArgs } from './lib/parse-args.js';
import { detectProject } from './lib/detect-project.js';

// Extracted UI modules
import { printBanner } from './lib/banner.js';
import { printHelp } from './lib/help.js';
import { interactiveInstall, runInstallation } from './lib/installer.js';
import { runRalph } from './lib/ralph.js';

// Flattener module
import { flatten as flattenCodebaseFn } from './flattener.js';

// CLI package root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = path.resolve(__dirname, '..');

// Package version
const { version: VERSION } = JSON.parse(fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf8'));

class ClaudeCraftCLI {
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
    };
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

    const { command, path: targetPath, options } = this.parseArgs(args);

    // Apply and validate options
    if (options.lang) {
      if (!LANGUAGES[options.lang]) {
        console.error(
          `${c.red}Error: Unknown language '${options.lang}'. Available: ${Object.keys(LANGUAGES).join(', ')}${c.reset}`
        );
        process.exit(1);
      }
      this.config.language = options.lang;
    }
    if (options.tech) {
      if (!TECHNOLOGIES[options.tech]) {
        console.error(
          `${c.red}Error: Unknown technology '${options.tech}'. Available: ${Object.keys(TECHNOLOGIES).join(', ')}${c.reset}`
        );
        process.exit(1);
      }
      this.config.technologies = [options.tech];
    }
    this.config.targetPath = path.resolve(targetPath || this.config.targetPath);

    const ctx = { CLI_ROOT, VERSION };

    switch (command) {
      case 'install':
        if (targetPath && options.tech) {
          // Non-interactive install
          await runInstallation(this, ctx);
        } else {
          // Interactive install
          await interactiveInstall(this, ctx);
        }
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

      case 'help':
      case '--help':
      case '-h':
        printBanner(VERSION);
        printHelp();
        break;

      default:
        if (!command) {
          // No command - run interactive install
          await interactiveInstall(this, ctx);
        } else {
          console.log(`${c.red}Unknown command: ${command}${c.reset}`);
          printHelp();
          process.exit(1);
        }
    }
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
    const outputFile = options.output || 'CODEBASE_CONTEXT.md';

    await flattenCodebaseFn(targetPath, outputFile, options);
  }
}

// Export class for testing
export { ClaudeCraftCLI };

// Run CLI only when executed directly (not imported by tests)
const isDirectRun =
  process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
if (isDirectRun) {
  const cli = new ClaudeCraftCLI();
  cli.run().catch((error) => {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}
