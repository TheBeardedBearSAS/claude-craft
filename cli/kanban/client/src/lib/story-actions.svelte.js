// Story mutations (create, edit, body, task status, delete) and the "new story" dialog trigger.
//
// Open the creation dialog from any view (it is mounted once, with the story detail, in App):
//   import { openCreate } from '../lib/story-actions.svelte.js';
//   <button type="button" data-new-story onclick={() => openCreate({ sprint_id: 'sprint-9', epic_id: 'E4' })}>
// `defaults` pre-fills the form (any StoryForm draft field). Mark the button `data-new-story`: it is where
// the focus goes when a story is deleted and its own trigger disappears. Hide the button when `health.readonly`.
//
// Every mutation resolves to { ok: true, story?, warnings? } or { ok: false, error: ApiError } and never throws
// (except an abort). On success the store is updated at once (the SSE reload follows) and a toast is shown;
// failures are left to the caller, which knows where to display them.

import { ApiError, request, storyUrl } from './api.js';
import { replaceStory } from './optimistic.js';
import { store, toast, patchStatus, noteWrite, trackWrite } from './store.svelte.js';
import { health } from './health.svelte.js';
import { toCreatePayload } from './story-form.js';
import { columnCount } from './wip.js';
import { t } from './i18n/index.svelte.js';

export const createDialog = $state({ open: false, defaults: {} });

export function openCreate(defaults = {}) {
  createDialog.defaults = defaults;
  createDialog.open = true;
}

export function closeCreate() {
  createDialog.open = false;
}

/** "Discard the unsaved changes?" on a ConfirmDialog; resolves true to discard. Used by every form of the app. */
export function confirmDiscard(dialog) {
  return dialog.confirm(t('form.unsaved'), {
    confirmLabel: t('form.discard'),
    cancelLabel: t('form.keepEditing'),
    danger: true,
  });
}

// ---- blocking reason ----------------------------------------------------------------------------------
// One PromptDialog serves the whole app (ids must stay unique): StoryDetail mounts it and registers it here.

let prompter = null;

export function registerPrompter(dialog) {
  prompter = dialog;
}

/** Asks why a story is blocked. @returns {Promise<string|null>} the trimmed reason, null when cancelled */
export function askBlockedReason(id) {
  return prompter.prompt(t('board.blockedPrompt', { id }), { required: t('board.blockedRequired') });
}

// ---- helpers -----------------------------------------------------------------------------------------

const asApiError = (err) =>
  err instanceof ApiError ? err : new ApiError({ status: 0, code: 'unknown', body: null, message: err?.message });

async function attempt(job) {
  try {
    return { ok: true, ...(await job()) };
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    return { ok: false, error: asApiError(err) };
  }
}

const upsert = (story) => {
  const known = store.stories.some((s) => s.id === story.id);
  store.stories = known ? replaceStory(store.stories, story) : [...store.stories, story];
  noteWrite();
};

const json = (method, body, headers) => ({ method, body: JSON.stringify(body), ...(headers ? { headers } : {}) });

const WARNING_TOASTS = {
  metadata_sync_failed: 'toast.metadata_sync_failed',
  trash_failed: 'toast.trash_failed',
};

function wipParams(story) {
  const limit = health.wipLimits?.[story.status];
  return {
    status: story.status,
    limit,
    count: columnCount(store.stories, store.sprint?.sprint_id ?? null, story.status),
  };
}

/** Server warnings -> information toasts. `wip_exceeded` needs the moved story for its column. */
export function notifyWarnings(warnings = [], story = null) {
  for (const code of warnings) {
    if (code === 'wip_exceeded' && story) toast({ kind: 'info', key: 'toast.wipExceeded', params: wipParams(story) });
    else if (WARNING_TOASTS[code]) toast({ kind: 'info', key: WARNING_TOASTS[code], params: {} });
  }
}

/**
 * Move a story to another column (the logic of the board's Move menu): asks for a reason when blocking,
 * goes through the store's optimistic patchStatus, then reports the server's warnings (exceeded WIP limit).
 * @param {(id: string) => Promise<string|null>} [askReason] resolves the blocking reason, null when cancelled
 * @returns {Promise<{ ok: boolean, cancelled?: boolean, story?: object, error?: Error }>}
 */
export async function moveStory(story, target, askReason = askBlockedReason) {
  const body = { status: target };
  if (target === 'blocked') {
    const reason = await askReason(story.id);
    if (!reason) return { ok: false, cancelled: true };
    body.blocked_reason = reason;
  }
  try {
    const { story: moved, warnings } = await patchStatus(story.id, body);
    notifyWarnings(warnings, moved);
    return { ok: true, story: moved };
  } catch (error) {
    return { ok: false, error }; // the store already showed the failure toast
  }
}

// ---- mutations ---------------------------------------------------------------------------------------

/** @param {object} draft StoryForm draft */
export function createStory(draft) {
  return attempt(async () => {
    const data = await request('/api/stories', json('POST', toCreatePayload(draft)));
    upsert(data.story);
    toast({ kind: 'success', key: 'toast.created', params: { id: data.story.id } });
    notifyWarnings(data.warnings, data.story);
    return { story: data.story };
  });
}

/** @param {string|undefined} rev the story's `_rev` when it was read: sent as If-Match (409 `conflict` if stale) */
export function updateStory(id, patch, rev) {
  return trackWrite(
    id,
    attempt(async () => {
      const headers = rev ? { 'If-Match': rev } : undefined;
      const data = await request(storyUrl(id), json('PATCH', patch, headers));
      upsert(data.story);
      toast({ kind: 'success', key: 'toast.saved', params: { id } });
      notifyWarnings(data.warnings, data.story);
      return { story: data.story };
    })
  );
}

/** @param {number} mtime the story's `_mtime` when its body was read */
export function saveBody(id, markdown, mtime) {
  return trackWrite(
    id,
    attempt(async () => {
      const data = await request(storyUrl(id, '/body'), json('PUT', { markdown, expected_mtime: mtime }));
      upsert(data.story);
      toast({ kind: 'success', key: 'toast.saved', params: { id } });
      return { story: data.story };
    })
  );
}

export function deleteStory(id, { force = false } = {}) {
  return attempt(async () => {
    const data = await request(storyUrl(id, force ? '?force=1' : ''), { method: 'DELETE' });
    store.stories = store.stories.filter((s) => s.id !== id);
    noteWrite();
    toast({ kind: 'success', key: 'toast.deleted', params: { id } });
    notifyWarnings(data.warnings);
    return {};
  });
}

/** @param {string} taskId the entry of `story.tasks.list` (it is the task's identifier in the YAML) */
export function setTaskStatus(id, taskId, status) {
  return trackWrite(
    id,
    attempt(async () => {
      const url = storyUrl(id, `/tasks/${encodeURIComponent(taskId)}`);
      const data = await request(url, json('PATCH', { status }));
      upsert(data.story);
      return { story: data.story };
    })
  );
}

/** Adds a to-do task (its name is its identifier). 409 `task_exists` for a name the story already has. */
export function addTask(id, title) {
  return trackWrite(
    id,
    attempt(async () => {
      const data = await request(storyUrl(id, '/tasks'), json('POST', { title }));
      upsert(data.story);
      return { story: data.story };
    })
  );
}

// ---- read the form needs -----------------------------------------------------------------------------

/** Fresh story + raw markdown body (the detail store keeps the body rendered as HTML). */
export function loadStoryRaw(id) {
  return attempt(async () => {
    const data = await request(storyUrl(id));
    return { story: data.story, body: data.body ?? '' };
  });
}
