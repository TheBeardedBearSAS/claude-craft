import { describe, it, expect } from 'vitest';
import {
  capacityState,
  selectionPoints,
  planTargets,
  filterByScope,
  firstCapacity,
  runBatch,
  validateSprintDraft,
  isPlannable,
  closeSummary,
  validateWipDraft,
  wipDraftFrom,
} from '../../cli/kanban/client/src/lib/sprint-plan.js';
import en from '../../cli/kanban/client/src/lib/i18n/locales/en.js';

describe('capacityState', () => {
  it('has no state without a capacity', () => {
    for (const capacity of [null, undefined, 0, NaN]) {
      expect(capacityState(5, capacity)).toEqual({ state: 'none', committed: 5, capacity: null, remaining: null });
    }
  });
  it('is under, at or over the capacity', () => {
    expect(capacityState(8, 13)).toEqual({ state: 'under', committed: 8, capacity: 13, remaining: 5 });
    expect(capacityState(13, 13)).toEqual({ state: 'at', committed: 13, capacity: 13, remaining: 0 });
    expect(capacityState(16, 13)).toEqual({ state: 'over', committed: 16, capacity: 13, remaining: -3 });
  });
  it('treats missing committed points as zero', () => {
    expect(capacityState(undefined, 10).committed).toBe(0);
  });
});

describe('selectionPoints', () => {
  const stories = [{ id: 'A', story_points: 3 }, { id: 'B', story_points: 5 }, { id: 'C' }];
  it('sums the selected stories, ignoring unknown ids and missing points', () => {
    expect(selectionPoints(stories, new Set(['A', 'C', 'Z']))).toBe(3);
    expect(selectionPoints(stories, ['A', 'B'])).toBe(8);
    expect(selectionPoints(stories, [])).toBe(0);
  });
});

describe('planTargets', () => {
  it('keeps the active sprint first, then the planned ones in numeric order, never a closed one', () => {
    const sprints = [
      { id: 'sprint-10-x', state: 'planned' },
      { id: 'sprint-3-c', state: 'closed' },
      { id: 'sprint-9-a', state: 'active' },
      { id: 'sprint-2-z', state: 'planned' },
    ];
    expect(planTargets(sprints).map((s) => s.id)).toEqual(['sprint-9-a', 'sprint-2-z', 'sprint-10-x']);
  });
  it('tolerates a missing list', () => {
    expect(planTargets(undefined)).toEqual([]);
  });
});

describe('filterByScope', () => {
  const stories = [
    { id: 'A', sprint_id: null },
    { id: 'B', sprint_id: 's1' },
    { id: 'C', sprint_id: 's2' },
    { id: 'D' },
  ];
  it('filters the backlog, the target sprint or everything', () => {
    expect(filterByScope(stories, 'backlog', 's1').map((s) => s.id)).toEqual(['A', 'D']);
    expect(filterByScope(stories, 'sprint', 's1').map((s) => s.id)).toEqual(['B']);
    expect(filterByScope(stories, 'all', 's1')).toHaveLength(4);
    expect(filterByScope(stories, 'nope', 's1')).toHaveLength(4);
  });
});

describe('isPlannable', () => {
  it('refuses read-only mode and non-writable stories', () => {
    expect(isPlannable({ _writable: true }, false)).toBe(true);
    expect(isPlannable({}, false)).toBe(true);
    expect(isPlannable({ _writable: false }, false)).toBe(false);
    expect(isPlannable({ _writable: true }, true)).toBe(false);
  });
});

describe('capacity sources', () => {
  it('firstCapacity picks the first usable number', () => {
    expect(firstCapacity(undefined, null, 'x', 13, 5)).toBe(13);
    expect(firstCapacity(0)).toBe(0);
    expect(firstCapacity(undefined, -2)).toBeNull();
  });
});

describe('runBatch', () => {
  it('runs in order and reports the count', async () => {
    const seen = [];
    const res = await runBatch(['a', 'b', 'c'], async (id) => seen.push(id));
    expect(seen).toEqual(['a', 'b', 'c']);
    expect(res).toEqual({ done: 3, total: 3, failedId: null, error: null });
  });
  it('stops at the first error and says how many went through', async () => {
    const boom = new Error('boom');
    const seen = [];
    const res = await runBatch(['a', 'b', 'c'], async (id) => {
      seen.push(id);
      if (id === 'b') throw boom;
    });
    expect(seen).toEqual(['a', 'b']);
    expect(res).toEqual({ done: 1, total: 3, failedId: 'b', error: boom });
  });
});

