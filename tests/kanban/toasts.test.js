import { describe, it, expect } from 'vitest';
import { createToasts, toastText } from '../../cli/kanban/client/src/lib/toasts.js';
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

describe('toastText (translated at display time, so it follows a change of language)', () => {
  const t = (key, params) => `${key}${params ? JSON.stringify(params) : ''}`;
  const tn = (key, n, params) => `${key}#${n}${JSON.stringify(params)}`;
  const text = (toast) => toastText(toast, { t, tn });

  it('falls back to the message without a key', () => {
    expect(text({ message: 'raw' })).toBe('raw');
  });

  it('translates a status id and a reason given as an i18n key', () => {
    expect(text({ key: 'toast.wipExceeded', params: { status: 'in-progress', count: 4, limit: 3 } })).toBe(
      'toast.wipExceeded{"status":"status.in-progress","count":4,"limit":3}'
    );
    expect(text({ key: 'toast.planFailed', params: { id: 'US-1', reasonKey: 'error.locked' } })).toBe(
      'toast.planFailed{"id":"US-1","reason":"error.locked"}'
    );
  });

  it('keeps an unknown status as it is', () => {
    expect(text({ key: 'toast.moved', params: { status: 'deferred' } })).toBe('toast.moved{"status":"deferred"}');
  });

  it('uses the plural form when the toast carries a count', () => {
    expect(text({ key: 'toast.plannedMany', count: 2, params: { sprint: 'S1' } })).toBe(
      'toast.plannedMany#2{"sprint":"S1"}'
    );
  });

  it('publishes the count with the toast', () => {
    const s = setup();
    s.toasts.push({ kind: 'success', key: 'toast.plannedMany', count: 3, params: {} });
    expect(s.list[0].count).toBe(3);
  });
});

describe('toasts: a burst of confirmations never fills the screen', () => {
  it('keeps the 3 most recent non-error toasts; errors are never dropped', () => {
    const s = setup();
    s.toasts.push({ kind: 'error', message: 'e1' });
    for (const m of ['a', 'b', 'c', 'd', 'e']) s.toasts.push({ kind: 'success', message: m });
    expect(s.list.map((x) => x.message)).toEqual(['e1', 'c', 'd', 'e']);
  });

  it('a dropped toast has its timer cleared', () => {
    const s = setup();
    for (const m of ['a', 'b', 'c', 'd']) s.toasts.push({ kind: 'info', message: m, ttl: 1000 });
    s.timers.advance(1000);
    expect(s.list).toEqual([]);
  });
});
