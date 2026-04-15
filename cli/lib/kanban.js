/**
 * claude-craft kanban : launches a local HTTP server that serves an interactive
 * Kanban view of a BMAD v6 project-management/ directory.
 *
 * Usage : claude-craft kanban [--port=3737] [--open] [--readonly] [--no-watch]
 *
 * @module cli/lib/kanban
 */

import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import colors from './colors.js';

const c = colors;

function resolvePM(targetPath) {
  const abs = path.resolve(targetPath);
  const pm = path.join(abs, 'project-management');
  if (!fs.existsSync(pm) || !fs.statSync(pm).isDirectory()) {
    return null;
  }
  return { projectRoot: abs, pmDir: pm };
}

function openBrowser(url) {
  const opener =
    process.platform === 'darwin' ? 'open' :
    process.platform === 'win32' ? 'start' :
    'xdg-open';
  try {
    spawn(opener, [url], { detached: true, stdio: 'ignore' }).unref();
  } catch {
    /* best-effort ; user can click the printed URL */
  }
}

/**
 * @param {object} opts
 * @param {string} opts.targetPath
 * @param {object} opts.options - parsed CLI options
 */
export async function runKanban({ targetPath, options }) {
  const resolved = resolvePM(targetPath);
  if (!resolved) {
    console.error(
      `${c.red}Error: no 'project-management/' directory found under ${path.resolve(targetPath)}.${c.reset}\n` +
      `Run ${c.bold}/workflow:plan${c.reset} in Claude Code first, or cd into a BMAD project.`,
    );
    process.exit(1);
  }
  const { projectRoot, pmDir } = resolved;

  const port = Number(options.port ?? 3737);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`${c.red}Error: invalid --port value "${options.port}"${c.reset}`);
    process.exit(1);
  }
  const readonly = !!options.readonly;
  const watch = options.watch !== false && !options['no-watch'];
  const shouldOpen = !!options.open;

  // Lazy-load server deps (avoids loading Hono/chokidar on unrelated CLI commands).
  const { Repository } = await import('../kanban/server/services/repository.js');
  const { createApp } = await import('../kanban/server/app.js');
  const { EventBus } = await import('../kanban/server/services/event-bus.js');
  const { serve } = await import('@hono/node-server');

  const repository = new Repository(pmDir);
  await repository.refresh();
  const eventBus = new EventBus();
  const app = createApp({ repository, port, readonly, eventBus, projectRoot });

  let stopWatcher = null;
  if (watch) {
    const { startWatcher } = await import('../kanban/server/services/file-watcher.js');
    const handle = startWatcher({ rootDir: pmDir, repository, eventBus });
    stopWatcher = handle.stop;
  }

  const server = serve({
    fetch: app.fetch,
    hostname: '127.0.0.1',
    port,
  });

  const url = `http://127.0.0.1:${port}`;
  console.log(`${c.green}claude-craft kanban${c.reset} serving ${c.bold}${pmDir}${c.reset}`);
  console.log(`  ${c.cyan}${url}${c.reset}${readonly ? `  ${c.dim}(readonly)${c.reset}` : ''}`);
  console.log(`  ${c.dim}watching:${c.reset} ${watch ? 'yes' : 'no'}`);
  console.log(`  ${c.dim}Press Ctrl+C to stop.${c.reset}\n`);

  if (shouldOpen) openBrowser(url);

  const shutdown = async () => {
    console.log(`\n${c.dim}stopping...${c.reset}`);
    if (stopWatcher) await stopWatcher();
    if (server && typeof server.close === 'function') {
      await new Promise((resolve) => server.close(resolve));
    }
    eventBus.clear();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
