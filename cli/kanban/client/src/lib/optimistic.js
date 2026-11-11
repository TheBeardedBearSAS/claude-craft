// Optimistic updates addressed by story id (never by array index: a reload may reorder the list). Pure.

const replaceById = (stories, story) => stories.map((s) => (s.id === story.id ? story : s));

/**
 * @returns {{ stories: object[], before: object|undefined }} new list + snapshot to hand to restore()
 */
export function applyPatch(stories, id, patch) {
  const before = stories.find((s) => s.id === id);
  if (!before) return { stories, before: undefined };
  return { stories: replaceById(stories, { ...before, ...patch }), before };
}

/** Put the snapshot back (by id). No-op when the story disappeared or there is no snapshot. */
export function restore(stories, before) {
  if (!before || !stories.some((s) => s.id === before.id)) return stories;
  return replaceById(stories, before);
}

/** Swap in the server's version of a story (by id). */
export function replaceStory(stories, story) {
  return stories.some((s) => s.id === story.id) ? replaceById(stories, story) : stories;
}
