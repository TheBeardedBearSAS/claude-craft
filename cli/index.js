#!/usr/bin/env node

/**
 * Claude-Craft CLI
 * Interactive installer for Claude Code rules, agents, and commands
 *
 * Usage: npx @the-bearded-bear/claude-craft [command] [options]
 */

const readline = require('readline');
const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI colors (shared module)
const colors = require('./lib/colors');
const c = colors;

// Extracted pure modules
const { TECHNOLOGIES, LANGUAGES } = require('./lib/constants');
const { parseArgs } = require('./lib/parse-args');
const { detectProject } = require('./lib/detect-project');

// CLI package root
const CLI_ROOT = path.resolve(__dirname, '..');

// Package version
const { version: VERSION } = require(path.join(CLI_ROOT, 'package.json'));

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
   * Print the ASCII art banner with version information.
   */
  printBanner() {
    console.log(`
${c.cyan}${c.bold}╔═══════════════════════════════════════════════════════════════╗${c.reset}
${c.cyan}${c.bold}║${c.reset}                                                               ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold}██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗${c.reset}        ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold}██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝${c.reset}        ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold}██║     ██║     ███████║██║   ██║██║  ██║█████╗${c.reset}          ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold}██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝${c.reset}          ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold}╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗${c.reset}        ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold} ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝${c.reset}        ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}                                                               ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold}██████╗██████╗  █████╗ ███████╗████████╗${c.reset}                ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold}██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝${c.reset}                ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold}██║     ██████╔╝███████║█████╗     ██║${c.reset}                   ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold}██║     ██╔══██╗██╔══██║██╔══╝     ██║${c.reset}                   ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold}╚██████╗██║  ██║██║  ██║██║        ██║${c.reset}                   ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold} ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝${c.reset}                   ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}                                                               ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.dim}AI-Assisted Development Framework for Claude Code${c.reset}          ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.dim}Version ${VERSION}${c.reset}${' '.repeat(Math.max(0, 46 - VERSION.length))}${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}                                                               ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}╚═══════════════════════════════════════════════════════════════╝${c.reset}
`);
  }

  /**
   * Print the CLI usage help with commands, options, and examples.
   */
  printHelp() {
    console.log(`
${c.bold}Usage:${c.reset} npx @the-bearded-bear/claude-craft [command] [options]

${c.bold}Commands:${c.reset}
  ${c.green}install${c.reset}              Interactive installation wizard
  ${c.green}install <path>${c.reset}       Install to specific directory
  ${c.green}init${c.reset}                 Initialize workflow in current project
  ${c.green}flatten${c.reset}              Generate flattened codebase summary
  ${c.green}ralph${c.reset}                Run Ralph Wiggum continuous loop
  ${c.green}help${c.reset}                 Show this help message

${c.bold}Options:${c.reset}
  ${c.yellow}--lang=XX${c.reset}            Language (en, fr, es, de, pt)
  ${c.yellow}--tech=NAME${c.reset}          Technology (${Object.keys(TECHNOLOGIES).join(', ')})
  ${c.yellow}--force${c.reset}              Overwrite existing files
  ${c.yellow}--quick${c.reset}              Quick Flow track (bug fixes)
  ${c.yellow}--standard${c.reset}           Standard track (features)
  ${c.yellow}--enterprise${c.reset}         Enterprise track (platforms)

${c.bold}Examples:${c.reset}
  ${c.dim}# Interactive installation${c.reset}
  npx @the-bearded-bear/claude-craft install

  ${c.dim}# Install Symfony rules in French${c.reset}
  npx @the-bearded-bear/claude-craft install ~/my-project --tech=symfony --lang=fr

  ${c.dim}# Initialize workflow${c.reset}
  npx @the-bearded-bear/claude-craft init --standard

  ${c.dim}# Flatten codebase for context${c.reset}
  npx @the-bearded-bear/claude-craft flatten --output=context.md

  ${c.dim}# Run Ralph continuous loop${c.reset}
  npx @the-bearded-bear/claude-craft ralph "Implement user authentication"

${c.bold}Technologies:${c.reset}
${Object.entries(TECHNOLOGIES).map(([key, val]) => `  ${c.cyan}${key.padEnd(12)}${c.reset} ${val.desc}`).join('\n')}

${c.bold}Languages:${c.reset}
${Object.entries(LANGUAGES).map(([key, val]) => `  ${c.cyan}${key}${c.reset} - ${val}`).join('\n')}
`);
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
   * Run the interactive installation wizard with 5-step user prompts.
   * @returns {Promise<void>}
   */
  async interactiveInstall() {
    this.createReadline();
    this.printBanner();

    console.log(`${c.bold}Welcome to Claude-Craft Interactive Installer${c.reset}\n`);

    try {
      // Step 1: Target path
      console.log(`${c.cyan}[1/5]${c.reset} ${c.bold}Target Directory${c.reset}`);
      const defaultPath = process.cwd();
      const targetInput = await this.prompt(`  Enter path (${c.dim}${defaultPath}${c.reset}): `);
      this.config.targetPath = targetInput || defaultPath;

      // Resolve and validate path
      this.config.targetPath = path.resolve(this.config.targetPath);
      if (!fs.existsSync(this.config.targetPath)) {
        console.log(`  ${c.yellow}Directory doesn't exist. Create it? (y/n)${c.reset}`);
        const create = await this.prompt('  ');
        if (create.toLowerCase() === 'y') {
          fs.mkdirSync(this.config.targetPath, { recursive: true });
          console.log(`  ${c.green}Created: ${this.config.targetPath}${c.reset}`);
        } else {
          console.log(`  ${c.red}Aborted.${c.reset}`);
          this.closeReadline();
          return;
        }
      }

      // Detect project
      console.log(`\n  ${c.dim}Analyzing project...${c.reset}`);
      const detected = this.detectProject(this.config.targetPath);

      if (detected.suggestedTechs.length > 0) {
        console.log(`  ${c.green}Detected:${c.reset} ${detected.suggestedTechs.join(', ')}`);
      }
      if (detected.hasClaude) {
        console.log(`  ${c.yellow}Existing .claude/ found - will update${c.reset}`);
      }

      // Step 2: Language
      console.log(`\n${c.cyan}[2/5]${c.reset} ${c.bold}Language${c.reset}`);
      console.log(`  ${Object.entries(LANGUAGES).map(([k, v], i) => `${i + 1}) ${k} - ${v}`).join('\n  ')}`);
      const langInput = await this.prompt(`  Select (1-5, default: 1): `);
      const langKeys = Object.keys(LANGUAGES);
      const langIndex = parseInt(langInput) - 1;
      this.config.language = langKeys[langIndex] || 'en';
      console.log(`  ${c.green}Selected: ${LANGUAGES[this.config.language]}${c.reset}`);

      // Step 3: Technologies
      console.log(`\n${c.cyan}[3/5]${c.reset} ${c.bold}Technologies${c.reset}`);
      console.log(`  ${Object.entries(TECHNOLOGIES).map(([k, v], i) => `${i + 1}) ${k.padEnd(12)} - ${v.desc}`).join('\n  ')}`);
      console.log(`  ${c.dim}Enter numbers separated by spaces (e.g., "1 2" for Symfony + Flutter)${c.reset}`);

      // Pre-select detected technologies
      const techKeys = Object.keys(TECHNOLOGIES);
      const preSelected = detected.suggestedTechs.map(t => techKeys.indexOf(t) + 1).filter(i => i > 0);
      const defaultTechs = preSelected.length > 0 ? preSelected.join(' ') : '1';

      const techInput = await this.prompt(`  Select (default: ${defaultTechs}): `);
      const techIndices = (techInput || defaultTechs).split(/\s+/).map(n => parseInt(n) - 1);
      this.config.technologies = techIndices.filter(i => i >= 0 && i < techKeys.length).map(i => techKeys[i]);
      console.log(`  ${c.green}Selected: ${this.config.technologies.join(', ') || 'common only'}${c.reset}`);

      // Step 4: Additional options
      console.log(`\n${c.cyan}[4/5]${c.reset} ${c.bold}Additional Components${c.reset}`);

      const infraInput = await this.prompt(`  Include Docker/Infrastructure rules? (y/N): `);
      this.config.includeInfra = infraInput.toLowerCase() === 'y';

      const projectInput = await this.prompt(`  Include Project Management commands? (Y/n): `);
      this.config.includeProject = projectInput.toLowerCase() !== 'n';

      // Step 5: Confirm
      console.log(`\n${c.cyan}[5/5]${c.reset} ${c.bold}Confirmation${c.reset}`);
      console.log(`
  ${c.bold}Installation Summary:${c.reset}
  ─────────────────────────────────────────
  Target:       ${c.cyan}${this.config.targetPath}${c.reset}
  Language:     ${c.cyan}${LANGUAGES[this.config.language]}${c.reset}
  Technologies: ${c.cyan}${this.config.technologies.length > 0 ? this.config.technologies.join(', ') : 'Common only'}${c.reset}
  Docker/Infra: ${c.cyan}${this.config.includeInfra ? 'Yes' : 'No'}${c.reset}
  Project Mgmt: ${c.cyan}${this.config.includeProject ? 'Yes' : 'No'}${c.reset}
  ─────────────────────────────────────────
`);

      const confirm = await this.prompt(`  Proceed with installation? (Y/n): `);
      if (confirm.toLowerCase() === 'n') {
        console.log(`  ${c.yellow}Installation cancelled.${c.reset}`);
        this.closeReadline();
        return;
      }

      this.closeReadline();

      // Run installation
      await this.runInstallation();

    } catch (error) {
      console.error(`${c.red}Error: ${error.message}${c.reset}`);
      this.closeReadline();
      process.exit(1);
    }
  }

  /**
   * Execute the installation scripts based on the current configuration.
   * Installs common rules, technology-specific rules, infrastructure, and project commands.
   * @returns {Promise<void>}
   * @throws {Error} If any installation script fails
   */
  async runInstallation() {
    console.log(`\n${c.bold}Installing Claude-Craft...${c.reset}\n`);

    const scriptsDir = path.join(CLI_ROOT, 'Dev', 'scripts');
    const langArg = `--lang=${this.config.language}`;
    const hasDocker = this.config.technologies.includes('docker');
    const includeInfra = this.config.includeInfra || hasDocker;
    const techsWithoutDocker = this.config.technologies.filter(t => t !== 'docker');
    // 1 base step (common rules) + installable tech scripts + optional infra + optional project
    const totalSteps = 1
      + techsWithoutDocker.filter(t => fs.existsSync(path.join(scriptsDir, `install-${t}-rules.sh`))).length
      + (includeInfra ? 1 : 0)
      + (this.config.includeProject ? 1 : 0);

    try {
      // Always install common rules
      console.log(`${c.cyan}[1/${totalSteps}]${c.reset} Installing common rules...`);
      this.runScript(path.join(scriptsDir, 'install-common-rules.sh'), [langArg, this.config.targetPath]);

      // Install technology-specific rules
      let step = 2;
      for (const tech of this.config.technologies) {
        if (tech === 'docker') continue; // Handled by infra
        const scriptName = `install-${tech}-rules.sh`;
        const scriptPath = path.join(scriptsDir, scriptName);
        if (fs.existsSync(scriptPath)) {
          console.log(`${c.cyan}[${step}/${totalSteps}]${c.reset} Installing ${tech} rules...`);
          this.runScript(scriptPath, [langArg, this.config.targetPath]);
          step++;
        }
      }

      // Install infrastructure rules
      if (includeInfra) {
        console.log(`${c.cyan}[${step}/${totalSteps}]${c.reset} Installing infrastructure rules...`);
        const infraScript = path.join(CLI_ROOT, 'Infra', 'install-infra-rules.sh');
        if (fs.existsSync(infraScript)) {
          this.runScript(infraScript, [langArg, this.config.targetPath]);
        }
        step++;
      }

      // Install project commands
      if (this.config.includeProject) {
        console.log(`${c.cyan}[${step}/${totalSteps}]${c.reset} Installing project commands...`);
        const projectScript = path.join(CLI_ROOT, 'Project', 'install-project-commands.sh');
        if (fs.existsSync(projectScript)) {
          this.runScript(projectScript, [langArg, this.config.targetPath]);
        }
      }

      this.printSuccess();

    } catch (error) {
      console.error(`${c.red}Installation failed: ${error.message}${c.reset}`);
      process.exit(1);
    }
  }

  /**
   * Execute a shell script synchronously via bash.
   * @param {string} scriptPath - Absolute path to the shell script
   * @param {string[]} args - Arguments to pass to the script
   * @throws {Error} If the script fails to start or exits with non-zero code
   */
  runScript(scriptPath, args) {
    const result = spawnSync('bash', [scriptPath, ...args], {
      stdio: 'inherit',
      cwd: CLI_ROOT,
    });
    if (result.error) {
      throw new Error(`Script failed to start: ${scriptPath} - ${result.error.message}`);
    }
    if (result.status !== 0) {
      throw new Error(`Script failed with exit code ${result.status}: ${scriptPath}`);
    }
  }

  /**
   * Print the post-installation success message with next steps.
   */
  printSuccess() {
    console.log(`
${c.green}${c.bold}╔═══════════════════════════════════════════════════════════════╗${c.reset}
${c.green}${c.bold}║${c.reset}                                                               ${c.green}${c.bold}║${c.reset}
${c.green}${c.bold}║${c.reset}   ${c.green}${c.bold}Installation Complete!${c.reset}                                    ${c.green}${c.bold}║${c.reset}
${c.green}${c.bold}║${c.reset}                                                               ${c.green}${c.bold}║${c.reset}
${c.green}${c.bold}╚═══════════════════════════════════════════════════════════════╝${c.reset}

${c.bold}Next Steps:${c.reset}

  1. ${c.cyan}cd ${this.config.targetPath}${c.reset}

  2. Start Claude Code and try the workflow:
     ${c.cyan}/workflow:init${c.reset}

  3. Or use technology-specific commands:
     ${c.cyan}/symfony:check-architecture${c.reset}
     ${c.cyan}/flutter:check-compliance${c.reset}
     ${c.cyan}/react:generate-component${c.reset}

${c.bold}Documentation:${c.reset}
  ${c.dim}https://github.com/TheBeardedBearSAS/claude-craft${c.reset}

`);
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
        console.error(`${c.red}Error: Unknown language '${options.lang}'. Available: ${Object.keys(LANGUAGES).join(', ')}${c.reset}`);
        process.exit(1);
      }
      this.config.language = options.lang;
    }
    if (options.tech) {
      if (!TECHNOLOGIES[options.tech]) {
        console.error(`${c.red}Error: Unknown technology '${options.tech}'. Available: ${Object.keys(TECHNOLOGIES).join(', ')}${c.reset}`);
        process.exit(1);
      }
      this.config.technologies = [options.tech];
    }
    this.config.targetPath = path.resolve(targetPath || this.config.targetPath);

    switch (command) {
      case 'install':
        if (targetPath && options.tech) {
          // Non-interactive install
          await this.runInstallation();
        } else {
          // Interactive install
          await this.interactiveInstall();
        }
        break;

      case 'init':
        this.printBanner();
        console.log(`${c.cyan}Workflow initialization is available after installation.${c.reset}`);
        console.log(`Run ${c.bold}/workflow:init${c.reset} in Claude Code.\n`);
        break;

      case 'flatten':
        await this.flattenCodebase(options);
        break;

      case 'ralph':
        await this.runRalph(args.slice(1), options);
        break;

      case 'help':
      case '--help':
      case '-h':
        this.printBanner();
        this.printHelp();
        break;

      default:
        if (!command) {
          // No command - run interactive install
          await this.interactiveInstall();
        } else {
          console.log(`${c.red}Unknown command: ${command}${c.reset}`);
          this.printHelp();
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
    this.printBanner();
    console.log(`${c.bold}Codebase Flattener${c.reset}\n`);
    console.log(`${c.dim}Generating context-optimized summary of your codebase...${c.reset}\n`);

    const targetPath = this.config.targetPath;
    const outputFile = options.output || 'CODEBASE_CONTEXT.md';

    // Import flattener module
    const flattener = require('./flattener');
    await flattener.flatten(targetPath, outputFile, options);
  }

  /**
   * Launch the Ralph Wiggum continuous AI agent loop.
   * @param {string[]} args - Positional arguments (prompt text after 'ralph' command)
   * @param {Object} options - CLI option flags
   * @param {string} [options.lang] - Language override
   * @param {string} [options.config] - Path to Ralph configuration file
   * @param {string} [options.continue] - Session ID to resume
   * @param {string} [options['max-iterations']] - Maximum iteration count
   * @param {boolean} [options.verbose] - Enable verbose output
   * @param {boolean} [options['dry-run']] - Preview without executing
   * @returns {Promise<void>}
   */
  async runRalph(args, options) {
    this.printBanner();
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

    // Add language if specified
    if (options.lang) {
      ralphArgs.push(`--lang=${options.lang}`);
    }

    // Add config if specified
    if (options.config) {
      ralphArgs.push(`--config=${options.config}`);
    }

    // Add continue if specified
    if (options.continue) {
      ralphArgs.push(`--continue=${options.continue}`);
    }

    // Add max-iterations if specified
    if (options['max-iterations']) {
      ralphArgs.push(`--max-iterations=${options['max-iterations']}`);
    }

    // Add verbose if specified
    if (options.verbose) {
      ralphArgs.push('--verbose');
    }

    // Add dry-run if specified
    if (options['dry-run']) {
      ralphArgs.push('--dry-run');
    }

    // Add remaining positional arguments (the prompt)
    const promptArgs = args.filter(arg => !arg.startsWith('--'));
    if (promptArgs.length > 0) {
      ralphArgs.push(promptArgs.join(' '));
    }

    console.log(`${c.dim}Running: bash ${ralphScript} ${ralphArgs.join(' ')}${c.reset}\n`);

    // Execute ralph.sh
    try {
      const ralph = spawn('bash', [ralphScript, ...ralphArgs], {
        stdio: 'inherit',
        cwd: this.config.targetPath,
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
}

// Run CLI
const cli = new ClaudeCraftCLI();
cli.run().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
