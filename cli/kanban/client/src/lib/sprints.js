// Pure sprint-summary logic (no DOM, no Svelte) — unit-tested in tests/kanban/sprints.test.js.

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
    done_points: mine
      .filter((s) => s.status === 'done')
      .reduce((n, s) => n + (s.story_points ?? 0), 0),
    has_goal: !!sprintEntry.goalPath,
    has_review: files.some((f) => f.category === 'sprint-review'),
    has_retro: files.some((f) => f.category === 'sprint-retro'),
  };
}

/**
 * Sort sprint summaries by id descending (most recent sprint first).
 * @param {Array<{ id:string }>} summaries
 * @returns {Array<{ id:string }>}
 */
export function sortSprints(summaries) {
  return [...summaries].sort((a, b) => b.id.localeCompare(a.id));
}
