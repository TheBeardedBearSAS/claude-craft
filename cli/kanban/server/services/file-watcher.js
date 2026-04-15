import chokidar from 'chokidar';
import { _internal } from './file-scanner.js';

/**
 * Start watching project-management/ directory for changes.
 * Publishes 'file:changed' events to eventBus after debounce.
 *
 * @param {object} opts
 * @param {string} opts.rootDir - absolute path to watch
 * @param {EventBus} opts.eventBus - bus to publish events
 * @param {Repository} opts.repository - cache to refresh on changes
 * @param {number} [opts.debounceMs=200] - debounce delay per path
 * @returns {object} - { stop: async () => void }
 */
export function startWatcher({ rootDir, eventBus, repository, debounceMs = 200 }) {
  const debounceTimers = new Map();
  let watcher = null;

  const onEvent = async (event, filePath) => {
    const category = _internal.classify(rootDir, filePath);
    if (!category || category === 'other') return;

    if (debounceTimers.has(filePath)) {
      clearTimeout(debounceTimers.get(filePath));
    }

    debounceTimers.set(filePath, setTimeout(async () => {
      debounceTimers.delete(filePath);
      try {
        await repository.refresh();
        eventBus.publish('file:changed', { path: filePath, event, category });
      } catch (err) {
        console.error('[file-watcher] Error processing change:', err.message);
      }
    }, debounceMs));
  };

  try {
    watcher = chokidar.watch(rootDir, {
      ignored: [
        /\.bak$/,
        /\.lock$/,
        /\.tmp-/,
        /(^|[/\\])\../,
        /node_modules/,
      ],
      ignoreInitial: true,
      persistent: true,
    });

    watcher
      .on('add', (path) => onEvent('add', path))
      .on('change', (path) => onEvent('change', path))
      .on('unlink', (path) => onEvent('unlink', path));

  } catch (err) {
    console.error('[file-watcher] Failed to start watcher:', err.message);
  }

  return {
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
