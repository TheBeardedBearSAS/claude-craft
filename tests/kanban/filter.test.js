import { describe, it, expect } from 'vitest';
import { matchStory, sortStories, facets } from '../../cli/kanban/client/src/lib/filter.js';

const S = (id, extra = {}) => ({ id, title: id, status: 'backlog', priority: 'could', story_points: 1, ...extra });

describe('matchStory', () => {
  const s = S('US-E4-03', {
    title: 'Connexion à l’équipe',
    persona: 'Admin',
    assigned_to: 'Alice',
    epic_id: 'E4',
    priority: 'must',
  });

  it('matches everything with empty filters', () => {
    expect(matchStory(s, {})).toBe(true);
    expect(matchStory(s)).toBe(true);
  });

  it('searches id, title, persona and assignee, ignoring case and accents', () => {
    for (const q of ['e4-03', 'EQUIPE', 'admin', 'alice', ' alice ']) expect(matchStory(s, { q }), q).toBe(true);
    expect(matchStory(s, { q: 'bob' })).toBe(false);
  });

  it('filters by priority list, assignee and epic', () => {
    expect(matchStory(s, { prio: ['must', 'should'] })).toBe(true);
    expect(matchStory(s, { prio: ['could'] })).toBe(false);
    expect(matchStory(s, { who: 'alice' })).toBe(true);
    expect(matchStory(s, { who: 'bob' })).toBe(false);
    expect(matchStory(s, { epic: 'E4' })).toBe(true);
    expect(matchStory(s, { epic: 'E5' })).toBe(false);
  });

  it('combines filters with AND and tolerates missing fields', () => {
    expect(matchStory(s, { q: 'alice', epic: 'E5' })).toBe(false);
    expect(matchStory({ id: 'US-1' }, { q: 'us-1' })).toBe(true);
    expect(matchStory({ id: 'US-1' }, { who: 'x' })).toBe(false);
  });
});

describe('sortStories', () => {
  const list = [
    S('US-3', { priority: 'could', story_points: 5, status: 'review', title: 'beta' }),
    S('US-1', { priority: 'must', story_points: 5, status: 'backlog', title: 'Alpha' }),
    S('US-2', { priority: 'wont', story_points: 2, status: 'done', title: 'gamma' }),
    S('US-10', { priority: 'should', story_points: 8, status: 'blocked', title: 'delta' }),
  ];
  const ids = (l) => l.map((s) => s.id);

  it('does not mutate the input', () => {
    const copy = [...list];
    sortStories(list, 'id');
    expect(list).toEqual(copy);
  });

  it('sorts ids naturally', () => {
    expect(ids(sortStories(list, 'id'))).toEqual(['US-1', 'US-2', 'US-3', 'US-10']);
    expect(ids(sortStories(list, 'id', 'desc'))).toEqual(['US-10', 'US-3', 'US-2', 'US-1']);
  });

  it('sorts priority must > should > could > wont', () => {
    expect(ids(sortStories(list, 'priority'))).toEqual(['US-1', 'US-10', 'US-3', 'US-2']);
  });

  it('sorts statuses in STATUSES order', () => {
    expect(ids(sortStories(list, 'status'))).toEqual(['US-1', 'US-3', 'US-2', 'US-10']);
  });

  it('breaks ties by id ascending, even when descending', () => {
    expect(ids(sortStories(list, 'points'))).toEqual(['US-2', 'US-1', 'US-3', 'US-10']);
    expect(ids(sortStories(list, 'points', 'desc'))).toEqual(['US-10', 'US-1', 'US-3', 'US-2']);
  });

  it('sorts titles ignoring case and accents', () => {
    expect(ids(sortStories(list, 'title'))).toEqual(['US-1', 'US-3', 'US-10', 'US-2']);
  });

  it('keeps the order for an unknown or empty key; unknown priorities go last', () => {
    expect(ids(sortStories(list, ''))).toEqual(ids(list));
    expect(ids(sortStories([S('a', { priority: 'p0' }), S('b', { priority: 'must' })], 'priority'))).toEqual([
      'b',
      'a',
    ]);
  });
});

describe('facets', () => {
  it('lists distinct, sorted, non-empty assignees and epics', () => {
    const f = facets([
      S('1', { assigned_to: 'bob', epic_id: 'E10' }),
      S('2', { assigned_to: 'alice', epic_id: 'E2' }),
      S('3', { assigned_to: 'bob', epic_id: null }),
      S('4', { assigned_to: '' }),
    ]);
    expect(f).toEqual({ assignees: ['alice', 'bob'], epics: ['E2', 'E10'] });
    expect(facets([])).toEqual({ assignees: [], epics: [] });
  });
});
