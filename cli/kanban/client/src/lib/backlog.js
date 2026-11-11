// Epic-grouping logic for the Backlog view. Pure (no Svelte/DOM) so it is unit-testable.

import { matchStory, sortStories } from './filter.js';
import { sumPoints } from './points.js';

/**
 * Group stories under their epic.
 *
 * Stories whose `epic_id` matches a known epic land in that epic's group. Stories whose
 * `epic_id` is set but unknown (e.g. BMAD v6 `.bmad/sprint-status.yaml` stories with
 * `epic_id="E1"` and no markdown epic file) get a *synthesized* minimal group so they
 * still render — otherwise the Backlog screen goes blank. Stories without an `epic_id`
 * are orphans.
 *
 * @param {Array<object>} stories
 * @param {Array<{id:string,title?:string,business_value?:string,status?:string}>} epics
 * @param {{ keepOrder?: boolean }} [opts] keepOrder: keep the input order inside each group (already sorted by the caller)
 * @returns {{groups: Array<{epic:object, stories:object[]}>, orphans: object[]}}
 */
export function groupStoriesByEpic(stories, epics, { keepOrder = false } = {}) {
  const groups = new Map();
  for (const epic of epics) {
    groups.set(epic.id, { epic, stories: [] });
  }

  const orphans = [];
  for (const story of stories) {
    const epicId = story.epic_id;
    if (!epicId) {
      orphans.push(story);
      continue;
    }
    if (!groups.has(epicId)) {
      // Unknown epic_id: synthesize a group so the story stays visible.
      groups.set(epicId, { epic: { id: epicId, title: epicId, business_value: '', status: '' }, stories: [] });
    }
    groups.get(epicId).stories.push(story);
  }

  const sorted = [...groups.values()].sort((a, b) => a.epic.id.localeCompare(b.epic.id));
  if (!keepOrder) {
    for (const group of sorted) group.stories.sort((a, b) => a.id.localeCompare(b.id));
    orphans.sort((a, b) => a.id.localeCompare(b.id));
  }

  return { groups: sorted, orphans };
}

/** Done count, total, percent and points of one epic's stories. */
export function epicProgress(stories) {
  const done = stories.filter((s) => s.status === 'done').length;
  const total = stories.length;
  return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0, points: sumPoints(stories) };
}

const isFiltering = (f) => Boolean(f.q || f.who || f.epic || f.prio?.length);

/**
 * Filter, sort and group the stories for the Backlog view.
 * Epics left without a match are hidden while a filter is active; plain sorting does not hide anything.
 * @param {object[]} stories
 * @param {object[]} epics
 * @param {{ q?:string, prio?:string[], who?:string, epic?:string, sort?:string, dir?:string }} filters from filtersFromQuery
 * @returns {{ groups: Array<{epic:object, stories:object[]}>, orphans: object[], filtered: boolean, count: number }}
 */
export function buildBacklog(stories, epics, filters = {}) {
  const filtered = isFiltering(filters);
  const kept = sortStories(
    stories.filter((s) => matchStory(s, filters)),
    filters.sort,
    filters.dir
  );
  const grouped = groupStoriesByEpic(kept, epics, { keepOrder: Boolean(filters.sort) });
  const groups = filtered ? grouped.groups.filter((g) => g.stories.length > 0) : grouped.groups;
  const orphans = grouped.orphans;
  return { groups, orphans, filtered, count: kept.length };
}
