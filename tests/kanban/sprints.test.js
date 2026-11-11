import { describe, it, expect } from 'vitest';
import {
  summarizeSprint,
  sortSprints,
  sprintState,
  sprintTotals,
  groupTasksByStory,
} from '../../cli/kanban/client/src/lib/sprints.js';

const mkFile = (category, name) => ({
  category,
  path: `/pm/sprints/sprint-001/${name}`,
});

describe('summarizeSprint', () => {
  it('counts stories and points belonging to the sprint', () => {
    const entry = { id: 'sprint-001', files: [], goalPath: null };
    const stories = [
      { sprint_id: 'sprint-001', status: 'done', story_points: 3 },
      { sprint_id: 'sprint-001', status: 'in-progress', story_points: 5 },
      { sprint_id: 'sprint-002', status: 'done', story_points: 8 }, // excluded
    ];
    const s = summarizeSprint(entry, stories);
    expect(s.story_count).toBe(2);
    expect(s.total_points).toBe(8);
    expect(s.done_points).toBe(3);
  });

  it('has_goal reflects goalPath presence', () => {
    expect(summarizeSprint({ id: 'sprint-001', files: [], goalPath: '/x/sprint-goal.md' }, []).has_goal).toBe(true);
    expect(summarizeSprint({ id: 'sprint-001', files: [] }, []).has_goal).toBe(false);
  });

  it('has_review is true when a sprint-review file exists', () => {
    const entry = { id: 'sprint-001', files: [mkFile('sprint-review', 'sprint-review.md')] };
    expect(summarizeSprint(entry, []).has_review).toBe(true);
  });

  it('has_retro is true for a sprint-retro file and false for board', () => {
    expect(
      summarizeSprint({ id: 'sprint-001', files: [mkFile('sprint-retro', 'sprint-retro.md')] }, []).has_retro
    ).toBe(true);
    expect(summarizeSprint({ id: 'sprint-001', files: [mkFile('board', 'board.md')] }, []).has_retro).toBe(false);
  });

  it('returns zero counts when no story belongs to the sprint', () => {
    const s = summarizeSprint({ id: 'sprint-001', files: [] }, [
      { sprint_id: 'sprint-002', status: 'done', story_points: 5 },
    ]);
    expect(s.story_count).toBe(0);
    expect(s.total_points).toBe(0);
    expect(s.done_points).toBe(0);
  });
});

describe('sortSprints', () => {
  it('sorts by id descending', () => {
    const input = [{ id: 'sprint-001' }, { id: 'sprint-003' }, { id: 'sprint-002' }];
    expect(sortSprints(input).map((s) => s.id)).toEqual(['sprint-003', 'sprint-002', 'sprint-001']);
  });

  it('sorts numerically, not lexically (sprint-10 before sprint-9)', () => {
    // Real sprint ids are NOT zero-padded (sprint-1 … sprint-10). A plain
    // localeCompare puts "sprint-10" before "sprint-2" (lexical), so the most
    // recent sprint was buried. Numeric-aware compare fixes the ordering.
    const input = [{ id: 'sprint-2-foo' }, { id: 'sprint-10-bar' }, { id: 'sprint-1-baz' }, { id: 'sprint-9-qux' }];
    expect(sortSprints(input).map((s) => s.id)).toEqual([
      'sprint-10-bar',
      'sprint-9-qux',
      'sprint-2-foo',
      'sprint-1-baz',
    ]);
  });

  it('handles an empty array', () => {
    expect(sortSprints([])).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const input = [{ id: 'a' }, { id: 'b' }];
    sortSprints(input);
    expect(input.map((s) => s.id)).toEqual(['a', 'b']);
  });
});

describe('sprintState', () => {
  const sp = (id, done = 0, total = 0, extra = {}) => ({ id, done_points: done, total_points: total, ...extra });

  it('trusts an explicit state from the API', () => {
    expect(sprintState(sp('sprint-2', 0, 5, { state: 'closed' }), 'sprint-2')).toBe('closed');
    expect(sprintState(sp('sprint-2', 5, 5, { state: 'planned' }), null)).toBe('planned');
  });

  it('prefers the API state over every local guess (older and fully delivered, yet planned)', () => {
    expect(sprintState(sp('sprint-1', 8, 8, { state: 'planned' }), 'sprint-3')).toBe('planned');
    expect(sprintState(sp('sprint-9', 0, 0, { state: 'closed' }), 'sprint-3')).toBe('closed');
  });

  it('ignores an unknown explicit state', () => {
    expect(sprintState(sp('sprint-2', 0, 5, { state: 'weird' }), 'sprint-2')).toBe('active');
  });

  it('is active when it is the store sprint, even with no points done', () => {
    expect(sprintState(sp('sprint-3', 0, 8), 'sprint-3')).toBe('active');
  });

  it('is not active just because some points are done (K-20)', () => {
    expect(sprintState(sp('sprint-4', 3, 8), 'sprint-3')).toBe('planned');
  });

  it('is closed when every point is delivered', () => {
    expect(sprintState(sp('sprint-1', 8, 8), 'sprint-3')).toBe('closed');
  });

  it('is closed when older than the active sprint (numeric-aware)', () => {
    expect(sprintState(sp('sprint-9', 2, 8), 'sprint-10')).toBe('closed');
    expect(sprintState(sp('sprint-11', 0, 8), 'sprint-10')).toBe('planned');
  });

  it('is planned without any active sprint and nothing delivered', () => {
    expect(sprintState(sp('sprint-1', 0, 8), null)).toBe('planned');
    expect(sprintState(sp('sprint-1', 0, 0), undefined)).toBe('planned');
  });
});

describe('sprintTotals', () => {
  it('sums points, done points and percent', () => {
    const t = sprintTotals([
      { status: 'done', story_points: 3 },
      { status: 'review', story_points: 5 },
    ]);
    expect(t).toEqual({ total: 8, done: 3, count: 2, pct: 38 });
  });

  it('handles an empty sprint', () => {
    expect(sprintTotals([])).toEqual({ total: 0, done: 0, count: 0, pct: 0 });
    expect(sprintTotals(undefined)).toEqual({ total: 0, done: 0, count: 0, pct: 0 });
  });
});

describe('groupTasksByStory', () => {
  it('groups tasks under their us_id', () => {
    const g = groupTasksByStory([
      { id: 'T1', us_id: 'US-1' },
      { id: 'T2', us_id: 'US-2' },
      { id: 'T3', us_id: 'US-1' },
    ]);
    expect(g['US-1'].map((t) => t.id)).toEqual(['T1', 'T3']);
    expect(g['US-2']).toHaveLength(1);
  });
});
