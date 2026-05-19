/**
 * CLI installation wizard and script runner.
 * @module cli/lib/installer
 */

import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';
import c from './colors.js';
import { TECHNOLOGIES, LANGUAGES } from './constants.js';
import { printBanner, printSuccess } from './banner.js';
import { assertSafeTarget } from './path-safety.js';

/**
 * Detect the preferred language from environment locale variables.
 * Reads process.env.LANG or process.env.LC_ALL and maps to a supported language code.
 * @returns {string} A supported language code: 'en' | 'fr' | 'es' | 'de' | 'pt'
 */
export function detectLocale() {
  const raw = (process.env.LC_ALL || process.env.LANG || '').toLowerCase();
  if (raw.startsWith('fr')) return 'fr';
  if (raw.startsWith('es')) return 'es';
  if (raw.startsWith('de')) return 'de';
  if (raw.startsWith('pt')) return 'pt';
  return 'en';
}

/**
 * Execute a shell script synchronously via bash.
 * @param {string} scriptPath - Absolute path to the shell script
 * @param {string[]} args - Arguments to pass to the script
 * @param {string} cwd - Working directory for the script
 * @throws {Error} If the script fails to start or exits with non-zero code
 */
function runScript(scriptPath, args, cwd) {
  const result = spawnSync('bash', [scriptPath, ...args], {
    stdio: 'inherit',
    cwd,
  });
  if (result.error) {
    throw new Error(`Script failed to start: ${scriptPath} - ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Script failed with exit code ${result.status}: ${scriptPath}`);
  }
}

/**
 * Run the interactive installation wizard with 5-step user prompts.
 * @param {import('../index.js').ClaudeCraftCLI} cli - CLI instance
 * @param {Object} ctx - Context object
 * @param {string} ctx.CLI_ROOT - Absolute path to the CLI package root
 * @param {string} ctx.VERSION - Current package version
 * @returns {Promise<void>}
 */
