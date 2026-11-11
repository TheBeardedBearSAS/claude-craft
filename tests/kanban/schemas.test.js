import { describe, it, expect } from 'vitest';
import {
  StoryFrontmatterSchema,
  EpicFrontmatterSchema,
  TaskFrontmatterSchema,
  TransitionRequestSchema,
  StoryPatchSchema,
  StoryCreateSchema,
  StoryBodySchema,
  TaskPatchSchema,
  SprintStatusSchema,
  SprintCreateSchema,
  SprintStartSchema,
  SprintCloseSchema,
  WipLimitsSchema,
  SPRINT_ID_RE,
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

  it('leaves invest_score undefined when absent (no fake 0)', () => {
    expect(StoryFrontmatterSchema.parse(minimal).invest_score).toBeUndefined();
  });

  it('accepts epic-style and TT ids', () => {
    expect(StoryFrontmatterSchema.parse({ id: 'US-E4-02', title: 'x' }).id).toBe('US-E4-02');
    expect(StoryFrontmatterSchema.parse({ id: 'TT-012', title: 'x' }).id).toBe('TT-012');
  });

  it('rejects ids that could escape a file name', () => {
    expect(() => StoryFrontmatterSchema.parse({ id: 'US-001/../x', title: 'x' })).toThrow();
    expect(() => StoryFrontmatterSchema.parse({ id: 'US-001.md', title: 'x' })).toThrow();
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
    expect(() => StoryFrontmatterSchema.parse({ id: 'US-', title: 'x' })).toThrow();
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
    expect(() =>
      StoryFrontmatterSchema.parse({
        ...minimal,
        tasks: { total: 1, completed: 0, list: ['T-001'] },
      })
    ).toThrow();
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
    expect(() =>
      TaskFrontmatterSchema.parse({
        id: 'TASK-001',
        us_id: 'US-001',
        type: 'UNKNOWN',
        estimation_hours: 1,
      })
    ).toThrow();
  });

  it('rejects mismatched us_id format', () => {
    expect(() =>
      TaskFrontmatterSchema.parse({
        id: 'TASK-001',
        us_id: 'STORY-001',
        type: 'BE',
        estimation_hours: 1,
      })
    ).toThrow();
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
    expect(() =>
      TransitionRequestSchema.parse({
        status: 'blocked',
        blocked_reason: 'x'.repeat(501),
      })
    ).toThrow();
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

  it('rejects unknown fields (strict): status goes through the transition route', () => {
    expect(() => StoryPatchSchema.parse({ status: 'done' })).toThrow();
    expect(() => StoryPatchSchema.parse({ id: 'US-009' })).toThrow();
    expect(() => StoryPatchSchema.parse({ history: [] })).toThrow();
  });

  it('accepts every editable field, nullable ones included', () => {
    const patch = {
      title: 'New title',
      story_points: 21,
      assigned_to: null,
      priority: 'wont',
      tdd_phase: 'red',
      epic_id: null,
      sprint_id: null,
      dependencies: ['US-001', 'US-E4-02'],
    };
    expect(StoryPatchSchema.parse(patch)).toEqual(patch);
  });

  it('rejects an empty patch, a blank title and out-of-range values', () => {
    expect(() => StoryPatchSchema.parse({})).toThrow();
    expect(() => StoryPatchSchema.parse({ title: '   ' })).toThrow();
    expect(() => StoryPatchSchema.parse({ title: 'x'.repeat(201) })).toThrow();
    expect(() => StoryPatchSchema.parse({ story_points: 22 })).toThrow();
    expect(() => StoryPatchSchema.parse({ story_points: 1.5 })).toThrow();
    expect(() => StoryPatchSchema.parse({ priority: 'P0' })).toThrow();
    expect(() => StoryPatchSchema.parse({ sprint_id: '' })).toThrow();
  });

  it('accepts EPIC-001 and E4 but not other epic references', () => {
    expect(() => StoryPatchSchema.parse({ epic_id: 'EPIC-001' })).not.toThrow();
    expect(() => StoryPatchSchema.parse({ epic_id: 'E4' })).not.toThrow();
    expect(() => StoryPatchSchema.parse({ epic_id: '../x' })).toThrow();
    expect(() => StoryPatchSchema.parse({ epic_id: 'EPIC-1' })).toThrow();
  });

  it('rejects dependencies that are not story ids', () => {
    expect(() => StoryPatchSchema.parse({ dependencies: ['US-001/../x'] })).toThrow();
    expect(() => StoryPatchSchema.parse({ dependencies: Array(51).fill('US-001') })).toThrow();
  });

  it('rejects assigned_to over 100 chars', () => {
    expect(() => StoryPatchSchema.parse({ assigned_to: 'x'.repeat(101) })).toThrow();
  });
});

describe('StoryCreateSchema', () => {
  it('needs a title only and trims it', () => {
    expect(StoryCreateSchema.parse({ title: '  Pay  ' })).toEqual({ title: 'Pay' });
    expect(() => StoryCreateSchema.parse({})).toThrow();
    expect(() => StoryCreateSchema.parse({ title: ' ' })).toThrow();
  });

  it('accepts the optional fields and rejects unknown ones (no status, no id)', () => {
    const full = { title: 'T', epic_id: 'E4', story_points: 3, priority: 'must', persona: 'P-001', sprint_id: null };
    expect(StoryCreateSchema.parse(full)).toEqual(full);
    expect(() => StoryCreateSchema.parse({ title: 'T', status: 'done' })).toThrow();
    expect(() => StoryCreateSchema.parse({ title: 'T', id: 'US-001' })).toThrow();
  });
});

describe('StoryBodySchema', () => {
  it('needs the markdown and the mtime it was read at', () => {
    expect(StoryBodySchema.parse({ markdown: '', expected_mtime: 12.5 })).toEqual({
      markdown: '',
      expected_mtime: 12.5,
    });
    expect(() => StoryBodySchema.parse({ markdown: 'x' })).toThrow();
    expect(() => StoryBodySchema.parse({ expected_mtime: 1 })).toThrow();
    expect(() => StoryBodySchema.parse({ markdown: 'x', expected_mtime: 'now' })).toThrow();
    expect(() => StoryBodySchema.parse({ markdown: 'x', expected_mtime: 1, path: '/etc' })).toThrow();
  });

  it('caps the markdown at 500 000 characters', () => {
    expect(() => StoryBodySchema.parse({ markdown: 'x'.repeat(500_000), expected_mtime: 1 })).not.toThrow();
    expect(() => StoryBodySchema.parse({ markdown: 'x'.repeat(500_001), expected_mtime: 1 })).toThrow();
  });
});

describe('TaskPatchSchema', () => {
  it('accepts the four task statuses only', () => {
    for (const status of ['to-do', 'in-progress', 'done', 'blocked']) {
      expect(TaskPatchSchema.parse({ status })).toEqual({ status });
    }
    expect(() => TaskPatchSchema.parse({ status: 'review' })).toThrow();
    expect(() => TaskPatchSchema.parse({ status: 'done', extra: 1 })).toThrow();
    expect(() => TaskPatchSchema.parse({})).toThrow();
    expect(TaskPatchSchema.parse({ title: '  Renamed ' })).toEqual({ title: 'Renamed' });
    expect(TaskPatchSchema.parse({ status: 'done', title: 'x' })).toEqual({ status: 'done', title: 'x' });
    expect(() => TaskPatchSchema.parse({ title: '   ' })).toThrow();
    expect(() => TaskPatchSchema.parse({ title: 'x'.repeat(201) })).toThrow();
    expect(() => TaskPatchSchema.parse({ title: 3 })).toThrow();
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
          history: [{ timestamp: '2026-01-30T10:00:00Z', from: 'backlog', to: 'ready-for-dev', by: 'pm', reason: '' }],
        },
      },
    };
    expect(() => SprintStatusSchema.parse(data)).not.toThrow();
  });

  it('rejects missing metadata', () => {
    expect(() => SprintStatusSchema.parse({ stories: {} })).toThrow();
  });

  const withTasks = (tasks) => ({
    metadata: { sprint_id: 'sprint-1', name: 'S1', start_date: '', end_date: '' },
    stories: { 'US-001': { title: 'Login', status: 'in-progress', tasks } },
  });

  it('keeps per-task statuses (sprint-status.yaml is the source of truth for task status)', () => {
    const parsed = SprintStatusSchema.parse(
      withTasks({
        total: 2,
        completed: 1,
        list: ['TASK-001', 'TASK-002'],
        status: { 'TASK-001': 'done', 'TASK-002': 'in-progress' },
      })
    );
    expect(parsed.stories['US-001'].tasks.status).toEqual({ 'TASK-001': 'done', 'TASK-002': 'in-progress' });
  });

  it('rejects an unknown task status', () => {
    expect(SprintStatusSchema.safeParse(withTasks({ list: ['TASK-001'], status: { 'TASK-001': 'wip' } })).success).toBe(
      false
    );
  });
});

