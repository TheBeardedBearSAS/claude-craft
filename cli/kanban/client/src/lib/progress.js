// Sprint progress roll-up for the App topbar/sidebar bar. Pure (no DOM).
// Bug #6: the bar previously summed ALL stories regardless of sprint, inflating
// the metric and contradicting the Burndown screen. Scope it to the active sprint.

/**
 * @param {Array<{sprint_id?:string,status?:string,story_points?:number}>} stories
 * @param {string|null|undefined} sprintId  active sprint id
 * @returns {{ totalPoints:number, donePoints:number, pct:number }}
 */
export function computeSprintProgress(stories, sprintId) {
  const mine = sprintId ? (stories ?? []).filter((s) => s.sprint_id === sprintId) : [];
  const totalPoints = mine.reduce((n, s) => n + (s.story_points ?? 0), 0);
  const donePoints = mine.filter((s) => s.status === 'done').reduce((n, s) => n + (s.story_points ?? 0), 0);
  const pct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
  return { totalPoints, donePoints, pct };
}
