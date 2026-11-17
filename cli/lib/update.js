/**
 * CLI `update` command — refresh an installation: new marketplace version, plugins, rules, migration.
 * @module cli/lib/update
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import c from './colors.js';
import { listDirs } from './fs-utils.js';
import { TECH_REGISTRY } from './tech-registry.js';
import { assertSafeTarget, assertSafeLang } from './path-safety.js';
import {
  INFRA_PLUGINS,
  PluginInstallError,
  ensureClaude,
  installPlugins,
  marketplaceName,
  parseHooks,
  readInstallJson,
} from './plugin-install.js';
import { migrateLegacyInstall } from './migrate-legacy.js';

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

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
};

/** Hooks profile of a copy-based installation, read from the hooks merged in settings.json. */
function detectHooks(claudeDir) {
  const text = JSON.stringify(readJson(path.join(claudeDir, 'settings.json'))?.hooks ?? {});
  if (!text.includes('guard-network') && !text.includes('memory-lifecycle')) return 'none';
  const memory = text.includes('memory-lifecycle');
  const profile = text.includes('quality-gate') ? 'full' : text.includes('guard-network') ? 'default' : 'none';
  return `${profile}${memory ? ',memory' : ''}`;
}

/** What a 9.x installation (no install.json) contains: techs and infra from its folders. */
function detectLegacyInstall(claudeDir) {
  const techs = listDirs(path.join(claudeDir, 'references')).filter(
    (r) => TECH_REGISTRY[r] && TECH_REGISTRY[r].tier !== null
  );
  const commandDirs = listDirs(path.join(claudeDir, 'commands')).map((d) => d.replace(/^bear-/, ''));
  const infra = INFRA_PLUGINS.filter((n) => commandDirs.includes(n));
  return { techs, infra, hooks: detectHooks(claudeDir) };
}

/**
 * Execute a shell script synchronously; returns true on exit code 0.
 * Security: spawnSync with argv array — no shell interpretation, no injection.
 */
function runScript(script, args, label) {
  const result = spawnSync('bash', [script, ...args], { encoding: 'utf8', timeout: 60_000, stdio: 'pipe' });
  if (result.status === 0) {
    console.log(`  ${c.green}[OK]${c.reset} ${label}`);
    return true;
  }
  console.log(`  ${c.red}[FAIL]${c.reset} ${label}: ${result.stderr || result.error?.message || 'unknown'}`);
  return false;
}

/**
 * Run the update command against a target directory.
 *
 * Flow: read `.bear-craft/install.json` (or detect a 9.x copy-based installation), copy the marketplace of
 * the current version, refresh the rules the plugins do not carry, migrate copied leftovers (our files are
 * removed, the user's kept), then re-register the marketplace and plugins (sync). `.claude/` is snapshotted
 * first and restored when a step fails (CC-REL-14); pass `--no-rollback` to opt out.
 *
 * @param {string} targetPath - Absolute path to the project directory
 * @param {Object} options - CLI options
 * @param {string} [options.lang] - Language override (default: the recorded language, else 'en')
 * @param {string} [options.tech] - Restrict the refresh of references to one tech
 * @param {boolean|string} [options['no-rollback']] - Disable backup/restore on failure
 * @param {string} cliRoot - Path to the CLI package root
 * @param {{execFn?: Function, version?: string}} [deps] - Injectable dependencies for testing
 */
