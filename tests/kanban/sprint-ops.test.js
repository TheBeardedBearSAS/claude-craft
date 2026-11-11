import { describe, it, expect } from 'vitest';
import {
  SprintOpError,
  applyOps,
  closeSprint,
  nextSprintNumber,
  parseSprintGoal,
  renderSprintGoal,
  sprintSlug,
  sprintState,
  startSprint,
  velocity,
} from '../../cli/kanban/server/services/sprint-ops.js';

const META = {
  sprint_id: 'sprint-2-api',
  name: 'API',
  start_date: '2026-11-02',
  end_date: '2026-11-13',
  goal: 'Ship the API',
  capacity_points: 21,
  epic: 'E1',
};

const ss = (over = {}) => ({
  version: '1.0',
  metadata: { ...META },
  stories: {
    'US-1': { title: 'One', status: 'done', story_points: 5 },
    'US-2': { title: 'Two', status: 'in-progress', story_points: 3 },
    'US-3': { title: 'Three', status: 'done', story_points: 2, sprint_id: 'sprint-2-api' },
    'US-4': { title: 'Four', status: 'ready-for-dev', story_points: 8, sprint_id: 'sprint-3-next' },
    'US-5': { title: 'Five', status: 'backlog', story_points: 1, sprint_id: null },
  },
  archived_sprints: {
    'sprint-1-setup': {
      name: 'Setup',
      closed_date: '2026-10-30',
      points_committed: 10,
      points_delivered: 8,
      stories: {},
    },
  },
  ...over,
});

const caught = (fn) => {
  try {
    fn();
  } catch (err) {
    return err;
  }
  throw new Error('did not throw');
};

describe('sprintState', () => {
  it('is active for the metadata sprint without closed_date', () => {
    expect(sprintState('sprint-2-api', ss(), [])).toBe('active');
  });

  it('is closed when archived', () => {
    expect(sprintState('sprint-1-setup', ss(), ['sprint-1-setup'])).toBe('closed');
  });

  it('is closed when the metadata sprint carries a closed_date', () => {
    const s = ss({ metadata: { ...META, closed_date: '2026-11-13' } });
    expect(sprintState('sprint-2-api', s, ['sprint-2-api'])).toBe('closed');
  });

  it('is planned when it only exists as a directory', () => {
    expect(sprintState('sprint-3-next', ss(), ['sprint-3-next'])).toBe('planned');
  });

  it('is null for an unknown sprint', () => {
    expect(sprintState('sprint-9-x', ss(), ['sprint-3-next'])).toBeNull();
  });

  it('tolerates a missing or invalid status file', () => {
    expect(sprintState('a', null, ['a'])).toBe('planned');
    expect(sprintState('a', { _invalid: true, metadata: { sprint_id: 'a' } }, ['a'])).toBe('planned');
  });
});

describe('startSprint', () => {
  const next = {
    id: 'sprint-3-next',
    name: 'Next',
    start_date: '2026-11-16',
    end_date: '2026-11-27',
    goal: 'G',
    capacity_points: 13,
  };
  const closed = () => ss({ metadata: { ...META, closed_date: '2026-11-13' } });

  it('replaces the metadata, without closed_date or leftovers of the previous sprint', () => {
    expect(startSprint(closed(), next)).toEqual([
      {
        op: 'setRoot',
        key: 'metadata',
        value: {
          sprint_id: 'sprint-3-next',
          name: 'Next',
          start_date: '2026-11-16',
          end_date: '2026-11-27',
          goal: 'G',
          capacity_points: 13,
        },
      },
    ]);
  });

  it('omits the capacity when unknown and defaults the goal', () => {
    const [op] = startSprint(null, { id: 'a', name: 'A', start_date: '', end_date: '' });
    expect(op.value).toEqual({ sprint_id: 'a', name: 'A', start_date: '', end_date: '', goal: '' });
  });

  it('refuses while another sprint is active, reporting it', () => {
    const err = caught(() => startSprint(ss(), next));
    expect(err).toBeInstanceOf(SprintOpError);
    expect(err).toMatchObject({
      code: 'sprint_already_active',
      extra: { active: { id: 'sprint-2-api', name: 'API' } },
    });
  });

  it('refuses to start the sprint that is already active', () => {
    expect(caught(() => startSprint(ss(), { ...next, id: 'sprint-2-api' })).code).toBe('sprint_already_active');
  });

  it('refuses to restart a closed sprint', () => {
    expect(caught(() => startSprint(closed(), { ...next, id: 'sprint-1-setup' })).code).toBe('sprint_closed');
  });

  it('accepts an empty status document', () => {
    expect(startSprint({ metadata: {}, stories: {} }, next)).toHaveLength(1);
  });

  it('never touches stories', () => {
    expect(startSprint(closed(), next).every((o) => o.op === 'setRoot')).toBe(true);
  });
});

