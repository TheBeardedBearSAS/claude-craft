// Single message queue for the aria-live region. Pure: timers are injected.

/**
 * @param {{ onChange: (message:string)=>void, ttlMs?: number,
 *           timers?: { set: Function, clear: Function } }} opts
 */
export function createAnnouncer({
  onChange,
  ttlMs = 3000,
  timers = { set: (fn, ms) => setTimeout(fn, ms), clear: (h) => clearTimeout(h) },
}) {
  let handle = null;
  const stop = () => {
    if (handle !== null) timers.clear(handle);
    handle = null;
  };
  const clear = () => {
    stop();
    onChange('');
  };
  /** A new message replaces the current one and restarts the countdown. */
  const say = (message) => {
    stop();
    onChange(message);
    handle = timers.set(clear, ttlMs);
  };
  return { say, clear };
}
