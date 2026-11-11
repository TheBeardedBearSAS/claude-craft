import { LockedError, MtimeMismatchError } from '../services/file-writer.js';
import { ConflictError, InvalidStatusFileError } from '../services/status-store.js';

/** A refusal decided inside a write transaction: status, stable code and optional extra body keys. */
export class HttpError extends Error {
  constructor(status, code, extra = {}) {
    super(code);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

/** Log the internal detail server-side; answer with a stable code only (no paths, no err.message). */
export function safeError(c, status, code, err) {
  console.error(`[kanban] ${code}:`, err);
  return c.json({ error: code }, status);
}

/** `If-Match` value without ETag decoration (`W/`, quotes); `*` or absent means "any". */
export function parseIfMatch(header) {
  const tag = header
    ?.trim()
    .replace(/^W\//, '')
    .replace(/^"(.*)"$/, '$1');
  return tag && tag !== '*' ? tag : null;
}

/** Maps any error thrown by a write to its HTTP answer. */
export function writeError(c, err) {
  if (err instanceof HttpError) return c.json({ error: err.code, ...err.extra }, err.status);
  if (err instanceof LockedError) return c.json({ error: 'locked' }, 423);
  if (err instanceof MtimeMismatchError) return c.json({ error: 'conflict', reason: 'file changed on disk' }, 409);
  if (err instanceof ConflictError) return c.json({ error: 'conflict', reason: err.reason, current: err.current }, 409);
  if (err instanceof InvalidStatusFileError) {
    if (err.kind === 'missing') return c.json({ error: 'sprint_status_missing' }, 409);
    if (err.kind === 'result') return c.json({ error: 'invalid_result', issues: err.issues }, 422);
    return c.json({ error: 'sprint_status_invalid', issues: err.issues }, 409);
  }
  return safeError(c, 500, 'write_failed', err);
}

/** Parses the JSON body and validates it. @returns {Promise<{ data: object } | { response: Response }>} */
export async function readJson(c, schema) {
  let body;
  try {
    body = await c.req.json();
  } catch {
    // An unparseable body is a client error, fully reported by the 400.
    return { response: c.json({ error: 'invalid_json' }, 400) };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { response: c.json({ error: 'invalid_payload', issues: parsed.error.issues }, 400) };
  return { data: parsed.data };
}
