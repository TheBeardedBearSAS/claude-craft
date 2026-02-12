/**
 * CLI `update` command — re-run install scripts to refresh an existing installation.
 * @module cli/lib/update
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import c from './colors.js';
import { listDirs } from './fs-utils.js';
import { TECH_REGISTRY } from './tech-registry.js';

/**
 * Run the update command against a target directory.
 * @param {string} targetPath - Absolute path to the project directory
 * @param {Object} options - CLI options
 * @param {string} [options.lang] - Language override (default: 'en')
 * @param {string} [options.tech] - Specific tech to update (if omitted, updates all detected)
 * @param {string} cliRoot - Path to the CLI package root
 */
function runUpdate(targetPath, options, cliRoot) {
  const claudeDir = path.join(targetPath, '.claude');
  const lang = options.lang || 'en';

  console.log(`\n${c.bold}Claude Craft Update${c.reset}`);
  console.log(`${c.dim}Directory: ${targetPath}${c.reset}\n`);

  // Verify existing installation
  if (!fs.existsSync(claudeDir)) {
    console.log(`${c.red}No claude-craft installation detected.${c.reset}`);
    console.log(`Run: npx @the-bearded-bear/claude-craft install ${targetPath}\n`);
    process.exitCode = 1;
    return;
  }

  // Determine techs to update
  let techsToUpdate = [];

  if (options.tech) {
    // Explicit --tech flag
    if (!TECH_REGISTRY[options.tech]) {
      console.log(`${c.red}Unknown technology: ${options.tech}${c.reset}`);
      console.log(`Available: ${Object.keys(TECH_REGISTRY).join(', ')}\n`);
      process.exitCode = 1;
      return;
    }
    techsToUpdate = [options.tech];
  } else {
    // Auto-detect from installed references
    const refsDir = path.join(claudeDir, 'references');
    const installedRefs = listDirs(refsDir);
    techsToUpdate = installedRefs.filter((ref) => TECH_REGISTRY[ref]);
  }

  // Always refresh common rules
  const scriptsDir = path.join(cliRoot, 'Dev', 'scripts');
  const commonScript = path.join(scriptsDir, 'install-common-rules.sh');

  let updated = 0;

  if (fs.existsSync(commonScript)) {
    console.log(`  ${c.cyan}Refreshing common rules...${c.reset}`);
    try {
      execSync(`bash "${commonScript}" --lang="${lang}" --force "${targetPath}"`, {
        encoding: 'utf8',
        timeout: 60_000,
        stdio: 'pipe',
      });
      console.log(`  ${c.green}[OK]${c.reset} Common rules updated`);
      updated++;
    } catch (e) {
      console.log(`  ${c.red}[FAIL]${c.reset} Common rules: ${e.message}`);
    }
  }

  // Run tech-specific install scripts
  for (const tech of techsToUpdate) {
    const entry = TECH_REGISTRY[tech];
    const script = path.join(scriptsDir, entry.installScript);

    if (!fs.existsSync(script)) {
      console.log(`  ${c.yellow}[SKIP]${c.reset} ${entry.displayName} — install script not found`);
      continue;
    }

    console.log(`  ${c.cyan}Refreshing ${entry.displayName}...${c.reset}`);
    try {
      execSync(`bash "${script}" --lang="${lang}" --force "${targetPath}"`, {
        encoding: 'utf8',
        timeout: 60_000,
        stdio: 'pipe',
      });
      console.log(`  ${c.green}[OK]${c.reset} ${entry.displayName} updated`);
      updated++;
    } catch (e) {
      console.log(`  ${c.red}[FAIL]${c.reset} ${entry.displayName}: ${e.message}`);
    }
  }

  // Summary
  console.log('');
  if (updated > 0) {
    console.log(`${c.green}Update complete — ${updated} component(s) refreshed.${c.reset}\n`);
  } else if (techsToUpdate.length === 0) {
    console.log(`${c.yellow}No tech references detected. Use --tech=NAME to specify.${c.reset}\n`);
  } else {
    console.log(`${c.red}Update failed — no components were refreshed.${c.reset}\n`);
    process.exitCode = 1;
  }
}

export { runUpdate };
