import { describe, it, expect } from 'vitest';
import { createAnnouncer } from '../../cli/kanban/client/src/lib/announce.js';
import { fakeTimers } from './fake-timers.js';

describe('announcer', () => {
  it('speaks then clears after the ttl', () => {
    const timers = fakeTimers();
    const seen = [];
    const a = createAnnouncer({ onChange: (m) => seen.push(m), ttlMs: 1000, timers });
    a.say('moved');
    timers.advance(1000);
    expect(seen).toEqual(['moved', '']);
  });

  it('a new message replaces the previous one and restarts the countdown', () => {
    const timers = fakeTimers();
    const seen = [];
    const a = createAnnouncer({ onChange: (m) => seen.push(m), ttlMs: 1000, timers });
    a.say('one');
    timers.advance(800);
    a.say('two');
    timers.advance(800);
    expect(seen).toEqual(['one', 'two']);
    timers.advance(200);
    expect(seen).toEqual(['one', 'two', '']);
    expect(timers.size).toBe(0);
  });

  it('clear() cancels the pending timer', () => {
    const timers = fakeTimers();
    const seen = [];
    const a = createAnnouncer({ onChange: (m) => seen.push(m), timers });
    a.say('x');
    a.clear();
    expect(timers.size).toBe(0);
    expect(seen).toEqual(['x', '']);
  });
});
