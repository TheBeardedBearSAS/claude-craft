import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { secureHeaders } from 'hono/secure-headers';
import { serveStatic } from '@hono/node-server/serve-static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { csrfGuard, readonlyGuard, resolveSafe } from './middleware/security.js';
import { validateTransition, validateUnblock, computeTransitionPatch } from './services/state-machine.js';
import { updateFrontmatter, LockedError, MtimeMismatchError } from './services/file-writer.js';
import { loadSprintStatus, computeBurndown } from './services/sprint-cache.js';
import { TransitionRequestSchema } from '../shared/schemas.js';

/**
 * Build the Hono app. Kept separate from the HTTP server boot so tests can
 * invoke routes via app.request() without opening a socket.
 *
 * @param {object} opts
 * @param {import('./services/repository.js').Repository} opts.repository
 * @param {number} opts.port
 * @param {boolean} [opts.readonly=false]
 * @param {string} [opts.projectRoot] - Parent of project-management/, defaults to parent of repository.rootDir
 * @returns {Hono}
 */
export function createApp({ repository, port, readonly = false, eventBus = null, projectRoot = null }) {
  const resolvedProjectRoot = projectRoot ?? path.dirname(repository.rootDir);
  const app = new Hono();

  // Baseline response hardening.
  // crossOriginEmbedderPolicy: require-corp isole le processus renderer (SEC-003).
  // xFrameOptions: DENY prévient le clickjacking (renforcé vs défaut SAMEORIGIN).
  // Pas de CSP personnalisé : le dashboard bundlé repose sur des assets inline servis localement.
  app.use(
    '*',
    secureHeaders({
      crossOriginEmbedderPolicy: true,
      xFrameOptions: 'DENY',
    })
  );
  app.use('*', csrfGuard(port));
  app.use('*', readonlyGuard(readonly));

  app.get('/api/health', (c) => c.json({ ok: true, readonly }));

  app.get('/api/stories', (c) => {
    const sprintId = c.req.query('sprint_id') || undefined;
    const status = c.req.query('status') || undefined;
    const epicId = c.req.query('epic_id') || undefined;
    return c.json({
      stories: repository.listStories({ sprintId, status, epicId }),
      epics: repository.listEpics(),
    });
  });

  app.get('/api/stories/:id', (c) => {
    const id = c.req.param('id');
    const story = repository.getStory(id);
    if (!story) return c.json({ error: 'not_found' }, 404);
    const tasks = repository.listTasksForStory(id);
    const body = repository.getStoryBody(id);
    return c.json({ story, tasks, body });
  });

  app.get('/api/dependencies', (c) => {
    return c.json(repository.buildDependenciesGraph());
  });

  app.get('/api/docs', (c) => {
    return c.json({ docs: repository.listDocs().map((d) => ({ rel: d.rel, category: d.category })) });
  });

  app.get('/api/docs/:rel{.+}', async (c) => {
    const rel = c.req.param('rel');
    try {
      resolveSafe(repository.rootDir, rel);
    } catch {
      return c.json({ error: 'invalid_path' }, 400);
    }
    const content = await repository.readDoc(rel);
    if (content === null) return c.json({ error: 'not_found' }, 404);
    return c.text(content);
  });

  app.patch('/api/stories/:id/status', async (c) => {
    const id = c.req.param('id');
    const filepath = repository.getStoryFile(id);
    const story = repository.getStory(id);
    if (!story) return c.json({ error: 'not_found' }, 404);
    // YAML-only story (BMAD v6 single-writer): no markdown file to rewrite.
    if (!filepath) {
      return c.json(
        {
          error: 'read_only_source',
          reason:
            'story gérée par .bmad/sprint-status.yaml (BMAD v6) ; utilisez les commandes team:/qa: pour changer le statut',
        },
        409
      );
    }

    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'invalid_json' }, 400);
    }

    const parsed = TransitionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'invalid_payload', issues: parsed.error.issues }, 400);
    }
    const { status: target, blocked_reason } = parsed.data;

    // Unblock : dispatch when story is blocked and target matches previous_status
    if (story.status === 'blocked' && target !== 'blocked') {
      const unblock = validateUnblock(story);
      if (!unblock.allowed) {
        return c.json({ error: 'invalid_transition', reason: unblock.reason }, 409);
      }
      if (unblock.status !== target) {
        return c.json(
          {
            error: 'invalid_transition',
            reason: `blocked stories may only be restored to previous_status (${unblock.status})`,
          },
          409
        );
      }
    } else {
      const check = validateTransition(story, target, { blocked_reason });
      if (!check.allowed) {
        return c.json(
          {
            error: 'invalid_transition',
            reason: check.reason,
            gate: check.gate,
            missing: check.missing,
          },
          409
        );
      }
    }

    const patch = computeTransitionPatch(story, target, { blocked_reason });
    try {
      await updateFrontmatter(filepath, patch, { expectedMtime: story._mtime });
      await repository.refresh();
      const fresh = repository.getStory(id);
      if (eventBus) eventBus.publish('story:updated', { id, story: fresh });
      return c.json({ story: fresh });
    } catch (err) {
      if (err instanceof LockedError) return c.json({ error: 'locked' }, 423);
      if (err instanceof MtimeMismatchError) return c.json({ error: 'conflict', reason: 'file changed on disk' }, 409);
      return c.json({ error: 'write_failed', message: err.message }, 500);
    }
  });

  app.get('/api/events', (c) => {
    if (!eventBus) return c.json({ error: 'events_disabled' }, 501);
    return streamSSE(c, async (stream) => {
      const unsubscribe = eventBus.subscribe((msg) => {
        stream
          .writeSSE({
            event: msg.event,
            data: JSON.stringify(msg),
          })
          .catch(() => {
            /* client disconnected */
          });
      });
      stream.onAbort(() => unsubscribe());
      // heartbeat toutes les 30s
      try {
        while (!stream.aborted) {
          await stream.sleep(30_000);
          await stream.writeSSE({ event: 'heartbeat', data: String(Date.now()) });
        }
      } catch {
        /* aborted */
      }
      unsubscribe();
    });
  });

  app.get('/api/sprints/current', async (c) => {
    let sprintStatus;
    try {
      sprintStatus = await loadSprintStatus(resolvedProjectRoot);
    } catch (err) {
      // YAML syntaxiquement invalide ou erreur I/O inattendue → 503 contrôlé (REL-001)
      return c.json({ error: 'sprint_data_unavailable', reason: err.message }, 503);
    }
    if (!sprintStatus || sprintStatus._invalid) {
      return c.json({ error: 'not_found' }, 404);
    }

    const sprintId = sprintStatus.metadata.sprint_id;
    const stories = repository.listStories({ sprintId });
    if (stories.length === 0) {
      return c.json({ error: 'not_found' }, 404);
    }

    const burndown = computeBurndown(sprintStatus, stories);

    return c.json({
      sprint: sprintStatus.metadata,
      stories: stories.map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
        story_points: s.story_points,
        assigned_to: s.assigned_to,
        tasks: s.tasks,
      })),
      burndown,
    });
  });

  // Resolve display metadata (name, dates, epic) for a sprint id from
  // sprint-status.yaml — current sprint via metadata, closed sprints via
  // archived_sprints. Gives all sprint endpoints a coherent shape.
  const sprintMeta = (ss, id) => {
    const base = { name: id, start_date: '', end_date: '', epic: '', points_delivered: null };
    if (!ss || ss._invalid) return base;
    if (ss.metadata?.sprint_id === id) {
      return {
        name: ss.metadata.name ?? id,
        start_date: ss.metadata.start_date ?? '',
        end_date: ss.metadata.end_date ?? '',
        epic: ss.metadata.epic ?? '',
        points_delivered: null,
      };
    }
    const a = ss.archived_sprints?.[id];
    if (a) {
      return {
        name: a.name ?? id,
        start_date: '',
        end_date: a.closed_date ?? '',
        epic: a.epic ?? '',
        points_delivered: a.points_delivered ?? null,
      };
    }
    return base;
  };

  const loadStatusSafe = async () => {
    try {
      return await loadSprintStatus(resolvedProjectRoot);
    } catch {
      return null;
    }
  };

  // List every scanned sprint with rolled-up story/point counts.
  // Declared after /api/sprints/current so :id below never captures "current".
  app.get('/api/sprints', async (c) => {
    const ss = await loadStatusSafe();
    const allStories = repository.listStories();
    const sprints = repository.listSprints().map((s) => {
      const stories = allStories.filter((st) => st.sprint_id === s.id);
      const meta = sprintMeta(ss, s.id);
      return {
        ...s,
        name: meta.name,
        epic: meta.epic,
        points_delivered: meta.points_delivered,
        story_count: stories.length,
        total_points: stories.reduce((n, st) => n + (st.story_points ?? 0), 0),
        done_points: stories.filter((st) => st.status === 'done').reduce((n, st) => n + (st.story_points ?? 0), 0),
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

    // Read an optional markdown file under the project-management root only.
    const readIfExists = async (absPath) => {
      if (!absPath) return null;
      try {
        const rel = path.relative(repository.rootDir, absPath).split(path.sep).join('/');
        resolveSafe(repository.rootDir, rel);
        return await fs.promises.readFile(absPath, 'utf8');
      } catch {
        return null;
      }
    };

    const goalFile = sprint.goalPath ?? null;
    const reviewFile = sprint.files.find((f) => f.category === 'sprint-review')?.path ?? null;
    const retroFile = sprint.files.find((f) => f.category === 'sprint-retro')?.path ?? null;

    const [goal, review, retro, ss] = await Promise.all([
      readIfExists(goalFile),
      readIfExists(reviewFile),
      readIfExists(retroFile),
      loadStatusSafe(),
    ]);
    const meta = sprintMeta(ss, id);

    return c.json({
      sprint: {
        id,
        name: meta.name,
        start_date: meta.start_date,
        end_date: meta.end_date,
        epic: meta.epic,
        points_delivered: meta.points_delivered,
        has_goal: !!goalFile,
        has_review: !!reviewFile,
        has_retro: !!retroFile,
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

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.resolve(__dirname, '../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use('/assets/*', serveStatic({ root: path.relative(process.cwd(), clientDist) }));
    app.get('/', (c) => c.html(fs.readFileSync(path.join(clientDist, 'index.html'), 'utf8')));
  } else {
    app.get('/', (c) =>
      c.text('claude-craft kanban : client not built.\n' + 'Run "npm run kanban:build" to build the UI.\n')
    );
  }

  return app;
}
