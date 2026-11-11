import { describe, it, expect } from 'vitest';
import { applyPatch, restore, replaceStory } from '../../cli/kanban/client/src/lib/optimistic.js';

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
