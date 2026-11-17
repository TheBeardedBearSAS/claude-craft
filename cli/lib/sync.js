/**
 * CLI `sync` command — replay .bear-craft/install.json on this machine (after a clone or a move).
 * @module cli/lib/sync
 */

import c from './colors.js';
import { assertSafeTarget } from './path-safety.js';
import { PluginInstallError, syncPlugins } from './plugin-install.js';

/**
 * Re-register the project marketplace and (re)install the recorded plugins. Idempotent, rules untouched.
 * @param {string} targetPath - Project directory
 * @param {{execFn?: Function}} [deps] - Injectable dependencies for testing
 */
function runSync(targetPath, deps = {}) {
  const target = assertSafeTarget(targetPath);
  console.log(`\n${c.bold}Bear Craft Sync${c.reset}`);
  console.log(`${c.dim}Directory: ${target}${c.reset}\n`);
  try {
    const { ids, marketplace } = syncPlugins(target, {
      ...deps,
      log: (m) => console.log(`  ${c.dim}${m}${c.reset}`),
    });
    console.log(`\n${c.green}[OK]${c.reset} ${ids.length} plugins enabled from ${marketplace}\n`);
  } catch (err) {
    if (!(err instanceof PluginInstallError)) throw err;
    console.error(`${c.red}${err.message}${c.reset}\n`);
    process.exitCode = 1;
  }
}

export { runSync };
