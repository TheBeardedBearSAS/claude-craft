import { describe, it, expect } from 'vitest';
import { sumPoints } from '../../cli/kanban/client/src/lib/points.js';

describe('sumPoints', () => {
  const l = [
    { story_points: 3, status: 'done' },
    { story_points: '5', status: 'backlog' },
    { status: 'done' },
    { story_points: 'x' },
  ];
  it('sums, counting missing or invalid points as 0', () => {
    expect(sumPoints(l)).toBe(8);
    expect(sumPoints([])).toBe(0);
    expect(sumPoints(undefined)).toBe(0);
  });
  it('honours a predicate', () => {
    expect(sumPoints(l, (s) => s.status === 'done')).toBe(3);
  });
});
