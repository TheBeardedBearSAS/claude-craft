// SSE event classification for the reactive store. Pure (no DOM).
// Bug #7: connectEvents() reloaded stories but never the sprint/burndown, so the
// chart and topbar progress went stale after a card moved. This decides what to
// refresh for a given event.

const STORY_RELEVANT_CATEGORIES = new Set(['story', 'task', 'epic']);

/**
 * @param {{event?:string, payload?:{category?:string}}} msg
 * @returns {{ reloadStories:boolean, reloadSprint:boolean }}
 */
export function classifyKanbanEvent(msg) {
  const event = msg?.event;
  if (event === 'story:updated') {
    return { reloadStories: true, reloadSprint: true };
  }
  if (event === 'file:changed' && STORY_RELEVANT_CATEGORIES.has(msg?.payload?.category)) {
    return { reloadStories: true, reloadSprint: true };
  }
  return { reloadStories: false, reloadSprint: false };
}
