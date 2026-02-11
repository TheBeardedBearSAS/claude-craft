/**
 * Ralph Wiggum continuous AI agent loop launcher.
 * @module cli/lib/ralph
 */

import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import c from './colors.js';
import { printBanner } from './banner.js';

/**
 * Launch the Ralph Wiggum continuous AI agent loop.
 * @param {import('../index.js').ClaudeCraftCLI} cli - CLI instance
 * @param {string[]} args - Positional arguments (prompt text after 'ralph' command)
 * @param {Object} options - CLI option flags
 * @param {string} [options.lang] - Language override
 * @param {string} [options.config] - Path to Ralph configuration file
 * @param {string} [options.continue] - Session ID to resume
 * @param {string} [options['max-iterations']] - Maximum iteration count
 * @param {boolean} [options.verbose] - Enable verbose output
 * @param {boolean} [options['dry-run']] - Preview without executing
 * @param {Object} ctx - Context object
 * @param {string} ctx.CLI_ROOT - Absolute path to the CLI package root
 * @param {string} ctx.VERSION - Current package version
 * @returns {Promise<void>}
 */
export async function runRalph(cli, args, options, { CLI_ROOT, VERSION }) {
  printBanner(VERSION);
  console.log(`${c.bold}Ralph Wiggum - Continuous AI Agent Loop${c.reset}\n`);

  // Build ralph.sh path
  const ralphScript = path.join(CLI_ROOT, 'Tools', 'Ralph', 'ralph.sh');

  // Check if script exists
  if (!fs.existsSync(ralphScript)) {
    console.log(`${c.red}Error: Ralph script not found at ${ralphScript}${c.reset}`);
    console.log(`${c.yellow}Make sure you have the full claude-craft installation.${c.reset}`);
    process.exit(1);
  }

  // Build command arguments
  const ralphArgs = [];

  if (options.lang) {
    ralphArgs.push(`--lang=${options.lang}`);
  }
  if (options.config) {
    ralphArgs.push(`--config=${options.config}`);
  }
  if (options.continue) {
    ralphArgs.push(`--continue=${options.continue}`);
  }
  if (options['max-iterations']) {
    ralphArgs.push(`--max-iterations=${options['max-iterations']}`);
  }
  if (options.verbose) {
    ralphArgs.push('--verbose');
  }
  if (options['dry-run']) {
    ralphArgs.push('--dry-run');
  }

  // Add remaining positional arguments (the prompt)
  const promptArgs = args.filter((arg) => !arg.startsWith('--'));
  if (promptArgs.length > 0) {
    ralphArgs.push(promptArgs.join(' '));
  }

  console.log(`${c.dim}Running: bash ${ralphScript} ${ralphArgs.join(' ')}${c.reset}\n`);

  // Execute ralph.sh
  try {
    const ralph = spawn('bash', [ralphScript, ...ralphArgs], {
      stdio: 'inherit',
      cwd: cli.config.targetPath,
    });

    ralph.on('close', (code) => {
      if (code === 0) {
        console.log(`\n${c.green}Ralph session completed successfully.${c.reset}`);
      } else {
        console.log(`\n${c.yellow}Ralph session ended with code ${code}.${c.reset}`);
      }
      process.exit(code);
    });

    ralph.on('error', (err) => {
      console.error(`${c.red}Failed to start Ralph: ${err.message}${c.reset}`);
      process.exit(1);
    });
  } catch (error) {
    console.error(`${c.red}Error running Ralph: ${error.message}${c.reset}`);
    process.exit(1);
  }
}
