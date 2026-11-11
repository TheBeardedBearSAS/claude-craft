import path from 'node:path';
import chokidar from 'chokidar';
import { _internal } from './file-scanner.js';

const IGNORED = [/\.bak$/, /\.lock$/, /\.tmp-/, /(^|[/\\])\../, /node_modules/];

/**
 * Start watching project-management/ directory for changes.
 * Publishes 'file:changed' events to eventBus after debounce.
 *
 * @param {object} opts
 * @param {string} opts.rootDir - absolute path of project-management/
 * @param {string} [opts.projectRoot] - when set, <projectRoot>/.bmad/sprint-status.yaml is watched too
 * @param {EventBus} opts.eventBus - bus to publish events
 * @param {Repository} opts.repository - cache to refresh on changes
 * @param {number} [opts.debounceMs=200] - debounce delay per path
 * @returns {{ ready: Promise<void>, stop: () => Promise<void> }} `ready` resolves once the initial scan is done
 *   and changes are actually being observed
 */
export function startWatcher({ rootDir, projectRoot, eventBus, repository, debounceMs = 200 }) {
  const statusPath = projectRoot ? path.join(projectRoot, '.bmad', 'sprint-status.yaml') : null;
  const classify = (filePath) => (filePath === statusPath ? 'sprint-status' : _internal.classify(rootDir, filePath));
  const relOf = (filePath) =>
    path
      .relative(statusPath && filePath === statusPath ? projectRoot : rootDir, filePath)
      .split(path.sep)
      .join('/');
  const debounceTimers = new Map();
  let watcher = null;
  let ready = Promise.resolve();

  const onEvent = async (event, filePath) => {
    const category = classify(filePath);
    if (!category || category === 'other') return;

    if (debounceTimers.has(filePath)) {
      clearTimeout(debounceTimers.get(filePath));
    }

    debounceTimers.set(
      filePath,
      setTimeout(async () => {
        debounceTimers.delete(filePath);
        try {
          await repository.refresh();
          eventBus.publish('file:changed', { rel: relOf(filePath), event, category });
        } catch (err) {
          console.error('[file-watcher] Error processing change:', err.message);
        }
      }, debounceMs)
    );
  };

  try {
    // The sprint-status file lives in a dot-directory: let it through, keep every other rule.
    const ignored = (p) => p !== statusPath && IGNORED.some((re) => re.test(p));
    watcher = chokidar.watch(statusPath ? [rootDir, statusPath] : rootDir, {
      ignored,
      ignoreInitial: true,
      persistent: true,
    });

    ready = new Promise((resolve) => watcher.once('ready', resolve));
    watcher
      .on('add', (p) => onEvent('add', p))
      .on('change', (p) => onEvent('change', p))
      .on('unlink', (p) => onEvent('unlink', p));
  } catch (err) {
    console.error('[file-watcher] Failed to start watcher:', err.message);
  }

  return {
    ready,
    async stop() {
      for (const timer of debounceTimers.values()) {
        clearTimeout(timer);
      }
      debounceTimers.clear();
      if (watcher) {
        await watcher.close();
        watcher = null;
      }
    },
  };
}
