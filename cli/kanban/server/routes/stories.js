import path from 'node:path';
import { readdir, readFile, rm, stat } from 'node:fs/promises';
import { bodyLimit } from 'hono/body-limit';
import { resolveSafe } from '../middleware/security.js';
import { validateTransition, validateUnblock, computeTransitionPatch } from '../services/state-machine.js';
import { updateFrontmatter } from '../services/file-writer.js';
import { mutateSprintStatus, revOf, ConflictError } from '../services/status-store.js';
import {
  BodyChangesFrontmatterError,
  createExclusive,
  hasStatusLine,
  patchMetadataList,
  renderStoryMarkdown,
  replaceBody,
  slugify,
  trashFile,
  writeTextAtomic,
} from '../services/story-files.js';
import { readWipLimits, wipWarnings } from '../services/kanban-config.js';
import { allowedTargets } from '../../shared/transitions.js';
import { EPIC_ID_RE, STORY_ID_RE, nextStoryId, storyIdFromFilename } from '../../shared/ids.js';
import {
  StoryBodySchema,
  StoryCreateSchema,
  StoryPatchSchema,
  TaskStatusPatchSchema,
  TransitionRequestSchema,
} from '../../shared/schemas.js';
import { HttpError, parseIfMatch, readJson, writeError } from './http-errors.js';

/** The markdown body route accepts more than the global 64 KB limit. */
export const BODY_ROUTE_RE = /^\/api\/stories\/[^/]+\/body$/;
export const BODY_ROUTE_LIMIT = 512 * 1024;

const STORIES_DIR = 'backlog/user-stories';
const ACTIVE_STATUSES = new Set(['in-progress', 'review']);
const YAML_SOURCE = 'sprint-status';

const actor = (user) => (user === 'kanban' ? user : `kanban:${user}`);
const isTracked = (story) => story._statusSource === YAML_SOURCE;
const isoDay = (now) => now().toISOString().slice(0, 10);

function readOnlyError(story) {
  if (story._source === 'archived') {
    return { error: 'archived', reason: 'story belongs to a closed sprint (archived_sprints): history is read-only' };
  }
  const reason =
    story._source === 'markdown-metadata'
      ? 'story has no YAML frontmatter (Markdown metadata list): edit the status in the file'
      : 'story is not writable from the board: change its status with the team:/qa: commands';
  return { error: 'read_only_source', reason };
}

/** The story addressed by `:id`, or the 404 answer. An id that cannot be a story id never reaches a path. */
function findStory(ctx, c) {
  const id = c.req.param('id');
  const story = STORY_ID_RE.test(id) ? ctx.repository.getStory(id) : null;
  return story ? { story } : { response: c.json({ error: 'not_found' }, 404) };
}

async function publish(ctx, id, extra = {}) {
  await ctx.repository.refresh();
  const story = ctx.repository.getStory(id);
  ctx.eventBus?.publish('story:updated', { id, story, ...extra });
  return story;
}

const withWarnings = (body, warnings) => (warnings.length ? { ...body, warnings } : body);

function entryOf(tx, id) {
  const current = tx.data.stories?.[id];
  if (!current) throw new ConflictError('removed', null);
  return current;
}

/** Optional `If-Match`: the board's `_rev` of the story against the YAML entry read under the lock. */
function checkRev(current, header) {
  const expected = parseIfMatch(header);
  if (expected && revOf(current) !== expected) throw new ConflictError('stale', current);
}

function assertSprint(ctx, tx, sprintId) {
  if (sprintId === undefined || sprintId === null) return;
  if (tx?.data.metadata?.sprint_id === sprintId || ctx.repository.getSprint(sprintId)) return;
  throw new HttpError(409, 'sprint_not_found');
}

// --- PATCH /api/stories/:id/status -------------------------------------------

function transitionError(c, story, extra) {
  return c.json({ error: 'invalid_transition', ...extra, allowed: allowedTargets(story) }, 409);
}

/** @returns {Response|null} the refusal, or null when the move is allowed */
function refuseTransition(c, story, { status: target, blocked_reason }) {
  if (story.status === 'blocked' && target !== 'blocked') {
    const unblock = validateUnblock(story);
    if (!unblock.allowed) return transitionError(c, story, { reason: unblock.reason });
    if (unblock.status === target) return null;
    return transitionError(c, story, {
      reason: `blocked stories may only be restored to previous_status (${unblock.status})`,
    });
  }
  const check = validateTransition(story, target, { blocked_reason });
  if (check.allowed) return null;
  return transitionError(c, story, { reason: check.reason, gate: check.gate, missing: check.missing });
}