describe('closeSprint', () => {
  const TODAY = '2026-11-13';
  const run = (opts = {}, state = ss()) => closeSprint(state, 'sprint-2-api', { today: TODAY, ...opts });

  it('archives done stories of the sprint (own key or implicit) and removes them from stories', () => {
    const { ops } = run();
    expect(ops).toContainEqual({ op: 'removeStory', id: 'US-1' });
    expect(ops).toContainEqual({ op: 'removeStory', id: 'US-3' });
    const archive = ops.find((o) => o.op === 'setArchive');
    expect(archive).toEqual({
      op: 'setArchive',
      id: 'sprint-2-api',
      entry: {
        name: 'API',
        epic: 'E1',
        closed_date: TODAY,
        points_committed: 10,
        points_delivered: 7,
        stories: { 'US-1': { status: 'done', points: 5 }, 'US-3': { status: 'done', points: 2 } },
      },
    });
  });

  it('keeps unfinished stories with sprint_id null (backlog) and their status', () => {
    const { ops } = run();
    expect(ops).toContainEqual({ op: 'setStory', id: 'US-2', fields: { sprint_id: null } });
    expect(ops.some((o) => o.id === 'US-2' && 'status' in (o.fields ?? {}))).toBe(false);
  });

  it('carries unfinished stories to a planned sprint', () => {
    const { ops, summary } = run({ carryOver: 'sprint-3-next', knownSprintIds: ['sprint-3-next'] });
    expect(ops).toContainEqual({ op: 'setStory', id: 'US-2', fields: { sprint_id: 'sprint-3-next' } });
    expect(summary).toMatchObject({ carry_to: 'sprint-3-next', carried: ['US-2'], archived: ['US-1', 'US-3'] });
  });

  it('never touches stories of other sprints or of the backlog', () => {
    const touched = run()
      .ops.filter((o) => o.id)
      .map((o) => o.id);
    expect(touched).not.toContain('US-4');
    expect(touched).not.toContain('US-5');
  });

  it('stamps metadata.closed_date last', () => {
    const { ops } = run();
    expect(ops.at(-1)).toEqual({ op: 'setMetadata', fields: { closed_date: TODAY } });
  });

  it('omits the epic when the metadata has none', () => {
    const state = ss();
    delete state.metadata.epic;
    const entry = run({}, state).ops.find((o) => o.op === 'setArchive').entry;
    expect(entry).not.toHaveProperty('epic');
  });

  it('reports the figures in the summary', () => {
    expect(run().summary).toEqual({
      name: 'API',
      closed_date: TODAY,
      points_committed: 10,
      points_delivered: 7,
      archived: ['US-1', 'US-3'],
      carried: ['US-2'],
      carry_to: 'backlog',
    });
  });

  it('refuses a sprint that is not the active one', () => {
    expect(caught(() => closeSprint(ss(), 'sprint-1-setup', { today: TODAY })).code).toBe('not_active');
    expect(caught(() => closeSprint(null, 'x', { today: TODAY })).code).toBe('not_active');
    const already = ss({ metadata: { ...META, closed_date: '2026-11-13' } });
    expect(caught(() => run({}, already)).code).toBe('not_active');
  });

  it('refuses an unknown carry-over target', () => {
    const err = caught(() => run({ carryOver: 'sprint-9-x', knownSprintIds: ['sprint-3-next'] }));
    expect(err.code).toBe('sprint_not_found');
  });

  it('refuses a closed sprint or the sprint itself as carry-over target', () => {
    const known = ['sprint-1-setup', 'sprint-2-api'];
    expect(caught(() => run({ carryOver: 'sprint-1-setup', knownSprintIds: known })).code).toBe('sprint_not_found');
    expect(caught(() => run({ carryOver: 'sprint-2-api', knownSprintIds: known })).code).toBe('sprint_not_found');
  });

  it('does not create an archive of stories when nothing is done', () => {
    const state = ss();
    state.stories = { 'US-2': state.stories['US-2'] };
    const entry = run({}, state).ops.find((o) => o.op === 'setArchive').entry;
    expect(entry.stories).toEqual({});
    expect(entry.points_delivered).toBe(0);
  });
});

