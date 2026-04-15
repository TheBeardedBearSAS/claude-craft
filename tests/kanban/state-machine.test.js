import { describe, it, expect } from 'vitest';
import {
  STATUSES,
  isTransitionAllowed,
  validateTransition,
  validateUnblock,
  computeTransitionPatch,
} from '../../cli/kanban/server/services/state-machine.js';

const storyOk = (overrides = {}) => ({
  id: 'US-001',
  title: 'x',
  status: 'backlog',
  previous_status: '',
  invest_score: 6,
  tdd_phase: '',
  tasks: { total: 3, completed: 3, list: ['TASK-001', 'TASK-002', 'TASK-003'] },
  ...overrides,
});

describe('isTransitionAllowed — structural matrix', () => {
  const LEGAL = [
    ['backlog', 'ready-for-dev'],
    ['backlog', 'blocked'],
    ['ready-for-dev', 'in-progress'],
    ['ready-for-dev', 'backlog'],
    ['ready-for-dev', 'blocked'],
    ['in-progress', 'review'],
    ['in-progress', 'blocked'],
    ['review', 'done'],
    ['review', 'in-progress'],
    ['review', 'blocked'],
  ];

  it.each(LEGAL)('allows %s -> %s', (from, to) => {
    expect(isTransitionAllowed(from, to)).toBe(true);
  });

  it('forbids skipping states (backlog -> in-progress, etc.)', () => {
    expect(isTransitionAllowed('backlog', 'in-progress')).toBe(false);
    expect(isTransitionAllowed('backlog', 'review')).toBe(false);
    expect(isTransitionAllowed('backlog', 'done')).toBe(false);
    expect(isTransitionAllowed('ready-for-dev', 'review')).toBe(false);
    expect(isTransitionAllowed('ready-for-dev', 'done')).toBe(false);
    expect(isTransitionAllowed('in-progress', 'done')).toBe(false);
    expect(isTransitionAllowed('in-progress', 'backlog')).toBe(false);
  });

  it('forbids transitions from done (terminal)', () => {
    for (const s of STATUSES) expect(isTransitionAllowed('done', s)).toBe(false);
  });

  it('forbids direct transitions from blocked (must use unblock)', () => {
    for (const s of STATUSES) expect(isTransitionAllowed('blocked', s)).toBe(false);
  });

  it('forbids self-transitions', () => {
    for (const s of STATUSES) expect(isTransitionAllowed(s, s)).toBe(false);
  });

  it('rejects unknown statuses', () => {
    expect(isTransitionAllowed('wip', 'done')).toBe(false);
    expect(isTransitionAllowed('backlog', 'pending')).toBe(false);
  });
});

