/**
 * CLI `update` command — re-run install scripts to refresh an existing installation.
 * @module cli/lib/update
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import c from './colors.js';
import { listDirs } from './fs-utils.js';
import { TECH_REGISTRY } from './tech-registry.js';

// Security: reject paths into system directories to prevent accidental or malicious
// installation outside the user's expected workspace.
const FORBIDDEN_SYSTEM_DIRS = ['/', '/etc', '/usr', '/bin', '/sbin', '/boot', '/lib', '/var', '/root', '/proc', '/sys', '/dev'];

function assertSafeTarget(targetPath) {
  const resolved = path.resolve(targetPath);
  for (const forbidden of FORBIDDEN_SYSTEM_DIRS) {
    if (resolved === forbidden || resolved.startsWith(forbidden + path.sep)) {
      throw new Error(`Refusing to operate on system directory: ${resolved}`);
    }
  }
  return resolved;
}

// Security: enforce allowlist on language code (prevents argument injection via --lang).
function assertSafeLang(lang) {
  if (!/^[a-z]{2}$/.test(lang)) {
    throw new Error(`Invalid --lang value: "${lang}" (expected 2-letter lowercase code)`);
  }
  return lang;
}

/**
 * Run the update command against a target directory.
 * @param {string} targetPath - Absolute path to the project directory
 * @param {Object} options - CLI options
 * @param {string} [options.lang] - Language override (default: 'en')
 * @param {string} [options.tech] - Specific tech to update (if omitted, updates all detected)
 * @param {string} cliRoot - Path to the CLI package root
 */
function runUpdate(targetPath, options, cliRoot) {
  // Security: validate inputs before any side effect (CWE-78, CWE-22).
  const safeTarget = assertSafeTarget(targetPath);
  const lang = assertSafeLang(options.lang || 'en');

  const claudeDir = path.join(safeTarget, '.claude');

  console.log(`\n${c.bold}Claude Craft Update${c.reset}`);
  console.log(`${c.dim}Directory: ${safeTarget}${c.reset}\n`);

  // Verify existing installation
  if (!fs.existsSync(claudeDir)) {
    console.log(`${c.red}No claude-craft installation detected.${c.reset}`);
    console.log(`Run: npx @the-bearded-bear/claude-craft install ${targetPath}\n`);
    process.exitCode = 1;
    return;
  }

  // Determine techs to update
  let techsToUpdate;

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
    // Security: spawnSync with argv array — no shell interpretation, no injection.
    const result = spawnSync('bash', [commonScript, `--lang=${lang}`, '--force', safeTarget], {
      encoding: 'utf8',
      timeout: 60_000,
      stdio: 'pipe',
    });
    if (result.status === 0) {
      console.log(`  ${c.green}[OK]${c.reset} Common rules updated`);
      updated++;
    } else {
      console.log(`  ${c.red}[FAIL]${c.reset} Common rules: ${result.stderr || result.error?.message || 'unknown'}`);
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
    // Security: spawnSync with argv array — no shell interpretation, no injection.
    const result = spawnSync('bash', [script, `--lang=${lang}`, '--force', safeTarget], {
      encoding: 'utf8',
      timeout: 60_000,
      stdio: 'pipe',
    });
    if (result.status === 0) {
      console.log(`  ${c.green}[OK]${c.reset} ${entry.displayName} updated`);
      updated++;
    } else {
      console.log(`  ${c.red}[FAIL]${c.reset} ${entry.displayName}: ${result.stderr || result.error?.message || 'unknown'}`);
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
