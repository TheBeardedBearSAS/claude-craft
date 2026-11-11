// Minimal hash-based router using Svelte 5 runes. Parsing/formatting lives in query.js (pure, tested).
// route = { name, params, query, pathname, parts }
//   #/kanban, #/backlog, #/burndown, #/deps  -> name only
//   #/sprints[/<id>]                         -> params.id
//   #/docs[/<rel path, URI-encoded>]         -> params.rel
//   anything else                            -> name: 'not-found'
// `query` is an object (see query.js); `?story=<id>` opens the detail from any view.

import { parseHash, formatHash, mergeQuery } from './query.js';
import { createLeaveGuard } from './leave-guard.js';

const current = () => parseHash(window.location.hash);

export const route = $state(current());

// A form with unsaved input registers here (see leave-guard.js): a URL change is held back — the previous URL is
// put back at once — until the user chooses to discard the input; "keep editing" leaves everything as it was.
// Every entry the app has shown is stamped in history.state: reaching a stamped entry is a Back/Forward (it is held
// back with pushState so the user can press Back again), a new entry (link, hash assignment) is simply replaced.
const leaveGuard = createLeaveGuard();
export const guardLeave = leaveGuard.add;

const history = window.history;
const stamp = () => history.replaceState({ ...(history.state ?? {}), kanban: 1 }, '');
stamp();

function apply() {
  stamp();
  Object.assign(route, current());
}

window.addEventListener('hashchange', async (event) => {
  if (!leaveGuard.busy && !leaveGuard.isDirty()) return apply();
  const revisit = Boolean(history.state?.kanban);
  if (revisit) history.pushState(history.state, '', event.oldURL);
  else history.replaceState(history.state, '', event.oldURL);
  if (leaveGuard.busy || !(await leaveGuard.mayLeave())) return;
  // Nothing is at stake any more: replay the navigation.
  if (revisit) return history.back();
  history.replaceState(history.state, '', event.newURL);
  apply();
});

export function navigate(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}

/**
 * Patch the query string of the current route without adding a history entry.
 * Empty values (null, '', []) remove the key.
 */
export function setQuery(patch) {
  const query = mergeQuery(route.query, patch);
  history.replaceState(history.state, '', formatHash(route.name, route.params, query));
  Object.assign(route, current());
}