describe('validateTransition — gates', () => {
  describe('backlog -> ready-for-dev : invest_gate', () => {
    it('passes when invest_score === 6', () => {
      const r = validateTransition(storyOk({ status: 'backlog', invest_score: 6 }), 'ready-for-dev');
      expect(r.allowed).toBe(true);
    });

    it('fails when invest_score < 6', () => {
      const r = validateTransition(storyOk({ status: 'backlog', invest_score: 4 }), 'ready-for-dev');
      expect(r.allowed).toBe(false);
      expect(r.gate).toBe('invest_gate');
      expect(r.missing[0]).toMatch(/invest_score/);
    });

    it('fails when invest_score missing', () => {
      const r = validateTransition({ ...storyOk(), status: 'backlog', invest_score: undefined }, 'ready-for-dev');
      expect(r.allowed).toBe(false);
    });
  });

  describe('in-progress -> review : tasks_complete_gate', () => {
    it('passes when all tasks completed', () => {
      const r = validateTransition(storyOk({ status: 'in-progress' }), 'review');
      expect(r.allowed).toBe(true);
    });

    it('fails when tasks remaining', () => {
      const r = validateTransition(
        storyOk({ status: 'in-progress', tasks: { total: 3, completed: 1, list: [] } }),
        'review',
      );
      expect(r.allowed).toBe(false);
      expect(r.gate).toBe('tasks_complete_gate');
      expect(r.missing.join(' ')).toMatch(/2 task/);
    });

    it('fails when no tasks defined', () => {
      const r = validateTransition(
        storyOk({ status: 'in-progress', tasks: { total: 0, completed: 0, list: [] } }),
        'review',
      );
      expect(r.allowed).toBe(false);
      expect(r.missing.join(' ')).toMatch(/no tasks/);
    });
  });

  describe('review -> done : dod_gate', () => {
    it('passes with all tasks done + tdd green', () => {
      const r = validateTransition(
        storyOk({ status: 'review', tdd_phase: 'green' }),
        'done',
      );
      expect(r.allowed).toBe(true);
    });

    it('passes with tdd refactor or done', () => {
      for (const tdd of ['refactor', 'done']) {
        expect(validateTransition(storyOk({ status: 'review', tdd_phase: tdd }), 'done').allowed).toBe(true);
      }
    });

    it('fails when tdd_phase is red or empty', () => {
      for (const tdd of ['', 'red']) {
        const r = validateTransition(storyOk({ status: 'review', tdd_phase: tdd }), 'done');
        expect(r.allowed).toBe(false);
        expect(r.gate).toBe('dod_gate');
      }
    });
  });

  describe('transitions without gate', () => {
    it('ready-for-dev -> in-progress always allowed (structural)', () => {
      expect(validateTransition(storyOk({ status: 'ready-for-dev' }), 'in-progress').allowed).toBe(true);
    });

    it('review -> in-progress allowed (changes requested)', () => {
      expect(validateTransition(storyOk({ status: 'review' }), 'in-progress').allowed).toBe(true);
    });
  });

  describe('-> blocked', () => {
    it('requires non-empty blocked_reason', () => {
      const r = validateTransition(storyOk({ status: 'in-progress' }), 'blocked');
      expect(r.allowed).toBe(false);
      expect(r.reason).toMatch(/blocked_reason/);
    });

    it('allowed with reason from any non-blocked state', () => {
      for (const s of ['backlog', 'ready-for-dev', 'in-progress', 'review']) {
        const r = validateTransition(storyOk({ status: s }), 'blocked', { blocked_reason: 'waiting' });
        expect(r.allowed).toBe(true);
      }
    });

    it('rejects blocked -> blocked', () => {
      const r = validateTransition(storyOk({ status: 'blocked' }), 'blocked', { blocked_reason: 'x' });
      expect(r.allowed).toBe(false);
    });
  });

  it('rejects illegal transitions with explicit reason', () => {
    const r = validateTransition(storyOk({ status: 'backlog' }), 'done');
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/not allowed/);
  });
});

describe('validateUnblock', () => {
  it('restores previous_status when valid', () => {
    const r = validateUnblock({ status: 'blocked', previous_status: 'in-progress' });
    expect(r.allowed).toBe(true);
    expect(r.status).toBe('in-progress');
  });

  it('rejects when story not blocked', () => {
    expect(validateUnblock({ status: 'in-progress' }).allowed).toBe(false);
  });

  it('rejects when previous_status missing or invalid', () => {
    expect(validateUnblock({ status: 'blocked', previous_status: '' }).allowed).toBe(false);
    expect(validateUnblock({ status: 'blocked', previous_status: 'wip' }).allowed).toBe(false);
    expect(validateUnblock({ status: 'blocked', previous_status: 'blocked' }).allowed).toBe(false);
  });
});

describe('computeTransitionPatch', () => {
  it('builds blocked patch with reason and timestamp', () => {
    const p = computeTransitionPatch(
      { status: 'in-progress' },
      'blocked',
      { blocked_reason: 'waiting', now: '2026-04-15T00:00:00Z' },
    );
    expect(p).toEqual({
      status: 'blocked',
      previous_status: 'in-progress',
      blocked_reason: 'waiting',
      blocked_at: '2026-04-15T00:00:00Z',
    });
  });

  it('clears blocked fields when unblocking', () => {
    const p = computeTransitionPatch(
      { status: 'blocked', previous_status: 'in-progress', blocked_reason: 'x' },
      'in-progress',
    );
    expect(p.status).toBe('in-progress');
    expect(p.previous_status).toBe('');
    expect(p.blocked_reason).toBe('');
    expect(p.blocked_at).toBe('');
  });

  it('records previous_status on standard transitions', () => {
    const p = computeTransitionPatch({ status: 'in-progress' }, 'review');
    expect(p).toEqual({ status: 'review', previous_status: 'in-progress' });
  });

  it('auto-fills now when not provided for blocked', () => {
    const p = computeTransitionPatch({ status: 'backlog' }, 'blocked', { blocked_reason: 'x' });
    expect(p.blocked_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
