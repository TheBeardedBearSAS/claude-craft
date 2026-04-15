/**
 * Minimal in-memory event bus with SSE-friendly fan-out.
 * Subscribers receive objects ; the route layer serializes them for SSE.
 */
export class EventBus {
  constructor() {
    this.subscribers = new Set();
  }

  subscribe(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  publish(event, payload) {
    const msg = { event, payload, ts: Date.now() };
    for (const fn of [...this.subscribers]) {
      try {
        fn(msg);
      } catch {
        /* isolate subscriber failures */
      }
    }
  }

  get size() {
    return this.subscribers.size;
  }

  clear() {
    this.subscribers.clear();
  }
}
