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

/**
 * Writes of this tab still waiting for their answer, by story id. A move shows at once, before the server answers
 * with the new `_rev`: an edit opened meanwhile waits for settled(id), or it would start from the older version and
 * its save would be refused as a conflict with the user's own change. A failed write counts as settled.
 * pending(): some write is on its way (a reload answered meanwhile would undo the change the board already shows).
 */
export function createWriteTracker() {
  const pending = new Map();
  return {
    track(id, write) {
      const all = Promise.allSettled([pending.get(id), write]);
      pending.set(id, all);
      all.then(() => pending.get(id) === all && pending.delete(id));
      return write;
    },
    settled: (id) => pending.get(id) ?? Promise.resolve(),
    pending: () => pending.size > 0,
  };
}
