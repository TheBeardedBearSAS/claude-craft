/**
 * Unit tests — pure logic extracted to support the kanban fixes. These target
 * small, DOM-free helpers (new modules created in the fix phase) plus the
 * existing config color map. Written BEFORE the fixes (TDD red): the imports of
 * not-yet-created modules will fail until Phase 3 lands them.
 */
import { describe, it, expect } from 'vitest';

import { TASK_TYPE } from '../../cli/kanban/client/src/lib/config.js';
import { mapBmadPriority } from '../../cli/kanban/shared/priority.js';
import { parseDependencyRefs } from '../../cli/kanban/shared/deps.js';
import { computeSprintProgress } from '../../cli/kanban/client/src/lib/progress.js';
import { alignBurndownByDate } from '../../cli/kanban/client/src/lib/burndown.js';
import { classifyKanbanEvent } from '../../cli/kanban/client/src/lib/events.js';

describe('config TASK_TYPE matches the schema task types', () => {
  // schemas.js TASK_TYPES = ['DB','BE','FE-WEB','FE-MOB','TEST','DOC','OPS','REV']
  it('defines a color for every schema task type', () => {
    for (const t of ['DB', 'BE', 'FE-WEB', 'FE-MOB', 'TEST', 'DOC', 'OPS', 'REV']) {
      expect(TASK_TYPE[t], `missing color for ${t}`).toBeTruthy();
    }
  });
  it('drops the stale keys that match no task type', () => {
    expect(TASK_TYPE.FE).toBeUndefined();
    expect(TASK_TYPE.DOCS).toBeUndefined();
  });
});

describe('mapBmadPriority (P0..P3 -> MoSCoW)', () => {
  it('maps each BMAD priority', () => {
    expect(mapBmadPriority('P0')).toBe('must');
    expect(mapBmadPriority('P1')).toBe('should');
    expect(mapBmadPriority('P2')).toBe('could');
    expect(mapBmadPriority('P3')).toBe('wont');
  });
  it('passes through valid MoSCoW values and defaults the rest to should', () => {
    expect(mapBmadPriority('must')).toBe('must');
    expect(mapBmadPriority(undefined)).toBe('should');
    expect(mapBmadPriority('weird')).toBe('should');
  });
});

describe('parseDependencyRefs (freeform strings -> ids)', () => {
  it('extracts the leading id token from each freeform dependency', () => {
    const refs = parseDependencyRefs([
      'US-E4-02 (modèle compte, S8, done)',
      'Config console AuthProvider (Phase 0, NON PRÊTE)',
      'US-E4-07a (checkout + entitlements)',
    ]);
    expect(refs).toContain('US-E4-02');
    expect(refs).toContain('US-E4-07a');
    // a non-id sentence yields no ref
    expect(refs).not.toContain('Config');
  });
  it('is safe on empty / undefined input', () => {
    expect(parseDependencyRefs([])).toEqual([]);
    expect(parseDependencyRefs(undefined)).toEqual([]);
  });
});

describe('computeSprintProgress (App progress bar — sprint-scoped, bug #6)', () => {
  const stories = [
    { sprint_id: 'A', status: 'done', story_points: 5 },
    { sprint_id: 'A', status: 'in-progress', story_points: 3 },
    { sprint_id: 'B', status: 'done', story_points: 8 }, // other sprint must not count
  ];
  it('counts only stories of the active sprint', () => {
    const p = computeSprintProgress(stories, 'A');
    expect(p.totalPoints).toBe(8);
    expect(p.donePoints).toBe(5);
    expect(p.pct).toBe(Math.round((5 / 8) * 100));
  });
  it('returns 0% safely when the sprint has no points', () => {
    const p = computeSprintProgress([], 'A');
    expect(p.totalPoints).toBe(0);
    expect(p.pct).toBe(0);
  });
});

describe('alignBurndownByDate (sr-only table join by date, bug #8)', () => {
  it('joins ideal and actual rows on their date, not their array index', () => {
    const ideal = [
      { date: '2026-07-27', points: 13 },
      { date: '2026-07-28', points: 11 },
      { date: '2026-07-29', points: 9 },
    ];
    const actual = [
      { date: '2026-07-27', points: 13 },
      { date: '2026-07-29', points: 6 }, // no entry on the 28th
    ];
    const rows = alignBurndownByDate(ideal, actual);
    expect(rows.map((r) => r.date)).toEqual(['2026-07-27', '2026-07-28', '2026-07-29']);
    const d29 = rows.find((r) => r.date === '2026-07-29');
    expect(d29.ideal).toBe(9);
    expect(d29.actual).toBe(6); // joined by date, would be wrong if joined by index
    const d28 = rows.find((r) => r.date === '2026-07-28');
    expect(d28.actual).toBeNull();
  });
});

describe('classifyKanbanEvent (SSE refresh routing, bug #7)', () => {
  it('reloads the sprint/burndown on a story status change', () => {
    const r = classifyKanbanEvent({ event: 'story:updated' });
    expect(r.reloadStories).toBe(true);
    expect(r.reloadSprint).toBe(true);
  });
  it('reloads both on a relevant file change', () => {
    const r = classifyKanbanEvent({ event: 'file:changed', payload: { category: 'story' } });
    expect(r.reloadStories).toBe(true);
    expect(r.reloadSprint).toBe(true);
  });
  it('ignores irrelevant file changes', () => {
    const r = classifyKanbanEvent({ event: 'file:changed', payload: { category: 'other' } });
    expect(r.reloadStories).toBe(false);
    expect(r.reloadSprint).toBe(false);
  });
});
