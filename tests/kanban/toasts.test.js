import { describe, it, expect } from 'vitest';
import { createToasts } from '../../cli/kanban/client/src/lib/toasts.js';
import { fakeTimers } from './fake-timers.js';

function setup(opts = {}) {
  const timers = fakeTimers();
  let list = [];
  const toasts = createToasts({ onChange: (l) => (list = l), timers, ...opts });
  return {
    timers,
    toasts,
    get list() {
      return list;
    },
  };
}

describe('toasts', () => {
  it('publishes i18n key and params next to the message', () => {
    const s = setup();
    s.toasts.push({ kind: 'success', message: 'US-1 -> done', key: 'toast.moved', params: { id: 'US-1' } });
    expect(s.list).toEqual([
      { id: 1, kind: 'success', message: 'US-1 -> done', key: 'toast.moved', params: { id: 'US-1' } },
    ]);
  });

  it('expires non-error toasts after the ttl', () => {
    const s = setup();
    s.toasts.push({ message: 'hi', ttl: 1000 });
    s.timers.advance(999);
    expect(s.list).toHaveLength(1);
    s.timers.advance(1);
    expect(s.list).toHaveLength(0);
  });

  it('never expires errors, even with an explicit ttl', () => {
    const s = setup();
    s.toasts.push({ kind: 'error', message: 'boom', ttl: 10 });
    s.timers.advance(60_000);
    expect(s.list).toHaveLength(1);
    s.toasts.dismiss(1);
    expect(s.list).toHaveLength(0);
  });

  it('pauses and resumes with the remaining time', () => {
    const s = setup();
    const id = s.toasts.push({ message: 'hi', ttl: 1000 });
    s.timers.advance(400);
    s.toasts.pause(id);
    s.timers.advance(5000);
    expect(s.list).toHaveLength(1);
    s.toasts.resume(id);
    s.timers.advance(599);
    expect(s.list).toHaveLength(1);
    s.timers.advance(1);
    expect(s.list).toHaveLength(0);
  });

  it('does not stack identical toasts', () => {
    const s = setup();
    const a = s.toasts.push({ kind: 'error', message: 'x', key: 'k' });
    const b = s.toasts.push({ kind: 'error', message: 'x', key: 'k' });
    expect(b).toBe(a);
    expect(s.list).toHaveLength(1);
  });

  it('dismiss clears the timer and ignores unknown ids', () => {
    const s = setup();
    const id = s.toasts.push({ message: 'hi' });
    s.toasts.dismiss(id);
    s.toasts.dismiss(999);
    expect(s.timers.size).toBe(0);
  });
});
