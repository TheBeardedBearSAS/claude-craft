import { describe, it, expect } from 'vitest';
import { groupStoriesByEpic } from '../../cli/kanban/client/src/lib/backlog.js';

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