function runUpdate(targetPath, options, cliRoot, deps = {}) {
  // Security: validate inputs before any side effect (CWE-78, CWE-22).
  const safeTarget = assertSafeTarget(targetPath);
  const rollbackEnabled = !options['no-rollback'];
  const claudeDir = path.join(safeTarget, '.claude');
  const recorded = readInstallJson(safeTarget);

  console.log(`\n${c.bold}Bear Craft Update${c.reset}`);
  console.log(`${c.dim}Directory: ${safeTarget}${c.reset}\n`);

  // Verify existing installation
  if (!fs.existsSync(claudeDir) && !recorded) {
    console.log(`${c.red}No bear-craft installation detected.${c.reset}`);
    console.log(`Run: npx @the-bearded-bear/bear-craft install ${targetPath}\n`);
    process.exitCode = 1;
    return;
  }

  const lang = assertSafeLang(options.lang || recorded?.lang || 'en');

  if (options.tech && !TECH_REGISTRY[options.tech]) {
    console.log(`${c.red}Unknown technology: ${options.tech}${c.reset}`);
    console.log(`Available: ${Object.keys(TECH_REGISTRY).join(', ')}\n`);
    process.exitCode = 1;
    return;
  }

  const base = recorded ?? detectLegacyInstall(claudeDir);
  const install = {
    lang,
    techs: options.tech ? [options.tech] : [...(base.techs ?? [])],
    infra: [...(base.infra ?? [])],
    hooks: typeof base.hooks === 'string' ? parseHooks(base.hooks) : (base.hooks ?? parseHooks('default')),
  };
  if (!recorded) {
    console.log(
      `  ${c.dim}No .bear-craft/install.json: detected ${install.techs.join(', ') || 'no tech'} from the existing installation${c.reset}`
    );
  }

  // No fallback when Claude Code is missing: fail before touching anything.
  try {
    const claudeVersion = ensureClaude(deps);
    console.log(`  ${c.green}[OK]${c.reset} Claude Code ${claudeVersion}`);
  } catch (err) {
    if (!(err instanceof PluginInstallError)) throw err;
    console.error(`${c.red}${err.message}${c.reset}\n`);
    process.exitCode = 1;
    return;
  }

  // Snapshot before any change so a partial failure can be rolled back.
  let backupPath = null;
  if (rollbackEnabled) {
    try {
      backupPath = snapshotClaudeDir(claudeDir);
    } catch (err) {
      console.log(`  ${c.yellow}[WARN]${c.reset} Backup failed (${err.message}); proceeding without rollback`);
    }
  }

  const scriptsDir = path.join(cliRoot, 'Dev', 'scripts');
  const langArg = `--lang=${lang}`;
  let updated = 0;
  let anyFailed = false;
  fs.mkdirSync(claudeDir, { recursive: true });

  // 1. Rules and references the plugins do not carry (plugin mode: no commands/agents/skills copy).
  const commonScript = path.join(scriptsDir, 'install-common-rules.sh');
  if (fs.existsSync(commonScript)) {
    console.log(`  ${c.cyan}Refreshing common rules...${c.reset}`);
    const stackArgs = install.techs.length > 0 ? [`--tech=${install.techs.join(',')}`] : [];
    if (
      runScript(commonScript, [langArg, ...stackArgs, '--plugin-mode', '--force', safeTarget], 'Common rules updated')
    ) {
      updated++;
    } else {
      anyFailed = true;
    }
  }
  for (const tech of install.techs) {
    const entry = TECH_REGISTRY[tech];
    const script = entry && path.join(scriptsDir, entry.installScript);
    if (!script || !fs.existsSync(script)) {
      console.log(`  ${c.yellow}[SKIP]${c.reset} ${entry?.displayName ?? tech} — install script not found`);
      continue;
    }
    console.log(`  ${c.cyan}Refreshing ${entry.displayName}...${c.reset}`);
    if (runScript(script, [langArg, '--plugin-mode', '--force', safeTarget], `${entry.displayName} updated`)) {
      updated++;
    } else {
      anyFailed = true;
    }
  }

  // 2. Copy-based leftovers: our files are removed, the user's are kept (with a warning).
  if (!anyFailed) {
    migrateLegacyInstall({
      target: safeTarget,
      lang,
      cliRoot,
      log: (m) => console.log(`  ${c.green}[OK]${c.reset} ${m}`),
      warn: (m) => console.log(`  ${c.yellow}[WARN]${c.reset} ${m}`),
    });

    // 3. Marketplace of the current version, plugins, install.json.
    try {
      const { ids } = installPlugins(
        { target: safeTarget, cliRoot, install, version: deps.version ?? readPackageVersion(cliRoot) },
        { ...deps, log: (m) => console.log(`  ${c.dim}${m}${c.reset}`) }
      );
      console.log(`  ${c.green}[OK]${c.reset} ${ids.length} plugins enabled (${marketplaceName(lang)})`);
      updated++;
    } catch (err) {
      console.log(`  ${c.red}[FAIL]${c.reset} Plugins: ${err.message}`);
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
  } else {
    console.log(`${c.red}Update failed — no components were refreshed.${c.reset}\n`);
    process.exitCode = 1;
  }
}

function readPackageVersion(cliRoot) {
  return readJson(path.join(cliRoot, 'package.json'))?.version ?? 'unknown';
}

export { runUpdate };
