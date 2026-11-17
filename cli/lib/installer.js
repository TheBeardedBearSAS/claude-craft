/**
 * CLI installation wizard and script runner.
 * @module cli/lib/installer
 */

import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';
import c from './colors.js';
import { TECHNOLOGIES, LANGUAGES } from './constants.js';
import { getBaseLayerTechsFor } from './tech-registry.js';
import { printBanner, printSuccess } from './banner.js';
import { assertSafeTarget } from './path-safety.js';
import {
  INFRA_PLUGINS,
  PluginInstallError,
  ensureClaude,
  installPlugins,
  marketplaceName,
  parseHooks,
  readInstallJson,
  resolveInfra,
} from './plugin-install.js';
import { migrateLegacyInstall } from './migrate-legacy.js';

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
 * @param {import('../index.js').BearCraftCLI} cli - CLI instance
 * @param {Object} ctx - Context object
 * @param {string} ctx.CLI_ROOT - Absolute path to the CLI package root
 * @param {string} ctx.VERSION - Current package version
 * @returns {Promise<void>}
 */
export async function interactiveInstall(cli, { CLI_ROOT, VERSION }) {
  cli.createReadline();
  printBanner(VERSION);

  console.log(`${c.bold}Welcome to Bear-Craft Interactive Installer${c.reset}\n`);

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
    const langIndex = Number.parseInt(langInput, 10) - 1;
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
    const techIndices = (techInput || defaultTechs).split(/\s+/).map((n) => Number.parseInt(n, 10) - 1);
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
 * Zero-prompt automatic installation. Auto-detects stack and locale, applies sensible defaults,
 * then runs the installation immediately. Designed to bring TTFV under 10 minutes for new users.
 * @param {import('../index.js').BearCraftCLI} cli - CLI instance
 * @param {Object} ctx - Context object
 * @param {string} ctx.CLI_ROOT - Absolute path to the CLI package root
 * @param {string} ctx.VERSION - Current package version
 * @returns {Promise<void>}
 */
export async function autoInstall(cli, { CLI_ROOT, VERSION }) {
  printBanner(VERSION);
  console.log(`${c.bold}Bear-Craft Auto Installer${c.reset} ${c.dim}(--auto mode)${c.reset}\n`);

  // Target path: already resolved in cli.config.targetPath (defaults to cwd)
  try {
    cli.config.targetPath = assertSafeTarget(cli.config.targetPath);
  } catch (err) {
    console.error(`${c.red}${err.message}${c.reset}`);
    process.exit(1);
  }
  if (!fs.existsSync(cli.config.targetPath)) {
    fs.mkdirSync(cli.config.targetPath, { recursive: true });
    console.log(`  ${c.green}Created target: ${cli.config.targetPath}${c.reset}`);
  }

  // Language: respect --lang if provided, else detect from locale
  if (!cli.config.language || cli.config.language === 'en') {
    cli.config.language = detectLocale();
  }

  // Technologies: respect --tech if provided, else auto-detect from project files
  if (!cli.config.technologies || cli.config.technologies.length === 0) {
    const detected = cli.detectProject(cli.config.targetPath);
    cli.config.technologies = detected.suggestedTechs;
    if (detected.hasDockerfile) {
      cli.config.includeInfra = true;
    }
    if (!cli.config.infra || cli.config.infra.length === 0) cli.config.infra = detected.suggestedInfra ?? [];
  }

  // Defaults: include project commands; skip RTK unless asked
  if (cli.config.includeProject === undefined) cli.config.includeProject = true;
  if (cli.config.includeRtk === undefined) cli.config.includeRtk = false;
  if (cli.config.includeInfra === undefined) cli.config.includeInfra = false;

  console.log(`  ${c.cyan}Target${c.reset}       ${cli.config.targetPath}`);
  console.log(`  ${c.cyan}Language${c.reset}     ${LANGUAGES[cli.config.language]}`);
  console.log(
    `  ${c.cyan}Technologies${c.reset} ${cli.config.technologies.length > 0 ? cli.config.technologies.join(', ') : 'common only'}`
  );
  console.log(`  ${c.cyan}Infra${c.reset}        ${cli.config.includeInfra ? 'yes' : 'no'}`);
  console.log(`  ${c.cyan}Project${c.reset}      ${cli.config.includeProject ? 'yes' : 'no'}`);
  console.log(`  ${c.cyan}RTK${c.reset}          ${cli.config.includeRtk ? 'yes' : 'no'}\n`);

  await runInstallation(cli, { CLI_ROOT });
}

/**
 * Execute the installation based on the current configuration: the bear-* plugins are installed in project
 * scope through Claude Code, and the installers only copy what the plugins do not carry (rules, references,
 * CLAUDE.md, settings, scaffold…). Copy-based leftovers of older versions are migrated.
 * @param {import('../index.js').BearCraftCLI} cli - CLI instance
 * @param {Object} ctx - Context object
 * @param {string} ctx.CLI_ROOT - Absolute path to the CLI package root
 * @param {string} [ctx.VERSION] - Package version (recorded in .bear-craft/VERSION)
 * @param {Function} [ctx.execFn] - Injectable executor for `claude` (tests)
 * @returns {Promise<void>}
 * @throws {Error} If any installation script fails
 */
export async function runInstallation(cli, { CLI_ROOT, VERSION, execFn }) {
  console.log(`\n${c.bold}Installing Bear-Craft...${c.reset}\n`);

  // Auto-include base-layer techs (e.g. php is pulled in by symfony/laravel — audit DA-PM-03).
  // Computed into a local list so the user's selection (cli.config.technologies) stays untouched.
  const baseLayers = getBaseLayerTechsFor(cli.config.technologies);
  const installTechs = [...new Set([...cli.config.technologies, ...baseLayers])].filter(
    (t) => t !== 'docker' && t !== 'coolify'
  );
  if (baseLayers.length > 0) {
    console.log(`  ${c.cyan}Base layer:${c.reset} auto-including ${baseLayers.join(', ')} (PHP framework selected)`);
  }

  const infra = resolveInfra({
    infra: [...(cli.config.infra ?? []), ...cli.config.technologies.filter((t) => INFRA_PLUGINS.includes(t))],
    includeInfra: cli.config.includeInfra,
  });
  const hooks = parseHooks(cli.config.hooks);
  const target = cli.config.targetPath;
  const scriptsDir = path.join(CLI_ROOT, 'Dev', 'scripts');
  const lang = cli.config.language;
  const langArg = `--lang=${lang}`;
  const stackTechs = [...installTechs, ...(infra.includes('docker') ? ['docker'] : [])];
  const stackArgs = stackTechs.length > 0 ? [`--tech=${stackTechs.join(',')}`] : [];
  const deps = { execFn };

  try {
    // Fail before touching anything when Claude Code is missing or too old (no fallback by design).
    const claudeVersion = ensureClaude(deps);
    console.log(`  ${c.green}[OK]${c.reset} Claude Code ${claudeVersion}`);

    // 1. What the plugins do not carry: rules, references, CLAUDE.md, settings, scaffold…
    let step = 1;
    const total = 2 + installTechs.length + (cli.config.includeProject ? 1 : 0) + (cli.config.includeRtk ? 1 : 0);
    console.log(`${c.cyan}[${step++}/${total}]${c.reset} Copying rules and project files...`);
    runScript(
      path.join(scriptsDir, 'install-common-rules.sh'),
      [langArg, ...stackArgs, '--plugin-mode', ...(cli.config.hooks ? [`--hooks=${cli.config.hooks}`] : []), target],
      CLI_ROOT
    );
    for (const tech of installTechs) {
      const scriptPath = path.join(scriptsDir, `install-${tech}-rules.sh`);
      if (!fs.existsSync(scriptPath)) continue;
      console.log(`${c.cyan}[${step++}/${total}]${c.reset} Copying ${tech} references...`);
      runScript(scriptPath, [langArg, '--plugin-mode', target], CLI_ROOT);
    }
    if (cli.config.includeProject) {
      console.log(`${c.cyan}[${step++}/${total}]${c.reset} Creating the project-management scaffold...`);
      const projectScript = path.join(CLI_ROOT, 'Project', 'install-project-commands.sh');
      if (fs.existsSync(projectScript)) {
        runScript(projectScript, [langArg, ...stackArgs, '--plugin-mode', target], CLI_ROOT);
      }
    }

    // 2. Copy-based leftovers of 9.x / 10.0 pre-releases: remove our files, keep the user's.
    migrateLegacyInstall({
      target,
      lang,
      cliRoot: CLI_ROOT,
      log: (m) => console.log(`  ${c.green}[OK]${c.reset} ${m}`),
      warn: (m) => console.log(`  ${c.yellow}[WARN]${c.reset} ${m}`),
    });

    // 3. The plugins themselves (project scope, marketplace copied into .bear-craft/).
    console.log(`${c.cyan}[${step++}/${total}]${c.reset} Installing plugins through Claude Code...`);
    // `install` is additive (monorepo modules, second run): keep what a previous run of the same language recorded.
    const previous = readInstallJson(target);
    const sameLang = previous && previous.lang === lang;
    const recordedTechs = [...new Set([...(sameLang ? previous.techs : []), ...installTechs])];
    const recordedInfra = [...new Set([...(sameLang ? previous.infra : []), ...infra])];
    const { ids } = installPlugins(
      {
        target,
        cliRoot: CLI_ROOT,
        install: { lang, techs: recordedTechs, infra: recordedInfra, hooks },
        version: VERSION ?? 'unknown',
      },
      { ...deps, log: (m) => console.log(`  ${c.dim}${m}${c.reset}`) }
    );
    console.log(`  ${c.green}[OK]${c.reset} ${ids.length} plugins enabled (${marketplaceName(lang)})`);

    // Install RTK (Token Optimizer)
    if (cli.config.includeRtk) {
      console.log(`${c.cyan}[${step}/${total}]${c.reset} Installing RTK (Token Optimizer)...`);
      const rtkScript = path.join(CLI_ROOT, 'Tools', 'RTK', 'install-rtk.sh');
      if (fs.existsSync(rtkScript)) {
        runScript(rtkScript, [langArg], CLI_ROOT);
      }
    }

    printSuccess(target);
  } catch (error) {
    if (error instanceof PluginInstallError) {
      console.error(`${c.red}${error.message}${c.reset}`);
    } else {
      console.error(`${c.red}Installation failed: ${error.message}${c.reset}`);
    }
    process.exit(1);
  }
}
