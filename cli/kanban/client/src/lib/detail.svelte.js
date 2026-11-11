// Shared story-detail modal state (Svelte 5 runes). Both the Kanban board and the
// Backlog open the SAME detail dialog through openDetail() — bug #3: backlog rows
// were not clickable and had no way to reach a story's details. The <StoryDetail>
// component (mounted once in App) renders whatever `detail.card` points to.

import { request, storyUrl, latestOnly, isAbort, errorKey } from './api.js';
import { renderMarkdown } from './markdown.js';
import { opener } from './opener.js';

export const detail = $state({
  card: null,
  tasks: [],
  body: '',
  loading: false,
  // { code, status, key, message } when the extras could not be loaded (K-18); null otherwise.
  error: null,
});

// Element to refocus when the modal closes (WCAG 2.4.3 focus return).
let triggerEl = null;
const latest = latestOnly();

function reset() {
  detail.tasks = [];
  detail.body = '';
  detail.error = null;
}

export async function openDetail(card) {
  if (!card) return;
  triggerEl = typeof document !== 'undefined' ? opener() : null;
  detail.card = card;
  reset();
  await loadDetail(card.id);
}

// Reset state only. Focus return is handled by <StoryDetail> AFTER the <dialog>
// is unmounted (tick), via consumeTrigger() — focusing while the modal dialog is
// still in the DOM is unreliable (focus falls back to <body> on some AT/Safari).
export function closeDetail() {
  latest(); // invalidate any in-flight load
  detail.card = null;
  detail.loading = false;
  reset();
}

/** Hand the trigger element to the caller and forget it (single-use). */
export function consumeTrigger() {
  const el = triggerEl;
  triggerEl = null;
  return el;
}

/** Load tasks + markdown body for a story; a newer call (or closeDetail) invalidates this one. */
export async function loadDetail(id) {
  const ticket = latest();
  detail.loading = true;
  try {
    const data = await request(storyUrl(id), { signal: ticket.signal });
    if (!ticket.current) return;
    detail.tasks = data.tasks ?? [];
    detail.error = null;
    const html = data.body ? await renderMarkdown(data.body) : '';
    if (ticket.current) detail.body = html;
  } catch (err) {
    if (isAbort(err) || !ticket.current) return;
    detail.error = { code: err.code ?? 'unknown', status: err.status ?? 0, key: errorKey(err), message: err.message };
  } finally {
    if (ticket.current) detail.loading = false;
  }
}
