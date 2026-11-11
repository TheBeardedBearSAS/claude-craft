import { describe, it, expect } from 'vitest';
import {
  averageVelocity,
  forecastSprints,
  remainingPoints,
  velocityRows,
} from '../../cli/kanban/client/src/lib/velocity.js';

const sp = (id, delivered, committed = delivered, closed_date = '2026-01-01') => ({
  id,
  name: id,
  closed_date,
  committed,
  delivered,
});

describe('averageVelocity', () => {
  it('is null without any closed sprint', () => {
    expect(averageVelocity([])).toBeNull();
    expect(averageVelocity(undefined)).toBeNull();
  });
  it('averages the delivered points of the last n sprints, one decimal', () => {
    const list = [
      sp('a', 50, 50, '2026-01-01'),
      sp('b', 20, 20, '2026-01-02'),
      sp('c', 21, 21, '2026-01-03'),
      sp('d', 22, 22, '2026-01-04'),
    ];
    expect(averageVelocity(list)).toBe(21);
    expect(averageVelocity(list, 2)).toBe(21.5);
    expect(averageVelocity(list, 10)).toBe(28.3);
  });
  it('orders by closing date, then by numeric sprint id, whatever the input order', () => {
    const list = [
      sp('sprint-10', 30, 30, '2026-02-01'),
      sp('sprint-2', 10, 10, '2026-02-01'),
      sp('sprint-1', 99, 99, '2026-01-01'),
    ];
    expect(averageVelocity(list, 2)).toBe(20);
  });
  it('ignores sprints with no delivered number', () => {
    expect(averageVelocity([sp('a', 10), { id: 'b', delivered: null }])).toBe(10);
  });
});

describe('forecastSprints', () => {
  it('rounds up to whole sprints', () => {
    expect(forecastSprints(45, 21)).toBe(3);
    expect(forecastSprints(42, 21)).toBe(2);
  });
  it('is 0 when nothing remains and null when the average is unusable', () => {
    expect(forecastSprints(0, 21)).toBe(0);
    expect(forecastSprints(10, 0)).toBeNull();
    expect(forecastSprints(10, null)).toBeNull();
    expect(forecastSprints(null, 10)).toBeNull();
    expect(forecastSprints(10, NaN)).toBeNull();
  });
});

describe('remainingPoints', () => {
  it('counts the points of every story that is not finished', () => {
    const stories = [
      { status: 'done', story_points: 5 },
      { status: 'deferred', story_points: 2 },
      { status: 'review', story_points: 3 },
      { status: 'backlog' },
      { status: 'backlog', story_points: 8 },
    ];
    expect(remainingPoints(stories)).toBe(11);
  });
});

describe('velocityRows', () => {
  it('orders the sprints for the chart and the table, with numbers', () => {
    const rows = velocityRows([
      sp('b', 3, 5, '2026-01-02'),
      sp('a', 4, 4, '2026-01-01'),
      { id: 'c', closed_date: '2026-01-03' },
    ]);
    expect(rows.map((r) => [r.id, r.committed, r.delivered])).toEqual([
      ['a', 4, 4],
      ['b', 5, 3],
      ['c', 0, 0],
    ]);
  });
});
