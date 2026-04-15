import { describe, it, expect } from 'vitest';
import {
  StoryFrontmatterSchema,
  EpicFrontmatterSchema,
  TaskFrontmatterSchema,
  TransitionRequestSchema,
  StoryPatchSchema,
  SprintStatusSchema,
  STATUSES,
} from '../../cli/kanban/shared/schemas.js';

describe('StoryFrontmatterSchema', () => {
  const minimal = { id: 'US-001', title: 'Login' };

  it('accepts minimal story and applies defaults', () => {
    const parsed = StoryFrontmatterSchema.parse(minimal);
    expect(parsed.status).toBe('backlog');
    expect(parsed.story_points).toBe(0);
    expect(parsed.priority).toBe('should');
    expect(parsed.tasks.total).toBe(0);
    expect(parsed.dependencies).toEqual([]);
  });

  it('accepts full story', () => {
    const full = {
      id: 'US-042',
      title: 'Checkout',
      epic_id: 'EPIC-003',
      persona: 'P-001',
      status: 'in-progress',
      previous_status: 'ready-for-dev',
      story_points: 5,
      priority: 'must',
      sprint_id: 'sprint-002',
      assigned_to: 'alice',
      tdd_phase: 'green',
      invest_score: 6,
      traceability: { implements: ['FR-001'], tests: ['AC-001'] },
      tasks: { total: 4, completed: 2, list: ['TASK-001', 'TASK-002', 'TASK-003', 'TASK-004'] },
      dependencies: ['US-001'],
    };
    expect(() => StoryFrontmatterSchema.parse(full)).not.toThrow();
  });

  it('rejects invalid id format', () => {
    expect(() => StoryFrontmatterSchema.parse({ id: 'STORY-1', title: 'x' })).toThrow();
    expect(() => StoryFrontmatterSchema.parse({ id: 'US-1', title: 'x' })).toThrow();
  });

  it('rejects invalid status', () => {
    expect(() => StoryFrontmatterSchema.parse({ ...minimal, status: 'wip' })).toThrow();
  });

  it('rejects story_points out of range', () => {
    expect(() => StoryFrontmatterSchema.parse({ ...minimal, story_points: 50 })).toThrow();
    expect(() => StoryFrontmatterSchema.parse({ ...minimal, story_points: -1 })).toThrow();
  });

  it('rejects invalid priority', () => {
    expect(() => StoryFrontmatterSchema.parse({ ...minimal, priority: 'critical' })).toThrow();
  });

  it('rejects invalid invest_score', () => {
    expect(() => StoryFrontmatterSchema.parse({ ...minimal, invest_score: 7 })).toThrow();
  });

  it('rejects invalid task id in list', () => {
    expect(() => StoryFrontmatterSchema.parse({
      ...minimal,
      tasks: { total: 1, completed: 0, list: ['T-001'] },
    })).toThrow();
  });

  it('rejects invalid dependency id', () => {
    expect(() => StoryFrontmatterSchema.parse({ ...minimal, dependencies: ['EPIC-001'] })).toThrow();
  });

  it('preserves unknown keys via passthrough', () => {
    const parsed = StoryFrontmatterSchema.parse({ ...minimal, custom_field: 'hello' });
    expect(parsed.custom_field).toBe('hello');
  });
});

describe('EpicFrontmatterSchema', () => {
  it('accepts valid epic', () => {
    const parsed = EpicFrontmatterSchema.parse({ id: 'EPIC-001', title: 'Auth' });
    expect(parsed.status).toBe('draft');
    expect(parsed.business_value).toBe('medium');
  });

  it('rejects bad status', () => {
    expect(() => EpicFrontmatterSchema.parse({ id: 'EPIC-001', title: 'x', status: 'wip' })).toThrow();
  });
});

describe('TaskFrontmatterSchema', () => {
  it('accepts valid task', () => {
    const parsed = TaskFrontmatterSchema.parse({
      id: 'TASK-001',
      us_id: 'US-001',
      type: 'BE',
      estimation_hours: 4,
    });
    expect(parsed.status).toBe('to-do');
    expect(parsed.actual_hours).toBe(0);
  });

  it('rejects invalid type', () => {
    expect(() => TaskFrontmatterSchema.parse({
      id: 'TASK-001', us_id: 'US-001', type: 'UNKNOWN', estimation_hours: 1,
    })).toThrow();
  });

  it('rejects mismatched us_id format', () => {
    expect(() => TaskFrontmatterSchema.parse({
      id: 'TASK-001', us_id: 'STORY-001', type: 'BE', estimation_hours: 1,
    })).toThrow();
  });
});

describe('TransitionRequestSchema', () => {
  it('accepts all valid statuses', () => {
    for (const status of STATUSES) {
      expect(() => TransitionRequestSchema.parse({ status })).not.toThrow();
    }
  });

  it('accepts blocked_reason', () => {
    const parsed = TransitionRequestSchema.parse({ status: 'blocked', blocked_reason: 'waiting API' });
    expect(parsed.blocked_reason).toBe('waiting API');
  });

  it('rejects blocked_reason over 500 chars', () => {
    expect(() => TransitionRequestSchema.parse({
      status: 'blocked',
      blocked_reason: 'x'.repeat(501),
    })).toThrow();
  });

  it('rejects unknown status', () => {
    expect(() => TransitionRequestSchema.parse({ status: 'pending' })).toThrow();
  });
});

describe('StoryPatchSchema', () => {
  it('accepts partial update', () => {
    expect(() => StoryPatchSchema.parse({ story_points: 3 })).not.toThrow();
    expect(() => StoryPatchSchema.parse({ assigned_to: 'bob' })).not.toThrow();
  });

  it('rejects unknown fields (strict)', () => {
    expect(() => StoryPatchSchema.parse({ status: 'done' })).toThrow();
    expect(() => StoryPatchSchema.parse({ title: 'hack' })).toThrow();
  });

  it('rejects assigned_to over 100 chars', () => {
    expect(() => StoryPatchSchema.parse({ assigned_to: 'x'.repeat(101) })).toThrow();
  });
});

describe('SprintStatusSchema', () => {
  it('accepts valid sprint-status yaml structure', () => {
    const data = {
      version: '1.0',
      metadata: {
        sprint_id: 'sprint-001',
        name: 'Walking Skeleton',
        start_date: '2026-01-29',
        end_date: '2026-02-12',
        goal: 'Auth basics',
      },
      stories: {
        'US-001': {
          title: 'Login',
          status: 'in-progress',
          story_points: 5,
          history: [
            { timestamp: '2026-01-30T10:00:00Z', from: 'backlog', to: 'ready-for-dev', by: 'pm', reason: '' },
          ],
        },
      },
    };
    expect(() => SprintStatusSchema.parse(data)).not.toThrow();
  });

  it('rejects missing metadata', () => {
    expect(() => SprintStatusSchema.parse({ stories: {} })).toThrow();
  });
});
