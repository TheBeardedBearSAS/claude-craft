import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeBurndown } from '../../cli/kanban/server/services/sprint-cache.js';

const makeSprintStatus = (startDate, endDate) => ({
  version: '1.0',
  metadata: {
    sprint_id: 'sprint-1',
    name: 'Sprint 1',
    start_date: startDate,
    end_date: endDate,
    goal: 'Ship it',
  },
  stories: {},
});

describe('computeBurndown — property-based', () => {
  it('total_points always equals sum of story_points in input', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ story_points: fc.nat(21) }), { maxLength: 10 }),
        (stories) => {
          const status = makeSprintStatus('', '');
          const result = computeBurndown(status, stories);
          const expected = stories.reduce((s, st) => s + (st.story_points ?? 0), 0);
          expect(result.total_points).toBe(expected);
        },
      ),
    );
  });

  it('returns empty ideal/actual when dates are missing', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ story_points: fc.nat(10) }), { maxLength: 5 }),
        (stories) => {
          const status = makeSprintStatus('', '');
          const result = computeBurndown(status, stories);
          expect(result.ideal).toEqual([]);
          expect(result.actual).toEqual([]);
          expect(result.on_track).toBeNull();
        },
      ),
    );
  });

  it('ideal line length equals totalDays+1 for valid date ranges', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 30 }),
        (durationDays) => {
          const start = new Date('2026-01-01');
          const end = new Date(start);
          end.setDate(start.getDate() + durationDays);

          const fmtDate = (d) => d.toISOString().split('T')[0];
          const status = makeSprintStatus(fmtDate(start), fmtDate(end));
          const stories = [{ story_points: 10 }];

          const result = computeBurndown(status, stories);
          expect(result.ideal.length).toBe(durationDays + 1);
        },
      ),
    );
  });

  it('ideal line always starts at total_points and ends at 0 (when points > 0)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 14 }),
        fc.integer({ min: 1, max: 50 }),
        (durationDays, totalPoints) => {
          const start = new Date('2026-03-01');
          const end = new Date(start);
          end.setDate(start.getDate() + durationDays);

          const fmtDate = (d) => d.toISOString().split('T')[0];
          const status = makeSprintStatus(fmtDate(start), fmtDate(end));

          const result = computeBurndown(status, [{ story_points: totalPoints }]);

          expect(result.ideal[0].points).toBe(totalPoints);
          expect(result.ideal[result.ideal.length - 1].points).toBe(0);
        },
      ),
    );
  });
});
