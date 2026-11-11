// Manual timers for tests: advance(ms) fires due callbacks in order.
export function fakeTimers() {
  let t = 0;
  let seq = 0;
  const pending = new Map();
  return {
    set(fn, ms) {
      pending.set(++seq, { fn, at: t + ms });
      return seq;
    },
    clear(h) {
      pending.delete(h);
    },
    now: () => t,
    advance(ms) {
      const end = t + ms;
      for (;;) {
        const next = [...pending].filter(([, p]) => p.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        pending.delete(next[0]);
        t = next[1].at;
        next[1].fn();
      }
      t = end;
    },
    get size() {
      return pending.size;
    },
  };
}
