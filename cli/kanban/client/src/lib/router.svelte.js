// Minimal hash-based router using Svelte 5 runes. Parsing/formatting lives in query.js (pure, tested).
// route = { name, params, query, pathname, parts }
//   #/kanban, #/backlog, #/burndown, #/deps  -> name only
//   #/sprints[/<id>]                         -> params.id
//   #/docs[/<rel path, URI-encoded>]         -> params.rel
//   anything else                            -> name: 'not-found'
// `query` is an object (see query.js); `?story=<id>` opens the detail from any view.

import { parseHash, formatHash, mergeQuery } from './query.js';

const current = () => parseHash(window.location.hash);

export const route = $state(current());

window.addEventListener('hashchange', () => {
  Object.assign(route, current());
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
  window.history.replaceState(window.history.state, '', formatHash(route.name, route.params, query));
  Object.assign(route, current());
}
