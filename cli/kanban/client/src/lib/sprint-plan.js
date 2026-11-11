// Sprint planning logic. Pure (no DOM, no Svelte) — unit-tested in tests/kanban/sprint-plan.test.js.

import { sumPoints } from './points.js';

const compareIds = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });

/**
 * Committed points against the capacity of a sprint.
 * @returns {{ state:'none'|'under'|'at'|'over', committed:number, capacity:number|null, remaining:number|null }}
 */
export function capacityState(committed, capacity) {
  const done = Number.isFinite(committed) ? committed : 0;
  if (!Number.isFinite(capacity) || capacity <= 0)
    return { state: 'none', committed: done, capacity: null, remaining: null };
  const remaining = capacity - done;
  const state = remaining < 0 ? 'over' : remaining === 0 ? 'at' : 'under';
  return { state, committed: done, capacity, remaining };
}

/** Points of the selected stories (ids that are not in `stories` count for nothing). */
export function selectionPoints(stories, selectedIds) {
  const selected = new Set(selectedIds);
  return sumPoints(stories ?? [], (s) => selected.has(s.id));
}

/** Sprints one can plan into: the active one first, then the planned ones; a closed sprint never. */
export function planTargets(sprints) {
  const list = sprints ?? [];
  const active = list.filter((s) => s.state === 'active');
  const planned = list.filter((s) => s.state === 'planned').sort((a, b) => compareIds(a.id, b.id));
  return [...active, ...planned];
}

/** Quick filter of the Backlog: stories outside any sprint, in the target sprint, or all of them. */
export function filterByScope(stories, scope, targetId) {
  if (scope === 'backlog') return stories.filter((s) => !s.sprint_id);
  if (scope === 'sprint') return stories.filter((s) => s.sprint_id === targetId);
  return stories;
}

/** A story can be (un)planned when the server is writable and the story is not archived / read-only. */
export function isPlannable(story, readonly) {
  return !readonly && story._writable !== false;
}

/** First capacity that is a usable number (>= 0), else null. */
export function firstCapacity(...candidates) {
  const found = candidates.find((c) => typeof c === 'number' && Number.isFinite(c) && c >= 0);
  return found ?? null;
}

/**
 * Run `move(id)` one after the other; stop at the first failure.
 * @returns {Promise<{ done:number, total:number, failedId:string|null, error:unknown }>}
 */
export async function runBatch(ids, move) {
  let done = 0;
  for (const id of ids) {
    try {
      await move(id);
      done += 1;
    } catch (error) {
      return { done, total: ids.length, failedId: id, error };
    }
  }
  return { done, total: ids.length, failedId: null, error: null };
}

/** Stories of a sprint split by what closing will do: done ones are archived, the others are carried over. */
export function closeSummary(stories, sprintId) {
  const mine = stories.filter((s) => s.sprint_id === sprintId);
  const done = mine.filter((s) => s.status === 'done');
  const unfinished = mine.filter((s) => s.status !== 'done');
  return {
    total: mine.length,
    done,
    unfinished,
    donePoints: sumPoints(done),
    unfinishedPoints: sumPoints(unfinished),
  };
}

const NAME_MAX = 120;
const CAPACITY_MAX = 999;

function capacityOf(raw) {
  const text = String(raw ?? '').trim();
  if (text === '') return { value: undefined };
  const n = Number(text);
  return Number.isInteger(n) && n >= 0 && n <= CAPACITY_MAX ? { value: n } : { error: 'sprint.error.capacity.range' };
}

function fieldErrors(draft, name, capacity) {
  const errors = {};
  if (!name) errors.name = 'sprint.error.name.required';
  else if (name.length > NAME_MAX) errors.name = 'sprint.error.name.tooLong';
  if (!draft.start_date) errors.start_date = 'sprint.error.startDate.required';
  if (!draft.end_date) errors.end_date = 'sprint.error.endDate.required';
  else if (draft.start_date && draft.end_date < draft.start_date) errors.end_date = 'sprint.create.dateOrder';
  if (capacity.error) errors.capacity = capacity.error;
  return errors;
}

/**
 * Validate the "New sprint" form like the server does.
 * @param {{ name:string, start_date:string, end_date:string, goal?:string, capacity?:string }} draft
 * @returns {{ errors: Record<string,string>, payload: object|null }} i18n keys per field; payload when valid
 */
export function validateSprintDraft(draft) {
  const name = String(draft.name ?? '').trim();
  const capacity = capacityOf(draft.capacity);
  const errors = fieldErrors(draft, name, capacity);
  if (Object.keys(errors).length > 0) return { errors, payload: null };
  const payload = { name, start_date: draft.start_date, end_date: draft.end_date };
  const goal = String(draft.goal ?? '').trim();
  if (goal) payload.goal = goal;
  if (capacity.value !== undefined) payload.capacity_points = capacity.value;
  return { errors, payload };
}

/** { status: '3' } draft fields from the limits the server knows (a missing limit is an empty field). */
export function wipDraftFrom(statuses, limits) {
  return Object.fromEntries(statuses.map((s) => [s, typeof limits?.[s] === 'number' ? String(limits[s]) : '']));
}

/**
 * Validate the WIP form: every field is empty (no limit) or a whole number from 1 to 99.
 * @returns {{ errors: Record<string,string>, limits: Record<string, number|null>|null }} PUT body when valid
 */
export function validateWipDraft(statuses, draft) {
  const errors = {};
  const limits = {};
  for (const status of statuses) {
    const text = String(draft[status] ?? '').trim();
    const n = Number(text);
    if (text === '') limits[status] = null;
    else if (/^\d{1,2}$/.test(text) && n >= 1) limits[status] = n;
    else errors[status] = 'settings.wip.error.range';
  }
  return { errors, limits: Object.keys(errors).length > 0 ? null : limits };
}
