import { describe, it, expect } from 'vitest';
import {
  moveTargets,
  describeCard,
  countChanged,
  BOARD_SHORTCUTS,
} from '../../cli/kanban/client/src/lib/board-card.js';
import en from '../../cli/kanban/client/src/lib/i18n/locales/en.js';

// Stub translators: expose key + params so the test checks WHAT is said, not the wording.
const t = (key, params) => (params ? `${key}${JSON.stringify(params)}` : key);
const tn = (key, n) => `${key}#${n}`;

const story = (extra = {}) => ({ id: 'US-1', status: 'in-progress', _writable: true, ...extra });

describe('moveTargets', () => {
  it('lists the targets allowed by the state machine', () => {
    expect(moveTargets(story())).toEqual(['review', 'blocked']);
  });

  it('a blocked story can only return to previous_status', () => {
    expect(moveTargets(story({ status: 'blocked', previous_status: 'review' }))).toEqual(['review']);
  });

  it('is empty in read-only mode', () => {
    expect(moveTargets(story(), { readonly: true })).toEqual([]);
  });

  it('is empty for a story managed elsewhere (_writable false)', () => {
    expect(moveTargets(story({ _writable: false }))).toEqual([]);
  });

  it('is empty for a done story', () => {
    expect(moveTargets(story({ status: 'done' }))).toEqual([]);
  });
});

describe('describeCard', () => {
  const full = story({
    priority: 'must',
    story_points: 5,
    tdd_phase: 'red',
    assigned_to: 'alice',
    tasks: { total: 4, completed: 1 },
  });

  it('restitutes priority, points, TDD phase, assignee and task progress', () => {
    const text = describeCard(full, { t, tn });
    expect(text).toContain('a11y.card.priority{"priority":"priority.must"}');
    expect(text).toContain('a11y.card.points#5');
    expect(text).toContain('a11y.card.tdd{"phase":"tdd.red"}');
    expect(text).toContain('a11y.card.assignee{"name":"alice"}');
    expect(text).toContain('a11y.card.tasks{"done":1,"total":4}');
  });

  it('says unassigned and omits missing facts', () => {
    const text = describeCard(story(), { t, tn });
    expect(text).toContain('a11y.card.unassigned');
    expect(text).not.toContain('a11y.card.priority');
    expect(text).not.toContain('a11y.card.points');
    expect(text).not.toContain('a11y.card.tasks');
  });

  it('gives the blocking reason', () => {
    const text = describeCard(story({ status: 'blocked', blocked_reason: 'waiting for API' }), { t, tn });
    expect(text).toContain('a11y.card.blocked{"reason":"waiting for API"}');
  });

  it('mentions read-only for a locked story and in read-only mode', () => {
    expect(describeCard(story({ _writable: false }), { t, tn })).toContain('a11y.card.readonly');
    expect(describeCard(story(), { t, tn, readonly: true })).toContain('a11y.card.readonly');
    expect(describeCard(story(), { t, tn })).not.toContain('a11y.card.readonly');
  });

  it('never prints "undefined"', () => {
    expect(describeCard({ id: 'US-9', status: 'backlog' }, { t, tn })).not.toContain('undefined');
  });
});

describe('countChanged', () => {
  const a = { id: 'A', status: 'backlog', title: 'a' };
  const b = { id: 'B', status: 'backlog', title: 'b' };

  it('is 0 for identical lists', () => {
    expect(countChanged([a, b], [{ ...a }, { ...b }])).toBe(0);
  });

  it('counts modified, added and removed stories once each', () => {
    expect(countChanged([a, b], [{ ...a, status: 'done' }])).toBe(2);
    expect(countChanged([a], [a, b])).toBe(1);
  });

  it('is 0 when there is nothing to compare against', () => {
    expect(countChanged(null, [a, b])).toBe(0);
  });
});

describe('BOARD_SHORTCUTS', () => {
  it('only references labels that exist in en', () => {
    for (const s of BOARD_SHORTCUTS) expect(en[s.label], s.label).toBeTypeOf('string');
  });

  it('gives each shortcut at least one key', () => {
    for (const s of BOARD_SHORTCUTS) expect(s.keys.length).toBeGreaterThan(0);
  });
});
