// Central store for the Kanban UI, backed by Svelte 5 runes.
// Normalized caches + SSE-driven invalidation.
//   store.revision  incremented once per successful reload batch: views that load their own data
//                   (Sprints, Deps, Docs, Burndown) observe it to refresh.
//   store.loading   true until the very first stories load settles (drives the skeleton, aria-busy).
//   store.sprintLoading  true until the very first current-sprint load settles (Burndown: no "no data" while loading).
//   store.sprints   [{ id, name, state: 'active'|'planned'|'closed', story_count, total_points, … }] from GET /api/sprints,
//                   reloaded with the current sprint (every story / sprint / settings event and every resync).
//   store.toasts    [{ id, kind, message, key, params }] — `key`/`params` let the UI translate at display time.

import { classifyKanbanEvent, createRefreshQueue } from './events.js';
import { request, storyUrl, errorKey } from './api.js';
import { applyPatch, restore, replaceStory, createWriteTracker } from './optimistic.js';
import { createToasts } from './toasts.js';
import { loadHealth } from './health.svelte.js';

export const store = $state({
  stories: [],
  epics: [],
  sprint: null,
  burndown: null,
  connected: false,
  loading: true,
  sprintLoading: true,
  sprints: [],
  sprintsLoaded: false,
  sprintsError: null,
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

// A reload that started before a write of this tab answered would bring back the older stories (and their older
// `_rev`: the next edit would end in a false 409 conflict), and one answered while a write is still on its way would
// undo the change the board already shows. Writes are counted and tracked; such a reload is dropped and asked for
// again.
let writes = 0;
const inFlight = createWriteTracker();
/** Hand every write of a story to this (it returns the same promise); see createWriteTracker in optimistic.js. */
export const trackWrite = inFlight.track;
/** Resolves once the writes of that story already sent have been answered. */
export const writesSettled = inFlight.settled;

/** Call when a write answer has been put into `store.stories`. */
export function noteWrite() {
  writes += 1;
}

export async function loadStories() {
  const seen = writes;
  try {
    const data = await request('/api/stories');
    if (seen !== writes || inFlight.pending()) {
      refreshQueue.request({ reloadStories: true });
      return false;
    }
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
      params: { reasonKey: errorKey(err) },
    });
    return false;
  } finally {
    store.loading = false;
  }
}

/** The sprint list (every state). Never throws: a failure is kept in `store.sprintsError` (an i18n error key). */
export async function loadSprintList() {
  try {
    const data = await request('/api/sprints');
    store.sprints = data.sprints ?? [];
    store.sprintsError = null;
  } catch (err) {
    store.sprintsError = errorKey(err);
  } finally {
    store.sprintsLoaded = true;
  }
}

export async function loadSprint() {
  const list = loadSprintList();
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
        params: { reasonKey: errorKey(err) },
      });
    }
    store.sprint = null;
    store.burndown = null;
    return false;
  } finally {
    store.sprintLoading = false;
    await list;
  }
}

// The server explains a refused gate in English (`missing`); the gate's name gives the translated explanation.
const GATES = new Set(['invest_gate', 'tasks_complete_gate', 'dod_gate']);

function failureToast(err) {
  const missing = err.body?.missing?.length ? ` (${err.body.missing.join(', ')})` : '';
  const gate = err.body?.gate;
  toast({
    kind: 'error',
    message: `Transition failed: ${err.body?.reason ?? err.message}${missing}`,
    key: 'toast.transition_failed',
    params: { reasonKey: GATES.has(gate) ? `toast.gate.${gate}` : errorKey(err) },
  });
}

// Status writes of one story go to the server one at a time, in the order the user made them. The board shows each
// move at once; sent together, two moves could be handled out of order and the second refused from a status the
// server no longer had ("not allowed"), or accepted and then overwritten.
const statusQueue = new Map(); // story id -> the last status write queued for it
// Latest status write queued for each story: an older answer is not applied over a newer move already shown, or the
// card would go back a column and be re-created (the focus the user had put on it is lost).
const lastStatusWrite = new Map();

/** @returns {Promise<{ story: object, warnings: string[] }>} the moved story and the server's warnings */
export function patchStatus(id, body) {
  const { stories, before } = applyPatch(store.stories, id, { status: body.status });
  if (!before) return Promise.reject(new Error('story not found'));
  store.stories = stories;
  const write = (lastStatusWrite.get(id) ?? 0) + 1;
  lastStatusWrite.set(id, write);

  const previous = statusQueue.get(id) ?? Promise.resolve();
  // A move queued behind one that failed is dropped: the failure has put the card back, and the new move was
  // chosen from a status the story never reached. The user has already been told about the first failure.
  const run = previous.then(() => sendStatus(id, body, before, write));
  statusQueue.set(id, run);
  const forget = () => statusQueue.get(id) === run && statusQueue.delete(id);
  run.then(forget, forget);
  return trackWrite(id, run);
}

async function sendStatus(id, body, before, write) {
  try {
    const data = await request(storyUrl(id, '/status'), { method: 'PATCH', body: JSON.stringify(body) });
    if (lastStatusWrite.get(id) === write) store.stories = replaceStory(store.stories, data.story);
    noteWrite();
    toast({
      kind: 'success',
      message: `${id} -> ${data.story.status}`,
      key: 'toast.moved',
      params: { id, status: data.story.status },
    });
    return { story: data.story, warnings: data.warnings ?? [] };
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
