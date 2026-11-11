import path from 'node:path';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolveSafe } from '../middleware/security.js';
import { loadSprintStatus, computeBurndown } from '../services/sprint-cache.js';
import { mutateSprintStatus, ConflictError, InvalidStatusFileError } from '../services/status-store.js';
import {
  SprintOpError,
  applyOps,
  closeSprint,
  nextSprintNumber,
  parseSprintGoal,
  renderSprintGoal,
  sprintSlug,
  sprintState,
  startSprint,
  velocity,
} from '../services/sprint-ops.js';
import { SPRINT_ID_RE, SprintCloseSchema, SprintCreateSchema, SprintStartSchema } from '../../shared/schemas.js';
import { createIdempotencyStore, idempotent } from '../services/idempotency.js';
import { HttpError, readJson, safeError, writeError } from './http-errors.js';

/**
 * Sprint routes: reads (list, detail, current, velocity) and the lifecycle (create, start, close).
 * Files written: `project-management/sprints/<id>/sprint-goal.md` (create) and
 * `.bmad/sprint-status.yaml` through `mutateSprintStatus` (start, close).
 *
 * @param {import('hono').Hono} app
 * @param {{ repository: object, projectRoot: string, eventBus?: object|null, now?: () => Date }} deps
 */
export function register(app, { repository, projectRoot, eventBus = null, now = () => new Date() }) {
  const sprintsDir = () => path.join(repository.rootDir, 'sprints');
  const publish = (id, state) => eventBus?.publish('sprint:updated', { id, state });

  const loadStatusSafe = async () => {
    try {
      return await loadSprintStatus(projectRoot);
    } catch (err) {
      // Sprint metadata is optional here: degrade to ids only, but never silently.
      console.error('[kanban] sprint-status.yaml unreadable:', err);
      return null;
    }
  };

  /** Ids of the directories under sprints/ (the source of truth for "this sprint exists"). */
  const listSprintDirs = async () => {
    try {
      const entries = await readdir(sprintsDir(), { withFileTypes: true });
      return entries.filter((e) => e.isDirectory() && SPRINT_ID_RE.test(e.name)).map((e) => e.name);
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  };

  const goalFile = (id) => resolveSafe(repository.rootDir, `sprints/${id}/sprint-goal.md`);
  const readGoal = (id) =>
    readFile(goalFile(id), 'utf8').catch((err) => (err.code === 'ENOENT' ? null : Promise.reject(err)));

  registerReads(app, { repository, projectRoot, loadStatusSafe });

  app.get('/api/velocity', async (c) => c.json(velocity(await loadStatusSafe())));

  /** Runs a write; refusals decided by the sprint rules become 409 answers. */
  const guarded = async (c, task) => {
    try {
      return await task();
    } catch (err) {
      return writeError(c, err instanceof SprintOpError ? new HttpError(409, err.code, err.extra) : err);
    }
  };

  const done = async (c, status, id, state, payload) => {
    await repository.refresh();
    publish(id, state);
    return c.json(payload, status);
  };

  // `Idempotency-Key`: a double submit of the creation form must not create two sprints.
  app.post(
    '/api/sprints',
    idempotent(createIdempotencyStore(), async (c) => {
      const read = await readJson(c, SprintCreateSchema);
      if (read.response) return read.response;
      return guarded(c, async () => {
        const sprint = await createSprintDir(read.data);
        return done(c, 201, sprint.id, 'planned', { sprint: { ...sprint, state: 'planned' } });
      });
    })
  );

  async function createSprintDir(input) {
    const ids = await listSprintDirs();
    const slug = sprintSlug(input.name);
    if (ids.some((id) => id.replace(/^sprint-\d+-?/, '') === slug)) throw new HttpError(409, 'sprint_exists');
    const status = await loadStatusSafe();
    const known = [...ids, ...Object.keys(status?.archived_sprints ?? {}), status?.metadata?.sprint_id ?? ''];
    const number = nextSprintNumber(known);
    const id = `sprint-${number}-${slug}`;
    const text = renderSprintGoal({ number, ...input });
    await writeNewSprint(id, text);
    return { id, ...parseSprintGoal(text, id) };
  }

  async function writeNewSprint(id, text) {
    const dir = path.dirname(goalFile(id));
    await mkdir(sprintsDir(), { recursive: true });
    try {
      await mkdir(dir);
    } catch (err) {
      if (err.code === 'EEXIST') throw new HttpError(409, 'sprint_exists');
      throw err;
    }
    try {
      await writeFile(goalFile(id), text, { flag: 'wx' });
    } catch (err) {
      await rm(dir, { recursive: true, force: true });
      throw err;
    }
  }

  const sprintParam = async (c, schema) => {
    const id = c.req.param('id');
    if (!SPRINT_ID_RE.test(id)) return { response: c.json({ error: 'not_found' }, 404) };
    const read = await readJsonOrEmpty(c, schema);
    return read.response ? read : { id, body: read.data };
  };

  app.post('/api/sprints/:id/start', async (c) => {
    const given = await sprintParam(c, SprintStartSchema);
    if (given.response) return given.response;
    const { id, body } = given;
    if (!(await listSprintDirs()).includes(id)) return c.json({ error: 'not_found' }, 404);
    return guarded(c, async () => {
      const sprint = { id, ...parseSprintGoal(await readGoal(id), id) };
      const { version } = await mutateSprintStatus(
        projectRoot,
        (tx) => {
          assertVersion(tx, body.expected_version);
          applyOps(tx, startSprint(tx.data, sprint));
        },
        { create: true }
      );
      return done(c, 200, id, 'active', { sprint: { ...sprint, state: 'active' }, version });
    });
  });

  app.post('/api/sprints/:id/close', async (c) => {
    const given = await sprintParam(c, SprintCloseSchema);
    if (given.response) return given.response;
    const { id, body } = given;
    return guarded(c, async () => {
      const knownSprintIds = await listSprintDirs();
      const today = now().toISOString().slice(0, 10);
      let summary;
      const { version } = await mutateSprintStatus(projectRoot, (tx) => {
        assertVersion(tx, body.expected_version);
        const closed = closeSprint(tx.data, id, { carryOver: body.carry_over, today, knownSprintIds });
        ({ summary } = closed);
        applyOps(tx, closed.ops);
      }).catch(missingFileMeansNotActive);
      return done(c, 200, id, 'closed', closeAnswer(id, summary, version));
    });
  });
}

function closeAnswer(id, s, version) {
  return {
    sprint: {
      id,
      name: s.name,
      state: 'closed',
      closed_date: s.closed_date,
      points_committed: s.points_committed,
      points_delivered: s.points_delivered,
    },
    archived: s.archived,
    carried_over: { to: s.carry_to, stories: s.carried },
    version,
  };
}

/** No status file at all: there is no active sprint to close. */
function missingFileMeansNotActive(err) {
  throw err instanceof InvalidStatusFileError && err.kind === 'missing' ? new SprintOpError('not_active') : err;
}

function assertVersion(tx, expected) {
  if (expected && tx.version !== expected) throw new ConflictError('stale', null);
}

/** Like `readJson`, but a body-less POST means `{}` (every field of these bodies is optional). */
async function readJsonOrEmpty(c, schema) {
  if ((await c.req.raw.clone().text()).trim() !== '') return readJson(c, schema);
  const parsed = schema.safeParse({});
  if (!parsed.success) return { response: c.json({ error: 'invalid_payload', issues: parsed.error.issues }, 400) };
  return { data: parsed.data };
}

// --- reads ------------------------------------------------------------------

/**
 * Display metadata (name, dates, epic) of a sprint: current one via metadata, closed ones via archived_sprints,
 * a sprint that is in neither (planned) via its sprint-goal.md.
 */
function sprintMeta(ss, id, goalText = null) {
  const base = { name: id, start_date: '', end_date: '', epic: '', points_delivered: null };
  if (!ss || ss._invalid) return planned(base, id, goalText);
  if (ss.metadata?.sprint_id === id) {
    return withCapacity(
      {
        name: ss.metadata.name ?? id,
        start_date: ss.metadata.start_date ?? '',
        end_date: ss.metadata.end_date ?? '',
        epic: ss.metadata.epic ?? '',
        points_delivered: null,
      },
      ss.metadata.capacity_points
    );
  }
  const a = ss.archived_sprints?.[id];
  if (!a) return planned(base, id, goalText);
  return {
    name: a.name ?? id,
    start_date: '',
    end_date: a.closed_date ?? '',
    epic: a.epic ?? '',
    points_delivered: a.points_delivered ?? null,
  };
}

function planned(base, id, goalText) {
  if (goalText === null) return base;
  const { name, start_date, end_date, capacity_points } = parseSprintGoal(goalText, id);
  return withCapacity({ ...base, name, start_date, end_date }, capacity_points);
}

/** `capacity_points` only when the sprint has one (a closed sprint has nothing left to plan against). */
const withCapacity = (meta, capacity) => (Number.isInteger(capacity) ? { ...meta, capacity_points: capacity } : meta);
const capacityOf = (meta) => (meta.capacity_points === undefined ? {} : { capacity_points: meta.capacity_points });

const knownToStatus = (ss, id) => ss?.metadata?.sprint_id === id || !!ss?.archived_sprints?.[id];

const sumPoints = (stories) => stories.reduce((n, st) => n + (st.story_points ?? 0), 0);

function registerReads(app, { repository, projectRoot, loadStatusSafe }) {
  const dirIds = () => repository.listSprints().map((s) => s.id);

  app.get('/api/sprints/current', async (c) => {
    let sprintStatus;
    try {
      sprintStatus = await loadSprintStatus(projectRoot);
    } catch (err) {
      // Invalid YAML syntax or unexpected I/O error -> controlled 503 (REL-001)
      return safeError(c, 503, 'sprint_data_unavailable', err);
    }
    if (!sprintStatus || sprintStatus._invalid) return c.json({ error: 'not_found' }, 404);

    const sprintId = sprintStatus.metadata.sprint_id;
    const stories = repository.listStories({ sprintId });
    if (stories.length === 0) return c.json({ error: 'not_found' }, 404);

    return c.json({
      sprint: { ...sprintStatus.metadata, state: sprintState(sprintId, sprintStatus, dirIds()) },
      stories: stories.map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
        story_points: s.story_points,
        assigned_to: s.assigned_to,
        tasks: s.tasks,
      })),
      burndown: computeBurndown(sprintStatus, stories),
    });
  });

  // Declared after /api/sprints/current so :id below never captures "current".
  app.get('/api/sprints', async (c) => {
    const ss = await loadStatusSafe();
    const allStories = repository.listStories();
    const ids = dirIds();
    const summaries = repository.listSprints();
    const goals = await Promise.all(
      summaries.map((s) =>
        knownToStatus(ss, s.id) ? null : readIfExists(repository, repository.getSprint(s.id).goalPath ?? null)
      )
    );
    const sprints = summaries.map((s, i) => {
      const stories = allStories.filter((st) => st.sprint_id === s.id);
      const meta = sprintMeta(ss, s.id, goals[i]);
      return {
        ...s,
        name: meta.name,
        start_date: meta.start_date,
        end_date: meta.end_date,
        epic: meta.epic,
        points_delivered: meta.points_delivered,
        ...capacityOf(meta),
        state: sprintState(s.id, ss, ids),
        story_count: stories.length,
        total_points: sumPoints(stories),
        done_points: sumPoints(stories.filter((st) => st.status === 'done')),
      };
    });
    return c.json({ sprints });
  });

  // Sprint detail : stories + their tasks, plus goal/review/retro markdown bodies.
  app.get('/api/sprints/:id', async (c) => {
    const id = c.req.param('id');
    const sprint = repository.getSprint(id);
    if (!sprint) return c.json({ error: 'not_found' }, 404);

    const stories = repository.listStories({ sprintId: id });
    const tasks = stories.flatMap((s) => repository.listTasksForStory(s.id));
    const fileOf = (category) => sprint.files.find((f) => f.category === category)?.path ?? null;
    const [goal, review, retro, ss] = await Promise.all([
      readIfExists(repository, sprint.goalPath ?? null),
      readIfExists(repository, fileOf('sprint-review')),
      readIfExists(repository, fileOf('sprint-retro')),
      loadStatusSafe(),
    ]);
    const meta = sprintMeta(ss, id, goal);

    return c.json({
      sprint: {
        id,
        name: meta.name,
        state: sprintState(id, ss, dirIds()),
        start_date: meta.start_date,
        end_date: meta.end_date,
        epic: meta.epic,
        points_delivered: meta.points_delivered,
        ...capacityOf(meta),
        has_goal: !!sprint.goalPath,
        has_review: !!fileOf('sprint-review'),
        has_retro: !!fileOf('sprint-retro'),
      },
      stories: stories.map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
        story_points: s.story_points,
        assigned_to: s.assigned_to,
      })),
      tasks,
      goal,
      review,
      retro,
    });
  });
}

/** Optional markdown file under the project-management root only. */
async function readIfExists(repository, absPath) {
  if (!absPath) return null;
  try {
    const rel = path.relative(repository.rootDir, absPath).split(path.sep).join('/');
    resolveSafe(repository.rootDir, rel);
    return await readFile(absPath, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(`[kanban] cannot read ${absPath}:`, err);
    return null;
  }
}
