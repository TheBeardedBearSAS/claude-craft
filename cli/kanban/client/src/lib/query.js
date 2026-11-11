// Query-string and hash-route helpers. Pure (no DOM, no Svelte).
// URL shape: #/kanban?q=auth&prio=must,should&who=alice&epic=E4&sort=priority&dir=desc&story=US-E4-03

const EMPTY = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

/** 'a=1&b=x%20y' (leading '?' tolerated) -> { a: '1', b: 'x y' }. First occurrence wins. */
export function parseQuery(str) {
  const out = {};
  for (const [k, v] of new globalThis.URLSearchParams(String(str ?? '').replace(/^\?/, ''))) {
    if (!(k in out)) out[k] = v;
  }
  return out;
}

const enc = (v) => encodeURIComponent(v).replace(/%2C/gi, ',');

/** Stable serialization: sorted keys, empty values dropped, arrays joined by ','. */
export function buildQuery(obj) {
  return Object.keys(obj ?? {})
    .filter((k) => !EMPTY(obj[k]))
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${enc(Array.isArray(obj[k]) ? obj[k].join(',') : String(obj[k]))}`)
    .join('&');
}

/** Apply a patch to a query object (or string). Empty patch values remove the key. */
export function mergeQuery(q, patch) {
  const base = typeof q === 'string' ? parseQuery(q) : { ...(q ?? {}) };
  for (const [k, v] of Object.entries(patch ?? {})) {
    if (EMPTY(v)) delete base[k];
    else base[k] = Array.isArray(v) ? v.join(',') : String(v);
  }
  return base;
}

/** Query object -> typed filters consumed by filter.js. */
export function filtersFromQuery(q) {
  const src = typeof q === 'string' ? parseQuery(q) : (q ?? {});
  return {
    q: src.q ?? '',
    prio: (src.prio ?? '').split(',').filter(Boolean),
    who: src.who ?? '',
    epic: src.epic ?? '',
    sort: src.sort ?? '',
    dir: src.dir === 'desc' ? 'desc' : 'asc',
    story: src.story ?? '',
  };
}

// ---- hash routes ---------------------------------------------------------

const VIEWS = new Set(['kanban', 'backlog', 'sprints', 'burndown', 'deps', 'docs']);

const NOT_FOUND = (pathname, parts, query) => ({ name: 'not-found', params: {}, query, pathname, parts });

function decodeAll(parts) {
  try {
    return parts.map(decodeURIComponent);
  } catch {
    return null;
  }
}

/** '#/docs/a%2Fb.md?x=1' -> { name, params, query, pathname, parts } (parts are raw, not decoded). */
export function parseHash(hash) {
  const raw = String(hash ?? '').replace(/^#/, '') || '/kanban';
  const qi = raw.indexOf('?');
  const pathname = qi === -1 ? raw : raw.slice(0, qi);
  const query = parseQuery(qi === -1 ? '' : raw.slice(qi + 1));
  const parts = pathname.split('/').filter(Boolean);
  const decoded = decodeAll(parts);
  const [name = 'kanban', ...rest] = decoded ?? [''];
  if (!decoded || !VIEWS.has(name)) return NOT_FOUND(pathname, parts, query);
  if (name === 'docs') return { name, params: rest.length ? { rel: rest.join('/') } : {}, query, pathname, parts };
  if (name === 'sprints' && rest.length <= 1) {
    return { name, params: rest.length ? { id: rest[0] } : {}, query, pathname, parts };
  }
  if (rest.length) return NOT_FOUND(pathname, parts, query);
  return { name, params: {}, query, pathname, parts };
}

/** (name, params, query) -> '#/…' (inverse of parseHash). */
export function formatHash(name, params = {}, query = {}) {
  let path = `/${name}`;
  if (name === 'docs' && params.rel) path += `/${params.rel.split('/').map(encodeURIComponent).join('/')}`;
  if (name === 'sprints' && params.id) path += `/${encodeURIComponent(params.id)}`;
  const qs = buildQuery(query);
  return `#${path}${qs ? `?${qs}` : ''}`;
}