async function moveTracked(ctx, c, story, patch, { status: target, blocked_reason, reason }) {
  const id = story.id;
  const entry = { from: story.status, to: target, by: actor(ctx.user), reason: reason ?? blocked_reason ?? '' };
  const { version } = await mutateSprintStatus(ctx.projectRoot, (tx) => {
    const current = tx.data.stories?.[id];
    // The transition was validated against the board's view: refuse if the YAML moved since.
    if (current?.status !== story.status) throw new ConflictError('status_changed', current ?? null);
    checkRev(current, c.req.header('If-Match'));
    tx.setStory(id, patch);
    tx.appendHistory(id, entry);
  });
  return version;
}

async function moveStory(ctx, c) {
  const { story, response } = findStory(ctx, c);
  if (response) return response;
  // Archived history or metadata-list markdown (no frontmatter): nothing to rewrite safely.
  if (!story._writable) return c.json(readOnlyError(story), 409);

  const parsed = await readJson(c, TransitionRequestSchema);
  if (parsed.response) return parsed.response;
  const refusal = refuseTransition(c, story, parsed.data);
  if (refusal) return refusal;

  const patch = computeTransitionPatch(story, parsed.data.status, { blocked_reason: parsed.data.blocked_reason });
  try {
    let version = null;
    // sprint-status.yaml is the source of truth for status whenever it tracks the story.
    if (isTracked(story)) version = await moveTracked(ctx, c, story, patch, parsed.data);
    else await updateFrontmatter(ctx.repository.getStoryFile(story.id), patch, { expectedMtime: story._mtime });
    const moved = await publish(ctx, story.id);
    const limits = await readWipLimits(ctx.projectRoot);
    return c.json(
      withWarnings({ story: moved, version }, wipWarnings(ctx.repository.listStories(), limits, moved.status))
    );
  } catch (err) {
    return writeError(c, err);
  }
}

// --- PATCH /api/stories/:id ----------------------------------------------------

function yamlFields(patch) {
  const fields = { ...patch };
  if (fields.epic_id === null) fields.epic_id = ''; // the YAML schema reads '' as "no epic"
  return fields;
}

function sprintMoveEntry(ctx, story, current, patch) {
  const from = story.sprint_id ?? null;
  if (patch.sprint_id === undefined || patch.sprint_id === from) return null;
  const label = (id) => id ?? 'backlog';
  return {
    from: current.status,
    to: current.status,
    by: actor(ctx.user),
    reason: `sprint: ${label(from)} -> ${label(patch.sprint_id)}`,
  };
}

function assertNotSelfDependent(story, patch) {
  if (!patch.dependencies?.includes(story.id)) return;
  const issues = [{ path: ['dependencies'], message: 'A story cannot depend on itself' }];
  throw new HttpError(400, 'invalid_payload', { issues });
}

async function patchTracked(ctx, c, story, patch) {
  return mutateSprintStatus(
    ctx.projectRoot,
    (tx) => {
      const current = entryOf(tx, story.id);
      checkRev(current, c.req.header('If-Match'));
      assertSprint(ctx, tx, patch.sprint_id);
      assertNotSelfDependent(story, patch);
      tx.setStory(story.id, yamlFields(patch));
      const moved = sprintMoveEntry(ctx, story, current, patch);
      if (moved) tx.appendHistory(story.id, moved);
    },
    { now: ctx.now }
  );
}

/** The frontmatter schema only knows `EPIC-NNN`: an `E<n>` written there would invalidate the whole file. */
function assertFrontmatterEpic(patch) {
  if (!patch.epic_id || EPIC_ID_RE.test(patch.epic_id)) return;
  const issues = [{ path: ['epic_id'], message: 'Expected EPIC-XXX for a story without sprint-status.yaml entry' }];
  throw new HttpError(400, 'invalid_payload', { issues });
}

/** Markdown frontmatter story that the YAML does not track: the frontmatter is the record. */
async function patchFrontmatter(ctx, story, patch) {
  assertSprint(ctx, null, patch.sprint_id);
  assertNotSelfDependent(story, patch);
  assertFrontmatterEpic(patch);
  const fields = { ...patch };
  if (fields.assigned_to === null) fields.assigned_to = '';
  const file = ctx.repository.getStoryFile(story.id);
  await updateFrontmatter(file, fields, { expectedMtime: story._mtime });
  return { version: null };
}

function metadataFields(patch, now) {
  const fields = {};
  if (patch.story_points !== undefined) fields.points = patch.story_points;
  if (patch.epic_id !== undefined) fields.epic = patch.epic_id;
  if (patch.sprint_id !== undefined) fields.sprint = patch.sprint_id;
  return Object.keys(fields).length ? { ...fields, updated: isoDay(now) } : null;
}

