import path from 'node:path';

/**
 * Middleware factory : enforces same-origin for mutating requests.
 * Only http://127.0.0.1:<port> and http://localhost:<port> are accepted.
 */
export function csrfGuard(port) {
  const allowed = new Set([
    `http://127.0.0.1:${port}`,
    `http://localhost:${port}`,
  ]);
  return async (c, next) => {
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(c.req.method)) {
      return next();
    }
    const origin = c.req.header('origin');
    const referer = c.req.header('referer');
    const source = origin ?? (referer ? new URL(referer).origin : null);
    if (!source || !allowed.has(source)) {
      return c.json({ error: 'forbidden', reason: 'invalid origin' }, 403);
    }
    return next();
  };
}

/**
 * Resolves a user-provided relative path safely under a base directory.
 * Throws on path traversal attempts.
 * @param {string} baseDir - absolute, trusted
 * @param {string} userPath - user-provided, untrusted
 * @returns {string} absolute resolved path, guaranteed under baseDir
 */
export function resolveSafe(baseDir, userPath) {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, userPath);
  const rel = path.relative(base, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    const err = new Error('path traversal detected');
    err.code = 'PATH_TRAVERSAL';
    throw err;
  }
  return resolved;
}

/**
 * Rejects requests when --readonly mode is active.
 */
export function readonlyGuard(enabled) {
  return async (c, next) => {
    if (!enabled) return next();
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(c.req.method)) {
      return c.json({ error: 'readonly', reason: 'server started in --readonly mode' }, 403);
    }
    return next();
  };
}