export async function interactiveInstall(cli, { CLI_ROOT, VERSION }) {
  cli.createReadline();
  printBanner(VERSION);

  console.log(`${c.bold}Welcome to Claude-Craft Interactive Installer${c.reset}\n`);

  try {
    // Step 1: Target path
    console.log(`${c.cyan}[1/5]${c.reset} ${c.bold}Target Directory${c.reset}`);
    const defaultPath = process.cwd();
    const targetInput = await cli.prompt(`  Enter path (${c.dim}${defaultPath}${c.reset}): `);
    const rawTarget = targetInput || defaultPath;

    // Security: reject system directories (/, /etc, /usr, /bin, …) before any side effect.
    try {
      cli.config.targetPath = assertSafeTarget(rawTarget);
    } catch (err) {
      console.log(`  ${c.red}${err.message}${c.reset}`);
      cli.closeReadline();
      return;
    }
    if (!fs.existsSync(cli.config.targetPath)) {
      console.log(`  ${c.yellow}Directory doesn't exist. Create it? (y/n)${c.reset}`);
      const create = await cli.prompt('  ');
      if (create.toLowerCase() === 'y') {
        fs.mkdirSync(cli.config.targetPath, { recursive: true });
        console.log(`  ${c.green}Created: ${cli.config.targetPath}${c.reset}`);
      } else {
        console.log(`  ${c.red}Aborted.${c.reset}`);
        cli.closeReadline();
        return;
      }
    }

    // Detect project
    console.log(`\n  ${c.dim}Analyzing project...${c.reset}`);
    const detected = cli.detectProject(cli.config.targetPath);

    if (detected.suggestedTechs.length > 0) {
      console.log(`  ${c.green}Detected:${c.reset} ${detected.suggestedTechs.join(', ')}`);
    }
    if (detected.hasClaude) {
      console.log(`  ${c.yellow}Existing .claude/ found - will update${c.reset}`);
    }

    // Step 2: Language
    console.log(`\n${c.cyan}[2/5]${c.reset} ${c.bold}Language${c.reset}`);
    const langKeys = Object.keys(LANGUAGES);
    const detectedLang = detectLocale();
    const detectedIndex = langKeys.indexOf(detectedLang) + 1;
    console.log(
      `  ${Object.entries(LANGUAGES)
        .map(([k, v], i) => `${i + 1}) ${k} - ${v}`)
        .join('\n  ')}`
    );
    if (detectedLang !== 'en') {
      console.log(`  ${c.dim}Auto-detected locale: ${detectedLang}${c.reset}`);
    }
    const langInput = await cli.prompt(`  Select (1-5, default: ${detectedIndex}): `);
    const langIndex = parseInt(langInput) - 1;
    cli.config.language = langKeys[langIndex] !== undefined ? langKeys[langIndex] : detectedLang;
    console.log(`  ${c.green}Selected: ${LANGUAGES[cli.config.language]}${c.reset}`);

    // Step 3: Technologies
    console.log(`\n${c.cyan}[3/5]${c.reset} ${c.bold}Technologies${c.reset}`);
    console.log(
      `  ${Object.entries(TECHNOLOGIES)
        .map(([k, v], i) => `${i + 1}) ${k.padEnd(12)} - ${v.desc}`)
        .join('\n  ')}`
    );
    console.log(`  ${c.dim}Enter numbers separated by spaces (e.g., "1 2" for Symfony + Flutter)${c.reset}`);

    // Pre-select detected technologies
    const techKeys = Object.keys(TECHNOLOGIES);
    const preSelected = detected.suggestedTechs.map((t) => techKeys.indexOf(t) + 1).filter((i) => i > 0);
    const defaultTechs = preSelected.length > 0 ? preSelected.join(' ') : '1';

    const techInput = await cli.prompt(`  Select (default: ${defaultTechs}): `);
    const techIndices = (techInput || defaultTechs).split(/\s+/).map((n) => parseInt(n) - 1);
    cli.config.technologies = techIndices.filter((i) => i >= 0 && i < techKeys.length).map((i) => techKeys[i]);
    console.log(`  ${c.green}Selected: ${cli.config.technologies.join(', ') || 'common only'}${c.reset}`);

    // Step 4: Additional options
    console.log(`\n${c.cyan}[4/5]${c.reset} ${c.bold}Additional Components${c.reset}`);

    const infraInput = await cli.prompt(`  Include Docker/Infrastructure rules? (y/N): `);
    cli.config.includeInfra = infraInput.toLowerCase() === 'y';

    const projectInput = await cli.prompt(`  Include Project Management commands? (Y/n): `);
    cli.config.includeProject = projectInput.toLowerCase() !== 'n';

    const rtkInput = await cli.prompt(`  Include Token Optimization (RTK)? (y/N): `);
    cli.config.includeRtk = rtkInput.toLowerCase() === 'y';

    // Step 5: Confirm
    console.log(`\n${c.cyan}[5/5]${c.reset} ${c.bold}Confirmation${c.reset}`);
    console.log(`
  ${c.bold}Installation Summary:${c.reset}
  ─────────────────────────────────────────
  Target:       ${c.cyan}${cli.config.targetPath}${c.reset}
  Language:     ${c.cyan}${LANGUAGES[cli.config.language]}${c.reset}
  Technologies: ${c.cyan}${cli.config.technologies.length > 0 ? cli.config.technologies.join(', ') : 'Common only'}${c.reset}
  Docker/Infra: ${c.cyan}${cli.config.includeInfra ? 'Yes' : 'No'}${c.reset}
  Project Mgmt: ${c.cyan}${cli.config.includeProject ? 'Yes' : 'No'}${c.reset}
  Token Optim.: ${c.cyan}${cli.config.includeRtk ? 'Yes' : 'No'}${c.reset}
  ─────────────────────────────────────────
`);

    const confirm = await cli.prompt(`  Proceed with installation? (Y/n): `);
    if (confirm.toLowerCase() === 'n') {
      console.log(`  ${c.yellow}Installation cancelled.${c.reset}`);
      cli.closeReadline();
      return;
    }

    cli.closeReadline();

    // Run installation
    await runInstallation(cli, { CLI_ROOT });
  } catch (error) {
    console.error(`${c.red}Error: ${error.message}${c.reset}`);
    cli.closeReadline();
    process.exit(1);
  }
}

