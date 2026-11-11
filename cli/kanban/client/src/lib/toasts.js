// Toast model with pause/resume. Pure: timers and clock are injected.
// Errors never expire (WCAG 2.2.1); other kinds expire after `ttl` ms unless paused (hover/focus).
// A toast carries both the English `message` and an i18n `key` + `params` (+ `count` for a plural key) so it is
// translated at display time (toastText) and follows a change of language.

import { STATUSES } from '../../../shared/transitions.js';

const DEFAULTS = { set: (fn, ms) => setTimeout(fn, ms), clear: (h) => clearTimeout(h), now: () => Date.now() };

/**
 * @param {{ onChange: (toasts: object[])=>void, defaultTtlMs?: number,
 *           timers?: { set: Function, clear: Function, now: ()=>number } }} opts
 */
// At most this many confirmations at once: a burst of actions must not cover the board (errors are always kept).
const MAX_INFO = 3;

export function createToasts({ onChange, defaultTtlMs = 3500, timers = DEFAULTS }) {
  let seq = 0;
  let items = []; // { id, kind, message, key, params, ttl, handle, remaining, startedAt }

  const publish = () =>
    onChange(items.map(({ id, kind, message, key, params, count }) => ({ id, kind, message, key, params, count })));
  const find = (id) => items.find((t) => t.id === id);

  function arm(t) {
    if (t.kind === 'error') return;
    t.startedAt = timers.now();
    t.handle = timers.set(() => dismiss(t.id), t.remaining);
  }

  function drop(t) {
    if (t.handle !== null) timers.clear(t.handle);
    items = items.filter((x) => x.id !== t.id);
  }

  function dismiss(id) {
    const t = find(id);
    if (!t) return;
    drop(t);
    publish();
  }

  /** @returns {number} toast id (the existing one when an identical toast is already shown) */
  function push({ kind = 'info', message = '', key = null, params = {}, count, ttl = defaultTtlMs }) {
    const same = items.find((t) => t.kind === kind && t.key === key && t.message === message);
    if (same) return same.id;
    const t = { id: ++seq, kind, message, key, params, count, handle: null, remaining: ttl, startedAt: 0 };
    items = [...items, t];
    arm(t);
    const infos = items.filter((x) => x.kind !== 'error');
    for (const old of infos.slice(0, Math.max(0, infos.length - MAX_INFO))) drop(old);
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

/**
 * Text of a toast in the current language. Params: a known `status` id is translated, `reasonKey` (an i18n key)
 * becomes `reason`; a toast with a `count` uses the plural form of its key.
 * @param {{ message?: string, key?: string|null, params?: object, count?: number }} toast
 * @param {{ t: Function, tn: Function }} i18n
 */
export function toastText(toast, { t, tn }) {
  if (!toast.key) return toast.message;
  const { reasonKey, ...params } = toast.params ?? {};
  if (STATUSES.includes(params.status)) params.status = t(`status.${params.status}`);
  if (reasonKey) params.reason = t(reasonKey);
  return toast.count === undefined ? t(toast.key, params) : tn(toast.key, toast.count, params);
}
