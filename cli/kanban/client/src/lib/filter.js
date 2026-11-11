// Board/Backlog filtering and sorting. Pure.

import { STATUSES } from '../../../shared/transitions.js';

const PRIORITY_ORDER = ['must', 'should', 'could', 'wont'];

/** Lowercase + strip accents so "Équipe" matches "equipe". */
export function fold(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function matchText(story, q) {
  const needle = fold(q).trim();
  if (!needle) return true;
  return fold([story.id, story.title, story.persona, story.assigned_to].join(' ')).includes(needle);
}

/** @param {object} filters as returned by filtersFromQuery */
export function matchStory(story, filters = {}) {
  const { q, prio = [], who, epic } = filters;
  if (!matchText(story, q)) return false;
  if (prio.length && !prio.includes(story.priority)) return false;
  if (who && fold(story.assigned_to) !== fold(who)) return false;
  if (epic && story.epic_id !== epic) return false;
  return true;
}

const rank = (list, value) => {
  const i = list.indexOf(value);
  return i === -1 ? list.length : i;
};

const KEYS = {
  title: (s) => fold(s.title),
  priority: (s) => rank(PRIORITY_ORDER, s.priority),
  status: (s) => rank(STATUSES, s.status),
  points: (s) => Number(s.story_points) || 0,
};

const byId = (a, b) => String(a.id).localeCompare(String(b.id), 'en', { numeric: true });

/** Stable sort on a copy; id breaks ties (always ascending). Unknown key keeps the input order. */
export function sortStories(list, key, dir = 'asc') {
  const out = [...list];
  const sign = dir === 'desc' ? -1 : 1;
  if (key === 'id') return out.sort((a, b) => sign * byId(a, b));
  const get = KEYS[key];
  if (!get) return out;
  return out.sort((a, b) => {
    const [x, y] = [get(a), get(b)];
    const c = x < y ? -1 : x > y ? 1 : 0;
    return c * sign || byId(a, b);
  });
}

const distinct = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

/** Distinct assignees and epics, to feed the filter controls. */
export function facets(stories) {
  return {
    assignees: distinct(stories.map((s) => s.assigned_to)),
    epics: distinct(stories.map((s) => s.epic_id)),
  };
}
