const KEY_RE = /^[\x21-\x7e]{8,128}$/;

export const IDEMPOTENCY_HEADER = 'Idempotency-Key';
export const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000;
export const IDEMPOTENCY_MAX_ENTRIES = 500;

/** An opaque client-chosen token: 8..128 visible ASCII characters. */
export const isValidKey = (key) => typeof key === 'string' && KEY_RE.test(key);

/**
 * In-process memory of the answers to non-idempotent requests (POST). The first call with a (scope, key) runs the
 * task; the same pair within `ttlMs` gets the same value without running it again, also while the task is in flight.
 * Bounded by `maxEntries` (oldest dropped first). Lost on restart: it protects against a double submit, not a replay
 * days later.
 */
export function createIdempotencyStore({
  ttlMs = IDEMPOTENCY_TTL_MS,
  maxEntries = IDEMPOTENCY_MAX_ENTRIES,
  now = Date.now,
} = {}) {
  const entries = new Map(); // `${scope}\n${key}` -> { at, promise }

  const prune = () => {
    const limit = now() - ttlMs;
    for (const [id, entry] of entries) if (entry.at <= limit) entries.delete(id);
    while (entries.size > maxEntries) entries.delete(entries.keys().next().value);
  };

  return {
    get size() {
      return entries.size;
    },
    /** @param {(value: any) => boolean} [shouldCache] a value it refuses (an error answer) is forgotten */
    run(scope, key, task, shouldCache = () => true) {
      prune();
      const id = `${scope}\n${key}`;
      const known = entries.get(id);
      if (known) return known.promise;
      const promise = task();
      entries.set(id, { at: now(), promise });
      prune();
      const forget = () => entries.get(id)?.promise === promise && entries.delete(id);
      promise.then((value) => shouldCache(value) || forget(), forget);
      return promise;
    },
  };
}

const isSuccess = (answer) => answer.status < 400;

/**
 * Wraps a Hono handler: with an `Idempotency-Key` header, a second request on the same path with the same key
 * replays the first answer (status, body, content type) and runs nothing. Only successful answers are kept.
 */
export function idempotent(store, handler) {
  return async (c) => {
    const key = c.req.header(IDEMPOTENCY_HEADER);
    if (key === undefined) return handler(c);
    if (!isValidKey(key)) return c.json({ error: 'invalid_idempotency_key' }, 400);
    let ran = false;
    const answer = await store.run(
      `${c.req.method} ${c.req.path}`,
      key,
      async () => {
        ran = true;
        const res = await handler(c);
        return { status: res.status, type: res.headers.get('content-type'), text: await res.text() };
      },
      isSuccess
    );
    const headers = {
      ...(answer.type ? { 'Content-Type': answer.type } : {}),
      ...(ran ? {} : { 'Idempotent-Replayed': 'true' }),
    };
    return c.body(answer.text, answer.status, headers);
  };
}