describe('SprintStatusSchema: sprint_id and closed_date', () => {
  const base = (story, meta = {}) => ({
    metadata: { sprint_id: 's1', name: 'S1', start_date: '', end_date: '', ...meta },
    stories: { 'US-001': { title: 'A', status: 'backlog', ...story } },
  });

  it('keeps sprint_id null (backlog) and distinguishes it from an absent key', () => {
    const withNull = SprintStatusSchema.parse(base({ sprint_id: null })).stories['US-001'];
    const absent = SprintStatusSchema.parse(base({})).stories['US-001'];
    expect(withNull.sprint_id).toBeNull();
    expect(Object.hasOwn(absent, 'sprint_id')).toBe(false);
  });

  it('keeps a string sprint_id and rejects a number', () => {
    expect(SprintStatusSchema.parse(base({ sprint_id: 's2' })).stories['US-001'].sprint_id).toBe('s2');
    expect(SprintStatusSchema.safeParse(base({ sprint_id: 3 })).success).toBe(false);
  });

  it('accepts metadata.closed_date as a string only', () => {
    expect(SprintStatusSchema.parse(base({}, { closed_date: '2026-11-13' })).metadata.closed_date).toBe('2026-11-13');
    expect(SprintStatusSchema.safeParse(base({}, { closed_date: 5 })).success).toBe(false);
  });
});

