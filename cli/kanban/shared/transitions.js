// Status model shared by server (state machine) and client. Pure: no Node import.

export const STATUSES = Object.freeze(['backlog', 'ready-for-dev', 'in-progress', 'review', 'done', 'blocked']);

export const TRANSITIONS = Object.freeze({
  backlog: ['ready-for-dev', 'blocked'],
  'ready-for-dev': ['in-progress', 'blocked', 'backlog'],
  'in-progress': ['review', 'blocked'],
  review: ['done', 'in-progress', 'blocked'],
  done: [],
  blocked: [],
});

/**
 * Statuses reachable from the story's current state (gates NOT evaluated).
 * blocked -> previous_status only; any non-terminal state may also go to blocked.
 * @param {{ status: string, previous_status?: string }} story
 * @returns {string[]}
 */
export function allowedTargets(story) {
  const { status, previous_status: prev } = story;
  if (status === 'blocked') return STATUSES.includes(prev) && prev !== 'blocked' ? [prev] : [];
  if (!(status in TRANSITIONS) || status === 'done') return [];
  return [...new Set([...TRANSITIONS[status], 'blocked'])];
}
