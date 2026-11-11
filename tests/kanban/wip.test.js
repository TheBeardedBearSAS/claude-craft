import { describe, it, expect } from 'vitest';
import { wipState, columnCount } from '../../cli/kanban/client/src/lib/wip.js';

describe('wipState', () => {
  it.each([
    [2, undefined, 'none'],
    [2, null, 'none'],
    [2, 0, 'none'],
    [2, 'x', 'none'],
    [0, 3, 'ok'],
    [2, 3, 'ok'],
    [3, 3, 'at'],
    [4, 3, 'over'],
    [1, 1, 'at'],
  ])('count %s with limit %s is %s', (count, limit, expected) => {
    expect(wipState(count, limit)).toBe(expected);
  });
});

describe('columnCount', () => {
  const stories = [
    { id: 'A', status: 'review', sprint_id: 's1' },
    { id: 'B', status: 'review', sprint_id: 's1' },
    { id: 'C', status: 'review', sprint_id: 's0' },
    { id: 'D', status: 'done', sprint_id: 's1' },
  ];

  it('counts the stories of a status inside the active sprint', () => {
    expect(columnCount(stories, 's1', 'review')).toBe(2);
  });

  it('counts every story when there is no active sprint (the board shows them all)', () => {
    expect(columnCount(stories, null, 'review')).toBe(3);
  });
});
