import { describe, it, expect } from 'vitest';
import {
  POINTS,
  emptyDraft,
  draftFromStory,
  validateDraft,
  diffPatch,
  parseDependencies,
  toCreatePayload,
  fieldErrorsFromIssues,
  describeFailure,
} from '../../cli/kanban/client/src/lib/story-form.js';

const story = (extra = {}) => ({
  id: 'US-E4-03',
  title: 'Auth',
  story_points: 5,
  priority: 'must',
  assigned_to: 'alice',
  tdd_phase: 'green',
  epic_id: 'EPIC-004',
  sprint_id: 'sprint-9',
  dependencies: ['US-E4-02'],
  ...extra,
});

describe('emptyDraft', () => {
  it('starts blank with a default priority and accepts defaults', () => {
    expect(emptyDraft()).toMatchObject({ title: '', story_points: '', priority: 'should', epic_id: '', sprint_id: '' });
    expect(emptyDraft({ sprint_id: 'sprint-9', epic_id: 'E4' })).toMatchObject({
      sprint_id: 'sprint-9',
      epic_id: 'E4',
    });
  });
});

describe('draftFromStory', () => {
  it('turns every field into form text (null becomes empty)', () => {
    expect(draftFromStory(story())).toMatchObject({
      title: 'Auth',
      story_points: '5',
      priority: 'must',
      assigned_to: 'alice',
      tdd_phase: 'green',
      epic_id: 'EPIC-004',
      sprint_id: 'sprint-9',
      dependencies: 'US-E4-02',
    });
    expect(
      draftFromStory(story({ assigned_to: null, epic_id: null, sprint_id: null, dependencies: undefined }))
    ).toMatchObject({
      assigned_to: '',
      epic_id: '',
      sprint_id: '',
      dependencies: '',
    });
  });

  it('keeps 0 points as "0"', () => {
    expect(draftFromStory(story({ story_points: 0 })).story_points).toBe('0');
  });
});

describe('parseDependencies', () => {
  it('splits on commas, semicolons and spaces, trims and removes duplicates', () => {
    expect(parseDependencies(' US-1, US-2 ;US-1  US-3,, ')).toEqual(['US-1', 'US-2', 'US-3']);
    expect(parseDependencies('')).toEqual([]);
  });
});

describe('validateDraft', () => {
  const ok = () => draftFromStory(story());

  it('accepts a complete draft', () => {
    expect(validateDraft(ok())).toEqual({ valid: true, errors: {}, params: {} });
  });

  it('requires a title and caps it at 200 characters', () => {
    const empty = validateDraft({ ...ok(), title: '   ' });
    expect(empty.valid).toBe(false);
    expect(empty.errors.title).toBe('form.error.title.required');
    const long = validateDraft({ ...ok(), title: 'x'.repeat(201) });
    expect(long.errors.title).toBe('form.error.title.tooLong');
    expect(long.params.title).toEqual({ max: 200 });
    expect(validateDraft({ ...ok(), title: 'x'.repeat(200) }).valid).toBe(true);
  });

  it('accepts only the points series, or none', () => {
    for (const n of POINTS) expect(validateDraft({ ...ok(), story_points: String(n) }).valid).toBe(true);
    expect(validateDraft({ ...ok(), story_points: '' }).valid).toBe(true);
    for (const bad of ['4', '22', '-1', '2.5', 'abc']) {
      const r = validateDraft({ ...ok(), story_points: bad });
      expect(r.errors.story_points).toBe('form.error.points.range');
      expect(r.params.story_points).toEqual({ min: 0, max: 21 });
    }
  });

  it('tolerates an off-series value that was already there (`keep`)', () => {
    expect(validateDraft({ ...ok(), story_points: '4' }, { keep: '4' }).valid).toBe(true);
  });

  it('refuses an unknown priority', () => {
    expect(validateDraft({ ...ok(), priority: 'urgent' }).errors.priority).toBe('form.error.priority.invalid');
    expect(validateDraft({ ...ok(), priority: '' }).valid).toBe(true);
  });

  it('validates dependency ids and refuses a self-dependency', () => {
    const bad = validateDraft({ ...ok(), dependencies: 'US-1, nope' });
    expect(bad.errors.dependencies).toBe('form.error.dependencies.invalid');
    expect(bad.params.dependencies).toEqual({ value: 'nope' });
    const self = validateDraft({ ...ok(), dependencies: 'US-E4-03' }, { selfId: 'US-E4-03' });
    expect(self.errors.dependencies).toBe('form.error.dependencies.self');
  });
});

