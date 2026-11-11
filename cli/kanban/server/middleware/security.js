import path from 'node:path';

/**
 * Middleware factory : enforces same-origin for mutating requests.
 * Only http://127.0.0.1:<port> and http://localhost:<port> are accepted.
 */
export function csrfGuard(port) {
  return async (c, next) => {
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(c.req.method)) {
      return next();
    }
    const origin = c.req.header('origin');
    const referer = c.req.header('referer');
    let source = origin ?? null;
    if (!source && referer) {
      try {
        source = new URL(referer).origin;
      } catch {
        // Referer malformé : traité comme absent → 403 en aval
        source = null;
      }
    }
    const p = servedPort(c, port);
    if (source !== `http://127.0.0.1:${p}` && source !== `http://localhost:${p}`) {
      return c.json({ error: 'forbidden', reason: 'invalid origin' }, 403);
    }
    return next();
  };
}

const LOOPBACK_HOSTS = ['127.0.0.1', 'localhost', '[::1]'];

// Port of the socket that received the request; the configured one in-process (app.request(), no socket).
function servedPort(c, port) {
  return c.env?.incoming?.socket?.localPort ?? port;
}

/**
 * Middleware factory : rejects requests whose Host header is not a loopback
 * name on the served port (DNS rebinding protection, GET included).
 */
export function hostGuard(port) {
  return async (c, next) => {
    const socket = c.env?.incoming?.socket;
    const host = c.req.header('host');
    // Rule: Host must be exactly <loopback>:<port of the listening socket> (configured port when in-process); a
    // missing Host is only tolerated in-process (app.request(), no socket) since Node rejects Host-less HTTP/1.1.
    if (!socket && host === undefined) return next();
    const p = servedPort(c, port);
    if (!LOOPBACK_HOSTS.some((h) => host === `${h}:${p}`)) {
      return c.json({ error: 'forbidden' }, 403);
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
