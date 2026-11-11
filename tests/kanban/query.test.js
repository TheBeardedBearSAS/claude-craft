import { describe, it, expect } from 'vitest';
import {
  parseQuery,
  buildQuery,
  mergeQuery,
  filtersFromQuery,
  parseHash,
  formatHash,
} from '../../cli/kanban/client/src/lib/query.js';

describe('query string', () => {
  it('parses, tolerating a leading ? and keeping the first duplicate', () => {
    expect(parseQuery('?q=a%20b&who=x&q=z')).toEqual({ q: 'a b', who: 'x' });
    expect(parseQuery('')).toEqual({});
    expect(parseQuery(undefined)).toEqual({});
  });

  it('builds a stable string: sorted keys, empty values dropped, lists joined by commas', () => {
    expect(buildQuery({ sort: 'priority', q: 'auth', prio: ['must', 'should'], who: '', epic: null, x: [] })).toBe(
      'prio=must,should&q=auth&sort=priority'
    );
    expect(buildQuery({ b: '1', a: '2' })).toBe(buildQuery({ a: '2', b: '1' }));
  });

  it('round-trips awkward values', () => {
    const q = { q: 'a&b=c d/é' };
    expect(parseQuery(buildQuery(q))).toEqual(q);
  });

  it('merges a patch; empty values remove keys', () => {
    expect(mergeQuery({ q: 'a', who: 'x' }, { q: '', epic: 'E1', prio: ['must'] })).toEqual({
      who: 'x',
      epic: 'E1',
      prio: 'must',
    });
    expect(mergeQuery('q=a', { story: 'US-1' })).toEqual({ q: 'a', story: 'US-1' });
  });

  it('derives typed filters', () => {
    expect(
      filtersFromQuery({
        q: 'auth',
        prio: 'must,should',
        who: 'alice',
        epic: 'E4',
        sort: 'points',
        dir: 'desc',
        story: 'US-1',
      })
    ).toEqual({
      q: 'auth',
      prio: ['must', 'should'],
      who: 'alice',
      epic: 'E4',
      sort: 'points',
      dir: 'desc',
      story: 'US-1',
    });
    expect(filtersFromQuery({ dir: 'sideways' })).toEqual({
      q: '',
      prio: [],
      who: '',
      epic: '',
      sort: '',
      dir: 'asc',
      story: '',
    });
    expect(filtersFromQuery('prio=could').prio).toEqual(['could']);
  });
});

describe('parseHash / formatHash', () => {
  it('defaults to kanban', () => {
    expect(parseHash('')).toMatchObject({ name: 'kanban', params: {}, query: {} });
    expect(parseHash('#/')).toMatchObject({ name: 'kanban' });
  });

  it('parses views and their query', () => {
    expect(parseHash('#/backlog?q=x&prio=must')).toMatchObject({ name: 'backlog', query: { q: 'x', prio: 'must' } });
  });

  it('parses sprints/<id>', () => {
    expect(parseHash('#/sprints/sprint-1')).toMatchObject({ name: 'sprints', params: { id: 'sprint-1' } });
    expect(parseHash('#/sprints')).toMatchObject({ name: 'sprints', params: {} });
  });

  it('decodes docs paths, with slashes', () => {
    const r = parseHash('#/docs/project-management/my%20doc%23.md');
    expect(r).toMatchObject({ name: 'docs', params: { rel: 'project-management/my doc#.md' } });
    expect(parseHash('#/docs').params).toEqual({});
  });

  it('flags unknown routes, extra segments and bad escapes as not-found', () => {
    expect(parseHash('#/nope').name).toBe('not-found');
    expect(parseHash('#/kanban/extra').name).toBe('not-found');
    expect(parseHash('#/sprints/a/b').name).toBe('not-found');
    expect(parseHash('#/docs/%E0%A4%A').name).toBe('not-found');
  });

  it('keeps pathname and raw parts for existing consumers', () => {
    expect(parseHash('#/sprints/s1')).toMatchObject({ pathname: '/sprints/s1', parts: ['sprints', 's1'] });
  });

  it('formats the inverse of parse', () => {
    expect(formatHash('kanban', {}, { q: 'a b', story: 'US-1' })).toBe('#/kanban?q=a%20b&story=US-1');
    expect(formatHash('docs', { rel: 'a b/c#.md' })).toBe('#/docs/a%20b/c%23.md');
    expect(formatHash('sprints', { id: 'sprint-1' })).toBe('#/sprints/sprint-1');
    const h = '#/docs/a%20b/c%23.md?q=x';
    expect(formatHash('docs', parseHash(h).params, parseHash(h).query)).toBe(h);
  });
});