describe('diffPatch', () => {
  it('is empty when nothing changed (nothing to send)', () => {
    expect(diffPatch(story(), draftFromStory(story()))).toEqual({});
  });

  it('only carries the modified fields, with the types the API expects', () => {
    const draft = { ...draftFromStory(story()), title: '  New  ', story_points: '8', priority: 'could' };
    expect(diffPatch(story(), draft)).toEqual({ title: 'New', story_points: 8, priority: 'could' });
  });

  it('sends null (never an empty string) for unassigned, no epic and backlog', () => {
    const draft = { ...draftFromStory(story()), assigned_to: ' ', epic_id: '', sprint_id: '' };
    expect(diffPatch(story(), draft)).toEqual({ assigned_to: null, epic_id: null, sprint_id: null });
  });

  it('treats null and empty as the same original value', () => {
    const original = story({ assigned_to: '', sprint_id: null });
    expect(diffPatch(original, draftFromStory(original))).toEqual({});
  });

  it('sends the dependency list as an array, only when it changed', () => {
    const draft = { ...draftFromStory(story()), dependencies: 'US-E4-02, US-E4-01' };
    expect(diffPatch(story(), draft)).toEqual({ dependencies: ['US-E4-02', 'US-E4-01'] });
    const cleared = { ...draftFromStory(story()), dependencies: '' };
    expect(diffPatch(story(), cleared)).toEqual({ dependencies: [] });
  });

  it('does not send points when the field was emptied (the API cannot unset them)', () => {
    expect(diffPatch(story(), { ...draftFromStory(story()), story_points: '' })).toEqual({});
  });
});

describe('toCreatePayload', () => {
  it('keeps only filled fields the create endpoint accepts', () => {
    const draft = {
      ...emptyDraft(),
      title: ' Login ',
      story_points: '3',
      epic_id: 'E4',
      persona: 'admin',
      assigned_to: 'x',
    };
    expect(toCreatePayload(draft)).toEqual({
      title: 'Login',
      story_points: 3,
      priority: 'should',
      epic_id: 'E4',
      persona: 'admin',
    });
  });

  it('adds the sprint only when one is chosen', () => {
    expect(toCreatePayload({ ...emptyDraft(), title: 'a', sprint_id: 'sprint-9' })).toMatchObject({
      sprint_id: 'sprint-9',
    });
    expect(toCreatePayload({ ...emptyDraft(), title: 'a' })).not.toHaveProperty('sprint_id');
  });
});

describe('fieldErrorsFromIssues', () => {
  it('maps zod issues onto form fields (first message wins)', () => {
    const issues = [
      { path: ['title'], message: 'Too big' },
      { path: ['title'], message: 'second' },
      { path: ['dependencies', 0], message: 'Expected US-XXX' },
      { path: ['unknown_key'], message: 'nope' },
    ];
    expect(fieldErrorsFromIssues(issues)).toEqual({ title: 'Too big', dependencies: 'Expected US-XXX' });
  });

  it('is empty for missing or malformed issues', () => {
    expect(fieldErrorsFromIssues(undefined)).toEqual({});
    expect(fieldErrorsFromIssues([{ message: 'x' }, null])).toEqual({});
  });
});

describe('describeFailure', () => {
  it('gives the i18n key of the error and the field messages of its issues', () => {
    const err = { code: 'invalid_payload', body: { issues: [{ path: ['title'], message: 'Too big' }] } };
    expect(describeFailure(err)).toEqual({ key: 'error.invalid_payload', fields: { title: 'Too big' }, retry: false });
  });

  it('offers a retry for a locked file or a network failure only', () => {
    expect(describeFailure({ code: 'locked' }).retry).toBe(true);
    expect(describeFailure({ code: 'network' }).retry).toBe(true);
    expect(describeFailure({ code: 'conflict' }).retry).toBe(false);
  });

  it('falls back to error.unknown', () => {
    expect(describeFailure(undefined)).toEqual({ key: 'error.unknown', fields: {}, retry: false });
  });
});
