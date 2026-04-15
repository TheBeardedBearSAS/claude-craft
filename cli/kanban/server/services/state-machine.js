/**
 * BMAD v6 state machine for User Story status transitions.
 * Authoritative server-side validator. UI proposes, this disposes.
 *
 * Allowed transitions (deny by default) :
 *   backlog       -> ready-for-dev | blocked
 *   ready-for-dev -> in-progress   | blocked | backlog
 *   in-progress   -> review        | blocked
 *   review        -> done          | in-progress | blocked
 *   done          -> (terminal, no outgoing)
 *   blocked       -> previous_status (via unblock)
 *
 * Gates (must pass before transition is allowed) :
 *   backlog       -> ready-for-dev : invest_score === 6
 *   in-progress   -> review        : tasks.completed === tasks.total && tasks.total > 0
 *   review        -> done          : tasks.completed === tasks.total && tdd_phase in green|refactor|done
 */

export const STATUSES = Object.freeze(['backlog', 'ready-for-dev', 'in-progress', 'review', 'done', 'blocked']);

const TRANSITIONS = Object.freeze({
  'backlog': ['ready-for-dev', 'blocked'],
  'ready-for-dev': ['in-progress', 'blocked', 'backlog'],
  'in-progress': ['review', 'blocked'],
  'review': ['done', 'in-progress', 'blocked'],
  'done': [],
  'blocked': [],
});

const GATES = Object.freeze({
  'backlog->ready-for-dev': {
    name: 'invest_gate',
    check: (story) => {
      const score = Number(story.invest_score ?? 0);
      return {
        passed: score >= 6,
        missing: score >= 6 ? [] : [`invest_score must be 6/6 (got ${score})`],
      };
    },
  },
  'in-progress->review': {
    name: 'tasks_complete_gate',
    check: (story) => {
      const total = Number(story.tasks?.total ?? 0);
      const done = Number(story.tasks?.completed ?? 0);
      const missing = [];
      if (total <= 0) missing.push('no tasks defined (tasks.total must be > 0)');
      if (done < total) missing.push(`${total - done} task(s) not completed`);
      return { passed: missing.length === 0, missing };
    },
  },
  'review->done': {
    name: 'dod_gate',
    check: (story) => {
      const total = Number(story.tasks?.total ?? 0);
      const done = Number(story.tasks?.completed ?? 0);
      const tddOk = ['green', 'refactor', 'done'].includes(story.tdd_phase ?? '');
      const missing = [];
      if (total <= 0 || done < total) missing.push('not all tasks completed');
      if (!tddOk) missing.push(`tdd_phase must be green|refactor|done (got "${story.tdd_phase ?? ''}")`);
      return { passed: missing.length === 0, missing };
    },
  },
});

/**
 * @param {string} from - current status
 * @param {string} to - target status
 * @returns {boolean} true if the transition is structurally allowed (gates NOT evaluated).
 */
export function isTransitionAllowed(from, to) {
  if (!STATUSES.includes(from) || !STATUSES.includes(to)) return false;
  if (from === to) return false;
  if (to === 'blocked') return from !== 'blocked' && from !== 'done';
  if (from === 'blocked') return false;
  return (TRANSITIONS[from] ?? []).includes(to);
}

/**
 * Validate a transition request against structure + gates.
 * @param {object} story - story frontmatter
 * @param {string} to - target status
 * @param {object} [opts]
 * @param {string} [opts.blocked_reason] - required when to === 'blocked'
 * @returns {{ allowed: boolean, reason?: string, gate?: string, missing?: string[] }}
 */
export function validateTransition(story, to, opts = {}) {
  const from = story.status;

  if (to === 'blocked') {
    if (from === 'blocked') return { allowed: false, reason: 'already blocked' };
    if (!opts.blocked_reason || !opts.blocked_reason.trim()) {
      return { allowed: false, reason: 'blocked_reason is required' };
    }
    return { allowed: true };
  }

  if (!isTransitionAllowed(from, to)) {
    return { allowed: false, reason: `transition ${from} -> ${to} not allowed` };
  }

  const gate = GATES[`${from}->${to}`];
  if (gate) {
    const result = gate.check(story);
    if (!result.passed) {
      return { allowed: false, gate: gate.name, missing: result.missing, reason: 'gate failed' };
    }
  }
  return { allowed: true };
}

/**
 * Unblock a story : restore previous_status. Does NOT evaluate gates
 * (the story was valid before being blocked).
 * @param {object} story
 * @returns {{ allowed: boolean, status?: string, reason?: string }}
 */
export function validateUnblock(story) {
  if (story.status !== 'blocked') {
    return { allowed: false, reason: 'story is not blocked' };
  }
  const prev = story.previous_status;
  if (!prev || !STATUSES.includes(prev) || prev === 'blocked') {
    return { allowed: false, reason: 'no valid previous_status to restore' };
  }
  return { allowed: true, status: prev };
}

/**
 * Compute the frontmatter patch to apply for a given transition.
 * @param {object} story
 * @param {string} to
 * @param {object} [opts]
 * @returns {object} partial frontmatter to merge
 */
export function computeTransitionPatch(story, to, opts = {}) {
  if (to === 'blocked') {
    return {
      status: 'blocked',
      previous_status: story.status,
      blocked_reason: opts.blocked_reason ?? '',
      blocked_at: opts.now ?? new Date().toISOString(),
    };
  }
  const patch = { status: to };
  if (story.status === 'blocked') {
    patch.previous_status = '';
    patch.blocked_reason = '';
    patch.blocked_at = '';
  } else {
    patch.previous_status = story.status;
  }
  return patch;
}

export const _internal = { TRANSITIONS, GATES };
