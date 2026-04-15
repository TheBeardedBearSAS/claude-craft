import { describe, it, expect } from 'vitest';
import { EventBus } from '../../cli/kanban/server/services/event-bus.js';

describe('EventBus', () => {
  it('delivers published events to subscribers', () => {
    const bus = new EventBus();
    const received = [];
    bus.subscribe((m) => received.push(m));
    bus.publish('x', { a: 1 });
    expect(received).toHaveLength(1);
    expect(received[0].event).toBe('x');
    expect(received[0].payload).toEqual({ a: 1 });
    expect(typeof received[0].ts).toBe('number');
  });

  it('returns unsubscribe function', () => {
    const bus = new EventBus();
    const received = [];
    const off = bus.subscribe((m) => received.push(m));
    bus.publish('a', 1);
    off();
    bus.publish('b', 2);
    expect(received).toHaveLength(1);
    expect(bus.size).toBe(0);
  });

  it('isolates subscriber failures', () => {
    const bus = new EventBus();
    const ok = [];
    bus.subscribe(() => { throw new Error('boom'); });
    bus.subscribe((m) => ok.push(m));
    expect(() => bus.publish('x', {})).not.toThrow();
    expect(ok).toHaveLength(1);
  });

  it('clears all subscribers', () => {
    const bus = new EventBus();
    bus.subscribe(() => {});
    bus.subscribe(() => {});
    expect(bus.size).toBe(2);
    bus.clear();
    expect(bus.size).toBe(0);
  });
});
