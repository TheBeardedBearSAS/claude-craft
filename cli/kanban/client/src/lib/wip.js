// Work-in-progress limits of the board columns. Pure.

/**
 * @param {number} count stories in the column
 * @param {number|null|undefined} limit configured limit (absent or not a positive number = none)
 * @returns {'none'|'ok'|'at'|'over'}
 */
export function wipState(count, limit) {
  if (!Number.isInteger(limit) || limit < 1) return 'none';
  if (count > limit) return 'over';
  return count === limit ? 'at' : 'ok';
}

/** Stories of a column as the board counts them: the active sprint only, or all when there is none. */
export function columnCount(stories, activeSprintId, status) {
  return stories.filter((s) => s.status === status && (!activeSprintId || s.sprint_id === activeSprintId)).length;
}
