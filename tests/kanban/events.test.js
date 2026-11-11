import { describe, it, expect, vi } from 'vitest';
import { classifyKanbanEvent, createRefreshQueue } from '../../cli/kanban/client/src/lib/events.js';
import { fakeTimers } from './fake-timers.js';

describe('classifyKanbanEvent (additions)', () => {
  it('reloads everything on sprint:updated', () => {
    expect(classifyKanbanEvent({ event: 'sprint:updated' })).toEqual({ reloadStories: true, reloadSprint: true });
  });
  it('also reloads health on settings:updated', () => {
    expect(classifyKanbanEvent({ event: 'settings:updated' })).toEqual({
      reloadStories: true,
      reloadSprint: true,
      reloadHealth: true,
    });
  });
  it('ignores unknown events', () => {
    expect(classifyKanbanEvent({ event: 'ping' })).toEqual({ reloadStories: false, reloadSprint: false });
    expect(classifyKanbanEvent(undefined)).toEqual({ reloadStories: false, reloadSprint: false });
  });
});

describe('createRefreshQueue', () => {
  it('coalesces a burst into one run with merged flags after the delay', () => {
    const timers = fakeTimers();
    const run = vi.fn();
    const q = createRefreshQueue({ run, delayMs: 150, timers });
    q.request({ reloadStories: true, reloadSprint: false });
    timers.advance(100);
    q.request({ reloadSprint: true, reloadHealth: true });
    timers.advance(49);
    expect(run).not.toHaveBeenCalled();
    timers.advance(1);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith({ reloadStories: true, reloadSprint: true, reloadHealth: true });
  });

  it('ignores requests with nothing to reload', () => {
    const timers = fakeTimers();
    const run = vi.fn();
    const q = createRefreshQueue({ run, timers });
    q.request({ reloadStories: false, reloadSprint: false });
    expect(timers.size).toBe(0);
  });

  it('runs again for a later burst; cancel drops the pending run', () => {
    const timers = fakeTimers();
    const run = vi.fn();
    const q = createRefreshQueue({ run, timers });
    q.request({ reloadStories: true });
    timers.advance(150);
    q.request({ reloadSprint: true });
    timers.advance(150);
    expect(run).toHaveBeenNthCalledWith(2, { reloadSprint: true });
    q.request({ reloadStories: true });
    q.cancel();
    timers.advance(1000);
    expect(run).toHaveBeenCalledTimes(2);
  });
});
