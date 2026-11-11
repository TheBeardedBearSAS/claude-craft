import { describe, it, expect, vi } from 'vitest';
import { classifyKanbanEvent, createRefreshQueue, createLiveLink } from '../../cli/kanban/client/src/lib/events.js';
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

describe('createLiveLink', () => {
  const setup = (hidden = false) => {
    const state = { hidden, opened: 0, closed: 0 };
    const link = createLiveLink({
      open: () => (state.opened += 1),
      close: () => (state.closed += 1),
      isHidden: () => state.hidden,
    });
    return { state, link };
  };

  it('opens the connection when the page is visible', () => {
    const { state, link } = setup();
    link.start();
    expect(state).toMatchObject({ opened: 1, closed: 0 });
  });

  it('does not open it for a page loaded in the background, then opens it when the page is shown', () => {
    const { state, link } = setup(true);
    link.start();
    expect(state.opened).toBe(0);
    state.hidden = false;
    link.visibilityChanged();
    expect(state.opened).toBe(1);
  });

  it('gives the connection back when the page is hidden and takes one again when it is shown', () => {
    const { state, link } = setup();
    link.start();
    state.hidden = true;
    link.visibilityChanged();
    expect(state).toMatchObject({ opened: 1, closed: 1 });
    link.visibilityChanged(); // still hidden: nothing more to close
    expect(state.closed).toBe(1);
    state.hidden = false;
    link.visibilityChanged();
    expect(state).toMatchObject({ opened: 2, closed: 1 });
  });

  it('never opens a second connection while one is open', () => {
    const { state, link } = setup();
    link.start();
    link.start();
    link.visibilityChanged();
    expect(state.opened).toBe(1);
  });

  it('stays closed after stop(), whatever the visibility does', () => {
    const { state, link } = setup();
    link.start();
    link.stop();
    expect(state.closed).toBe(1);
    link.visibilityChanged();
    link.stop();
    expect(state).toMatchObject({ opened: 1, closed: 1 });
  });
});
