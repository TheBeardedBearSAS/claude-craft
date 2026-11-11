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

// A form with unsaved input registers here (see leave-guard.js): a URL change is held back until the user chooses to
// discard the input; "keep editing" leaves the form and the URL as they were.
// Every entry the app has shown carries its position in history.state, so the router knows how far a Back/Forward
// went and travels the same distance back with history.go(); an entry it has not shown yet (link, hash assignment)
// is one step ahead. It never creates or rewrites an entry to hold a navigation back: Chrome's Back button skips an
// entry that added another one without a user gesture, and the forward entries would be lost.
// Escape is not a URL change: each form takes it itself (actions.js, asksBeforeClosing).
const leaveGuard = createLeaveGuard();
export const guardLeave = leaveGuard.add;

const history = window.history;
const stateAt = (position) => ({ ...(history.state ?? {}), kanban: position });
let position = Number.isInteger(history.state?.kanban) ? history.state.kanban : 0;
history.replaceState(stateAt(position), '');
let returning = false; // our own way back to the entry that holds the form
let cleared = false; // the user discarded the input: let the replayed navigation through

function apply() {
  const known = history.state?.kanban;
  position = Number.isInteger(known) ? known : position + 1;
  history.replaceState(stateAt(position), '');
  Object.assign(route, current());
}

window.addEventListener('hashchange', async () => {
  if (returning) {
    returning = false;
    return;
  }
  if (cleared || (!leaveGuard.busy && !leaveGuard.isDirty())) {
    cleared = false;
    return apply();
  }
  const reached = history.state?.kanban;
  const wayBack = Number.isInteger(reached) ? position - reached : -1;
  returning = true;
  history.go(wayBack);
  if (leaveGuard.busy || !(await leaveGuard.mayLeave())) return;
  // Nothing is at stake any more: replay the navigation.
  cleared = true;
  history.go(-wayBack);
});

// Leaving the app itself (reload, closing the tab, Back past the first entry): the browser asks.
window.addEventListener('beforeunload', (event) => {
  if (leaveGuard.isDirty()) event.preventDefault();
});

export function navigate(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}

/**
 * Patch the query string of the current route without adding a history entry.
 * Empty values (null, '', []) remove the key.
 */
export function setQuery(patch) {
  // From the URL as it is now, not from `route`: when a navigation has just happened and its hashchange is still
  // to come, `route` describes the page being left and rebuilding the URL from it would undo the navigation.
  const now = current();
  history.replaceState(history.state, '', formatHash(now.name, now.params, mergeQuery(now.query, patch)));
  if (now.name === route.name) Object.assign(route, current());
}
