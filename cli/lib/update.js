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
import { assertSafeTarget, assertSafeLang } from './path-safety.js';

/**
 * Generate a backup of `.claude/` next to the original, returning the backup path.
 * @param {string} claudeDir
 * @returns {string|null} Backup path, or null if claudeDir is empty/missing.
 */
function snapshotClaudeDir(claudeDir) {
  if (!fs.existsSync(claudeDir)) return null;
  // Timestamped to avoid collisions if a previous run was interrupted.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${claudeDir}.backup-${stamp}`;
  fs.cpSync(claudeDir, backupPath, { recursive: true });
  return backupPath;
}

/**
 * Restore `.claude/` from a backup snapshot and remove the backup directory.
 * @param {string} claudeDir
 * @param {string} backupPath
 */
function restoreClaudeDir(claudeDir, backupPath) {
  fs.rmSync(claudeDir, { recursive: true, force: true });
  fs.renameSync(backupPath, claudeDir);
}

/**
 * Run the update command against a target directory.
 *
 * By default the command snapshots `.claude/` before running install scripts.
 * If any script exits non-zero, the snapshot is restored (CC-REL-14). Pass
 * `--no-rollback` to opt out (faster, useful in CI where a fresh checkout
 * is implicit).
 *
 * @param {string} targetPath - Absolute path to the project directory
 * @param {Object} options - CLI options
 * @param {string} [options.lang] - Language override (default: 'en')
 * @param {string} [options.tech] - Specific tech to update (if omitted, updates all detected)
 * @param {boolean|string} [options['no-rollback']] - Disable backup/restore on failure
 * @param {string} cliRoot - Path to the CLI package root
 */
function runUpdate(targetPath, options, cliRoot) {
  // Security: validate inputs before any side effect (CWE-78, CWE-22).
  const safeTarget = assertSafeTarget(targetPath);
  const lang = assertSafeLang(options.lang || 'en');
  const rollbackEnabled = !options['no-rollback'];

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

  // Snapshot before any script runs so a partial failure can be rolled back.
  let backupPath = null;
  if (rollbackEnabled) {
    try {
      backupPath = snapshotClaudeDir(claudeDir);
    } catch (err) {
      console.log(`  ${c.yellow}[WARN]${c.reset} Backup failed (${err.message}); proceeding without rollback`);
    }
  }

  let updated = 0;
  let anyFailed = false;

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
      anyFailed = true;
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
      console.log(
        `  ${c.red}[FAIL]${c.reset} ${entry.displayName}: ${result.stderr || result.error?.message || 'unknown'}`
      );
      anyFailed = true;
    }
  }

  // Rollback on partial failure (CC-REL-14).
  if (anyFailed && backupPath) {
    try {
      restoreClaudeDir(claudeDir, backupPath);
      console.log(
        `\n  ${c.yellow}[ROLLBACK]${c.reset} Restored .claude/ from snapshot (use --no-rollback to disable).`
      );
    } catch (err) {
      console.log(`\n  ${c.red}[ROLLBACK FAILED]${c.reset} ${err.message} — backup kept at ${backupPath}`);
    }
  } else if (backupPath) {
    // Success: drop the backup.
    fs.rmSync(backupPath, { recursive: true, force: true });
  }

  // Summary
  console.log('');
  if (anyFailed) {
    console.log(`${c.red}Update failed — see [FAIL] lines above.${c.reset}\n`);
    process.exitCode = 1;
  } else if (updated > 0) {
    console.log(`${c.green}Update complete — ${updated} component(s) refreshed.${c.reset}\n`);
  } else if (techsToUpdate.length === 0) {
    console.log(`${c.yellow}No tech references detected. Use --tech=NAME to specify.${c.reset}\n`);
  } else {
    console.log(`${c.red}Update failed — no components were refreshed.${c.reset}\n`);
    process.exitCode = 1;
  }
}

export { runUpdate };
