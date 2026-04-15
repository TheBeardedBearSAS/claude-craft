// Minimal hash-based router using Svelte 5 runes.
// Routes : #/kanban, #/backlog, #/burndown, #/deps, #/docs[/<path>]

function parse() {
  const raw = window.location.hash.slice(1) || '/kanban';
  const [pathname, query = ''] = raw.split('?');
  const parts = pathname.split('/').filter(Boolean);
  return { pathname, parts, query };
}

export const route = $state(parse());

window.addEventListener('hashchange', () => {
  Object.assign(route, parse());
});

export function navigate(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}
