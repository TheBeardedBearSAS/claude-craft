import { describe, it, expect } from 'vitest';
import { groupStoriesByEpic, epicProgress, buildBacklog } from '../../cli/kanban/client/src/lib/backlog.js';

const story = (id, extra = {}) => ({ id, title: id, status: 'review', story_points: 1, ...extra });

describe('groupStoriesByEpic', () => {
  it('places a story under its known epic', () => {
    const epics = [{ id: 'EPIC-001', title: 'Auth', business_value: 'high', status: 'in-progress' }];
    const stories = [story('US-001', { epic_id: 'EPIC-001' })];

    const { groups, orphans } = groupStoriesByEpic(stories, epics);

    expect(orphans).toHaveLength(0);
    expect(groups).toHaveLength(1);
    expect(groups[0].epic.id).toBe('EPIC-001');
    expect(groups[0].epic.title).toBe('Auth');
    expect(groups[0].stories.map((s) => s.id)).toEqual(['US-001']);
  });

  // Regression: BMAD v6 sprint-status.yaml stories carry epic_id="E1" with no markdown
  // epic file, so store.epics is empty. The old code dropped them entirely (neither a
  // known group nor an orphan) -> blank Backlog screen.
  it('synthesizes a group for an unknown epic_id instead of dropping the story', () => {
    const stories = [story('US-E1-01', { epic_id: 'E1' }), story('US-E1-02', { epic_id: 'E1' })];

    const { groups, orphans } = groupStoriesByEpic(stories, []);

    expect(orphans).toHaveLength(0);
    expect(groups).toHaveLength(1);
    expect(groups[0].epic.id).toBe('E1');
    expect(groups[0].epic.title).toBe('E1');
    expect(groups[0].stories.map((s) => s.id)).toEqual(['US-E1-01', 'US-E1-02']);
  });

  it('treats a story without epic_id as an orphan', () => {
    const stories = [story('US-099', { epic_id: null })];

    const { groups, orphans } = groupStoriesByEpic(stories, []);

    expect(groups).toHaveLength(0);
    expect(orphans.map((s) => s.id)).toEqual(['US-099']);
  });

  it('sorts groups by epic id, stories and orphans by id', () => {
    const epics = [
      { id: 'EPIC-002', title: 'B' },
      { id: 'EPIC-001', title: 'A' },
    ];
    const stories = [
      story('US-003', { epic_id: 'EPIC-001' }),
      story('US-001', { epic_id: 'EPIC-001' }),
      story('US-z', {}),
      story('US-a', {}),
    ];

    const { groups, orphans } = groupStoriesByEpic(stories, epics);

    expect(groups.map((g) => g.epic.id)).toEqual(['EPIC-001', 'EPIC-002']);
    expect(groups[0].stories.map((s) => s.id)).toEqual(['US-001', 'US-003']);
    expect(orphans.map((s) => s.id)).toEqual(['US-a', 'US-z']);
  });

  it('returns empty structures for no input', () => {
    expect(groupStoriesByEpic([], [])).toEqual({ groups: [], orphans: [] });
  });
});

describe('epicProgress', () => {
  it('counts done stories, points and percent', () => {
    const p = epicProgress([
      story('A', { status: 'done', story_points: 3 }),
      story('B', { status: 'in-progress', story_points: 5 }),
    ]);
    expect(p).toEqual({ done: 1, total: 2, percent: 50, points: 8 });
  });

  it('is zero for an empty epic', () => {
    expect(epicProgress([])).toEqual({ done: 0, total: 0, percent: 0, points: 0 });
  });
});

describe('buildBacklog', () => {
  const epics = [
    { id: 'E1', title: 'One' },
    { id: 'E2', title: 'Two' },
  ];
  const stories = [
    story('US-1', { epic_id: 'E1', title: 'Login form', priority: 'could', story_points: 2 }),
    story('US-2', { epic_id: 'E1', title: 'Logout', priority: 'must', story_points: 8 }),
    story('US-3', { epic_id: 'E2', title: 'Billing', priority: 'must', story_points: 3 }),
    story('US-4', { title: 'Loose end', priority: 'should' }),
  ];
  const noFilter = { q: '', prio: [], who: '', epic: '', sort: '', dir: 'asc' };

  it('keeps every epic and orphan when no filter is active', () => {
    const r = buildBacklog(stories, epics, noFilter);
    expect(r.filtered).toBe(false);
    expect(r.groups.map((g) => g.epic.id)).toEqual(['E1', 'E2']);
    expect(r.orphans.map((s) => s.id)).toEqual(['US-4']);
    expect(r.count).toBe(4);
  });

  it('applies the filters and drops the epics left empty', () => {
    const r = buildBacklog(stories, epics, { ...noFilter, prio: ['must'] });
    expect(r.filtered).toBe(true);
    expect(r.groups.map((g) => g.epic.id)).toEqual(['E1', 'E2']);
    expect(r.groups[0].stories.map((s) => s.id)).toEqual(['US-2']);
    expect(r.orphans).toEqual([]);
    expect(r.count).toBe(2);
  });

  it('hides an epic with no match while filtering', () => {
    const r = buildBacklog(stories, epics, { ...noFilter, q: 'billing' });
    expect(r.groups.map((g) => g.epic.id)).toEqual(['E2']);
  });

  it('sorts within each group when a sort key is set', () => {
    const r = buildBacklog(stories, epics, { ...noFilter, sort: 'points', dir: 'desc' });
    expect(r.groups[0].stories.map((s) => s.id)).toEqual(['US-2', 'US-1']);
  });

  it('sorting alone does not count as filtering', () => {
    expect(buildBacklog(stories, epics, { ...noFilter, sort: 'title' }).filtered).toBe(false);
  });
});
