// Toast model with pause/resume. Pure: timers and clock are injected.
// Errors never expire (WCAG 2.2.1); other kinds expire after `ttl` ms unless paused (hover/focus).
// A toast carries both the English `message` and an i18n `key` + `params` so it can be translated at display time.

const DEFAULTS = { set: (fn, ms) => setTimeout(fn, ms), clear: (h) => clearTimeout(h), now: () => Date.now() };

/**
 * @param {{ onChange: (toasts: object[])=>void, defaultTtlMs?: number,
 *           timers?: { set: Function, clear: Function, now: ()=>number } }} opts
 */
export function createToasts({ onChange, defaultTtlMs = 3500, timers = DEFAULTS }) {
  let seq = 0;
  let items = []; // { id, kind, message, key, params, ttl, handle, remaining, startedAt }

  const publish = () =>
    onChange(items.map(({ id, kind, message, key, params }) => ({ id, kind, message, key, params })));
  const find = (id) => items.find((t) => t.id === id);

  function arm(t) {
    if (t.kind === 'error') return;
    t.startedAt = timers.now();
    t.handle = timers.set(() => dismiss(t.id), t.remaining);
  }

  function dismiss(id) {
    const t = find(id);
    if (!t) return;
    if (t.handle !== null) timers.clear(t.handle);
    items = items.filter((x) => x.id !== id);
    publish();
  }

  /** @returns {number} toast id (the existing one when an identical toast is already shown) */
  function push({ kind = 'info', message = '', key = null, params = {}, ttl = defaultTtlMs }) {
    const same = items.find((t) => t.kind === kind && t.key === key && t.message === message);
    if (same) return same.id;
    const t = { id: ++seq, kind, message, key, params, handle: null, remaining: ttl, startedAt: 0 };
    items = [...items, t];
    arm(t);
    publish();
    return t.id;
  }

  function pause(id) {
    const t = find(id);
    if (!t || t.handle === null) return;
    timers.clear(t.handle);
    t.handle = null;
    t.remaining = Math.max(0, t.remaining - (timers.now() - t.startedAt));
  }

  function resume(id) {
    const t = find(id);
    if (t && t.handle === null) arm(t);
  }

  return { push, dismiss, pause, resume };
}