describe('SprintCreateSchema', () => {
  const ok = { name: 'Auth', start_date: '2026-11-02', end_date: '2026-11-13' };

  it('accepts the minimal and the full body', () => {
    expect(SprintCreateSchema.safeParse(ok).success).toBe(true);
    expect(SprintCreateSchema.safeParse({ ...ok, goal: 'G', capacity_points: 0 }).success).toBe(true);
    expect(SprintCreateSchema.safeParse({ ...ok, end_date: ok.start_date }).success).toBe(true);
  });

  it.each([
    ['unknown key', { ...ok, extra: 1 }],
    ['empty name', { ...ok, name: '   ' }],
    ['name too long', { ...ok, name: 'x'.repeat(121) }],
    ['newline in name', { ...ok, name: 'a\nb' }],
    ['bad date shape', { ...ok, start_date: '02/11/2026' }],
    ['impossible date', { ...ok, start_date: '2026-02-30' }],
    ['end before start', { ...ok, end_date: '2026-11-01' }],
    ['negative capacity', { ...ok, capacity_points: -1 }],
    ['fractional capacity', { ...ok, capacity_points: 2.5 }],
    ['capacity too large', { ...ok, capacity_points: 1000 }],
    ['goal too long', { ...ok, goal: 'x'.repeat(1001) }],
    ['missing end', { name: 'A', start_date: '2026-01-01' }],
  ])('rejects %s', (_, body) => {
    expect(SprintCreateSchema.safeParse(body).success).toBe(false);
  });

  it('trims the name', () => {
    expect(SprintCreateSchema.parse({ ...ok, name: '  Auth ' }).name).toBe('Auth');
  });
});

describe('SprintStartSchema and SprintCloseSchema', () => {
  it('start: optional expected_version, nothing else', () => {
    expect(SprintStartSchema.safeParse({}).success).toBe(true);
    expect(SprintStartSchema.safeParse({ expected_version: 'abc123def456' }).success).toBe(true);
    expect(SprintStartSchema.safeParse({ expected_version: '' }).success).toBe(false);
    expect(SprintStartSchema.safeParse({ other: 1 }).success).toBe(false);
  });

  it('close: carry_over defaults to backlog and accepts a sprint id', () => {
    expect(SprintCloseSchema.parse({}).carry_over).toBe('backlog');
    expect(SprintCloseSchema.parse({ carry_over: 'sprint-3-next' }).carry_over).toBe('sprint-3-next');
  });

  it.each(['../x', 'a/b', '', 'sprint 3', '.hidden', 'x'.repeat(101)])('close rejects carry_over %j', (carry_over) => {
    expect(SprintCloseSchema.safeParse({ carry_over }).success).toBe(false);
  });

  it('close rejects unknown keys', () => {
    expect(SprintCloseSchema.safeParse({ carry: 'backlog' }).success).toBe(false);
  });

  it('SPRINT_ID_RE is a single safe path segment', () => {
    expect(SPRINT_ID_RE.test('sprint-9-auth_premium')).toBe(true);
    expect(['..', '.', 'a/b', 'a\\b', 'a..b', '-x'].filter((id) => SPRINT_ID_RE.test(id))).toEqual([]);
  });
});

describe('WipLimitsSchema', () => {
  it('accepts limits and null for known statuses', () => {
    expect(WipLimitsSchema.safeParse({ 'in-progress': 3, review: null }).success).toBe(true);
    expect(WipLimitsSchema.safeParse({}).success).toBe(true);
  });

  it.each([
    ['unknown status', { doing: 3 }],
    ['zero', { review: 0 }],
    ['too large', { review: 100 }],
    ['fractional', { review: 1.5 }],
    ['string', { review: '3' }],
  ])('rejects %s', (_, body) => {
    expect(WipLimitsSchema.safeParse(body).success).toBe(false);
  });

  it('knows every status', () => {
    expect(WipLimitsSchema.safeParse(Object.fromEntries(STATUSES.map((s) => [s, 5]))).success).toBe(true);
  });
});
