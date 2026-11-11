// SSE event classification and refresh batching for the reactive store. Pure (no DOM).
// Bug #7: connectEvents() reloaded stories but never the sprint/burndown, so the
// chart and topbar progress went stale after a card moved. This decides what to
// refresh for a given event.

const STORY_RELEVANT_CATEGORIES = new Set(['story', 'task', 'epic', 'sprint-status']);
const ALL = { reloadStories: true, reloadSprint: true };
const NONE = { reloadStories: false, reloadSprint: false };

/**
 * @param {{event?:string, payload?:{category?:string}}} msg
 * @returns {{ reloadStories:boolean, reloadSprint:boolean, reloadHealth?:boolean }}
 *   reloadHealth is only present (true) for settings changes (WIP limits live in /api/health).
 */
export function classifyKanbanEvent(msg) {
  const event = msg?.event;
  if (event === 'story:updated' || event === 'sprint:updated') return { ...ALL };
  if (event === 'settings:updated') return { ...ALL, reloadHealth: true };
  if (event === 'file:changed' && STORY_RELEVANT_CATEGORIES.has(msg?.payload?.category)) return { ...ALL };
  return { ...NONE };
}

/**
 * Coalesce bursts of refresh requests (a write fires story:updated AND file:changed) into one run.
 * Flags are OR-ed while waiting; `run` receives the merged flags.
 * @param {{ run: (flags:object)=>any, delayMs?: number, timers?: { set: Function, clear: Function } }} opts
 */
export function createRefreshQueue({
  run,
  delayMs = 150,
  timers = { set: (fn, ms) => setTimeout(fn, ms), clear: (h) => clearTimeout(h) },
}) {
  let pending = null;
  let handle = null;

  const flush = () => {
    const flags = pending;
    pending = null;
    handle = null;
    if (flags) return run(flags);
  };

  function request(flags) {
    const wanted = Object.entries(flags).filter(([, v]) => v);
    if (wanted.length === 0) return;
    pending = { ...pending, ...Object.fromEntries(wanted) };
    if (handle === null) handle = timers.set(flush, delayMs);
  }

  function cancel() {
    if (handle !== null) timers.clear(handle);
    handle = null;
    pending = null;
  }

  return { request, flush, cancel };
}

/**
 * When the live connection is open: only while the page is visible. A browser allows six connections per server
 * over HTTP/1.1 and every open board would keep one; boards left in background tabs would use them all up and a
 * seventh tab would wait for its document for ever. Pure: the caller wires the DOM events and the EventSource.
 * @param {{ open: () => void, close: () => void, isHidden: () => boolean }} deps
 */
export function createLiveLink({ open, close, isHidden }) {
  let wanted = false;
  let connected = false;
  const sync = () => {
    const should = wanted && !isHidden();
    if (should === connected) return;
    connected = should;
    if (should) open();
    else close();
  };
  return {
    start() {
      wanted = true;
      sync();
    },
    stop() {
      wanted = false;
      sync();
    },
    visibilityChanged: sync,
  };
}
