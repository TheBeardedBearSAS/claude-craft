// Pure helpers of the app shell (search shortcuts, diagnostics banner, connection announcements).

import { formatHash } from './query.js';

const LIVE_SEARCH_VIEWS = new Set(['kanban', 'backlog']);
const SPRINT_STATUS_FILE = '.bmad/sprint-status.yaml';

/** Board and Backlog filter as you type; other views navigate to the backlog on Enter. */
export const isLiveSearchView = (name) => LIVE_SEARCH_VIEWS.has(name);

function isEditable(target) {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable === true;
}

/** Ctrl/Cmd+K anywhere, "/" outside a text field. Never while a modal is open. */
export function isSearchShortcut(event, { modalOpen = false } = {}) {
  if (modalOpen) return false;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') return true;
  return event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !isEditable(event.target);
}

/** Destination hash of a search submitted from a view without live filtering. */
export function searchSubmitHash(draft) {
  return formatHash('backlog', {}, { q: String(draft ?? '').trim() });
}

/** Flat list of { file, message } from GET /api/diagnostics (empty when everything is readable). */
export function diagnosticsItems(diag) {
  const items = [];
  const status = diag?.sprint_status;
  if (status?.state === 'invalid') {
    const issues = status.issues?.length ? status.issues : [status.state];
    for (const message of issues) items.push({ file: SPRINT_STATUS_FILE, message });
  }
  for (const f of diag?.files ?? []) {
    for (const message of f.errors ?? []) items.push({ file: f.rel, message });
  }
  return items;
}

/** Feeds on `store.connected`; returns 'lost' / 'restored' on a transition after a first connection. */
export function createConnectionTracker() {
  let everConnected = false;
  let current = false;
  return {
    update(connected) {
      if (connected === current) return null;
      current = connected;
      if (connected && !everConnected) {
        everConnected = true;
        return null;
      }
      return connected ? 'restored' : everConnected ? 'lost' : null;
    },
  };
}
