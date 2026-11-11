// HTTP client for the Kanban API. No Svelte; only needs fetch.

export class ApiError extends Error {
  /** @param {{ status:number, code:string, body:object|null, message?:string }} p */
  constructor({ status, code, body, message }) {
    super(message ?? code);
    this.name = 'ApiError';
    this.status = status; // 0 = network failure
    this.code = code; // server `error` field, 'network' or 'http_<status>'
    this.body = body;
  }
}

export const isAbort = (err) => err?.name === 'AbortError';

async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function send(url, init) {
  try {
    return await fetch(url, init);
  } catch (err) {
    if (isAbort(err)) throw err;
    throw new ApiError({ status: 0, code: 'network', body: null, message: err?.message });
  }
}

/**
 * JSON request (`{ as: 'text' }` reads a text body instead, e.g. markdown documents).
 * Throws ApiError (status, code, body) on network failure or non-2xx.
 */
export async function request(url, { as = 'json', ...init } = {}) {
  const text = as === 'text';
  const headers = text ? (init.headers ?? {}) : { 'Content-Type': 'application/json', ...(init.headers ?? {}) };
  const res = await send(url, { ...init, headers });
  if (res.ok) return text ? res.text() : readJson(res);
  const body = await readJson(res);
  const code = typeof body?.error === 'string' && body.error ? body.error : `http_${res.status}`;
  throw new ApiError({ status: res.status, code, body, message: body?.error || `HTTP ${res.status}` });
}

/** '/api/stories/<encoded id><suffix>' — ids end up in the path, always encode (K-19). */
export function storyUrl(id, suffix = '') {
  return `/api/stories/${encodeURIComponent(id)}${suffix}`;
}

/** i18n key for an API error: 'error.<code>' (translate() falls back to 'error.unknown'). */
export function errorKey(err) {
  return /^[a-z0-9_]+$/.test(err?.code ?? '') ? `error.${err.code}` : 'error.unknown';
}

/**
 * Guard against stale responses. Each call to the returned function starts a new "ticket" and aborts
 * the previous one's signal; after each await, check `ticket.current` before touching state.
 * const run = latestOnly(); const t = run(); const data = await request(url, { signal: t.signal }); if (!t.current) return;
 */
export function latestOnly() {
  let last = null;
  return () => {
    last?.controller.abort();
    const controller = new globalThis.AbortController();
    const ticket = {
      controller,
      signal: controller.signal,
      get current() {
        return last === ticket;
      },
    };
    last = ticket;
    return ticket;
  };
}