describe('validateSprintDraft', () => {
  const ok = { name: ' Sprint A ', start_date: '2026-01-05', end_date: '2026-01-16', goal: ' go ', capacity: '13' };
  it('returns a trimmed payload for a valid draft', () => {
    expect(validateSprintDraft(ok)).toEqual({
      errors: {},
      payload: { name: 'Sprint A', start_date: '2026-01-05', end_date: '2026-01-16', goal: 'go', capacity_points: 13 },
    });
  });
  it('leaves the optional fields out when empty', () => {
    const { payload } = validateSprintDraft({ ...ok, goal: '  ', capacity: '' });
    expect(payload).toEqual({ name: 'Sprint A', start_date: '2026-01-05', end_date: '2026-01-16' });
  });
  it('reports one error key per invalid field', () => {
    const { errors, payload } = validateSprintDraft({
      name: ' ',
      start_date: '',
      end_date: '',
      goal: '',
      capacity: '',
    });
    expect(Object.keys(errors)).toEqual(['name', 'start_date', 'end_date']);
    expect(payload).toBeNull();
  });
  it('requires the end date to be on or after the start date', () => {
    const { errors } = validateSprintDraft({ ...ok, end_date: '2026-01-01' });
    expect(errors).toEqual({ end_date: 'sprint.create.dateOrder' });
    expect(validateSprintDraft({ ...ok, end_date: ok.start_date }).errors).toEqual({});
  });
  it('bounds the name and the capacity like the server', () => {
    expect(validateSprintDraft({ ...ok, name: 'x'.repeat(121) }).errors.name).toBeTruthy();
    for (const capacity of ['-1', '1000', '2.5', 'abc']) {
      expect(validateSprintDraft({ ...ok, capacity }).errors.capacity, capacity).toBeTruthy();
    }
    expect(validateSprintDraft({ ...ok, capacity: '0' }).payload.capacity_points).toBe(0);
  });
  it('only returns i18n keys that exist', () => {
    const bad = { name: '', start_date: '', end_date: '', goal: '', capacity: '-3' };
    for (const key of Object.values(validateSprintDraft(bad).errors)) expect(en[key], key).toBeTruthy();
    expect(en[validateSprintDraft({ ...ok, end_date: '2000-01-01' }).errors.end_date]).toBeTruthy();
  });
});

describe('closeSummary', () => {
  const stories = [
    { id: 'A', sprint_id: 's1', status: 'done', story_points: 3 },
    { id: 'B', sprint_id: 's1', status: 'review', story_points: 5 },
    { id: 'C', sprint_id: 's1', status: 'in-progress' },
    { id: 'D', sprint_id: 's2', status: 'done', story_points: 8 },
  ];
  it('splits the sprint stories into archived and carried over', () => {
    const s = closeSummary(stories, 's1');
    expect(s.done.map((x) => x.id)).toEqual(['A']);
    expect(s.unfinished.map((x) => x.id)).toEqual(['B', 'C']);
    expect(s).toMatchObject({ total: 3, donePoints: 3, unfinishedPoints: 5 });
  });
});

describe('WIP form', () => {
  const statuses = ['in-progress', 'review', 'done'];
  it('fills the draft from the known limits', () => {
    expect(wipDraftFrom(statuses, { 'in-progress': 3, review: null })).toEqual({
      'in-progress': '3',
      review: '',
      done: '',
    });
    expect(wipDraftFrom(statuses, undefined)).toEqual({ 'in-progress': '', review: '', done: '' });
  });
  it('turns a valid draft into a full PUT body (empty = no limit)', () => {
    const draft = { 'in-progress': ' 3 ', review: '', done: '99' };
    expect(validateWipDraft(statuses, draft)).toEqual({
      errors: {},
      limits: { 'in-progress': 3, review: null, done: 99 },
    });
  });
  it('flags every field outside 1..99 or not a whole number', () => {
    const draft = { 'in-progress': '0', review: '100', done: '2.5' };
    const { errors, limits } = validateWipDraft(statuses, draft);
    expect(Object.keys(errors)).toEqual(statuses);
    expect(limits).toBeNull();
    expect(en[errors.review]).toBeTruthy();
    expect(validateWipDraft(statuses, { 'in-progress': '-1', review: 'abc', done: '' }).errors).toMatchObject({
      'in-progress': expect.any(String),
      review: expect.any(String),
    });
  });
});
