import { describe, it, expect } from 'vitest';
import { STATUSES, TRANSITIONS, allowedTargets } from '../../cli/kanban/shared/transitions.js';

describe('allowedTargets', () => {
  it('lists the structural targets plus blocked', () => {
    expect(allowedTargets({ status: 'backlog' }).sort()).toEqual(['blocked', 'ready-for-dev']);
    expect(allowedTargets({ status: 'review' }).sort()).toEqual(['blocked', 'done', 'in-progress']);
  });

  it('adds blocked only once', () => {
    const targets = allowedTargets({ status: 'in-progress' });
    expect(targets.filter((t) => t === 'blocked')).toHaveLength(1);
  });

  it('done is terminal', () => {
    expect(allowedTargets({ status: 'done' })).toEqual([]);
  });

  it('blocked only goes back to previous_status', () => {
    expect(allowedTargets({ status: 'blocked', previous_status: 'review' })).toEqual(['review']);
  });

  it('blocked without a valid previous_status has no target', () => {
    expect(allowedTargets({ status: 'blocked', previous_status: '' })).toEqual([]);
    expect(allowedTargets({ status: 'blocked', previous_status: 'blocked' })).toEqual([]);
    expect(allowedTargets({ status: 'blocked', previous_status: 'nope' })).toEqual([]);
  });

  it('unknown status has no target', () => {
    expect(allowedTargets({ status: 'weird' })).toEqual([]);
  });

  it('exposes the shared constants', () => {
    expect(STATUSES).toContain('blocked');
    expect(TRANSITIONS['review']).toContain('done');
  });
});
