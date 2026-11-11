// Planning and sprint-lifecycle actions (K-22): every function calls the write API and updates the store without
// waiting for the SSE event. Pure rules live in sprint-plan.js.
//
//   planning                       { busy } — true while a call is in flight or waiting for the previous one
//   moveToSprint(id, sprintId)     PATCH /api/stories/:id { sprint_id } (null = backlog) with If-Match; optimistic,
//                                  restored on failure; returns the story; throws ApiError
//   planStory(id, sprint)          moveToSprint + toast; `sprint` = { id, name } or null; resolves true/false
//   planStories(ids, sprint)       one after the other, stops at the first error; toast says how many went through;
//                                  resolves { done, total, failedId, error }
//   createSprint(payload, key)     POST /api/sprints (Idempotency-Key: key) → sprint; throws ApiError
//   startSprint(id)                POST /api/sprints/:id/start → sprint; 409 sprint_already_active has body.active
//   closeSprint(id, carryOver)     POST /api/sprints/:id/close → { sprint, archived, carried_over, version }
//   saveWipLimits(limits)          PUT /api/settings/wip → wip_limits (also stored in `health.wipLimits`)
//   refreshPlanning()              reloads stories, current sprint, sprint list and health

import { request, storyUrl, errorKey } from './api.js';
import { store, toast, loadStories, loadSprint, noteWrite, trackWrite } from './store.svelte.js';
import { health, loadHealth } from './health.svelte.js';
import { applyPatch, restore, replaceStory } from './optimistic.js';
import { runBatch } from './sprint-plan.js';

export const planning = $state({ busy: false });

// Planning calls run one after the other: a click made while one is on its way (the board already shows it) waits
// for its answer, and the next If-Match starts from the version that answer brings back, instead of being dropped.
let queue = Promise.resolve();
let running = 0;

function busy(task) {
  running += 1;
  planning.busy = true;
  const run = queue.then(task).finally(() => {
    running -= 1;
    planning.busy = running > 0;
  });
  queue = run.catch(() => {});
  return run;
}

const json = (method, body, headers) => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
  ...(headers ? { headers } : {}),
});

/** Reload everything a sprint or planning change touches, and tell the views that observe `store.revision`. */
export async function refreshPlanning() {
  await Promise.all([loadStories(), loadSprint(), loadHealth()]);
  store.revision += 1;
}

export function moveToSprint(id, sprintId) {
  return trackWrite(id, sendSprint(id, sprintId));
}

async function sendSprint(id, sprintId) {
  const current = store.stories.find((s) => s.id === id);
  if (!current) throw new Error(`story ${id} not found`);
  const { stories, before } = applyPatch(store.stories, id, { sprint_id: sprintId });
  store.stories = stories;
  try {
    const headers = current._rev ? { 'If-Match': current._rev } : {};
    const data = await request(storyUrl(id), { ...json('PATCH', { sprint_id: sprintId }), headers });
    store.stories = replaceStory(store.stories, data.story);
    noteWrite();
    return data.story;
  } catch (err) {
    store.stories = restore(store.stories, before);
    throw err;
  }
}

function failed(key, params, err) {
  toast({ kind: 'error', message: err?.message ?? '', key, params: { ...params, reasonKey: errorKey(err) } });
  // A conflict means our copy is stale: fetch the current one.
  if (err.code === 'conflict') loadStories();
}

export function planStory(id, sprint) {
  return busy(async () => {
    try {
      await moveToSprint(id, sprint?.id ?? null);
    } catch (err) {
      failed('toast.planFailed', { id }, err);
      return false;
    }
    const message = sprint ? `${id} -> ${sprint.name}` : id;
    if (sprint) toast({ kind: 'success', message, key: 'toast.planned', params: { id, sprint: sprint.name } });
    else toast({ kind: 'success', message, key: 'toast.unplanned', params: { id } });
    return true;
  });
}

function reportBatch(result, sprint) {
  const { done, total, failedId, error } = result;
  if (error) return failed('toast.batchPartial', { done, total, id: failedId }, error);
  const key = sprint ? 'toast.plannedMany' : 'toast.unplannedMany';
  const message = `${done} stories`; // also tells two batches apart (toasts with the same key and text merge)
  toast({ kind: 'success', message, key, count: done, params: sprint ? { sprint: sprint.name } : {} });
}

export function planStories(ids, sprint) {
  return busy(async () => {
    const result = await runBatch(ids, (id) => moveToSprint(id, sprint?.id ?? null));
    reportBatch(result, sprint);
    return result;
  });
}

/** @param {string} [key] one `idempotencyKey()` per opening of the form: a repeated POST gets the first answer */
export function createSprint(payload, key) {
  return busy(async () => {
    const { sprint } = await request(
      '/api/sprints',
      json('POST', payload, key ? { 'Idempotency-Key': key } : undefined)
    );
    toast({ kind: 'success', message: sprint.name, key: 'toast.sprintCreated', params: { sprint: sprint.name } });
    await refreshPlanning();
    return sprint;
  });
}

export function startSprint(id) {
  return busy(async () => {
    const { sprint } = await request(`/api/sprints/${encodeURIComponent(id)}/start`, json('POST'));
    toast({ kind: 'success', message: sprint.name, key: 'toast.sprintStarted', params: { sprint: sprint.name } });
    await refreshPlanning();
    return sprint;
  });
}

export function closeSprint(id, carryOver = 'backlog') {
  return busy(async () => {
    const answer = await request(
      `/api/sprints/${encodeURIComponent(id)}/close`,
      json('POST', { carry_over: carryOver })
    );
    const name = answer.sprint.name || id;
    toast({ kind: 'success', message: name, key: 'toast.sprintClosed', params: { sprint: name } });
    await refreshPlanning();
    return answer;
  });
}

export function saveWipLimits(limits) {
  return busy(async () => {
    const data = await request('/api/settings/wip', json('PUT', limits));
    health.wipLimits = data.wip_limits ?? {};
    return health.wipLimits;
  });
}