/**
 * Execute the installation scripts based on the current configuration.
 * Installs common rules, technology-specific rules, infrastructure, and project commands.
 * @param {import('../index.js').ClaudeCraftCLI} cli - CLI instance
 * @param {Object} ctx - Context object
 * @param {string} ctx.CLI_ROOT - Absolute path to the CLI package root
 * @returns {Promise<void>}
 * @throws {Error} If any installation script fails
 */
export async function runInstallation(cli, { CLI_ROOT }) {
  console.log(`\n${c.bold}Installing Claude-Craft...${c.reset}\n`);

  const scriptsDir = path.join(CLI_ROOT, 'Dev', 'scripts');
  const langArg = `--lang=${cli.config.language}`;
  const hasDocker = cli.config.technologies.includes('docker');
  const includeInfra = cli.config.includeInfra || hasDocker;
  const techsWithoutDocker = cli.config.technologies.filter((t) => t !== 'docker');
  // 1 base step (common rules) + installable tech scripts + optional infra + optional project + optional rtk
  const totalSteps =
    1 +
    techsWithoutDocker.filter((t) => fs.existsSync(path.join(scriptsDir, `install-${t}-rules.sh`))).length +
    (includeInfra ? 1 : 0) +
    (cli.config.includeProject ? 1 : 0) +
    (cli.config.includeRtk ? 1 : 0);

  try {
    // Always install common rules
    console.log(`${c.cyan}[1/${totalSteps}]${c.reset} Installing common rules...`);
    runScript(path.join(scriptsDir, 'install-common-rules.sh'), [langArg, cli.config.targetPath], CLI_ROOT);

    // Install technology-specific rules
    let step = 2;
    for (const tech of cli.config.technologies) {
      if (tech === 'docker') continue; // Handled by infra
      const scriptName = `install-${tech}-rules.sh`;
      const scriptPath = path.join(scriptsDir, scriptName);
      if (fs.existsSync(scriptPath)) {
        console.log(`${c.cyan}[${step}/${totalSteps}]${c.reset} Installing ${tech} rules...`);
        runScript(scriptPath, [langArg, cli.config.targetPath], CLI_ROOT);
        step++;
      }
    }

    // Install infrastructure rules
    if (includeInfra) {
      console.log(`${c.cyan}[${step}/${totalSteps}]${c.reset} Installing infrastructure rules...`);
      const infraScript = path.join(CLI_ROOT, 'Infra', 'install-docker-rules.sh');
      if (fs.existsSync(infraScript)) {
        runScript(infraScript, [langArg, cli.config.targetPath], CLI_ROOT);
      }
      step++;
    }

    // Install project commands
    if (cli.config.includeProject) {
      console.log(`${c.cyan}[${step}/${totalSteps}]${c.reset} Installing project commands...`);
      const projectScript = path.join(CLI_ROOT, 'Project', 'install-project-commands.sh');
      if (fs.existsSync(projectScript)) {
        runScript(projectScript, [langArg, cli.config.targetPath], CLI_ROOT);
      }
      step++;
    }

    // Install RTK (Token Optimizer)
    if (cli.config.includeRtk) {
      console.log(`${c.cyan}[${step}/${totalSteps}]${c.reset} Installing RTK (Token Optimizer)...`);
      const rtkScript = path.join(CLI_ROOT, 'Tools', 'RTK', 'install-rtk.sh');
      if (fs.existsSync(rtkScript)) {
        runScript(rtkScript, [langArg], CLI_ROOT);
      }
    }

    printSuccess(cli.config.targetPath);
  } catch (error) {
    console.error(`${c.red}Installation failed: ${error.message}${c.reset}`);
    process.exit(1);
  }
}
