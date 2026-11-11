import { describe, it, expect } from 'vitest';
import { applyPatch, restore, replaceStory, createWriteTracker } from '../../cli/kanban/client/src/lib/optimistic.js';

const list = () => [
  { id: 'a', status: 'backlog' },
  { id: 'b', status: 'review' },
];

describe('optimistic updates', () => {
  it('patches by id and returns the snapshot', () => {
    const { stories, before } = applyPatch(list(), 'b', { status: 'done' });
    expect(stories.map((s) => s.status)).toEqual(['backlog', 'done']);
    expect(before).toEqual({ id: 'b', status: 'review' });
  });

  it('does not mutate the input and ignores unknown ids', () => {
    const l = list();
    applyPatch(l, 'a', { status: 'done' });
    expect(l).toEqual(list());
    const r = applyPatch(l, 'zz', {});
    expect(r.before).toBeUndefined();
    expect(r.stories).toBe(l);
  });

  it('restores by id even if the list was reordered meanwhile', () => {
    const { stories, before } = applyPatch(list(), 'a', { status: 'done' });
    const reordered = [...stories].reverse();
    expect(restore(reordered, before).find((s) => s.id === 'a').status).toBe('backlog');
  });

  it('restore is a no-op when the story vanished or there is no snapshot', () => {
    const l = [{ id: 'b' }];
    expect(restore(l, { id: 'a' })).toBe(l);
    expect(restore(l, undefined)).toBe(l);
  });

  it('replaceStory swaps in the server version', () => {
    expect(replaceStory(list(), { id: 'a', status: 'ready-for-dev' })[0].status).toBe('ready-for-dev');
  });
});

describe('writes still on their way', () => {
  const later = () => {
    let settle;
    const promise = new Promise((resolve, reject) => (settle = { resolve, reject }));
    return { promise, ...settle };
  };
  const state = async (promise) => {
    let done = false;
    promise.then(() => (done = true));
    await new Promise((r) => setTimeout(r, 0));
    return done;
  };

  it('nothing pending: settled at once', async () => {
    expect(await state(createWriteTracker().settled('a'))).toBe(true);
  });

  it('waits for every write of that story, failed ones included, and only for that story', async () => {
    const writes = createWriteTracker();
    const first = later();
    const second = later();
    const other = later();
    expect(writes.track('a', first.promise)).toBe(first.promise);
    writes.track('a', second.promise).catch(() => {});
    writes.track('b', other.promise);
    const settled = writes.settled('a');
    expect(writes.pending()).toBe(true);
    first.resolve();
    expect(await state(settled)).toBe(false);
    second.reject(new Error('409'));
    expect(await state(settled)).toBe(true);
    expect(writes.pending()).toBe(true); // story b
    other.resolve();
    await state(writes.settled('b'));
    expect(writes.pending()).toBe(false);
  });
});