/** Keeps the `## Metadata` list of the markdown file in step; a failure never fails the request. */
async function syncMetadata(ctx, story, patch) {
  const file = ctx.repository.getStoryFile(story.id);
  const fields = metadataFields(patch, ctx.now);
  if (!file || !fields) return [];
  try {
    const text = await readFile(file, 'utf8');
    const next = patchMetadataList(text, fields);
    if (next !== text) await writeTextAtomic(file, next);
    return [];
  } catch (err) {
    console.error(`[kanban] metadata_sync_failed (${story.id}):`, err);
    return ['metadata_sync_failed'];
  }
}

async function editStory(ctx, c) {
  const { story, response } = findStory(ctx, c);
  if (response) return response;
  if (!story._writable) return c.json(readOnlyError(story), 409);
  const parsed = await readJson(c, StoryPatchSchema);
  if (parsed.response) return parsed.response;
  try {
    const { version } = isTracked(story)
      ? await patchTracked(ctx, c, story, parsed.data)
      : await patchFrontmatter(ctx, story, parsed.data);
    const warnings = isTracked(story) ? await syncMetadata(ctx, story, parsed.data) : [];
    return c.json(withWarnings({ story: await publish(ctx, story.id), version }, warnings));
  } catch (err) {
    return writeError(c, err);
  }
}

// --- PUT /api/stories/:id/body -------------------------------------------------

async function putBody(ctx, c) {
  const { story, response } = findStory(ctx, c);
  if (response) return response;
  if (story._source === 'archived') return c.json(readOnlyError(story), 409);
  const file = ctx.repository.getStoryFile(story.id);
  if (!file) return c.json({ error: 'no_backing_file' }, 409);
  const parsed = await readJson(c, StoryBodySchema);
  if (parsed.response) return parsed.response;
  const { markdown, expected_mtime: expected } = parsed.data;
  if (hasStatusLine(markdown)) return c.json({ error: 'status_line_forbidden' }, 422);
  try {
    await replaceBody(file, markdown, expected);
    return c.json({ story: await publish(ctx, story.id) });
  } catch (err) {
    // A leading `---` block would become the frontmatter, and a frontmatter can carry a status.
    if (err instanceof BodyChangesFrontmatterError) {
      return c.json({ error: 'status_line_forbidden', reason: 'frontmatter' }, 422);
    }
    return writeError(c, err);
  }
}

// --- POST /api/stories ---------------------------------------------------------

async function idsOnDisk(dir) {
  const names = await Promise.all([dir, path.join(dir, '.trash')].map((d) => readdir(d).catch(() => [])));
  return names.flat().map(storyIdFromFilename).filter(Boolean);
}

/** Current + archived stories of the YAML and every markdown file (trash included): no id is ever reused. */
async function knownIds(data, dir) {
  const archived = Object.values(data.archived_sprints ?? {}).flatMap((s) => Object.keys(s?.stories ?? {}));
  return [...Object.keys(data.stories ?? {}), ...archived, ...(await idsOnDisk(dir))];
}

/** Creates `backlog/user-stories/<id>-<slug>.md` (never overwrites). @returns {Promise<string>} absolute path */
async function writeNewStory(ctx, id, input) {
  const name = `${id}-${slugify(input.title)}.md`;
  const file = resolveSafe(ctx.repository.rootDir, path.posix.join(STORIES_DIR, name));
  try {
    await createExclusive(file, renderStoryMarkdown({ id, ...input, date: isoDay(ctx.now) }));
  } catch (err) {
    if (err.code === 'EEXIST') throw new HttpError(409, 'id_collision');
    throw err;
  }
  return file;
}

const newEntry = (input) => ({
  title: input.title,
  status: 'backlog',
  previous_status: '',
  // The keys are always written: absent, a YAML-only story would inherit the active sprint and epic.
  sprint_id: input.sprint_id ?? null,
  story_points: input.story_points ?? 0,
  priority: input.priority ?? 'should',
  epic_id: input.epic_id ?? '',
});

async function statusFileExists(projectRoot) {
  return stat(path.join(projectRoot, '.bmad', 'sprint-status.yaml')).then(
    () => true,
    () => false
  );
}

async function createStory(ctx, c) {
  const parsed = await readJson(c, StoryCreateSchema);
  if (parsed.response) return parsed.response;
  const input = parsed.data;
  if (!(await statusFileExists(ctx.projectRoot))) return c.json({ error: 'sprint_status_missing' }, 409);
  const dir = path.join(ctx.repository.rootDir, ...STORIES_DIR.split('/'));
  let id = null;
  let created = null;
  try {
    const { version } = await mutateSprintStatus(
      ctx.projectRoot,
      async (tx) => {
        assertSprint(ctx, tx, input.sprint_id);
        id = nextStoryId(await knownIds(tx.data, dir), input.epic_id ?? null);
        created = await writeNewStory(ctx, id, input);
        tx.addStory(id, newEntry(input));
        tx.appendHistory(id, { from: '', to: 'backlog', by: actor(ctx.user), reason: 'Story created' });
      },
      { now: ctx.now }
    );
    created = null; // the YAML entry is written: from here on the markdown file belongs to it
    return c.json({ story: await publish(ctx, id), version }, 201);
  } catch (err) {
    if (created) await rm(created, { force: true });
    return writeError(c, err);
  }
}

