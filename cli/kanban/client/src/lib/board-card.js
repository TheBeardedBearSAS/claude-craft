// Pure helpers for the Kanban board cards: where a card may go, how it is described to a screen reader,
// how many stories changed between two loads. No Svelte, no DOM; translators are injected.

import { allowedTargets } from '../../../shared/transitions.js';

/** Statuses a card can be moved to (empty when read-only or managed by .bmad/sprint-status.yaml). */
export function moveTargets(story, { readonly = false } = {}) {
  if (readonly || story._writable === false) return [];
  return allowedTargets(story);
}

const taskFact = (tasks, t) =>
  tasks?.total > 0 ? t('a11y.card.tasks', { done: tasks.completed ?? 0, total: tasks.total }) : '';

function facts(s, { t, tn }) {
  return [
    s.priority && t('a11y.card.priority', { priority: t(`priority.${s.priority}`) }),
    Number.isFinite(s.story_points) && tn('a11y.card.points', s.story_points),
    s.tdd_phase && t('a11y.card.tdd', { phase: t(`tdd.${s.tdd_phase}`) }),
    s.assigned_to ? t('a11y.card.assignee', { name: s.assigned_to }) : t('a11y.card.unassigned'),
    taskFact(s.tasks, t),
    s.status === 'blocked' && s.blocked_reason && t('a11y.card.blocked', { reason: s.blocked_reason }),
  ];
}

/** Text read after a card's name (aria-describedby): priority, points, TDD phase, assignee, tasks, blocker. */
export function describeCard(story, { t, tn, readonly = false }) {
  const locked = readonly || story._writable === false;
  return [...facts(story, { t, tn }), locked && t('a11y.card.readonly')].filter(Boolean).join('. ');
}

/** Number of stories added, removed or modified between two story lists (0 without a baseline). */
export function countChanged(prev, next) {
  if (!prev) return 0;
  const before = new Map(prev.map((s) => [s.id, JSON.stringify(s)]));
  const after = new Map(next.map((s) => [s.id, JSON.stringify(s)]));
  const ids = new Set([...before.keys(), ...after.keys()]);
  return [...ids].filter((id) => before.get(id) !== after.get(id)).length;
}

/** Board keyboard shortcuts, in display order. `label` is an en.js key; the Settings panel reuses this list. */
export const BOARD_SHORTCUTS = [
  { keys: ['↑', '↓'], label: 'settings.keyboard.navigate' },
  { keys: ['←', '→'], label: 'settings.keyboard.column' },
  { keys: ['Alt+M'], label: 'settings.keyboard.move' },
  { keys: ['1–6'], label: 'settings.keyboard.toColumn' },
  { keys: ['Esc'], label: 'settings.keyboard.close' },
  { keys: ['Enter'], label: 'settings.keyboard.details' },
  { keys: ['Ctrl+K', '/'], label: 'settings.keyboard.search' },
];
