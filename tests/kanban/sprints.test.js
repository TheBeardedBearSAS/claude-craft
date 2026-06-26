import { describe, it, expect } from 'vitest';
import { summarizeSprint, sortSprints } from '../../cli/kanban/client/src/lib/sprints.js';

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
