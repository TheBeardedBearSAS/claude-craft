// Story form model: drafts (form text) <-> API payloads. Pure, no Svelte. Error values are i18n keys.

import { STORY_ID_RE } from '../../../shared/ids.js';
import { errorKey } from './api.js';

export const POINTS = [0, 1, 2, 3, 5, 8, 13, 21];
export const PRIORITIES = ['must', 'should', 'could', 'wont'];
export const TDD_PHASES = ['', 'red', 'green', 'refactor', 'done'];
export const TITLE_MAX = 200;
export const FIELDS = [
  'title',
  'story_points',
  'priority',
  'assigned_to',
  'tdd_phase',
  'epic_id',
  'sprint_id',
  'dependencies',
  'persona',
];

const text = (v) => (v === null || v === undefined ? '' : String(v));

export function emptyDraft(defaults = {}) {
  return {
    title: '',
    story_points: '',
    priority: 'should',
    assigned_to: '',
    tdd_phase: '',
    epic_id: '',
    sprint_id: '',
    dependencies: '',
    persona: '',
    ...defaults,
  };
}

export function draftFromStory(story) {
  return {
    title: text(story.title),
    story_points: text(story.story_points),
    priority: text(story.priority),
    assigned_to: text(story.assigned_to),
    tdd_phase: text(story.tdd_phase),
    epic_id: text(story.epic_id),
    sprint_id: text(story.sprint_id),
    dependencies: (story.dependencies ?? []).join(', '),
    persona: text(story.persona),
  };
}

/** 'US-1, US-2;US-3' -> ['US-1', 'US-2', 'US-3'] (trimmed, no empties, no duplicates). */
export function parseDependencies(value) {
  return [
    ...new Set(
      text(value)
        .split(/[\s,;]+/)
        .filter(Boolean)
    ),
  ];
}

function pointsError(raw, keep) {
  const value = text(raw).trim();
  if (value === '' || value === text(keep)) return null;
  const n = Number(value);
  return POINTS.includes(n) && /^\d+$/.test(value) ? null : 'form.error.points.range';
}

function dependenciesError(raw, selfId) {
  const ids = parseDependencies(raw);
  const bad = ids.find((id) => !STORY_ID_RE.test(id));
  if (bad) return { key: 'form.error.dependencies.invalid', params: { value: bad } };
  return selfId && ids.includes(selfId) ? { key: 'form.error.dependencies.self' } : null;
}

function titleError(raw) {
  const title = text(raw).trim();
  if (!title) return { key: 'form.error.title.required' };
  return title.length > TITLE_MAX ? { key: 'form.error.title.tooLong', params: { max: TITLE_MAX } } : null;
}

/**
 * @param {object} draft
 * @param {{ keep?: string|number, selfId?: string }} [ctx] keep: an off-series points value already stored
 * @returns {{ valid: boolean, errors: Record<string,string>, params: Record<string,object> }}
 */
export function validateDraft(draft, { keep, selfId } = {}) {
  const found = {
    title: titleError(draft.title),
    story_points: pointsError(draft.story_points, keep) && {
      key: 'form.error.points.range',
      params: { min: POINTS[0], max: POINTS.at(-1) },
    },
    priority: draft.priority && !PRIORITIES.includes(draft.priority) ? { key: 'form.error.priority.invalid' } : null,
    dependencies: dependenciesError(draft.dependencies, selfId),
  };
  const errors = {};
  const params = {};
  for (const [field, err] of Object.entries(found)) {
    if (!err) continue;
    errors[field] = err.key;
    if (err.params) params[field] = err.params;
  }
  return { valid: Object.keys(errors).length === 0, errors, params };
}

const orNull = (v) => text(v).trim() || null;

// Draft field -> API value. `undefined` = the field must not be sent.
const TO_API = {
  title: (v) => text(v).trim(),
  story_points: (v) => (text(v).trim() === '' ? undefined : Number(v)),
  priority: (v) => v || undefined,
  assigned_to: orNull,
  tdd_phase: (v) => text(v),
  epic_id: orNull,
  sprint_id: orNull,
  dependencies: parseDependencies,
};

const normalized = (field, value) => JSON.stringify(TO_API[field](value) ?? null);

/** Only the fields whose value differs from the original story, in the PATCH /api/stories/:id format. */
export function diffPatch(original, draft) {
  const before = draftFromStory(original);
  const patch = {};
  for (const field of Object.keys(TO_API)) {
    if (normalized(field, before[field]) === normalized(field, draft[field])) continue;
    const value = TO_API[field](draft[field]);
    if (value !== undefined) patch[field] = value;
  }
  return patch;
}

/** POST /api/stories body: only the filled fields the endpoint accepts. */
export function toCreatePayload(draft) {
  const payload = { title: TO_API.title(draft.title) };
  const points = TO_API.story_points(draft.story_points);
  if (points !== undefined) payload.story_points = points;
  if (draft.priority) payload.priority = draft.priority;
  for (const field of ['epic_id', 'sprint_id', 'persona']) {
    const value = orNull(draft[field]);
    if (value) payload[field] = value;
  }
  return payload;
}

/** Server `issues` (zod) -> { field: message } for the fields the form has; the first message per field wins. */
export function fieldErrorsFromIssues(issues) {
  const out = {};
  for (const issue of Array.isArray(issues) ? issues : []) {
    const field = issue?.path?.[0];
    if (FIELDS.includes(field) && !(field in out)) out[field] = String(issue.message ?? '');
  }
  return out;
}

/** What a form shows after a refused write: the error's i18n key, per-field messages, and whether to offer a retry. */
export function describeFailure(err) {
  return {
    key: errorKey(err),
    fields: fieldErrorsFromIssues(err?.body?.issues),
    retry: err?.code === 'locked' || err?.code === 'network',
  };
}

/** One opaque token per opening of a creation form: the server answers a repeated POST with the first answer. */
export function idempotencyKey(source = globalThis.crypto) {
  if (typeof source?.randomUUID === 'function') return source.randomUUID();
  return Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10).padEnd(8, '0')).join('-');
}

/**
 * Whether a dialog that just closed should give the focus back to its trigger: only when the focus was lost (nothing,
 * the page body, a removed or disabled element) or is still inside the dialog. A user who already reached another
 * control while the server answered keeps it (WCAG 2.4.3). Pure: the caller passes the DOM nodes.
 */
export function focusLost(active, body, dialog) {
  if (!active || active === body || !active.isConnected || active.disabled === true) return true;
  return Boolean(dialog?.contains(active));
}

/**
 * The control that opened a dialog, where the focus goes back when it closes. Safari on macOS gives no focus to a
 * button on click: the focus is still on the page body when the dialog opens, so the control just clicked is the
 * opener. Pure: the caller passes the DOM nodes.
 */
export function openerOf(active, body, clicked) {
  if (active && active !== body) return active;
  return clicked?.isConnected ? clicked : active;
}
