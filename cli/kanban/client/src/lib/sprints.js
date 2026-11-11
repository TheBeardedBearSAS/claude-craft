// Pure sprint-summary logic (no DOM, no Svelte) — unit-tested in tests/kanban/sprints.test.js.

import { sumPoints } from './points.js';

/**
 * Roll up a sprint aggregation entry against the full story list.
 * @param {{ id:string, files?:object[], goalPath?:string|null }} sprintEntry
 *   — shaped like a repository.sprints Map value
 * @param {Array<{ sprint_id?:string, status?:string, story_points?:number }>} stories
 * @returns {{ id:string, story_count:number, total_points:number, done_points:number,
 *            has_goal:boolean, has_review:boolean, has_retro:boolean }}
 */
export function summarizeSprint(sprintEntry, stories) {
  const files = sprintEntry.files ?? [];
  const mine = stories.filter((s) => s.sprint_id === sprintEntry.id);
  return {
    id: sprintEntry.id,
    story_count: mine.length,
    total_points: mine.reduce((n, s) => n + (s.story_points ?? 0), 0),
    done_points: mine.filter((s) => s.status === 'done').reduce((n, s) => n + (s.story_points ?? 0), 0),
    has_goal: !!sprintEntry.goalPath,
    has_review: files.some((f) => f.category === 'sprint-review'),
    has_retro: files.some((f) => f.category === 'sprint-retro'),
  };
}

/**
 * Sort sprint summaries by id descending (most recent sprint first).
 * Numeric-aware so unpadded ids order correctly (sprint-10 before sprint-9);
 * a plain localeCompare sorts lexically and buries sprint-10 under sprint-2.
 * @param {Array<{ id:string }>} summaries
 * @returns {Array<{ id:string }>}
 */
export function sortSprints(summaries) {
  return [...summaries].sort((a, b) => compareSprintIds(b.id, a.id));
}

const compareSprintIds = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

const STATES = ['planned', 'active', 'closed'];

/**
 * State of a sprint. Uses the explicit `state` of the API when present; otherwise derives it from the
 * active sprint id (never from "some points are done", K-20): active if it is the active sprint,
 * closed if everything is delivered or if it comes before the active one, planned otherwise.
 * @param {{ id:string, state?:string, total_points?:number, done_points?:number }} sprint
 * @param {string|null|undefined} activeId id of the active sprint (store.sprint.sprint_id)
 * @returns {'planned'|'active'|'closed'}
 */
export function sprintState(sprint, activeId) {
  if (STATES.includes(sprint?.state)) return sprint.state;
  if (activeId && sprint.id === activeId) return 'active';
  if (sprint.total_points > 0 && sprint.done_points >= sprint.total_points) return 'closed';
  if (activeId && compareSprintIds(sprint.id, activeId) < 0) return 'closed';
  return 'planned';
}

/** Points, done points, story count and percent of a sprint's stories. */
export function sprintTotals(stories) {
  const list = stories ?? [];
  const total = sumPoints(list);
  const done = sumPoints(list, (s) => s.status === 'done');
  return { total, done, count: list.length, pct: total ? Math.round((done / total) * 100) : 0 };
}

/** { 'US-1': [task, …] } from a flat task list. */
export function groupTasksByStory(tasks) {
  const map = {};
  for (const task of tasks ?? []) (map[task.us_id] ??= []).push(task);
  return map;
}
