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

  // Baseline response hardening (X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
  // COOP, CORP…). No custom CSP: the bundled dashboard relies on inline assets served locally.
  app.use('*', secureHeaders());
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
    return c.json({ story, tasks });
  });

  app.get('/api/dependencies', (c) => {
    return c.json(repository.buildDependenciesGraph());
  });

  app.get('/api/docs', (c) => {
    return c.json({ docs: repository.listDocs().map((d) => ({ rel: d.rel })) });
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
    if (!story || !filepath) return c.json({ error: 'not_found' }, 404);

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
    const sprintStatus = await loadSprintStatus(resolvedProjectRoot);
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
