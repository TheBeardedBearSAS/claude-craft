import { describe, it, expect } from 'vitest';
import { alignBurndownByDate, buildSeries, normalizeOnTrack } from '../../cli/kanban/client/src/lib/burndown.js';

describe('alignBurndownByDate', () => {
  it('joins by date, not by index', () => {
    const rows = alignBurndownByDate(
      [
        { date: '2026-01-01', points: 10 },
        { date: '2026-01-02', points: 5 },
      ],
      [{ date: '2026-01-02', points: 6 }]
    );
    expect(rows).toEqual([
      { date: '2026-01-01', ideal: 10, actual: null },
      { date: '2026-01-02', ideal: 5, actual: 6 },
    ]);
  });
});

describe('buildSeries', () => {
  it('returns aligned uPlot columns with unix-second timestamps', () => {
    const s = buildSeries(
      [
        { date: '2026-01-01', points: 10 },
        { date: '2026-01-02', points: 5 },
      ],
      [{ date: '2026-01-01', points: 10 }]
    );
    expect(s.timestamps).toEqual([Date.parse('2026-01-01') / 1000, Date.parse('2026-01-02') / 1000]);
    expect(s.ideal).toEqual([10, 5]);
    expect(s.actual).toEqual([10, null]);
  });

  it('is empty without data', () => {
    expect(buildSeries([], [])).toEqual({ timestamps: [], ideal: [], actual: [] });
    expect(buildSeries(undefined, undefined).timestamps).toEqual([]);
  });
});

describe('normalizeOnTrack', () => {
  it('keeps known statuses and maps the rest to unknown', () => {
    expect(normalizeOnTrack('on-track')).toBe('on-track');
    expect(normalizeOnTrack('at-risk')).toBe('at-risk');
    expect(normalizeOnTrack('behind')).toBe('behind');
    expect(normalizeOnTrack('nope')).toBe('unknown');
    expect(normalizeOnTrack(undefined)).toBe('unknown');
  });
});