// --- DELETE /api/stories/:id ---------------------------------------------------

function assertDeletable(ctx, story, status, force) {
  if (!force && ACTIVE_STATUSES.has(status)) throw new HttpError(409, 'story_active', { status });
  const dependents = ctx.repository
    .listStories()
    .filter((s) => s.id !== story.id && s.dependencies?.includes(story.id))
    .map((s) => s.id);
  if (dependents.length) throw new HttpError(409, 'has_dependents', { dependents });
}

async function removeEntry(ctx, story, force) {
  if (!isTracked(story)) {
    assertDeletable(ctx, story, story.status, force);
    return null;
  }
  const { version } = await mutateSprintStatus(
    ctx.projectRoot,
    (tx) => {
      assertDeletable(ctx, story, entryOf(tx, story.id).status, force);
      tx.removeStory(story.id);
    },
    { now: ctx.now }
  );
  return version;
}

async function trashMarkdown(ctx, story) {
  const file = ctx.repository.getStoryFile(story.id);
  if (!file) return [];
  try {
    await trashFile(file);
    return [];
  } catch (err) {
    console.error(`[kanban] trash_failed (${story.id}):`, err);
    return ['trash_failed'];
  }
}

async function deleteStory(ctx, c) {
  const { story, response } = findStory(ctx, c);
  if (response) return response;
  if (story._source === 'archived') return c.json(readOnlyError(story), 409);
  try {
    const version = await removeEntry(ctx, story, c.req.query('force') === '1');
    const warnings = await trashMarkdown(ctx, story);
    await publish(ctx, story.id, { deleted: true });
    return c.json(withWarnings({ deleted: story.id, version }, warnings));
  } catch (err) {
    return writeError(c, err);
  }
}

// --- PATCH /api/stories/:id/tasks/:taskId ---------------------------------------

/** `tasks` with the new status of `taskId` and `completed` recounted from the per-task statuses. */
export function withTaskStatus(tasks, taskId, status) {
  const list = tasks?.list ?? [];
  if (!list.includes(taskId)) throw new HttpError(404, 'task_not_found');
  const statuses = { ...tasks.status, [taskId]: status };
  return { ...tasks, status: statuses, completed: list.filter((t) => statuses[t] === 'done').length };
}

async function setTaskStatus(ctx, c) {
  const { story, response } = findStory(ctx, c);
  if (response) return response;
  if (story._source === 'archived') return c.json(readOnlyError(story), 409);
  if (!isTracked(story)) {
    return c.json({ error: 'read_only_source', reason: 'task statuses are tracked in .bmad/sprint-status.yaml' }, 409);
  }
  const parsed = await readJson(c, TaskStatusPatchSchema);
  if (parsed.response) return parsed.response;
  try {
    const { version } = await mutateSprintStatus(
      ctx.projectRoot,
      (tx) => {
        const current = entryOf(tx, story.id);
        checkRev(current, c.req.header('If-Match'));
        tx.setStory(story.id, { tasks: withTaskStatus(current.tasks, c.req.param('taskId'), parsed.data.status) });
      },
      { now: ctx.now }
    );
    return c.json({ story: await publish(ctx, story.id), version });
  } catch (err) {
    return writeError(c, err);
  }
}

// --- registration ----------------------------------------------------------------

/**
 * @param {import('hono').Hono} app
 * @param {{ repository: object, projectRoot: string, user?: string, eventBus?: object|null, now?: () => Date }} deps
 */
export function register(app, { repository, projectRoot, user = 'kanban', eventBus = null, now = () => new Date() }) {
  const ctx = { repository, projectRoot, user, eventBus, now };
  const bigBody = bodyLimit({
    maxSize: BODY_ROUTE_LIMIT,
    onError: (c) => c.json({ error: 'payload_too_large' }, 413),
  });
  app.patch('/api/stories/:id/status', (c) => moveStory(ctx, c));
  app.patch('/api/stories/:id/tasks/:taskId', (c) => setTaskStatus(ctx, c));
  app.patch('/api/stories/:id', (c) => editStory(ctx, c));
  app.put('/api/stories/:id/body', bigBody, (c) => putBody(ctx, c));
  app.post('/api/stories', (c) => createStory(ctx, c));
  app.delete('/api/stories/:id', (c) => deleteStory(ctx, c));
}