describe('applyOps', () => {
  it('forwards each operation to the transaction', () => {
    const calls = [];
    const tx = new Proxy(
      {},
      {
        get:
          (_, name) =>
          (...args) =>
            calls.push([name, ...args]),
      }
    );
    applyOps(tx, [
      { op: 'setRoot', key: 'metadata', value: { a: 1 } },
      { op: 'setMetadata', fields: { b: 2 } },
      { op: 'setStory', id: 'US-1', fields: { c: 3 } },
      { op: 'removeStory', id: 'US-2' },
      { op: 'setArchive', id: 's', entry: { d: 4 } },
    ]);
    expect(calls).toEqual([
      ['setRoot', 'metadata', { a: 1 }],
      ['setMetadata', { b: 2 }],
      ['setStory', 'US-1', { c: 3 }],
      ['removeStory', 'US-2'],
      ['setArchive', 's', { d: 4 }],
    ]);
  });

  it('rejects an unknown operation', () => {
    expect(() => applyOps({}, [{ op: 'nope' }])).toThrow(/unknown operation/);
  });
});

describe('velocity', () => {
  const arch = (id, closed_date, over = {}) => ({ [id]: { name: id, closed_date, ...over } });

  it('sorts oldest first and averages the last 3 closed sprints', () => {
    const v = velocity({
      archived_sprints: {
        ...arch('d', '2026-04-01', { points_committed: 30, points_delivered: 24 }),
        ...arch('a', '2026-01-01', { points_committed: 10, points_delivered: 10 }),
        ...arch('c', '2026-03-01', { points_committed: 20, points_delivered: 20 }),
        ...arch('b', '2026-02-01', { points_committed: 12, points_delivered: 9 }),
      },
    });
    expect(v.sprints.map((s) => s.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(v.sprints[0]).toEqual({ id: 'a', name: 'a', closed_date: '2026-01-01', committed: 10, delivered: 10 });
    expect(v.average).toBeCloseTo((9 + 20 + 24) / 3, 1);
  });

  it('derives missing figures from the archived stories', () => {
    const v = velocity({
      archived_sprints: arch('a', '2026-01-01', {
        stories: {
          x: { status: 'done', points: 3 },
          y: { status: 'done', points: 2 },
          z: { status: 'deferred', points: 4 },
        },
      }),
    });
    expect(v.sprints[0]).toMatchObject({ committed: 9, delivered: 5 });
  });

  it('gives null when nothing can be computed', () => {
    const v = velocity({ archived_sprints: arch('a', '2026-01-01') });
    expect(v.sprints[0]).toMatchObject({ committed: null, delivered: null });
    expect(v.average).toBeNull();
  });

  it('ignores sprints without delivered figure for the average', () => {
    const v = velocity({
      archived_sprints: {
        ...arch('a', '2026-01-01', { points_delivered: 10 }),
        ...arch('b', '2026-02-01'),
      },
    });
    expect(v.average).toBe(10);
  });

  it('rounds the average to one decimal', () => {
    const v = velocity({
      archived_sprints: {
        ...arch('a', '2026-01-01', { points_delivered: 10 }),
        ...arch('b', '2026-02-01', { points_delivered: 10 }),
        ...arch('c', '2026-03-01', { points_delivered: 11 }),
      },
    });
    expect(v.average).toBe(10.3);
  });

  it('is empty without archives or status file', () => {
    expect(velocity(null)).toEqual({ sprints: [], average: null });
    expect(velocity({})).toEqual({ sprints: [], average: null });
  });

  it('falls back to the sprint id as name and an empty date', () => {
    const v = velocity({ archived_sprints: { a: { points_delivered: 1 } } });
    expect(v.sprints[0]).toEqual({ id: 'a', name: 'a', closed_date: '', committed: null, delivered: 1 });
  });
});

describe('sprint directory helpers', () => {
  it('nextSprintNumber is the highest sprint-<N> + 1', () => {
    expect(nextSprintNumber(['sprint-1-a', 'sprint-9-b', 'sprint-10-c', 'misc'])).toBe(11);
    expect(nextSprintNumber([])).toBe(1);
    expect(nextSprintNumber(['sprint-007'])).toBe(8);
  });

  it('sprintSlug folds accents and keeps ASCII words', () => {
    expect(sprintSlug('Génération + Fiche Détail!')).toBe('generation-fiche-detail');
    expect(sprintSlug('  ')).toBe('sprint');
    expect(sprintSlug('../../etc/passwd')).toBe('etc-passwd');
    expect(sprintSlug('x'.repeat(100)).length).toBeLessThanOrEqual(40);
  });

  it('renders then parses the sprint goal file', () => {
    const md = renderSprintGoal({
      number: 3,
      name: 'Next',
      start_date: '2026-11-16',
      end_date: '2026-11-27',
      goal: 'Ship it',
      capacity_points: 13,
    });
    expect(parseSprintGoal(md, 'sprint-3-next')).toEqual({
      name: 'Next',
      start_date: '2026-11-16',
      end_date: '2026-11-27',
      goal: 'Ship it',
      capacity_points: 13,
    });
  });

  it('round-trips a sprint without goal nor capacity', () => {
    const md = renderSprintGoal({ number: 1, name: 'A', start_date: '2026-01-01', end_date: '2026-01-02' });
    expect(parseSprintGoal(md, 'sprint-1-a')).toEqual({
      name: 'A',
      start_date: '2026-01-01',
      end_date: '2026-01-02',
      goal: '',
    });
  });

  it('parses the legacy workflow:start template', () => {
    const md = `# Sprint 4 : Détail

## Informations

| Attribut | Valeur |
|----------|--------|
| Numéro | 4 |
| Début | 2026-11-02 |
| Fin | 2026-11-13 |
| Capacité | 21 points |

## Sprint Goal

> "Les utilisateurs peuvent s'inscrire"
`;
    expect(parseSprintGoal(md, 'sprint-4-detail')).toEqual({
      name: 'Détail',
      start_date: '2026-11-02',
      end_date: '2026-11-13',
      goal: "Les utilisateurs peuvent s'inscrire",
      capacity_points: 21,
    });
  });

  it('falls back to the id and empty fields on a free-form file', () => {
    expect(parseSprintGoal('# Sprint 8 — Auth & Paramètres\n\nLivrer l’auth.\n', 'sprint-8-auth')).toEqual({
      name: 'Auth & Paramètres',
      start_date: '',
      end_date: '',
      goal: '',
    });
    expect(parseSprintGoal('', 'sprint-8-auth').name).toBe('sprint-8-auth');
    expect(parseSprintGoal(null, 'sprint-8-auth').name).toBe('sprint-8-auth');
  });

  it('escapes table separators so a name cannot break the table', () => {
    const md = renderSprintGoal({ number: 1, name: 'A | B', start_date: '2026-01-01', end_date: '2026-01-02' });
    expect(parseSprintGoal(md, 'x').start_date).toBe('2026-01-01');
  });
});
