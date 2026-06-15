// Central store for the Kanban UI, backed by Svelte 5 runes.
// Normalized caches + SSE-driven invalidation.

import { classifyKanbanEvent } from './events.js';

export const store = $state({
  stories: [],
  epics: [],
  sprint: null,
  burndown: null,
  connected: false,
  loading: false,
  error: null,
  toasts: [],
});

let es = null;
let toastSeq = 0;

export function toast({ kind = 'info', message, ttl = 3500 }) {
  const id = ++toastSeq;
  store.toasts.push({ id, kind, message });
  setTimeout(() => {
    const idx = store.toasts.findIndex((t) => t.id === id);
    if (idx >= 0) store.toasts.splice(idx, 1);
  }, ttl);
}

export function dismissToast(id) {
  const idx = store.toasts.findIndex((t) => t.id === id);
  if (idx >= 0) store.toasts.splice(idx, 1);
}

async function request(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch {
      body = { error: res.statusText };
    }
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

export async function loadStories() {
  store.loading = true;
  try {
    const data = await request('/api/stories');
    store.stories = data.stories;
    store.epics = data.epics;
    store.error = null;
  } catch (err) {
    store.error = err.message;
    toast({ kind: 'error', message: `Failed to load stories: ${err.message}` });
  } finally {
    store.loading = false;
  }
}

export async function loadSprint() {
  try {
    const data = await request('/api/sprints/current');
    store.sprint = data.sprint;
    store.burndown = data.burndown;
  } catch (err) {
    if (err.status !== 404) toast({ kind: 'error', message: `Sprint load failed: ${err.message}` });
    store.sprint = null;
    store.burndown = null;
  }
}

export async function patchStatus(id, body) {
  const prev = store.stories.find((s) => s.id === id);
  if (!prev) throw new Error('story not found');
  // Optimistic update on structural transitions (skip on blocked without reason)
  const idx = store.stories.findIndex((s) => s.id === id);
  const before = { ...prev };
  store.stories[idx] = { ...prev, status: body.status };
  try {
    const data = await request(`/api/stories/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    store.stories[idx] = data.story;
    toast({ kind: 'success', message: `${id} -> ${data.story.status}` });
    return data.story;
  } catch (err) {
    store.stories[idx] = before;
    const details = err.body?.missing?.length ? ` (${err.body.missing.join(', ')})` : '';
    toast({ kind: 'error', message: `Transition failed: ${err.body?.reason ?? err.message}${details}`, ttl: 5000 });
    throw err;
  }
}

export function connectEvents() {
  if (es) return;
  es = new EventSource('/api/events');
  es.addEventListener('open', () => {
    store.connected = true;
  });
  es.addEventListener('error', () => {
    store.connected = false;
  });
  // Both story moves and relevant file changes must refresh the board AND the
  // sprint/burndown (bug #7: the chart + topbar progress went stale otherwise).
  const refresh = async ({ reloadStories, reloadSprint }) => {
    const jobs = [];
    if (reloadStories) jobs.push(loadStories());
    if (reloadSprint) jobs.push(loadSprint());
    if (jobs.length) await Promise.all(jobs);
  };
  es.addEventListener('story:updated', () => refresh(classifyKanbanEvent({ event: 'story:updated' })));
  es.addEventListener('file:changed', (e) => {
    let payload;
    try {
      ({ payload } = JSON.parse(e.data));
    } catch {
      payload = undefined;
    }
    return refresh(classifyKanbanEvent({ event: 'file:changed', payload }));
  });
}

export function disconnectEvents() {
  if (es) {
    es.close();
    es = null;
    store.connected = false;
  }
}
