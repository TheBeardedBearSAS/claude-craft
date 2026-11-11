// Central store for the Kanban UI, backed by Svelte 5 runes.
// Normalized caches + SSE-driven invalidation.
//   store.revision  incremented once per successful reload batch: views that load their own data
//                   (Sprints, Deps, Docs, Burndown) observe it to refresh.
//   store.loading   true until the very first stories load settles (drives the skeleton, aria-busy).
//   store.toasts    [{ id, kind, message, key, params }] — `key`/`params` let the UI translate at display time.

import { classifyKanbanEvent, createRefreshQueue } from './events.js';
import { request, storyUrl, errorKey } from './api.js';
import { applyPatch, restore, replaceStory } from './optimistic.js';
import { createToasts } from './toasts.js';
import { loadHealth } from './health.svelte.js';

export const store = $state({
  stories: [],
  epics: [],
  sprint: null,
  burndown: null,
  connected: false,
  loading: true,
  error: null,
  toasts: [],
  revision: 0,
});

const toasts = createToasts({ onChange: (list) => (store.toasts = list) });

/** @param {{kind?:string, message?:string, key?:string, params?:object, ttl?:number}} t errors never expire */
export function toast(t) {
  return toasts.push(t);
}
export const dismissToast = toasts.dismiss;
export const pauseToast = toasts.pause;
export const resumeToast = toasts.resume;

export async function loadStories() {
  try {
    const data = await request('/api/stories');
    store.stories = data.stories;
    store.epics = data.epics;
    store.error = null;
    return true;
  } catch (err) {
    store.error = err.message;
    toast({
      kind: 'error',
      message: `Failed to load stories: ${err.message}`,
      key: 'toast.load_failed',
      params: { reason: err.message },
    });
    return false;
  } finally {
    store.loading = false;
  }
}

export async function loadSprint() {
  try {
    const data = await request('/api/sprints/current');
    store.sprint = data.sprint;
    store.burndown = data.burndown;
    return true;
  } catch (err) {
    if (err.status !== 404) {
      toast({
        kind: 'error',
        message: `Sprint load failed: ${err.message}`,
        key: 'toast.sprint_failed',
        params: { reason: err.message },
      });
    }
    store.sprint = null;
    store.burndown = null;
    return false;
  }
}

function failureToast(err) {
  const missing = err.body?.missing?.length ? ` (${err.body.missing.join(', ')})` : '';
  toast({
    kind: 'error',
    message: `Transition failed: ${err.body?.reason ?? err.message}${missing}`,
    key: 'toast.transition_failed',
    params: {
      reason: err.body?.reason ?? err.message,
      missing: (err.body?.missing ?? []).join(', '),
      error: errorKey(err),
    },
  });
}

export async function patchStatus(id, body) {
  const { stories, before } = applyPatch(store.stories, id, { status: body.status });
  if (!before) throw new Error('story not found');
  store.stories = stories;
  try {
    const data = await request(storyUrl(id, '/status'), { method: 'PATCH', body: JSON.stringify(body) });
    store.stories = replaceStory(store.stories, data.story);
    toast({
      kind: 'success',
      message: `${id} -> ${data.story.status}`,
      key: 'toast.moved',
      params: { id, status: data.story.status },
    });
    return data.story;
  } catch (err) {
    store.stories = restore(store.stories, before);
    failureToast(err);
    throw err;
  }
}

// ---- SSE ---------------------------------------------------------------------

let es = null;
let dropped = false;

async function runRefresh({ reloadStories, reloadSprint, reloadHealth }) {
  const jobs = [];
  if (reloadStories) jobs.push(loadStories());
  if (reloadSprint) jobs.push(loadSprint());
  if (reloadHealth) jobs.push(loadHealth());
  const results = await Promise.all(jobs);
  if (results.some(Boolean)) store.revision += 1;
}

const refreshQueue = createRefreshQueue({ run: runRefresh, delayMs: 150 });

function onFileChanged(e) {
  let payload;
  try {
    ({ payload } = JSON.parse(e.data));
  } catch {
    payload = undefined;
  }
  refreshQueue.request(classifyKanbanEvent({ event: 'file:changed', payload }));
}

export function connectEvents() {
  if (es) return;
  es = new EventSource('/api/events');
  es.addEventListener('open', () => {
    store.connected = true;
    if (dropped) {
      // Events were missed while disconnected: resynchronize everything.
      dropped = false;
      refreshQueue.request({ reloadStories: true, reloadSprint: true, reloadHealth: true });
    }
  });
  es.addEventListener('error', () => {
    store.connected = false;
    dropped = true;
  });
  for (const event of ['story:updated', 'sprint:updated', 'settings:updated']) {
    es.addEventListener(event, () => refreshQueue.request(classifyKanbanEvent({ event })));
  }
  es.addEventListener('file:changed', onFileChanged);
}

export function disconnectEvents() {
  if (es) {
    es.close();
    es = null;
    store.connected = false;
    dropped = false;
    refreshQueue.cancel();
  }
}
